import type { IPlayerUISession } from "@minecraft/server-editor";
import { applyDirectFills, type FillOperation } from "../engine/transaction";

function add(
  operations: FillOperation[],
  from: { x: number; y: number; z: number },
  to: { x: number; y: number; z: number },
  block: string
): void {
  operations.push({ from, to, block });
}

export function buildRunwayArrivalTerminal(ui: IPlayerUISession<unknown>): string {
  const dimension = ui.extensionContext.player.dimension;
  if (!dimension.isChunkLoaded({ x: -188, y: 69, z: 40 })) {
    throw new Error("The runway arrival area has not loaded yet. Wait a moment and try again.");
  }

  const operations: FillOperation[] = [];

  // Structural apron and seamless causeway entrance.
  add(operations, { x: -201, y: 67, z: 29 }, { x: -175, y: 68, z: 44 }, "minecraft:deepslate_tiles");
  add(operations, { x: -200, y: 69, z: 30 }, { x: -176, y: 69, z: 43 }, "minecraft:smooth_stone");
  add(operations, { x: -193, y: 67, z: 38 }, { x: -183, y: 69, z: 46 }, "minecraft:smooth_stone");

  // Vehicle turnaround loop and center island.
  add(operations, { x: -198, y: 69, z: 32 }, { x: -178, y: 69, z: 34 }, "minecraft:gray_concrete");
  add(operations, { x: -198, y: 69, z: 39 }, { x: -178, y: 69, z: 41 }, "minecraft:gray_concrete");
  add(operations, { x: -198, y: 69, z: 35 }, { x: -196, y: 69, z: 38 }, "minecraft:gray_concrete");
  add(operations, { x: -180, y: 69, z: 35 }, { x: -178, y: 69, z: 38 }, "minecraft:gray_concrete");
  add(operations, { x: -194, y: 69, z: 35 }, { x: -182, y: 69, z: 38 }, "minecraft:light_gray_concrete");
  add(operations, { x: -188, y: 69, z: 35 }, { x: -188, y: 69, z: 38 }, "minecraft:yellow_concrete");

  // Covered passenger loading bay on the west side.
  add(operations, { x: -200, y: 70, z: 31 }, { x: -198, y: 73, z: 31 }, "minecraft:polished_blackstone_bricks");
  add(operations, { x: -200, y: 70, z: 42 }, { x: -198, y: 73, z: 42 }, "minecraft:polished_blackstone_bricks");
  add(operations, { x: -201, y: 74, z: 30 }, { x: -194, y: 74, z: 43 }, "minecraft:orange_concrete");
  add(operations, { x: -200, y: 74, z: 31 }, { x: -195, y: 74, z: 42 }, "minecraft:white_concrete");
  add(operations, { x: -199, y: 70, z: 34 }, { x: -197, y: 70, z: 39 }, "minecraft:blue_concrete");
  for (const z of [31, 36, 42]) {
    add(operations, { x: -195, y: 74, z }, { x: -195, y: 74, z }, "minecraft:sea_lantern");
  }

  // Runway-facing security line and controlled service opening.
  add(operations, { x: -200, y: 70, z: 29 }, { x: -191, y: 71, z: 29 }, "minecraft:yellow_concrete");
  add(operations, { x: -185, y: 70, z: 29 }, { x: -176, y: 71, z: 29 }, "minecraft:yellow_concrete");
  add(operations, { x: -190, y: 70, z: 29 }, { x: -186, y: 70, z: 29 }, "minecraft:polished_blackstone");
  add(operations, { x: -190, y: 71, z: 29 }, { x: -190, y: 73, z: 29 }, "minecraft:orange_concrete");
  add(operations, { x: -186, y: 71, z: 29 }, { x: -186, y: 73, z: 29 }, "minecraft:orange_concrete");
  add(operations, { x: -190, y: 73, z: 29 }, { x: -186, y: 73, z: 29 }, "minecraft:sea_lantern");

  // Parallel service-road stubs and illuminated perimeter bollards.
  add(operations, { x: -207, y: 68, z: 31 }, { x: -201, y: 69, z: 36 }, "minecraft:gray_concrete");
  add(operations, { x: -175, y: 68, z: 31 }, { x: -169, y: 69, z: 36 }, "minecraft:gray_concrete");
  for (const x of [-200, -194, -182, -176]) {
    add(operations, { x, y: 70, z: 43 }, { x, y: 71, z: 43 }, "minecraft:sea_lantern");
  }

  applyDirectFills(dimension, operations);
  return "Built the runway-side airside terminal, turnaround, passenger bay, security gate, and service-road connection.";
}
