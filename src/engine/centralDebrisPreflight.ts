import { system, type Dimension, type Vector3 } from "@minecraft/server";
import type { IPlayerUISession } from "@minecraft/server-editor";
import { HEIDI_TUNNEL_POINTS } from "../builds/heidiHavenMountainTunnel";

const SECTIONS = [{ from: 0, to: 27 }, { from: 28, to: 55 }, { from: 56, to: 83 }] as const;
const HALF_WIDTH = 35;
const SAMPLE_WIDTHS = [38, 39, 40, 41, 42] as const;
const MIN_Y = 60;
const MAX_Y = 130;
const STRUCTURE_BLOCKS = new Set([
  "minecraft:black_concrete", "minecraft:gray_concrete", "minecraft:yellow_concrete",
  "minecraft:orange_concrete", "minecraft:polished_blackstone_bricks", "minecraft:deepslate_tiles",
  "minecraft:polished_andesite", "minecraft:sea_lantern", "minecraft:glass",
  "minecraft:light_blue_stained_glass", "minecraft:purple_stained_glass",
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
  return { point, cross: (width) => ({ x: Math.round(point.x + px * width), z: Math.round(point.z + pz * width) }) };
}

function grassSurface(dimension: Dimension, x: number, z: number, fallback: number): number {
  const top = dimension.getTopmostBlock({ x, z });
  if (!top) return fallback;
  for (let y = Math.min(MAX_Y, top.y); y >= MIN_Y; y -= 1) {
    if (dimension.getBlock({ x, y, z })?.typeId === "minecraft:grass_block") return y;
  }
  return fallback;
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

export interface CentralDebrisPreflightReport {
  readonly ticketId: "STAGE11-MOUNTAIN-RECOVERY";
  readonly target: "central-ribs-and-black-columns";
  readonly routeIndices: readonly [0, 83];
  readonly scanWidth: 71;
  readonly yRange: readonly [60, 130];
  readonly scannedColumns: number;
  readonly candidateColumns: number;
  readonly excessColumns: number;
  readonly deficitColumns: number;
  readonly severeColumns: number;
  readonly maximumCandidateCells: number;
  readonly scannedChunks: number;
  readonly undoAvailable: boolean;
  readonly candidateBounds: null | { readonly from: { readonly x: number; readonly z: number }; readonly to: { readonly x: number; readonly z: number } };
  readonly candidateTopBlocks: readonly [string, number][];
  readonly structureIntersections: Readonly<Record<string, number>>;
  readonly structureIntersectionTotal: number;
  readonly structureIntersectionBounds: null | { readonly from: Vector3; readonly to: Vector3 };
  readonly worstLocations: readonly { readonly x: number; readonly z: number; readonly difference: number; readonly topBlock: string }[];
  readonly decision: "REVIEW_REQUIRED";
}

export function startCentralDebrisPreflight(
  ui: IPlayerUISession<unknown>,
  onProgress: (message: string) => void,
  onComplete: (report: CentralDebrisPreflightReport) => void,
  onError: (message: string) => void
): void {
  const dimension = ui.extensionContext.player.dimension;
  const visited = new Set<string>();
  const topBlocks = new Map<string, number>();
  const intersections = new Map<string, number>();
  const worst: { x: number; z: number; difference: number; topBlock: string }[] = [];
  let sectionIndex = 0; let scannedChunks = 0; let candidateColumns = 0;
  let excessColumns = 0; let deficitColumns = 0; let severeColumns = 0;
  let minX = Infinity; let maxX = -Infinity; let minZ = Infinity; let maxZ = -Infinity;
  let structureMin: Vector3 | undefined; let structureMax: Vector3 | undefined;

  const finish = (): void => {
    const manager = ui.extensionContext.transactionManager as unknown as { createPendingTransaction?: unknown; isBusy?: () => boolean };
    const undoAvailable = typeof manager.createPendingTransaction === "function" || (typeof manager.isBusy === "function" && !manager.isBusy());
    worst.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
    const intersectionRecord = [...intersections.entries()].sort((a, b) => b[1] - a[1]).reduce<Record<string, number>>((result, [id, count]) => { result[id] = count; return result; }, {});
    const report: CentralDebrisPreflightReport = {
      ticketId: "STAGE11-MOUNTAIN-RECOVERY", target: "central-ribs-and-black-columns",
      routeIndices: [0, 83], scanWidth: 71, yRange: [60, 130], scannedColumns: visited.size,
      candidateColumns, excessColumns, deficitColumns, severeColumns,
      maximumCandidateCells: candidateColumns * (MAX_Y - MIN_Y + 1), scannedChunks, undoAvailable,
      candidateBounds: candidateColumns === 0 ? null : { from: { x: minX, z: minZ }, to: { x: maxX, z: maxZ } },
      candidateTopBlocks: [...topBlocks.entries()].sort((a, b) => b[1] - a[1]),
      structureIntersections: intersectionRecord,
      structureIntersectionTotal: [...intersections.values()].reduce((sum, count) => sum + count, 0),
      structureIntersectionBounds: structureMin && structureMax ? { from: structureMin, to: structureMax } : null,
      worstLocations: worst.slice(0, 30), decision: "REVIEW_REQUIRED"
    };
    const summary = {
      scannedColumns: report.scannedColumns,
      candidateColumns: report.candidateColumns,
      excessColumns: report.excessColumns,
      deficitColumns: report.deficitColumns,
      severeColumns: report.severeColumns,
      maximumCandidateCells: report.maximumCandidateCells,
      scannedChunks: report.scannedChunks,
      undoAvailable: report.undoAvailable,
      candidateBounds: report.candidateBounds
    };
    const structures = {
      structureIntersections: report.structureIntersections,
      structureIntersectionTotal: report.structureIntersectionTotal,
      structureIntersectionBounds: report.structureIntersectionBounds,
      candidateTopBlocks: report.candidateTopBlocks
    };
    console.warn(`EAW_CENTRAL_PREFLIGHT_SUMMARY ${JSON.stringify(summary)}`);
    console.warn(`EAW_CENTRAL_PREFLIGHT_STRUCTURES ${JSON.stringify(structures)}`);
    for (let index = 0; index < report.worstLocations.length; index += 10) {
      console.warn(`EAW_CENTRAL_PREFLIGHT_WORST_${index / 10 + 1} ${JSON.stringify(report.worstLocations.slice(index, index + 10))}`);
    }
    ui.log.info(`EAW central preflight saved: ${report.candidateColumns} candidates across ${report.scannedChunks} chunks.`);
    onComplete(report);
  };

  const scanSection = (): void => {
    if (sectionIndex >= SECTIONS.length) { finish(); return; }
    const section = SECTIONS[sectionIndex];
    const midpoint = HEIDI_TUNNEL_POINTS[Math.floor((section.from + section.to) / 2)];
    ui.extensionContext.player.teleport({ x: midpoint.x, y: midpoint.y + 40, z: midpoint.z }, { dimension });
    onProgress(`Loading central debris section ${sectionIndex + 1} of ${SECTIONS.length}...`);
    system.runTimeout(() => {
      try {
        const predictions = new Map<string, { x: number; z: number; heights: number[] }>();
        for (let index = section.from; index <= section.to; index += 1) {
          const { point, cross } = geometry(index);
          const left = median(SAMPLE_WIDTHS.map((width) => { const at = cross(-width); return grassSurface(dimension, at.x, at.z, point.y + 8); }));
          const right = median(SAMPLE_WIDTHS.map((width) => { const at = cross(width); return grassSurface(dimension, at.x, at.z, point.y + 8); }));
          for (let width = -HALF_WIDTH; width <= HALF_WIDTH; width += 1) {
            const at = cross(width);
            const expected = Math.round(left + (right - left) * ((width + HALF_WIDTH) / (HALF_WIDTH * 2)));
            const key = `${at.x},${at.z}`;
            const existing = predictions.get(key);
            if (existing) existing.heights.push(expected); else predictions.set(key, { ...at, heights: [expected] });
          }
        }
        const chunkGroups = new Map<string, { x: number; z: number; heights: number[] }[]>();
        for (const prediction of predictions.values()) {
          const key = `${Math.floor(prediction.x / 16)},${Math.floor(prediction.z / 16)}`;
          const group = chunkGroups.get(key);
          if (group) group.push(prediction); else chunkGroups.set(key, [prediction]);
        }
        const chunks = [...chunkGroups.entries()];
        let chunkIndex = 0;
        const scanChunk = (): void => {
          if (chunkIndex >= chunks.length) { sectionIndex += 1; scanSection(); return; }
          const [chunkKey, columns] = chunks[chunkIndex];
          const [chunkX, chunkZ] = chunkKey.split(",").map(Number);
          ui.extensionContext.player.teleport({ x: chunkX * 16 + 8, y: 120, z: chunkZ * 16 + 8 }, { dimension });
          onProgress(`Central debris scan: section ${sectionIndex + 1}/3, chunk ${chunkIndex + 1}/${chunks.length}. No blocks changed.`);
          system.runTimeout(() => {
            try {
              if (!dimension.isChunkLoaded({ x: chunkX * 16 + 8, y: 90, z: chunkZ * 16 + 8 })) {
                throw new Error(`Chunk ${chunkX},${chunkZ} did not load after its dedicated teleport.`);
              }
              for (const prediction of columns) {
                const key = `${prediction.x},${prediction.z}`;
                if (visited.has(key)) continue;
                visited.add(key);
                const expected = Math.round(prediction.heights.reduce((sum, height) => sum + height, 0) / prediction.heights.length);
                const top = dimension.getTopmostBlock({ x: prediction.x, z: prediction.z });
                if (!top) continue;
                const difference = top.y - expected;
                if (Math.abs(difference) < 5) continue;
                candidateColumns += 1;
                if (difference > 0) excessColumns += 1; else deficitColumns += 1;
                if (Math.abs(difference) >= 8) severeColumns += 1;
                minX = Math.min(minX, prediction.x); maxX = Math.max(maxX, prediction.x);
                minZ = Math.min(minZ, prediction.z); maxZ = Math.max(maxZ, prediction.z);
                topBlocks.set(top.typeId, (topBlocks.get(top.typeId) ?? 0) + 1);
                worst.push({ x: prediction.x, z: prediction.z, difference, topBlock: top.typeId });
                for (let y = MIN_Y; y <= MAX_Y; y += 1) {
                  const typeId = dimension.getBlock({ x: prediction.x, y, z: prediction.z })?.typeId;
                  if (!typeId || !STRUCTURE_BLOCKS.has(typeId)) continue;
                  intersections.set(typeId, (intersections.get(typeId) ?? 0) + 1);
                  structureMin = { x: Math.min(structureMin?.x ?? prediction.x, prediction.x), y: Math.min(structureMin?.y ?? y, y), z: Math.min(structureMin?.z ?? prediction.z, prediction.z) };
                  structureMax = { x: Math.max(structureMax?.x ?? prediction.x, prediction.x), y: Math.max(structureMax?.y ?? y, y), z: Math.max(structureMax?.z ?? prediction.z, prediction.z) };
                }
              }
              scannedChunks += 1; chunkIndex += 1; scanChunk();
            } catch (error) {
              onError(error instanceof Error ? error.message : String(error));
            }
          }, 25);
        };
        scanChunk();
      } catch (error) {
        onError(error instanceof Error ? error.message : String(error));
      }
    }, 60);
  };
  scanSection();
}
