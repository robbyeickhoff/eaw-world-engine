import type { Dimension, Vector3 } from "@minecraft/server";
import type { IPlayerUISession } from "@minecraft/server-editor";
import { applyDirectFills, type FillOperation } from "../engine/transaction";

export interface RoadPoint { x: number; y: number; z: number }

export const MOUNTAIN_ROUTE: RoadPoint[] = [
  { x: -76, y: 70, z: 182 },
  { x: -35, y: 82, z: 194 },
  { x: -65, y: 94, z: 170 },
  { x: -25, y: 106, z: 162 },
  { x: -45, y: 112, z: 145 },
  { x: -23, y: 117, z: 151 }
];

function add(operations: FillOperation[], from: Vector3, to: Vector3, block: string): void {
  operations.push({ from, to, block });
}

function linePoints(from: RoadPoint, to: RoadPoint): RoadPoint[] {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const steps = Math.max(Math.abs(dx), Math.abs(dz));
  const points: RoadPoint[] = [];
  for (let index = 0; index <= steps; index += 1) {
    const ratio = steps === 0 ? 0 : index / steps;
    points.push({
      x: Math.round(from.x + dx * ratio),
      y: Math.round(from.y + (to.y - from.y) * ratio),
      z: Math.round(from.z + dz * ratio)
    });
  }
  return points.filter((point, index) => index === 0 || point.x !== points[index - 1].x || point.y !== points[index - 1].y || point.z !== points[index - 1].z);
}

function groundBelow(dimension: Dimension, point: RoadPoint): number | undefined {
  for (let y = point.y - 3; y >= -60; y -= 1) {
    const block = dimension.getBlock({ x: point.x, y, z: point.z });
    if (block?.isSolid) return y;
  }
  return undefined;
}

export function buildLandArrivalTerminal(ui: IPlayerUISession<unknown>): string {
  const dimension = ui.extensionContext.player.dimension;
  if (!dimension.isChunkLoaded({ x: -83, y: 70, z: 182 })) throw new Error("The land arrival area is not loaded yet.");
  const operations: FillOperation[] = [];

  add(operations, { x: -91, y: 67, z: 173 }, { x: -74, y: 68, z: 191 }, "minecraft:deepslate_tiles");
  add(operations, { x: -90, y: 69, z: 174 }, { x: -75, y: 69, z: 190 }, "minecraft:smooth_stone");
  add(operations, { x: -88, y: 69, z: 177 }, { x: -78, y: 69, z: 187 }, "minecraft:gray_concrete");
  add(operations, { x: -83, y: 69, z: 177 }, { x: -83, y: 69, z: 187 }, "minecraft:light_gray_concrete");
  add(operations, { x: -76, y: 69, z: 179 }, { x: -72, y: 69, z: 185 }, "minecraft:gray_concrete");

  add(operations, { x: -90, y: 70, z: 174 }, { x: -90, y: 73, z: 190 }, "minecraft:orange_concrete");
  add(operations, { x: -89, y: 74, z: 174 }, { x: -82, y: 74, z: 190 }, "minecraft:orange_concrete");
  add(operations, { x: -88, y: 74, z: 175 }, { x: -83, y: 74, z: 189 }, "minecraft:white_concrete");
  for (const z of [175, 182, 189]) add(operations, { x: -83, y: 74, z }, { x: -83, y: 74, z }, "minecraft:sea_lantern");

  add(operations, { x: -89, y: 70, z: 176 }, { x: -87, y: 70, z: 180 }, "minecraft:blue_concrete");
  add(operations, { x: -89, y: 70, z: 184 }, { x: -87, y: 70, z: 188 }, "minecraft:blue_concrete");
  for (const z of [174, 178, 186, 190]) add(operations, { x: -75, y: 70, z }, { x: -75, y: 71, z }, "minecraft:sea_lantern");

  applyDirectFills(dimension, operations);
  return "Built the land-side arrival terminal and mountain-road entrance.";
}

export function buildMountainRoadSegment(ui: IPlayerUISession<unknown>, segment: number): string {
  const dimension = ui.extensionContext.player.dimension;
  const from = MOUNTAIN_ROUTE[segment];
  const to = MOUNTAIN_ROUTE[segment + 1];
  if (!from || !to) throw new Error(`Unknown mountain-road segment ${segment}.`);
  const midpoint = { x: Math.round((from.x + to.x) / 2), y: Math.round((from.y + to.y) / 2), z: Math.round((from.z + to.z) / 2) };
  if (!dimension.isChunkLoaded(midpoint)) throw new Error("This mountain-road section has not loaded yet.");

  const operations: FillOperation[] = [];
  const points = linePoints(from, to);
  const eastWest = Math.abs(to.x - from.x) >= Math.abs(to.z - from.z);
  points.forEach((point, index) => {
    add(operations, { x: point.x - 2, y: point.y - 2, z: point.z - 2 }, { x: point.x + 2, y: point.y - 1, z: point.z + 2 }, "minecraft:deepslate_tiles");
    add(operations, { x: point.x - 2, y: point.y, z: point.z - 2 }, { x: point.x + 2, y: point.y, z: point.z + 2 }, "minecraft:gray_concrete");
    add(operations, { x: point.x, y: point.y, z: point.z }, { x: point.x, y: point.y, z: point.z }, "minecraft:light_gray_concrete");
    add(operations, { x: point.x - 2, y: point.y + 1, z: point.z - 2 }, { x: point.x + 2, y: point.y + 5, z: point.z + 2 }, "minecraft:air");

    if (index % 6 === 0) {
      if (eastWest) {
        for (const z of [point.z - 3, point.z + 3]) {
          add(operations, { x: point.x, y: point.y, z }, { x: point.x, y: point.y + 1, z }, "minecraft:yellow_concrete");
          add(operations, { x: point.x, y: point.y + 2, z }, { x: point.x, y: point.y + 2, z }, "minecraft:sea_lantern");
        }
      } else {
        for (const x of [point.x - 3, point.x + 3]) {
          add(operations, { x, y: point.y, z: point.z }, { x, y: point.y + 1, z: point.z }, "minecraft:yellow_concrete");
          add(operations, { x, y: point.y + 2, z: point.z }, { x, y: point.y + 2, z: point.z }, "minecraft:sea_lantern");
        }
      }
    }

    if (index % 8 === 0) {
      const ground = groundBelow(dimension, point);
      if (ground !== undefined && ground < point.y - 2) {
        add(operations, { x: point.x - 1, y: ground + 1, z: point.z - 1 }, { x: point.x + 1, y: point.y - 2, z: point.z + 1 }, "minecraft:polished_deepslate");
      }
    }
  });

  add(operations, { x: to.x - 4, y: to.y - 2, z: to.z - 4 }, { x: to.x + 4, y: to.y, z: to.z + 4 }, "minecraft:gray_concrete");
  add(operations, { x: to.x, y: to.y, z: to.z }, { x: to.x, y: to.y, z: to.z }, "minecraft:sea_lantern");
  applyDirectFills(dimension, operations);
  return `Built mountain-road section ${segment + 1} of ${MOUNTAIN_ROUTE.length - 1}.`;
}
