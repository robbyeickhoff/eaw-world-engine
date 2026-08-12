import type { Dimension, Vector3 } from "@minecraft/server";
import type { IPlayerUISession } from "@minecraft/server-editor";
import { HEIDI_TUNNEL_POINTS } from "./heidiHavenMountainTunnel";
import { applyFillTransaction, type FillOperation } from "../engine/transaction";
import { SECTION2_RECOVERY } from "../engine/section2RecoveryPreflight";

const SAMPLE_WIDTHS = [15, 16, 17] as const;
const MAX_CHANGES = 43_026;
let ranThisSession = false;

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
    cross: (width) => ({ x: Math.round(point.x + px * width), z: Math.round(point.z + pz * width) })
  };
}

function naturalSurface(dimension: Dimension, x: number, z: number, fallback: number): number {
  const top = dimension.getTopmostBlock({ x, z });
  if (!top) return fallback;
  // Grass is the safest surviving record of the original mountainside. This
  // intentionally rejects the exposed stone boxes and ribs from the failed build.
  for (let y = Math.min(SECTION2_RECOVERY.toY, top.y); y >= SECTION2_RECOVERY.fromY; y -= 1) {
    if (dimension.getBlock({ x, y, z })?.typeId === "minecraft:grass_block") return y;
  }
  return fallback;
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function smooth(values: readonly number[]): number[] {
  return values.map((_, index) => median(values.slice(Math.max(0, index - 2), Math.min(values.length, index + 3))));
}

function addColumn(operations: FillOperation[], x: number, z: number, rawSurface: number): void {
  const minY = SECTION2_RECOVERY.fromY;
  const maxY = SECTION2_RECOVERY.toY;
  const surface = Math.max(minY, Math.min(maxY - 1, rawSurface));
  if (surface <= 63) {
    if (surface > minY) operations.push({ from: { x, y: minY, z }, to: { x, y: surface - 1, z }, block: "minecraft:stone" });
    operations.push({ from: { x, y: surface, z }, to: { x, y: surface, z }, block: "minecraft:gravel" });
    if (surface < 63) operations.push({ from: { x, y: surface + 1, z }, to: { x, y: 63, z }, block: "minecraft:water" });
    operations.push({ from: { x, y: 64, z }, to: { x, y: maxY, z }, block: "minecraft:air" });
    return;
  }
  const stoneTop = surface - 4;
  if (stoneTop >= minY) operations.push({ from: { x, y: minY, z }, to: { x, y: stoneTop, z }, block: "minecraft:stone" });
  operations.push({ from: { x, y: surface - 3, z }, to: { x, y: surface - 1, z }, block: "minecraft:dirt" });
  operations.push({ from: { x, y: surface, z }, to: { x, y: surface, z }, block: "minecraft:grass_block" });
  operations.push({ from: { x, y: surface + 1, z }, to: { x, y: maxY, z }, block: "minecraft:air" });
}

export function reconstructSection2Mountain(ui: IPlayerUISession<unknown>): string {
  if (ranThisSession) throw new Error("Section 2 already ran in this Editor session. Stop and review it.");
  const dimension = ui.extensionContext.player.dimension;
  const chunkKeys = new Set<string>();
  const leftSamples: number[] = [];
  const rightSamples: number[] = [];

  for (let index = SECTION2_RECOVERY.routeFrom; index <= SECTION2_RECOVERY.routeTo; index += 1) {
    const { point, cross } = geometry(index);
    leftSamples.push(median(SAMPLE_WIDTHS.map((width) => {
      const at = cross(-width);
      return naturalSurface(dimension, at.x, at.z, point.y + 8);
    })));
    rightSamples.push(median(SAMPLE_WIDTHS.map((width) => {
      const at = cross(width);
      return naturalSurface(dimension, at.x, at.z, point.y + 8);
    })));
    for (let width = -SECTION2_RECOVERY.halfWidth; width <= SECTION2_RECOVERY.halfWidth; width += 1) {
      const at = cross(width);
      chunkKeys.add(`${Math.floor(at.x / 16)},${Math.floor(at.z / 16)}`);
    }
  }
  for (const key of chunkKeys) {
    const [chunkX, chunkZ] = key.split(",").map(Number);
    if (!dimension.isChunkLoaded({ x: chunkX * 16 + 8, y: 90, z: chunkZ * 16 + 8 })) {
      throw new Error(`Build refused: Section 2 chunk ${chunkX},${chunkZ} is not loaded.`);
    }
  }

  const left = smooth(leftSamples);
  const right = smooth(rightSamples);
  const predictions = new Map<string, { x: number; z: number; heights: number[] }>();
  for (let index = SECTION2_RECOVERY.routeFrom; index <= SECTION2_RECOVERY.routeTo; index += 1) {
    const sampleIndex = index - SECTION2_RECOVERY.routeFrom;
    const { cross } = geometry(index);
    for (let width = -SECTION2_RECOVERY.halfWidth; width <= SECTION2_RECOVERY.halfWidth; width += 1) {
      const at = cross(width);
      const blend = (width + SECTION2_RECOVERY.halfWidth) / (SECTION2_RECOVERY.halfWidth * 2);
      const height = Math.round(left[sampleIndex] + (right[sampleIndex] - left[sampleIndex]) * blend);
      const key = `${at.x},${at.z}`;
      const existing = predictions.get(key);
      if (existing) existing.heights.push(height);
      else predictions.set(key, { ...at, heights: [height] });
    }
  }
  if (predictions.size !== 606) {
    throw new Error(`Build refused: expected 606 approved columns but calculated ${predictions.size}.`);
  }

  const operations: FillOperation[] = [];
  for (const prediction of predictions.values()) {
    const height = Math.round(prediction.heights.reduce((sum, value) => sum + value, 0) / prediction.heights.length);
    addColumn(operations, prediction.x, prediction.z, height);
  }
  const trackedFrom = { x: SECTION2_RECOVERY.extent.from.x, y: SECTION2_RECOVERY.fromY, z: SECTION2_RECOVERY.extent.from.z };
  const trackedTo = { x: SECTION2_RECOVERY.extent.to.x, y: SECTION2_RECOVERY.toY, z: SECTION2_RECOVERY.extent.to.z };
  applyFillTransaction(
    ui.extensionContext.transactionManager,
    dimension,
    "EAW Section 2 mountain reconstruction",
    trackedFrom,
    trackedTo,
    operations,
    { from: trackedFrom, to: trackedTo, maxChangedBlocks: MAX_CHANGES }
  );
  ranThisSession = true;
  return "Section 2 reconstruction draft complete in one undoable transaction. Stop and review before any further stage.";
}
