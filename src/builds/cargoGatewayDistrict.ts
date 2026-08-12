import type { Vector3 } from "@minecraft/server";
import type { IPlayerUISession } from "@minecraft/server-editor";
import { applyDirectFills, type FillOperation } from "../engine/transaction";

function add(operations: FillOperation[], from: Vector3, to: Vector3, block: string): void {
  operations.push({ from, to, block });
}

function disk(
  operations: FillOperation[],
  centerX: number,
  centerZ: number,
  y: number,
  radius: number,
  block: string,
  minimumRadius = 0
): void {
  for (let x = centerX - radius; x <= centerX + radius; x += 1) {
    for (let z = centerZ - radius; z <= centerZ + radius; z += 1) {
      const distanceSquared = (x - centerX) ** 2 + (z - centerZ) ** 2;
      if (distanceSquared <= radius ** 2 && distanceSquared >= minimumRadius ** 2) {
        add(operations, { x, y, z }, { x, y, z }, block);
      }
    }
  }
}

export function buildCargoRoundabout(ui: IPlayerUISession<unknown>): string {
  const dimension = ui.extensionContext.player.dimension;
  if (!dimension.isChunkLoaded({ x: -80, y: 70, z: 50 })) throw new Error("The cargo roundabout area is not loaded yet.");
  const operations: FillOperation[] = [];

  // Clear only the traffic zone; overhead gantry beams remain untouched.
  disk(operations, -80, 50, 70, 14, "minecraft:air", 5);
  for (let y = 71; y <= 75; y += 1) disk(operations, -80, 50, y, 14, "minecraft:air", 5);
  disk(operations, -80, 50, 67, 14, "minecraft:deepslate_tiles");
  disk(operations, -80, 50, 68, 14, "minecraft:deepslate_tiles");
  disk(operations, -80, 50, 69, 13, "minecraft:gray_concrete", 6);
  disk(operations, -80, 50, 69, 6, "minecraft:orange_concrete", 5);
  disk(operations, -80, 50, 69, 5, "minecraft:polished_blackstone");

  // Freight-themed center island.
  add(operations, { x: -83, y: 70, z: 47 }, { x: -78, y: 71, z: 50 }, "minecraft:orange_concrete");
  add(operations, { x: -82, y: 72, z: 49 }, { x: -77, y: 73, z: 52 }, "minecraft:cyan_concrete");
  add(operations, { x: -81, y: 74, z: 49 }, { x: -79, y: 74, z: 51 }, "minecraft:sea_lantern");

  // West gateway and east cargo-hall branch.
  add(operations, { x: -96, y: 67, z: 46 }, { x: -88, y: 68, z: 54 }, "minecraft:deepslate_tiles");
  add(operations, { x: -96, y: 69, z: 47 }, { x: -88, y: 69, z: 53 }, "minecraft:gray_concrete");
  add(operations, { x: -72, y: 67, z: 46 }, { x: -65, y: 68, z: 54 }, "minecraft:deepslate_tiles");
  add(operations, { x: -72, y: 69, z: 47 }, { x: -65, y: 69, z: 53 }, "minecraft:gray_concrete");
  add(operations, { x: -96, y: 70, z: 47 }, { x: -65, y: 74, z: 53 }, "minecraft:air");
  add(operations, { x: -96, y: 69, z: 50 }, { x: -88, y: 69, z: 50 }, "minecraft:light_gray_concrete");
  add(operations, { x: -72, y: 69, z: 50 }, { x: -65, y: 69, z: 50 }, "minecraft:light_gray_concrete");

  // Industrial lighting at the four roundabout approaches.
  for (const point of [
    { x: -94, z: 45 }, { x: -94, z: 55 }, { x: -66, z: 45 }, { x: -66, z: 55 },
    { x: -85, z: 64 }, { x: -75, z: 64 }
  ]) {
    add(operations, { x: point.x, y: 70, z: point.z }, { x: point.x, y: 72, z: point.z }, "minecraft:yellow_concrete");
    add(operations, { x: point.x, y: 73, z: point.z }, { x: point.x, y: 73, z: point.z }, "minecraft:sea_lantern");
  }

  applyDirectFills(dimension, operations);
  return "Built the freight roundabout, cargo-hall branch, and organized gateway approaches.";
}

interface RoadPoint { x: number; y: number; z: number }

function approachPoints(): RoadPoint[] {
  const points: RoadPoint[] = [];
  for (let z = 62; z <= 90; z += 1) points.push({ x: -80, y: 69, z });
  for (let offset = 1; offset <= 13; offset += 1) points.push({ x: -80 + offset, y: 69 + Math.round(offset / 13), z: 90 + offset });
  for (let z = 104; z <= 133; z += 1) points.push({ x: -67, y: 70 + Math.round((z - 104) / 29), z });
  return points;
}

