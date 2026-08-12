import type { Dimension, Vector3 } from "@minecraft/server";
import type { IPlayerUISession } from "@minecraft/server-editor";
import { applyDirectFills, type FillOperation } from "../engine/transaction";

const TOWER = { x: -184, z: 177 } as const;
const LOWER_DECK_Y = 69;
const UPPER_DECK_Y = 90;

function fill(
  operations: FillOperation[],
  from: Vector3,
  to: Vector3,
  block: string
): void {
  operations.push({ from, to, block });
}

function point(
  operations: FillOperation[],
  x: number,
  y: number,
  z: number,
  block: string
): void {
  fill(operations, { x, y, z }, { x, y, z }, block);
}

function findGroundY(dimension: Dimension, x: number, z: number, startY: number): number {
  for (let y = startY; y >= -60; y -= 1) {
    const block = dimension.getBlock({ x, y, z });
    if (block?.isSolid) return y;
  }
  return 44;
}

function addPylon(
  dimension: Dimension,
  operations: FillOperation[],
  x: number,
  z: number,
  deckY: number
): void {
  const groundY = findGroundY(dimension, x, z, deckY - 3);
  fill(
    operations,
    { x: x - 1, y: groundY + 1, z: z - 1 },
    { x: x + 1, y: deckY - 2, z: z + 1 },
    "minecraft:polished_deepslate"
  );
  fill(
    operations,
    { x: x - 2, y: groundY, z: z - 2 },
    { x: x + 2, y: groundY, z: z + 2 },
    "minecraft:deepslate_tiles"
  );
  point(operations, x, deckY - 2, z, "minecraft:sea_lantern");
}

function addNorthCauseway(dimension: Dimension, operations: FillOperation[], endZ = 40, startZ = 171): void {
  const y = LOWER_DECK_Y;

  for (let z = startZ; z >= endZ; z -= 1) {
    const transition = Math.min(4, Math.floor((171 - z) / 5));
    const centerX = -184 - transition;
    fill(operations, { x: centerX - 4, y: y - 2, z }, { x: centerX + 4, y: y - 1, z }, "minecraft:deepslate_tiles");
    fill(operations, { x: centerX - 3, y, z }, { x: centerX + 3, y, z }, "minecraft:smooth_stone");
    point(operations, centerX, y, z, "minecraft:light_gray_concrete");
    fill(operations, { x: centerX - 4, y, z }, { x: centerX - 4, y: y + 1, z }, "minecraft:yellow_concrete");
    fill(operations, { x: centerX + 4, y, z }, { x: centerX + 4, y: y + 1, z }, "minecraft:yellow_concrete");
    point(operations, centerX - 4, y + 2, z, "minecraft:cyan_stained_glass");
    point(operations, centerX + 4, y + 2, z, "minecraft:cyan_stained_glass");
  }

  for (let z = 45; z <= 163; z += 16) {
    if (z < endZ || z > startZ) continue;
    const transition = Math.min(4, Math.floor((171 - z) / 5));
    const centerX = -184 - transition;
    addPylon(dimension, operations, centerX, z, y);
    point(operations, centerX - 4, y + 1, z, "minecraft:sea_lantern");
    point(operations, centerX + 4, y + 1, z, "minecraft:sea_lantern");
  }

  if (endZ === 40) fill(operations, { x: -193, y: y - 2, z: 38 }, { x: -183, y, z: 43 }, "minecraft:smooth_stone");
}

function addEastCauseway(dimension: Dimension, operations: FillOperation[], startX = -178, endX = -83): void {

  for (let x = startX; x <= endX; x += 1) {
    const transition = Math.min(5, Math.floor((x + 178) / 5));
    const centerZ = 177 + transition;
    const y = LOWER_DECK_Y;
    fill(operations, { x, y: y - 2, z: centerZ - 4 }, { x, y: y - 1, z: centerZ + 4 }, "minecraft:deepslate_tiles");
    fill(operations, { x, y, z: centerZ - 3 }, { x, y, z: centerZ + 3 }, "minecraft:smooth_stone");
    point(operations, x, y, centerZ, "minecraft:light_gray_concrete");
    fill(operations, { x, y, z: centerZ - 4 }, { x, y: y + 1, z: centerZ - 4 }, "minecraft:yellow_concrete");
    fill(operations, { x, y, z: centerZ + 4 }, { x, y: y + 1, z: centerZ + 4 }, "minecraft:yellow_concrete");
    point(operations, x, y + 2, centerZ - 4, "minecraft:cyan_stained_glass");
    point(operations, x, y + 2, centerZ + 4, "minecraft:cyan_stained_glass");
  }

  for (let x = -171; x <= -83; x += 16) {
    if (x < startX || x > endX) continue;
    const transition = Math.min(5, Math.floor((x + 178) / 5));
    const centerZ = 177 + transition;
    const y = LOWER_DECK_Y;
    addPylon(dimension, operations, x, centerZ, y);
    point(operations, x, y + 1, centerZ - 4, "minecraft:sea_lantern");
    point(operations, x, y + 1, centerZ + 4, "minecraft:sea_lantern");
  }

  if (endX === -83) fill(operations, { x: -86, y: 67, z: 177 }, { x: -80, y: 69, z: 187 }, "minecraft:smooth_stone");
}

