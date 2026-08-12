import type { Vector3 } from "@minecraft/server";
import type { IPlayerUISession } from "@minecraft/server-editor";
import { applyDirectFills, type FillOperation } from "../engine/transaction";

interface TunnelPoint extends Vector3 {}

const ROUTE: TunnelPoint[] = [
  { x: -67, y: 71, z: 133 },
  { x: -67, y: 73, z: 150 },
  { x: -60, y: 75, z: 164 },
  { x: -42, y: 80, z: 174 },
  { x: -18, y: 87, z: 188 },
  { x: 8, y: 95, z: 202 },
  { x: 27, y: 101, z: 211 },
  { x: 32, y: 103, z: 222 }
];

function routePoints(): TunnelPoint[] {
  const result: TunnelPoint[] = [];
  for (let segment = 0; segment < ROUTE.length - 1; segment += 1) {
    const from = ROUTE[segment];
    const to = ROUTE[segment + 1];
    const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.z - from.z));
    for (let step = segment === 0 ? 0 : 1; step <= steps; step += 1) {
      const t = step / steps;
      result.push({
        x: Math.round(from.x + (to.x - from.x) * t),
        y: Math.round(from.y + (to.y - from.y) * t),
        z: Math.round(from.z + (to.z - from.z) * t)
      });
    }
  }
  return result.filter((point, index, points) => index === 0 || point.x !== points[index - 1].x || point.y !== points[index - 1].y || point.z !== points[index - 1].z);
}

export const HEIDI_TUNNEL_POINTS = routePoints();
export const HEIDI_TUNNEL_SECTIONS = Array.from(
  { length: Math.ceil(HEIDI_TUNNEL_POINTS.length / 28) },
  (_, index) => ({
    from: index * 28,
    to: Math.min(HEIDI_TUNNEL_POINTS.length - 1, index * 28 + 27)
  })
);

function add(operations: FillOperation[], from: Vector3, to: Vector3, block: string): void {
  operations.push({ from, to, block });
}

