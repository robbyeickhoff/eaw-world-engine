import type { IPlayerUISession } from "@minecraft/server-editor";
import { applyDirectFills, type FillOperation } from "../engine/transaction";

export function buildCraneEasterEgg(ui: IPlayerUISession<unknown>): string {
  const dimension = ui.extensionContext.player.dimension;
  if (!dimension.isChunkLoaded({ x: -83, y: 70, z: 50 })) {
    throw new Error("The gantry crane area is not loaded yet.");
  }

  const operations: FillOperation[] = [];
  const add = (from: { x: number; y: number; z: number }, to: { x: number; y: number; z: number }, block: string): void => {
    operations.push({ from, to, block });
  };

  // Reset the crane cable and both possible cargo positions.
  add({ x: -83, y: 70, z: 48 }, { x: -83, y: 80, z: 52 }, "minecraft:air");
  add({ x: -85, y: 70, z: 48 }, { x: -81, y: 78, z: 52 }, "minecraft:air");
  add({ x: -83, y: 77, z: 50 }, { x: -83, y: 80, z: 50 }, "minecraft:chain");

  // Suspended mystery cargo: rugged shell, warning corners, concealed luminous core.
  add({ x: -85, y: 73, z: 48 }, { x: -81, y: 76, z: 52 }, "minecraft:polished_blackstone_bricks");
  add({ x: -84, y: 74, z: 49 }, { x: -82, y: 75, z: 51 }, "minecraft:purple_stained_glass");
  for (const x of [-85, -81]) {
    for (const z of [48, 52]) add({ x, y: 73, z }, { x, y: 76, z }, "minecraft:orange_concrete");
  }
  add({ x: -83, y: 73, z: 48 }, { x: -83, y: 76, z: 48 }, "minecraft:yellow_concrete");

  // Marked landing pad under the crane.
  add({ x: -86, y: 69, z: 47 }, { x: -80, y: 69, z: 53 }, "minecraft:polished_blackstone");
  add({ x: -85, y: 69, z: 48 }, { x: -81, y: 69, z: 52 }, "minecraft:yellow_concrete");
  add({ x: -84, y: 69, z: 49 }, { x: -82, y: 69, z: 51 }, "minecraft:deepslate_tiles");

  // Rework the existing gold pillar into an obvious industrial control console.
  add({ x: -95, y: 69, z: 54 }, { x: -93, y: 69, z: 56 }, "minecraft:polished_blackstone_bricks");
  add({ x: -95, y: 70, z: 54 }, { x: -93, y: 71, z: 56 }, "minecraft:deepslate_tiles");
  // Large protruding activation panel: impossible to bury or mistake for the console shell.
  add({ x: -96, y: 70, z: 55 }, { x: -96, y: 71, z: 56 }, "minecraft:gold_block");
  add({ x: -95, y: 72, z: 55 }, { x: -93, y: 72, z: 55 }, "minecraft:orange_concrete");
  add({ x: -94, y: 72, z: 55 }, { x: -94, y: 72, z: 55 }, "minecraft:sea_lantern");

  applyDirectFills(dimension, operations);
  return "Built the interactive gantry-crane mystery cargo and control console.";
}