function removeOldRunwayAlignment(operations: FillOperation[], endZ: number, startZ: number): void {
  for (let z = endZ; z <= Math.min(startZ, 170); z += 1) {
    fill(operations, { x: -192, y: 67, z }, { x: -184, y: 72, z }, "minecraft:air");
  }
  for (let z = 45; z <= 165; z += 16) {
    if (z < endZ || z > startZ) continue;
    fill(operations, { x: -190, y: 45, z: z - 2 }, { x: -186, y: 62, z: z + 2 }, "minecraft:water");
    fill(operations, { x: -190, y: 63, z: z - 2 }, { x: -186, y: 68, z: z + 2 }, "minecraft:air");
  }
}

function removeOldLandAlignment(operations: FillOperation[], startX: number, endX: number): void {
  for (let x = Math.max(startX, -177); x <= endX; x += 1) {
    fill(operations, { x, y: 67, z: 178 }, { x, y: 73, z: 186 }, "minecraft:air");
  }
  for (let x = -171; x <= -83; x += 16) {
    if (x < startX || x > endX) continue;
    fill(operations, { x: x - 2, y: 45, z: 180 }, { x: x + 2, y: 62, z: 184 }, "minecraft:water");
    fill(operations, { x: x - 2, y: 63, z: 180 }, { x: x + 2, y: 69, z: 184 }, "minecraft:air");
  }
}

function addLowerTransferPlatform(operations: FillOperation[]): void {
  fill(operations, { x: -193, y: 67, z: 168 }, { x: -175, y: 68, z: 186 }, "minecraft:deepslate_tiles");
  fill(operations, { x: -192, y: 69, z: 169 }, { x: -176, y: 69, z: 185 }, "minecraft:smooth_stone");
  fill(operations, { x: -184, y: 69, z: 169 }, { x: -184, y: 69, z: 185 }, "minecraft:light_gray_concrete");
  fill(operations, { x: -192, y: 69, z: 177 }, { x: -176, y: 69, z: 177 }, "minecraft:light_gray_concrete");
  for (const x of [-192, -176]) {
    for (const z of [169, 185]) point(operations, x, 70, z, "minecraft:sea_lantern");
  }
}

