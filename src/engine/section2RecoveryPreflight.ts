import { system, type Vector3 } from "@minecraft/server";
import type { IPlayerUISession } from "@minecraft/server-editor";
import { HEIDI_TUNNEL_POINTS } from "../builds/heidiHavenMountainTunnel";

export const SECTION2_RECOVERY = {
  routeFrom: 28,
  routeTo: 55,
  halfWidth: 13,
  fromY: 60,
  toY: 130,
  extent: { from: { x: -73, z: 153 }, to: { x: -28, z: 190 } }
} as const;

const PROTECTED_BLOCKS = new Set([
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

export interface Section2PreflightReport {
  readonly ticketId: "STAGE11-MOUNTAIN-RECOVERY";
  readonly stage: 2;
  readonly routeIndices: readonly [28, 55];
  readonly corridorWidth: 27;
  readonly extent: typeof SECTION2_RECOVERY.extent;
  readonly yRange: readonly [60, 130];
  readonly columns: number;
  readonly maximumCells: number;
  readonly loadedChunks: string;
  readonly undoAvailable: boolean;
  readonly undoApi: "pending-transaction" | "legacy-transaction" | "unavailable";
  readonly occupiedBlocks: number;
  readonly airBlocks: number;
  readonly topSurfaceRange: readonly [number, number];
  readonly protectedBlocks: Readonly<Record<string, number>>;
  readonly protectedBlockTotal: number;
  readonly protectedIntersectionBounds: null | {
    readonly from: Vector3;
    readonly to: Vector3;
  };
  readonly mostCommonBlocks: readonly [string, number][];
  readonly decision: "REVIEW_REQUIRED";
}

export function startSection2RecoveryPreflight(
  ui: IPlayerUISession<unknown>,
  onProgress: (message: string) => void,
  onComplete: (report: Section2PreflightReport) => void,
  onError: (message: string) => void
): void {
  const dimension = ui.extensionContext.player.dimension;
  const config = SECTION2_RECOVERY;
  const columns = new Map<string, { x: number; z: number }>();
  for (let index = config.routeFrom; index <= config.routeTo; index += 1) {
    const { cross } = geometry(index);
    for (let width = -config.halfWidth; width <= config.halfWidth; width += 1) {
      const at = cross(width);
      columns.set(`${at.x},${at.z}`, at);
    }
  }
  const columnList = [...columns.values()].sort((a, b) => a.z - b.z || a.x - b.x);

  const chunkKeys = new Set<string>();
  for (const at of columnList) chunkKeys.add(`${Math.floor(at.x / 16)},${Math.floor(at.z / 16)}`);
  let loadedChunks = 0;
  for (const key of chunkKeys) {
    const [chunkX, chunkZ] = key.split(",").map(Number);
    if (dimension.isChunkLoaded({ x: chunkX * 16 + 8, y: 90, z: chunkZ * 16 + 8 })) loadedChunks += 1;
  }

  const histogram = new Map<string, number>();
  const protectedHistogram = new Map<string, number>();
  let occupiedBlocks = 0;
  let airBlocks = 0;
  let minTop = Number.POSITIVE_INFINITY;
  let maxTop = Number.NEGATIVE_INFINITY;
  let protectedMin: Vector3 | undefined;
  let protectedMax: Vector3 | undefined;
  let cursor = 0;

  const scanBatch = (): void => {
    try {
      const end = Math.min(columnList.length, cursor + 24);
      for (; cursor < end; cursor += 1) {
        const at = columnList[cursor];
        const top = dimension.getTopmostBlock(at);
        if (top) {
          minTop = Math.min(minTop, top.y);
          maxTop = Math.max(maxTop, top.y);
        }
        for (let y = config.fromY; y <= config.toY; y += 1) {
          const typeId = dimension.getBlock({ x: at.x, y, z: at.z })?.typeId ?? "minecraft:unknown";
          histogram.set(typeId, (histogram.get(typeId) ?? 0) + 1);
          if (typeId === "minecraft:air" || typeId === "minecraft:cave_air") airBlocks += 1;
          else occupiedBlocks += 1;
          if (PROTECTED_BLOCKS.has(typeId)) {
            protectedHistogram.set(typeId, (protectedHistogram.get(typeId) ?? 0) + 1);
            protectedMin = {
              x: Math.min(protectedMin?.x ?? at.x, at.x),
              y: Math.min(protectedMin?.y ?? y, y),
              z: Math.min(protectedMin?.z ?? at.z, at.z)
            };
            protectedMax = {
              x: Math.max(protectedMax?.x ?? at.x, at.x),
              y: Math.max(protectedMax?.y ?? y, y),
              z: Math.max(protectedMax?.z ?? at.z, at.z)
            };
          }
        }
      }
      onProgress(`Section 2 preflight: scanned ${cursor} of ${columnList.length} columns. No blocks changed.`);
      if (cursor < columnList.length) {
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
      const protectedBlocks = [...protectedHistogram.entries()]
        .sort((a, b) => b[1] - a[1])
        .reduce<Record<string, number>>((result, [typeId, count]) => {
          result[typeId] = count;
          return result;
        }, {});
      const report: Section2PreflightReport = {
        ticketId: "STAGE11-MOUNTAIN-RECOVERY",
        stage: 2,
        routeIndices: [28, 55],
        corridorWidth: 27,
        extent: config.extent,
        yRange: [60, 130],
        columns: columnList.length,
        maximumCells: columnList.length * (config.toY - config.fromY + 1),
        loadedChunks: `${loadedChunks}/${chunkKeys.size}`,
        undoAvailable: undoApi === "pending-transaction"
          || (undoApi === "legacy-transaction" && !transactionManager.isBusy!()),
        undoApi,
        occupiedBlocks,
        airBlocks,
        topSurfaceRange: [minTop, maxTop],
        protectedBlocks,
        protectedBlockTotal: [...protectedHistogram.values()].reduce((sum, count) => sum + count, 0),
        protectedIntersectionBounds: protectedMin && protectedMax ? { from: protectedMin, to: protectedMax } : null,
        mostCommonBlocks: [...histogram.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15),
        decision: "REVIEW_REQUIRED"
      };
      console.warn(`EAW_SECTION2_PREFLIGHT ${JSON.stringify(report)}`);
      ui.log.info(`EAW_SECTION2_PREFLIGHT ${JSON.stringify(report)}`);
      onComplete(report);
    } catch (error) {
      const message = error instanceof Error ? `${error.message}${error.stack ? ` | ${error.stack}` : ""}` : String(error);
      console.warn(`EAW_SECTION2_PREFLIGHT_ERROR ${message}`);
      onError(message);
    }
  };

  scanBatch();
}