export function buildHeidiTunnelSection(ui: IPlayerUISession<unknown>, sectionIndex: number): string {
  const section = HEIDI_TUNNEL_SECTIONS[sectionIndex];
  if (!section) throw new Error("Unknown Heidi Haven tunnel section.");
  const dimension = ui.extensionContext.player.dimension;
  const midpoint = HEIDI_TUNNEL_POINTS[Math.floor((section.from + section.to) / 2)];
  if (!dimension.isChunkLoaded(midpoint)) throw new Error("This mountain section has not loaded yet.");
  const operations: FillOperation[] = [];

  const buildFrom = Math.max(0, section.from - 2);
  const buildTo = Math.min(HEIDI_TUNNEL_POINTS.length - 1, section.to + 2);

  const geometry = (index: number): { point: TunnelPoint; cross: (width: number) => { x: number; z: number } } => {
    const point = HEIDI_TUNNEL_POINTS[index];
    const previous = HEIDI_TUNNEL_POINTS[Math.max(0, index - 1)];
    const next = HEIDI_TUNNEL_POINTS[Math.min(HEIDI_TUNNEL_POINTS.length - 1, index + 1)];
    const dx = next.x - previous.x;
    const dz = next.z - previous.z;
    const length = Math.max(1, Math.sqrt(dx * dx + dz * dz));
    const px = -dz / length;
    const pz = dx / length;
    const cross = (width: number): { x: number; z: number } => ({
      x: Math.round(point.x + px * width),
      z: Math.round(point.z + pz * width)
    });
    return { point, cross };
  };

  // Pass 1: reconstruct the mountain mass that the previous oversized clearing
  // removed. This deliberately happens before the finished tunnel is carved.
  for (let index = buildFrom; index <= buildTo; index += 1) {
    const { point, cross } = geometry(index);
    add(operations, { x: point.x - 9, y: point.y - 2, z: point.z - 9 }, { x: point.x + 9, y: point.y + 11, z: point.z + 9 }, "minecraft:stone");
    for (let width = -9; width <= 9; width += 1) {
      const at = cross(width);
      const top = point.y + 15 - Math.floor(Math.abs(width) / 2);
      add(operations, { x: at.x - 1, y: point.y + 12, z: at.z - 1 }, { x: at.x + 1, y: top - 1, z: at.z + 1 }, "minecraft:dirt");
      add(operations, { x: at.x - 1, y: top, z: at.z - 1 }, { x: at.x + 1, y: top, z: at.z + 1 }, "minecraft:grass_block");
    }
  }

  // Pass 2: carve only the final interior profile. Three-block overlaps make the
  // diagonal path continuous without cutting open the mountain beside it.
  for (let index = buildFrom; index <= buildTo; index += 1) {
    const { point, cross } = geometry(index);
    for (let width = -5; width <= 5; width += 1) {
      const at = cross(width);
      add(operations, { x: at.x - 1, y: point.y + 1, z: at.z - 1 }, { x: at.x + 1, y: point.y + 8, z: at.z + 1 }, "minecraft:air");
    }
  }

  // Pass 3: continuous road, sidewalks, lined walls, and ceiling.
  for (let index = buildFrom; index <= buildTo; index += 1) {
    const { point, cross } = geometry(index);

    for (let width = -5; width <= 5; width += 1) {
      const at = cross(width);
      add(operations, { x: at.x - 1, y: point.y - 2, z: at.z - 1 }, { x: at.x + 1, y: point.y - 1, z: at.z + 1 }, "minecraft:deepslate_tiles");
      const floorBlock = Math.abs(width) === 5
        ? "minecraft:polished_andesite"
        : width === 0
          ? "minecraft:yellow_concrete"
          : "minecraft:gray_concrete";
      add(operations, { x: at.x - 1, y: point.y, z: at.z - 1 }, { x: at.x + 1, y: point.y, z: at.z + 1 }, floorBlock);
      add(operations, { x: at.x - 1, y: point.y + 9, z: at.z - 1 }, { x: at.x + 1, y: point.y + 10, z: at.z + 1 }, "minecraft:deepslate_tiles");
    }
    for (const width of [-6, 6]) {
      const at = cross(width);
      add(operations, { x: at.x - 1, y: point.y, z: at.z - 1 }, { x: at.x + 1, y: point.y + 9, z: at.z + 1 }, "minecraft:polished_blackstone_bricks");
    }

    if (index % 10 === 0) {
      for (const width of [-5, 5]) {
        const at = cross(width);
        add(operations, { x: at.x, y: point.y + 1, z: at.z }, { x: at.x, y: point.y + 8, z: at.z }, "minecraft:orange_concrete");
      }
      for (let width = -5; width <= 5; width += 1) {
        const at = cross(width);
        add(operations, { x: at.x, y: point.y + 8, z: at.z }, { x: at.x, y: point.y + 8, z: at.z }, width === 0 || Math.abs(width) === 4 ? "minecraft:sea_lantern" : "minecraft:orange_concrete");
      }
    }
  }

  // Replace the failed exposed chamber with two contained illuminated alcoves.
  if (section.from <= 70 && section.to >= 70) {
    const { point, cross } = geometry(70);
    for (const width of [-5, 5]) {
      const at = cross(width);
      add(operations, { x: at.x - 1, y: point.y + 2, z: at.z - 1 }, { x: at.x + 1, y: point.y + 6, z: at.z + 1 }, "minecraft:purple_stained_glass");
      add(operations, { x: at.x, y: point.y + 3, z: at.z }, { x: at.x, y: point.y + 5, z: at.z }, "minecraft:amethyst_block");
      add(operations, { x: at.x, y: point.y + 7, z: at.z }, { x: at.x, y: point.y + 7, z: at.z }, "minecraft:sea_lantern");
    }
  }

  // Remove the oversized failed gateway, then install a compact portal below the
  // elevated road instead of colliding with it.
  if (sectionIndex === 0) {
    add(operations, { x: -75, y: 85, z: 132 }, { x: -59, y: 96, z: 136 }, "minecraft:air");
    add(operations, { x: -74, y: 69, z: 131 }, { x: -72, y: 82, z: 135 }, "minecraft:polished_blackstone_bricks");
    add(operations, { x: -62, y: 69, z: 131 }, { x: -60, y: 82, z: 135 }, "minecraft:polished_blackstone_bricks");
    add(operations, { x: -74, y: 81, z: 131 }, { x: -60, y: 84, z: 135 }, "minecraft:orange_concrete");
    add(operations, { x: -71, y: 71, z: 132 }, { x: -63, y: 80, z: 138 }, "minecraft:air");
  }

  // Monumental daylight portal at the Heidi Haven district exit.
  if (sectionIndex === HEIDI_TUNNEL_SECTIONS.length - 1) {
    add(operations, { x: 25, y: 112, z: 220 }, { x: 39, y: 115, z: 224 }, "minecraft:air");
    add(operations, { x: 25, y: 101, z: 220 }, { x: 25, y: 113, z: 224 }, "minecraft:polished_blackstone_bricks");
    add(operations, { x: 39, y: 101, z: 220 }, { x: 39, y: 113, z: 224 }, "minecraft:polished_blackstone_bricks");
    add(operations, { x: 25, y: 112, z: 220 }, { x: 39, y: 113, z: 224 }, "minecraft:orange_concrete");
    add(operations, { x: 26, y: 103, z: 220 }, { x: 38, y: 111, z: 224 }, "minecraft:air");
    for (const x of [27, 32, 37]) add(operations, { x, y: 113, z: 219 }, { x, y: 113, z: 219 }, "minecraft:sea_lantern");
  }

  applyDirectFills(dimension, operations);
  return `Built Heidi Haven mountain tunnel section ${sectionIndex + 1} of ${HEIDI_TUNNEL_SECTIONS.length}.`;
}
