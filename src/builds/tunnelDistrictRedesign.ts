import type { Dimension, Vector3 } from "@minecraft/server";
import type { IPlayerUISession } from "@minecraft/server-editor";
import { applyDirectFills, type FillOperation } from "../engine/transaction";

const TUNNEL_MIN_X = -148;
const TUNNEL_MAX_X = -126;
const TUNNEL_MIN_Z = 65;
const TUNNEL_MAX_Z = 173;

function add(operations: FillOperation[], from: Vector3, to: Vector3, block: string): void {
  operations.push({ from, to, block });
}

export function removeTunnelSection(
  ui: IPlayerUISession<unknown>,
  fromZ: number,
  toZ: number
): string {
  const dimension = ui.extensionContext.player.dimension;
  const midpoint = { x: -137, y: 70, z: Math.round((fromZ + toZ) / 2) };
  if (!dimension.isChunkLoaded(midpoint)) throw new Error("This tunnel section has not loaded yet.");
  const operations: FillOperation[] = [];

  // Thin slices remain reliable across Minecraft chunk boundaries.
  for (let z = fromZ; z <= toZ; z += 1) {
    add(operations, { x: TUNNEL_MIN_X, y: 64, z }, { x: TUNNEL_MAX_X, y: 90, z }, "minecraft:air");
    add(operations, { x: TUNNEL_MIN_X, y: 55, z }, { x: TUNNEL_MAX_X, y: 63, z }, "minecraft:water");
  }
  applyDirectFills(dimension, operations);
  return `Removed tunnel section Z ${fromZ} to ${toZ} and restored the water channel.`;
}

interface RoadPoint { x: number; y: number; z: number }

function bezierPoint(t: number): RoadPoint {
  const start = { x: -132, y: 69, z: 49 };
  const control1 = { x: -145, y: 69, z: 51 };
  const control2 = { x: -163, y: 69, z: 35 };
  const end = { x: -176, y: 69, z: 37 };
  const inverse = 1 - t;
  return {
    x: Math.round(inverse ** 3 * start.x + 3 * inverse ** 2 * t * control1.x + 3 * inverse * t ** 2 * control2.x + t ** 3 * end.x),
    y: 69,
    z: Math.round(inverse ** 3 * start.z + 3 * inverse ** 2 * t * control1.z + 3 * inverse * t ** 2 * control2.z + t ** 3 * end.z)
  };
}

function groundY(dimension: Dimension, x: number, z: number): number {
  for (let y = 66; y >= 45; y -= 1) {
    const block = dimension.getBlock({ x, y, z });
    if (block?.isSolid) return y;
  }
  return 44;
}

export function buildSignAirportConnector(ui: IPlayerUISession<unknown>): string {
  const dimension = ui.extensionContext.player.dimension;
  if (!dimension.isChunkLoaded({ x: -154, y: 69, z: 43 })) throw new Error("The road connection area has not loaded yet.");
  const cleanup: FillOperation[] = [];
  const points: RoadPoint[] = [];
  for (let step = 0; step <= 56; step += 1) {
    const point = bezierPoint(step / 56);
    if (!points.some((existing) => existing.x === point.x && existing.z === point.z)) points.push(point);
  }
  points.forEach((point, index) => {
    if (index > 2 && index < points.length - 3) {
      add(cleanup, { x: point.x - 4, y: 64, z: point.z - 4 }, { x: point.x + 4, y: 74, z: point.z + 4 }, "minecraft:air");
    }
    if (index % 7 === 0) {
      add(cleanup, { x: point.x - 1, y: 55, z: point.z - 1 }, { x: point.x + 1, y: 63, z: point.z + 1 }, "minecraft:water");
      add(cleanup, { x: point.x - 1, y: 64, z: point.z - 1 }, { x: point.x + 1, y: 66, z: point.z + 1 }, "minecraft:air");
    }
  });
  applyDirectFills(dimension, cleanup);

  const operations: FillOperation[] = [];
  // Crisp east-west bridge from the sign road to a proper turning plaza.
  add(operations, { x: -176, y: 67, z: 46 }, { x: -132, y: 68, z: 52 }, "minecraft:deepslate_tiles");
  add(operations, { x: -176, y: 69, z: 47 }, { x: -132, y: 69, z: 51 }, "minecraft:gray_concrete");
  add(operations, { x: -176, y: 69, z: 49 }, { x: -132, y: 69, z: 49 }, "minecraft:light_gray_concrete");
  for (const z of [46, 52]) {
    add(operations, { x: -176, y: 69, z }, { x: -132, y: 70, z }, "minecraft:yellow_concrete");
    add(operations, { x: -176, y: 71, z }, { x: -132, y: 71, z }, "minecraft:cyan_stained_glass");
  }
  add(operations, { x: -176, y: 70, z: 47 }, { x: -132, y: 74, z: 51 }, "minecraft:air");

  // Clean 90-degree turning plaza and short airport-road connection.
  add(operations, { x: -182, y: 67, z: 43 }, { x: -170, y: 68, z: 55 }, "minecraft:deepslate_tiles");
  add(operations, { x: -181, y: 69, z: 44 }, { x: -171, y: 69, z: 54 }, "minecraft:gray_concrete");
  add(operations, { x: -179, y: 67, z: 37 }, { x: -173, y: 68, z: 49 }, "minecraft:deepslate_tiles");
  add(operations, { x: -178, y: 69, z: 37 }, { x: -174, y: 69, z: 49 }, "minecraft:gray_concrete");
  add(operations, { x: -176, y: 69, z: 37 }, { x: -176, y: 69, z: 49 }, "minecraft:light_gray_concrete");
  for (const x of [-179, -173]) {
    add(operations, { x, y: 69, z: 37 }, { x, y: 70, z: 47 }, "minecraft:yellow_concrete");
    add(operations, { x, y: 71, z: 37 }, { x, y: 71, z: 47 }, "minecraft:cyan_stained_glass");
  }

  for (const x of [-168, -152, -136]) {
    const ground = groundY(dimension, x, 49);
    if (ground < 67) add(operations, { x: x - 1, y: ground + 1, z: 48 }, { x: x + 1, y: 66, z: 50 }, "minecraft:polished_deepslate");
    for (const z of [46, 52]) add(operations, { x, y: 71, z }, { x, y: 71, z }, "minecraft:sea_lantern");
  }
  applyDirectFills(dimension, operations);
  return "Rebuilt the sign-to-airport connection as a clean bridge, turning plaza, and aligned airport-road link.";
}

export const TUNNEL_SECTIONS = [
  { fromZ: TUNNEL_MIN_Z, toZ: 100 },
  { fromZ: 101, toZ: 137 },
  { fromZ: 138, toZ: TUNNEL_MAX_Z }
] as const;
