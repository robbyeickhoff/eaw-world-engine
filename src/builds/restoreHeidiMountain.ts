import type { Dimension, Vector3 } from "@minecraft/server";
import type { IPlayerUISession } from "@minecraft/server-editor";
import { HEIDI_TUNNEL_POINTS, HEIDI_TUNNEL_SECTIONS } from "./heidiHavenMountainTunnel";
import { applyDirectFills, type FillOperation } from "../engine/transaction";

const NATURAL_BLOCKS = new Set([
  "minecraft:grass_block", "minecraft:dirt", "minecraft:stone", "minecraft:gravel",
  "minecraft:andesite", "minecraft:diorite", "minecraft:granite", "minecraft:coal_ore",
  "minecraft:deepslate", "minecraft:sand"
]);

function naturalSurface(dimension: Dimension, x: number, z: number, fallback: number): number {
  const top = dimension.getTopmostBlock({ x, z });
  if (!top) return fallback;
  for (let y = top.y; y >= Math.max(60, top.y - 60); y -= 1) {
    const block = dimension.getBlock({ x, y, z });
    if (block && NATURAL_BLOCKS.has(block.typeId)) return y;
  }
  return fallback;
}

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
    cross: (width: number) => ({
      x: Math.round(point.x + px * width),
      z: Math.round(point.z + pz * width)
    })
  };
}

export { HEIDI_TUNNEL_POINTS, HEIDI_TUNNEL_SECTIONS };

export function restoreHeidiMountainSection(ui: IPlayerUISession<unknown>, sectionIndex: number): string {
  const section = HEIDI_TUNNEL_SECTIONS[sectionIndex];
  if (!section) throw new Error("Unknown mountain restoration section.");
  const dimension = ui.extensionContext.player.dimension;
  const midpoint = HEIDI_TUNNEL_POINTS[Math.floor((section.from + section.to) / 2)];
  if (!dimension.isChunkLoaded(midpoint)) throw new Error("This mountain section has not loaded yet.");
  const operations: FillOperation[] = [];
  const visited = new Set<string>();
  const from = Math.max(0, section.from - 2);
  const to = Math.min(HEIDI_TUNNEL_POINTS.length - 1, section.to + 2);

  for (let index = from; index <= to; index += 1) {
    const { point, cross } = geometry(index);
    const left = cross(-17);
    const right = cross(17);
    const leftHeight = naturalSurface(dimension, left.x, left.z, point.y + 9);
    const rightHeight = naturalSurface(dimension, right.x, right.z, point.y + 9);

    for (let width = -12; width <= 12; width += 1) {
      const at = cross(width);
      const key = `${at.x},${at.z}`;
      if (visited.has(key)) continue;
      visited.add(key);
      const blend = (width + 12) / 24;
      const sideHeight = Math.round(leftHeight + (rightHeight - leftHeight) * blend);
      const ridge = Math.round(3 * (1 - Math.abs(width) / 12));
      const surfaceY = Math.max(68, sideHeight + ridge);
      const clearTop = Math.max(surfaceY + 8, point.y + 19);

      operations.push({ from: { x: at.x, y: 60, z: at.z }, to: { x: at.x, y: surfaceY - 4, z: at.z }, block: "minecraft:stone" });
      operations.push({ from: { x: at.x, y: surfaceY - 3, z: at.z }, to: { x: at.x, y: surfaceY - 1, z: at.z }, block: "minecraft:dirt" });
      operations.push({ from: { x: at.x, y: surfaceY, z: at.z }, to: { x: at.x, y: surfaceY, z: at.z }, block: "minecraft:grass_block" });
      operations.push({ from: { x: at.x, y: surfaceY + 1, z: at.z }, to: { x: at.x, y: clearTop, z: at.z }, block: "minecraft:air" });
    }
  }

  applyDirectFills(dimension, operations);
  return `Restored natural mountain section ${sectionIndex + 1} of ${HEIDI_TUNNEL_SECTIONS.length}.`;
}
