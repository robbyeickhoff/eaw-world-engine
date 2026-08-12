import { system, type Vector3 } from "@minecraft/server";
import type { IPlayerUISession } from "@minecraft/server-editor";
import { HEIDI_TUNNEL_POINTS } from "../builds/heidiHavenMountainTunnel";

export const STAGE1_BOUNDARY = {
  from: { x: -87, y: 37, z: 125 },
  to: { x: -42, y: 120, z: 168 }
} as const;

const RISK_BLOCKS = new Set([
  "minecraft:black_concrete", "minecraft:gray_concrete", "minecraft:yellow_concrete",
  "minecraft:orange_concrete", "minecraft:polished_blackstone_bricks",
  "minecraft:deepslate_tiles", "minecraft:polished_andesite", "minecraft:sea_lantern",
  "minecraft:glass", "minecraft:light_blue_stained_glass", "minecraft:purple_stained_glass",
  "minecraft:amethyst_block", "minecraft:iron_block", "minecraft:chain"
]);

function geometry(index: number): { point: Vector3; cross: (width: number) => { x: number; z: number } } {
  const point = HEIDI_TUNNEL_POINTS[index];
  const previous = HEIDI_TUNNEL_POINTS[Math.max(0, index - 1)];
  const next = HEIDI_TUNNEL_POINTS[Math.min(HEIDI_TUNNEL_POINTS.length - 1, index + 1)];
  const dx = next.x - previous.x;
  const dz = next.z - previous.z;
  const length = Math.max(1, Math.sqrt(dx * dx + dz * dz));
  const px = -dz / length;
  const pz = dx / length;
  return {
    point,
    cross: (width) => ({
      x: Math.round(point.x + px * width),
      z: Math.round(point.z + pz * width)
    })
  };
}

export interface Stage1PreflightReport {
  readonly ticketId: "STAGE11-MOUNTAIN-RECOVERY";
  readonly stage: 1;
  readonly boundary: typeof STAGE1_BOUNDARY;
  readonly boundaryVolume: number;
  readonly proposedCorridorWidth: number;
  readonly proposedColumns: number;
  readonly estimatedMaximumBlockChanges: number;
  readonly loadedChunks: string;
  readonly undoAvailable: boolean;
  readonly undoApi: "pending-transaction" | "legacy-transaction" | "unavailable";
  readonly occupiedBlocks: number;
  readonly airBlocks: number;
  readonly topSurfaceRange: [number, number];
  readonly riskBlocks: Readonly<Record<string, number>>;
  readonly corridorProfiles: readonly {
    readonly width: number;
    readonly columns: number;
    readonly maximumChanges: number;
    readonly riskBlocks: number;
  }[];
  readonly mostCommonBlocks: readonly [string, number][];
  readonly decision: "REVIEW_REQUIRED";
}

