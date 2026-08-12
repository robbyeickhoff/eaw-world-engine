import type { Dimension, Vector3 } from "@minecraft/server";
import type { IPlayerUISession } from "@minecraft/server-editor";
import { HEIDI_TUNNEL_POINTS, HEIDI_TUNNEL_SECTIONS } from "../builds/heidiHavenMountainTunnel";

const ARTIFICIAL = new Set([
  "minecraft:black_concrete", "minecraft:gray_concrete", "minecraft:yellow_concrete",
  "minecraft:orange_concrete", "minecraft:polished_blackstone_bricks",
  "minecraft:deepslate_tiles", "minecraft:polished_andesite", "minecraft:sea_lantern",
  "minecraft:purple_stained_glass", "minecraft:amethyst_block"
]);

function geometry(index: number): { point: Vector3; cross: (width: number) => Vector3 } {
  const point = HEIDI_TUNNEL_POINTS[index];
  const previous = HEIDI_TUNNEL_POINTS[Math.max(0, index - 1)];
  const next = HEIDI_TUNNEL_POINTS[Math.min(HEIDI_TUNNEL_POINTS.length - 1, index + 1)];
  const dx = next.x - previous.x;
  const dz = next.z - previous.z;
  const length = Math.max(1, Math.sqrt(dx * dx + dz * dz));
  const px = -dz / length;
  const pz = dx / length;
  return { point, cross: (width) => ({ x: Math.round(point.x + px * width), y: point.y, z: Math.round(point.z + pz * width) }) };
}

function topY(dimension: Dimension, x: number, z: number): number | undefined {
  return dimension.getTopmostBlock({ x, z })?.y;
}

export { HEIDI_TUNNEL_POINTS, HEIDI_TUNNEL_SECTIONS };

export interface MountainSurveyResult {
  readonly summary: string;
  readonly detail: string;
}

export function surveyHeidiDamageSection(ui: IPlayerUISession<unknown>, sectionIndex: number): MountainSurveyResult {
  const section = HEIDI_TUNNEL_SECTIONS[sectionIndex];
  if (!section) throw new Error("Unknown survey section.");
  const dimension = ui.extensionContext.player.dimension;
  const midpoint = HEIDI_TUNNEL_POINTS[Math.floor((section.from + section.to) / 2)];
  if (!dimension.isChunkLoaded(midpoint)) throw new Error("Survey area has not loaded yet.");

  const columns = new Set<string>();
  let artificialBlocks = 0;
  let minTop = 999;
  let maxTop = -999;
  const crossSections: string[] = [];
  for (let index = section.from; index <= section.to; index += 4) {
    const { point, cross } = geometry(index);
    const heights: number[] = [];
    for (let width = -30; width <= 30; width += 3) {
      const at = cross(width);
      const key = `${at.x},${at.z}`;
      if (columns.has(key)) continue;
      columns.add(key);
      const surface = topY(dimension, at.x, at.z);
      if (surface !== undefined) {
        minTop = Math.min(minTop, surface);
        maxTop = Math.max(maxTop, surface);
        heights.push(surface);
      }
      for (let y = 60; y <= 140; y += 1) {
        const block = dimension.getBlock({ x: at.x, y, z: at.z });
        if (block && ARTIFICIAL.has(block.typeId)) artificialBlocks += 1;
      }
    }
    crossSections.push(`${index}:${heights.join(",")}`);
  }
  const report = {
    section: sectionIndex + 1,
    route: [section.from, section.to],
    columns: columns.size,
    topRange: [minTop, maxTop],
    artificialBlocks,
    crossSections
  };
  const detail = JSON.stringify(report);
  ui.log.info(`EAW_MOUNTAIN_SURVEY ${detail}`);
  // Console output is persisted in Minecraft's ContentLog, unlike the Editor UI log.
  console.warn(`EAW_MOUNTAIN_SURVEY ${detail}`);
  return {
    summary: `Section ${sectionIndex + 1}: ${columns.size} columns, surface Y ${minTop}-${maxTop}, ${artificialBlocks} artificial samples.`,
    detail
  };
}