export function buildMountainApproach(ui: IPlayerUISession<unknown>): string {
  const dimension = ui.extensionContext.player.dimension;
  if (!dimension.isChunkLoaded({ x: -73, y: 78, z: 98 })) throw new Error("The mountain approach has not loaded yet.");
  const operations: FillOperation[] = [];
  const points = approachPoints();
  points.forEach((point, index) => {
    add(operations, { x: point.x - 3, y: point.y - 2, z: point.z - 3 }, { x: point.x + 3, y: point.y - 1, z: point.z + 3 }, "minecraft:deepslate_tiles");
    add(operations, { x: point.x - 2, y: point.y, z: point.z - 2 }, { x: point.x + 2, y: point.y, z: point.z + 2 }, "minecraft:gray_concrete");
    add(operations, { x: point.x, y: point.y, z: point.z }, { x: point.x, y: point.y, z: point.z }, "minecraft:light_gray_concrete");
    add(operations, { x: point.x - 2, y: point.y + 1, z: point.z - 2 }, { x: point.x + 2, y: point.y + 6, z: point.z + 2 }, "minecraft:air");
    if (index % 8 === 0) {
      for (const x of [point.x - 3, point.x + 3]) {
        add(operations, { x, y: point.y, z: point.z }, { x, y: point.y + 1, z: point.z }, "minecraft:orange_concrete");
        add(operations, { x, y: point.y + 2, z: point.z }, { x, y: point.y + 2, z: point.z }, "minecraft:sea_lantern");
      }
    }
  });
  applyDirectFills(dimension, operations);
  return "Built the unified gantry-to-mountain approach road.";
}

export function buildMountainPortalStarter(ui: IPlayerUISession<unknown>): string {
  const dimension = ui.extensionContext.player.dimension;
  if (!dimension.isChunkLoaded({ x: -64, y: 76, z: 145 })) throw new Error("The mountain portal has not loaded yet.");
  const operations: FillOperation[] = [];

  for (let depth = 0; depth <= 26; depth += 1) {
    const centerX = -67 + Math.round(depth / 7);
    const floorY = 71 + Math.round(depth / 8);
    const z = 133 + depth;
    add(operations, { x: centerX - 5, y: floorY - 1, z }, { x: centerX + 5, y: floorY + 7, z }, "minecraft:deepslate_tiles");
    add(operations, { x: centerX - 4, y: floorY, z }, { x: centerX + 4, y: floorY + 6, z }, "minecraft:air");
    add(operations, { x: centerX - 3, y: floorY, z }, { x: centerX + 3, y: floorY, z }, "minecraft:gray_concrete");
    add(operations, { x: centerX, y: floorY, z }, { x: centerX, y: floorY, z }, "minecraft:light_gray_concrete");
    if (depth % 6 === 0) {
      add(operations, { x: centerX - 4, y: floorY, z }, { x: centerX - 4, y: floorY + 6, z }, "minecraft:orange_concrete");
      add(operations, { x: centerX + 4, y: floorY, z }, { x: centerX + 4, y: floorY + 6, z }, "minecraft:orange_concrete");
      add(operations, { x: centerX - 4, y: floorY + 6, z }, { x: centerX + 4, y: floorY + 6, z }, "minecraft:orange_concrete");
      add(operations, { x: centerX, y: floorY + 6, z }, { x: centerX, y: floorY + 6, z }, "minecraft:sea_lantern");
    }
  }

  // Monumental portal face at the former tree location.
  add(operations, { x: -73, y: 70, z: 132 }, { x: -73, y: 80, z: 134 }, "minecraft:polished_blackstone_bricks");
  add(operations, { x: -61, y: 70, z: 132 }, { x: -61, y: 80, z: 134 }, "minecraft:polished_blackstone_bricks");
  add(operations, { x: -73, y: 80, z: 132 }, { x: -61, y: 82, z: 134 }, "minecraft:orange_concrete");
  for (const x of [-72, -67, -62]) add(operations, { x, y: 81, z: 132 }, { x, y: 81, z: 132 }, "minecraft:sea_lantern");

  // Temporary illuminated construction barrier at the starter bore.
  add(operations, { x: -67, y: 74, z: 159 }, { x: -61, y: 77, z: 159 }, "minecraft:orange_stained_glass");
  add(operations, { x: -65, y: 75, z: 158 }, { x: -63, y: 76, z: 158 }, "minecraft:sea_lantern");
  applyDirectFills(dimension, operations);
  return "Built the Heidi Haven portal and 27-block rising starter tunnel.";
}