export function startStage1RecoveryPreflight(
  ui: IPlayerUISession<unknown>,
  onProgress: (message: string) => void,
  onComplete: (report: Stage1PreflightReport) => void,
  onError: (message: string) => void
): void {
  const dimension = ui.extensionContext.player.dimension;
  const { from, to } = STAGE1_BOUNDARY;
  const chunkStates: boolean[] = [];
  for (let chunkX = Math.floor(from.x / 16); chunkX <= Math.floor(to.x / 16); chunkX += 1) {
    for (let chunkZ = Math.floor(from.z / 16); chunkZ <= Math.floor(to.z / 16); chunkZ += 1) {
      chunkStates.push(dimension.isChunkLoaded({ x: chunkX * 16 + 8, y: 80, z: chunkZ * 16 + 8 }));
    }
  }

  const corridorHalfWidths = [7, 9, 11, 13, 15] as const;
  const corridorColumns = new Map<number, Set<string>>();
  for (const halfWidth of corridorHalfWidths) corridorColumns.set(halfWidth, new Set<string>());
  for (let index = 0; index <= 27; index += 1) {
    const { cross } = geometry(index);
    for (const halfWidth of corridorHalfWidths) {
      const columns = corridorColumns.get(halfWidth)!;
      for (let width = -halfWidth; width <= halfWidth; width += 1) {
        const at = cross(width);
        if (at.x >= from.x && at.x <= to.x && at.z >= from.z && at.z <= to.z) columns.add(`${at.x},${at.z}`);
      }
    }
  }

  const histogram = new Map<string, number>();
  const riskHistogram = new Map<string, number>();
  const corridorRiskCounts = new Map<number, number>();
  for (const halfWidth of corridorHalfWidths) corridorRiskCounts.set(halfWidth, 0);
  let occupiedBlocks = 0;
  let airBlocks = 0;
  let minTop = 999;
  let maxTop = -999;
  let z = from.z;

  const scanBatch = (): void => {
    try {
      const batchEnd = Math.min(to.z, z + 1);
      for (; z <= batchEnd; z += 1) {
        for (let x = from.x; x <= to.x; x += 1) {
          const columnKey = `${x},${z}`;
          const top = dimension.getTopmostBlock({ x, z });
          if (top) {
            minTop = Math.min(minTop, top.y);
            maxTop = Math.max(maxTop, top.y);
          }
          for (let y = from.y; y <= to.y; y += 1) {
            const typeId = dimension.getBlock({ x, y, z })?.typeId ?? "minecraft:unknown";
            histogram.set(typeId, (histogram.get(typeId) ?? 0) + 1);
            if (typeId === "minecraft:air" || typeId === "minecraft:cave_air") airBlocks += 1;
            else occupiedBlocks += 1;
            if (RISK_BLOCKS.has(typeId)) {
              riskHistogram.set(typeId, (riskHistogram.get(typeId) ?? 0) + 1);
              for (const halfWidth of corridorHalfWidths) {
                if (corridorColumns.get(halfWidth)!.has(columnKey)) {
                  corridorRiskCounts.set(halfWidth, corridorRiskCounts.get(halfWidth)! + 1);
                }
              }
            }
          }
        }
      }
      const scanned = Math.min(to.z - from.z + 1, z - from.z);
      onProgress(`Stage 1 preflight: scanned ${scanned} of ${to.z - from.z + 1} slices. No blocks changed.`);
      if (z <= to.z) {
        system.runTimeout(scanBatch, 1);
        return;
      }

      const transactionManager = ui.extensionContext.transactionManager as unknown as {
        createPendingTransaction?: unknown;
        isBusy?: () => boolean;
      };
      const undoApi = typeof transactionManager.createPendingTransaction === "function"
        ? "pending-transaction" as const
        : typeof transactionManager.isBusy === "function"
          ? "legacy-transaction" as const
          : "unavailable" as const;
      const widestColumns = corridorColumns.get(15)!;
      const report: Stage1PreflightReport = {
        ticketId: "STAGE11-MOUNTAIN-RECOVERY",
        stage: 1,
        boundary: STAGE1_BOUNDARY,
        boundaryVolume: (to.x - from.x + 1) * (to.y - from.y + 1) * (to.z - from.z + 1),
        proposedCorridorWidth: 31,
        proposedColumns: widestColumns.size,
        estimatedMaximumBlockChanges: widestColumns.size * 61,
        loadedChunks: `${chunkStates.filter(Boolean).length}/${chunkStates.length}`,
        undoAvailable: undoApi === "pending-transaction"
          || (undoApi === "legacy-transaction" && !transactionManager.isBusy!()),
        undoApi,
        occupiedBlocks,
        airBlocks,
        topSurfaceRange: [minTop, maxTop],
        riskBlocks: [...riskHistogram.entries()]
          .sort((a, b) => b[1] - a[1])
          .reduce<Record<string, number>>((result, entry) => {
            result[entry[0]] = entry[1];
            return result;
          }, {}),
        corridorProfiles: corridorHalfWidths.map((halfWidth) => ({
          width: halfWidth * 2 + 1,
          columns: corridorColumns.get(halfWidth)!.size,
          maximumChanges: corridorColumns.get(halfWidth)!.size * 61,
          riskBlocks: corridorRiskCounts.get(halfWidth)!
        })),
        mostCommonBlocks: [...histogram.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15),
        decision: "REVIEW_REQUIRED"
      };
      console.warn(`EAW_STAGE1_PREFLIGHT ${JSON.stringify(report)}`);
      ui.log.info(`EAW_STAGE1_PREFLIGHT ${JSON.stringify(report)}`);
      onComplete(report);
    } catch (error) {
      const message = error instanceof Error ? `${error.message}${error.stack ? ` | ${error.stack}` : ""}` : String(error);
      console.warn(`EAW_STAGE1_PREFLIGHT_ERROR ${message}`);
      onError(message);
    }
  };

  scanBatch();
}