function addTowerAndUpperBridge(operations: FillOperation[]): void {
  const minX = TOWER.x - 5;
  const maxX = TOWER.x + 5;
  const minZ = TOWER.z - 5;
  const maxZ = TOWER.z + 5;

  fill(operations, { x: minX - 1, y: 45, z: minZ - 1 }, { x: maxX + 1, y: 48, z: maxZ + 1 }, "minecraft:deepslate_tiles");
  fill(operations, { x: minX, y: 49, z: minZ }, { x: maxX, y: 93, z: maxZ }, "minecraft:cyan_stained_glass");
  fill(operations, { x: minX + 1, y: 49, z: minZ + 1 }, { x: maxX - 1, y: 92, z: maxZ - 1 }, "minecraft:air");

  for (const x of [minX, maxX]) {
    for (const z of [minZ, maxZ]) {
      fill(operations, { x, y: 48, z }, { x, y: 95, z }, "minecraft:polished_blackstone_bricks");
      for (let y = 52; y <= 92; y += 8) point(operations, x, y, z, "minecraft:sea_lantern");
    }
  }

  fill(operations, { x: minX - 1, y: 68, z: minZ - 1 }, { x: maxX + 1, y: 69, z: maxZ + 1 }, "minecraft:smooth_stone");
  fill(operations, { x: minX - 1, y: 89, z: minZ - 1 }, { x: maxX + 1, y: 90, z: maxZ + 1 }, "minecraft:smooth_stone");
  fill(operations, { x: minX - 2, y: 94, z: minZ - 2 }, { x: maxX + 2, y: 95, z: maxZ + 2 }, "minecraft:orange_concrete");
  fill(operations, { x: TOWER.x - 2, y: 70, z: TOWER.z - 2 }, { x: TOWER.x + 2, y: 73, z: TOWER.z + 2 }, "minecraft:light_gray_concrete");
  fill(operations, { x: TOWER.x - 1, y: 71, z: TOWER.z - 1 }, { x: TOWER.x + 1, y: 73, z: TOWER.z + 1 }, "minecraft:air");

  fill(operations, { x: -219, y: 88, z: 173 }, { x: minX, y: 89, z: 181 }, "minecraft:deepslate_tiles");
  fill(operations, { x: -219, y: UPPER_DECK_Y, z: 174 }, { x: minX, y: UPPER_DECK_Y, z: 180 }, "minecraft:smooth_stone");
  fill(operations, { x: -219, y: UPPER_DECK_Y, z: 173 }, { x: minX, y: UPPER_DECK_Y + 1, z: 173 }, "minecraft:orange_concrete");
  fill(operations, { x: -219, y: UPPER_DECK_Y, z: 181 }, { x: minX, y: UPPER_DECK_Y + 1, z: 181 }, "minecraft:orange_concrete");
  fill(operations, { x: -219, y: UPPER_DECK_Y + 2, z: 173 }, { x: minX, y: UPPER_DECK_Y + 2, z: 173 }, "minecraft:cyan_stained_glass");
  fill(operations, { x: -219, y: UPPER_DECK_Y + 2, z: 181 }, { x: minX, y: UPPER_DECK_Y + 2, z: 181 }, "minecraft:cyan_stained_glass");
  for (let x = -215; x <= minX; x += 8) {
    point(operations, x, UPPER_DECK_Y + 1, 173, "minecraft:sea_lantern");
    point(operations, x, UPPER_DECK_Y + 1, 181, "minecraft:sea_lantern");
  }
}

function preflightLoadedChunks(dimension: Dimension, checkpoints: Vector3[]): void {
  const missing = checkpoints.find((location) => !dimension.isChunkLoaded(location));
  if (missing) {
    throw new Error(
      `The build area near X ${missing.x}, Z ${missing.z} has not loaded yet. Wait a moment and click this same button again.`
    );
  }
}

export function buildElevatorHub(ui: IPlayerUISession<unknown>): string {
  const dimension = ui.extensionContext.player.dimension;
  preflightLoadedChunks(dimension, [
    { x: -184, y: 45, z: 177 },
    { x: -219, y: 90, z: 177 }
  ]);
  const operations: FillOperation[] = [];
  addTowerAndUpperBridge(operations);
  applyDirectFills(dimension, operations);
  return "Stage 1 complete: built the elevator tower and helipad bridge.";
}

export function buildRunwayCausewaySection(ui: IPlayerUISession<unknown>, endZ: number, startZ: number, includePlatform: boolean): string {
  const dimension = ui.extensionContext.player.dimension;
  const checkpoints: Vector3[] = [];
  for (let z = endZ; z <= startZ; z += 16) checkpoints.push({ x: -188, y: 69, z });
  preflightLoadedChunks(dimension, checkpoints);
  const cleanup: FillOperation[] = [];
  removeOldRunwayAlignment(cleanup, endZ, startZ);
  applyDirectFills(dimension, cleanup);
  const operations: FillOperation[] = [];
  if (includePlatform) addLowerTransferPlatform(operations);
  addNorthCauseway(dimension, operations, endZ, startZ);
  applyDirectFills(dimension, operations);
  return "Stage 2 complete: built the supported runway causeway.";
}

export function buildLandCausewaySection(ui: IPlayerUISession<unknown>, startX: number, endX: number, includePlatform: boolean): string {
  const dimension = ui.extensionContext.player.dimension;
  const checkpoints: Vector3[] = [];
  for (let x = startX; x <= endX; x += 16) checkpoints.push({ x, y: 70, z: 182 });
  preflightLoadedChunks(dimension, checkpoints);
  const cleanup: FillOperation[] = [];
  removeOldLandAlignment(cleanup, startX, endX);
  applyDirectFills(dimension, cleanup);
  const operations: FillOperation[] = [];
  if (includePlatform) addLowerTransferPlatform(operations);
  addEastCauseway(dimension, operations, startX, endX);
  applyDirectFills(dimension, operations);
  return "Stage 3 complete: built the supported land causeway.";
}
