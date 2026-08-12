import { system, type Dimension, type Vector3 } from "@minecraft/server";
import type { IPlayerUISession } from "@minecraft/server-editor";
import { HEIDI_TUNNEL_POINTS } from "../builds/heidiHavenMountainTunnel";

const SECTIONS = [
  { id: 2, from: 28, to: 55 },
  { id: 3, from: 56, to: 83 },
  { id: 4, from: 84, to: 111 },
  { id: 5, from: 112, to: 129 }
] as const;
const TERRAIN = new Set([
  "minecraft:grass_block", "minecraft:dirt", "minecraft:stone", "minecraft:water",
  "minecraft:sand", "minecraft:gravel", "minecraft:andesite", "minecraft:diorite",
  "minecraft:granite", "minecraft:deepslate", "minecraft:coal_ore", "minecraft:iron_ore",
  "minecraft:copper_ore"
]);
const DISTINCTIVE = new Set([
  "minecraft:black_concrete", "minecraft:gray_concrete", "minecraft:yellow_concrete",
  "minecraft:orange_concrete", "minecraft:polished_blackstone_bricks",
  "minecraft:deepslate_tiles", "minecraft:polished_andesite", "minecraft:sea_lantern",
  "minecraft:glass", "minecraft:light_blue_stained_glass", "minecraft:purple_stained_glass",
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

function terrainSurface(dimension: Dimension, x: number, z: number, fallback: number): number {
  const top = dimension.getTopmostBlock({ x, z });
  if (!top) return fallback;
  for (let y = Math.min(140, top.y); y >= 37; y -= 1) {
    const block = dimension.getBlock({ x, y, z });
    if (block && TERRAIN.has(block.typeId)) return y;
  }
  return fallback;
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

export function startRemainingMountainSurvey(
  ui: IPlayerUISession<unknown>,
  onProgress: (message: string) => void,
  onComplete: () => void,
  onError: (message: string) => void
): void {
  const dimension = ui.extensionContext.player.dimension;
  let sectionPosition = 0;

  const scanSection = (): void => {
    try {
      if (sectionPosition >= SECTIONS.length) {
        console.warn("EAW_REMAINING_SURVEY_COMPLETE");
        onComplete();
        return;
      }
      const section = SECTIONS[sectionPosition];
      const midpoint = HEIDI_TUNNEL_POINTS[Math.floor((section.from + section.to) / 2)];
      ui.extensionContext.player.teleport({ x: midpoint.x, y: midpoint.y + 30, z: midpoint.z }, { dimension });
      onProgress(`Loading remaining damage section ${section.id} of 5...`);
      system.runTimeout(() => {
        try {
          const columns = new Set<string>();
          let excessColumns = 0;
          let deficitColumns = 0;
          let severeColumns = 0;
          let maximumExcess = 0;
          let maximumDeficit = 0;
          let distinctiveBlocks = 0;
          let loaded = true;
          for (let index = section.from; index <= section.to; index += 1) {
            const { point, cross } = geometry(index);
            loaded = loaded && dimension.isChunkLoaded(point);
            const left = median([15, 16, 17].map((width) => {
              const at = cross(-width);
              return terrainSurface(dimension, at.x, at.z, point.y + 5);
            }));
            const right = median([15, 16, 17].map((width) => {
              const at = cross(width);
              return terrainSurface(dimension, at.x, at.z, point.y + 5);
            }));
            for (let width = -13; width <= 13; width += 1) {
              const at = cross(width);
              const key = `${at.x},${at.z}`;
              if (columns.has(key)) continue;
              columns.add(key);
              const expected = Math.round(left + (right - left) * ((width + 13) / 26));
              const actual = terrainSurface(dimension, at.x, at.z, expected);
              const difference = actual - expected;
              if (difference > 3) excessColumns += 1;
              if (difference < -3) deficitColumns += 1;
              if (Math.abs(difference) >= 8) severeColumns += 1;
              maximumExcess = Math.max(maximumExcess, difference);
              maximumDeficit = Math.min(maximumDeficit, difference);
              for (let y = 60; y <= 130; y += 1) {
                const block = dimension.getBlock({ x: at.x, y, z: at.z });
                if (block && DISTINCTIVE.has(block.typeId)) distinctiveBlocks += 1;
              }
            }
          }
          const report = {
            section: section.id,
            route: [section.from, section.to],
            from: HEIDI_TUNNEL_POINTS[section.from],
            to: HEIDI_TUNNEL_POINTS[section.to],
            loaded,
            corridorWidth: 27,
            columns: columns.size,
            excessColumns,
            deficitColumns,
            severeColumns,
            maximumExcess,
            maximumDeficit,
            distinctiveBlocks,
            maximumCellsY60To130: columns.size * 71
          };
          console.warn(`EAW_REMAINING_SURVEY ${JSON.stringify(report)}`);
          ui.log.info(`EAW_REMAINING_SURVEY ${JSON.stringify(report)}`);
          sectionPosition += 1;
          scanSection();
        } catch (error) {
          const message = error instanceof Error ? `${error.message}${error.stack ? ` | ${error.stack}` : ""}` : String(error);
          console.warn(`EAW_REMAINING_SURVEY_ERROR ${message}`);
          onError(message);
        }
      }, 60);
    } catch (error) {
      onError(error instanceof Error ? error.message : String(error));
    }
  };

  scanSection();
}
