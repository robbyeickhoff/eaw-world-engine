import type { Dimension, Vector3 } from "@minecraft/server";
import type { IPlayerUISession } from "@minecraft/server-editor";
import { HEIDI_TUNNEL_POINTS } from "./heidiHavenMountainTunnel";
import { applyFillTransaction, type FillOperation } from "../engine/transaction";
import { STAGE1_BOUNDARY } from "../engine/stage1RecoveryPreflight";

const HALF_WIDTH = 13;
const SAMPLE_WIDTHS = [15, 16, 17] as const;
const MIN_Y = 60;
const MAX_Y = 120;
const MAX_CHANGES = 42_639;

const TERRAIN_BLOCKS = new Set([
  "minecraft:grass_block", "minecraft:dirt", "minecraft:stone", "minecraft:water",
  "minecraft:sand", "minecraft:gravel", "minecraft:andesite", "minecraft:diorite",
  "minecraft:granite", "minecraft:deepslate", "minecraft:coal_ore", "minecraft:iron_ore",
  "minecraft:copper_ore"
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
    cross: (width) => ({ x: Math.round(point.x + px * width), z: Math.round(point.z + pz * width) })
  };
}

function terrainSurface(dimension: Dimension, x: number, z: number, fallback: number): number {
  const top = dimension.getTopmostBlock({ x, z });
  if (!top) return fallback;
  for (let y = Math.min(MAX_Y, top.y); y >= 37; y -= 1) {
    const block = dimension.getBlock({ x, y, z });
    if (block && TERRAIN_BLOCKS.has(block.typeId)) return y;
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

function addPartitionedColumn(operations: FillOperation[], x: number, z: number, rawSurface: number): void {
  const surface = Math.max(MIN_Y, Math.min(MAX_Y - 1, rawSurface));
  if (surface <= 63) {
    if (surface > MIN_Y) operations.push({ from: { x, y: MIN_Y, z }, to: { x, y: surface - 1, z }, block: "minecraft:stone" });
    operations.push({ from: { x, y: surface, z }, to: { x, y: surface, z }, block: "minecraft:gravel" });
    if (surface < 63) operations.push({ from: { x, y: surface + 1, z }, to: { x, y: 63, z }, block: "minecraft:water" });
    operations.push({ from: { x, y: 64, z }, to: { x, y: MAX_Y, z }, block: "minecraft:air" });
    return;
  }

  const stoneTop = surface - 4;
  if (stoneTop >= MIN_Y) operations.push({ from: { x, y: MIN_Y, z }, to: { x, y: stoneTop, z }, block: "minecraft:stone" });
  operations.push({ from: { x, y: surface - 3, z }, to: { x, y: surface - 1, z }, block: "minecraft:dirt" });
  operations.push({ from: { x, y: surface, z }, to: { x, y: surface, z }, block: "minecraft:grass_block" });
  operations.push({ from: { x, y: surface + 1, z }, to: { x, y: MAX_Y, z }, block: "minecraft:air" });
}

export function reconstructStage1Mountain(ui: IPlayerUISession<unknown>): string {
  const dimension = ui.extensionContext.player.dimension;
  const sampleLeft: number[] = [];
  const sampleRight: number[] = [];

  for (let index = 0; index <= 27; index += 1) {
    const { point, cross } = geometry(index);
    sampleLeft.push(median(SAMPLE_WIDTHS.map((width) => {
      const at = cross(-width);
      return terrainSurface(dimension, at.x, at.z, point.y + 5);
    })));
    sampleRight.push(median(SAMPLE_WIDTHS.map((width) => {
      const at = cross(width);
      return terrainSurface(dimension, at.x, at.z, point.y + 5);
    })));
  }

  const left = smooth(sampleLeft);
  const right = smooth(sampleRight);
  const predictions = new Map<string, { x: number; z: number; heights: number[] }>();
  for (let index = 0; index <= 27; index += 1) {
    const { cross } = geometry(index);
    for (let width = -HALF_WIDTH; width <= HALF_WIDTH; width += 1) {
      const at = cross(width);
      const blend = (width + HALF_WIDTH) / (HALF_WIDTH * 2);
      const height = Math.round(left[index] + (right[index] - left[index]) * blend);
      const key = `${at.x},${at.z}`;
      const existing = predictions.get(key);
      if (existing) existing.heights.push(height);
      else predictions.set(key, { ...at, heights: [height] });
    }
  }

  if (predictions.size !== 699) {
    throw new Error(`Build refused: expected 699 approved columns but calculated ${predictions.size}.`);
  }

  const operations: FillOperation[] = [];
  for (const prediction of predictions.values()) {
    addPartitionedColumn(operations, prediction.x, prediction.z, Math.round(prediction.heights.reduce((sum, value) => sum + value, 0) / prediction.heights.length));
  }

  applyFillTransaction(
    ui.extensionContext.transactionManager,
    dimension,
    "EAW Stage 1 mountain reconstruction",
    STAGE1_BOUNDARY.from,
    STAGE1_BOUNDARY.to,
    operations,
    { ...STAGE1_BOUNDARY, maxChangedBlocks: MAX_CHANGES }
  );
  return "Stage 1 reconstruction draft complete in one undoable transaction. Stop and review before any further stage.";
}
