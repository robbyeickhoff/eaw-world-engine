import { system, type Dimension, type Vector3 } from "@minecraft/server";
import type { IPlayerUISession } from "@minecraft/server-editor";
import { HEIDI_TUNNEL_POINTS } from "../builds/heidiHavenMountainTunnel";

const SECTIONS = [
  { id: 1, from: 0, to: 27 }, { id: 2, from: 28, to: 55 },
  { id: 3, from: 56, to: 83 }, { id: 4, from: 84, to: 111 },
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

export function startResidualStructureLocator(
  ui: IPlayerUISession<unknown>,
  onProgress: (message: string) => void,
  onComplete: () => void,
  onError: (message: string) => void
): void {
  const dimension = ui.extensionContext.player.dimension;
  let sectionPosition = 0;

  const scanSection = (): void => {
    if (sectionPosition >= SECTIONS.length) {
      console.warn("EAW_RESIDUAL_LOCATOR_COMPLETE");
      onComplete();
      return;
    }
    const section = SECTIONS[sectionPosition];
    const midpoint = HEIDI_TUNNEL_POINTS[Math.floor((section.from + section.to) / 2)];
    ui.extensionContext.player.teleport({ x: midpoint.x, y: midpoint.y + 35, z: midpoint.z }, { dimension });
    onProgress(`Loading wide residual scan ${section.id} of 5...`);
    system.runTimeout(() => {
      try {
        const visited = new Set<string>();
        const bandCounts = { center: 0, shoulder: 0, outer: 0 };
        const severe: { x: number; z: number; difference: number; width: number }[] = [];
        let distinctiveBlocks = 0;
        let exposedStoneCliffs = 0;
        let minX = 9999; let maxX = -9999; let minZ = 9999; let maxZ = -9999;
        for (let index = section.from; index <= section.to; index += 1) {
          const { point, cross } = geometry(index);
          const left = median([38, 39, 40, 41, 42].map((width) => {
            const at = cross(-width);
            return terrainSurface(dimension, at.x, at.z, point.y + 5);
          }));
          const right = median([38, 39, 40, 41, 42].map((width) => {
            const at = cross(width);
            return terrainSurface(dimension, at.x, at.z, point.y + 5);
          }));
          for (let width = -35; width <= 35; width += 1) {
            const at = cross(width);
            const key = `${at.x},${at.z}`;
            if (visited.has(key)) continue;
            visited.add(key);
            const expected = Math.round(left + (right - left) * ((width + 35) / 70));
            const actual = terrainSurface(dimension, at.x, at.z, expected);
            const difference = actual - expected;
            const absoluteWidth = Math.abs(width);
            if (Math.abs(difference) >= 5) {
              if (absoluteWidth <= 13) bandCounts.center += 1;
              else if (absoluteWidth <= 22) bandCounts.shoulder += 1;
              else bandCounts.outer += 1;
              minX = Math.min(minX, at.x); maxX = Math.max(maxX, at.x);
              minZ = Math.min(minZ, at.z); maxZ = Math.max(maxZ, at.z);
              if (Math.abs(difference) >= 8) severe.push({ ...at, difference, width });
            }
            const surfaceBlock = dimension.getBlock({ x: at.x, y: actual, z: at.z });
            if (surfaceBlock?.typeId === "minecraft:stone") {
              const neighborHeights = [
                terrainSurface(dimension, at.x + 1, at.z, actual), terrainSurface(dimension, at.x - 1, at.z, actual),
                terrainSurface(dimension, at.x, at.z + 1, actual), terrainSurface(dimension, at.x, at.z - 1, actual)
              ];
              if (neighborHeights.some((height) => actual - height >= 8)) exposedStoneCliffs += 1;
            }
            for (let y = 60; y <= 130; y += 1) {
              const block = dimension.getBlock({ x: at.x, y, z: at.z });
              if (block && DISTINCTIVE.has(block.typeId)) distinctiveBlocks += 1;
            }
          }
        }
        severe.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
        const report = {
          section: section.id,
          route: [section.from, section.to],
          scanWidth: 71,
          columns: visited.size,
          anomaliesByBand: bandCounts,
          exposedStoneCliffs,
          distinctiveBlocks,
          anomalyBounds: minX === 9999 ? null : { from: { x: minX, z: minZ }, to: { x: maxX, z: maxZ } },
          severeLocations: severe.slice(0, 20)
        };
        console.warn(`EAW_RESIDUAL_LOCATOR ${JSON.stringify(report)}`);
        ui.log.info(`EAW_RESIDUAL_LOCATOR ${JSON.stringify(report)}`);
        sectionPosition += 1;
        scanSection();
      } catch (error) {
        const message = error instanceof Error ? `${error.message}${error.stack ? ` | ${error.stack}` : ""}` : String(error);
        console.warn(`EAW_RESIDUAL_LOCATOR_ERROR ${message}`);
        onError(message);
      }
    }, 60);
  };

  scanSection();
}
