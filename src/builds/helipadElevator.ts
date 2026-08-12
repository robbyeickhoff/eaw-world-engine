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

export function buildHelipadElevatorStations(ui: IPlayerUISession<unknown>): string {
  const dimension = ui.extensionContext.player.dimension;
  if (!dimension.isChunkLoaded({ x: -184, y: 70, z: 177 })) {
    throw new Error("The elevator tower is not loaded. Use Teleport to active build and try again.");
  }

  const operations: FillOperation[] = [];

  // Remove the accidental Y 75 canopy slab and restore the tower cross-section.
  add(operations, { x: -193, y: 75, z: 168 }, { x: -175, y: 75, z: 186 }, "minecraft:air");
  add(operations, { x: -189, y: 75, z: 172 }, { x: -179, y: 75, z: 182 }, "minecraft:cyan_stained_glass");
  add(operations, { x: -188, y: 75, z: 173 }, { x: -180, y: 75, z: 181 }, "minecraft:air");
  for (const x of [-189, -179]) {
    for (const z of [172, 182]) {
      add(operations, { x, y: 75, z }, { x, y: 75, z }, "minecraft:polished_blackstone_bricks");
    }
  }

  // Heavy underwater foundation so the tower reads as structurally anchored.
  add(operations, { x: -191, y: 45, z: 170 }, { x: -177, y: 48, z: 184 }, "minecraft:deepslate_tiles");
  for (const x of [-189, -179]) {
    for (const z of [172, 182]) {
      add(operations, { x: x - 1, y: 49, z: z - 1 }, { x: x + 1, y: 68, z: z + 1 }, "minecraft:polished_deepslate");
    }
  }
  for (const y of [52, 60, 68]) {
    add(operations, { x: -190, y, z: 171 }, { x: -178, y, z: 173 }, "minecraft:deepslate_tiles");
    add(operations, { x: -190, y, z: 181 }, { x: -178, y, z: 183 }, "minecraft:deepslate_tiles");
    add(operations, { x: -190, y, z: 174 }, { x: -188, y, z: 180 }, "minecraft:deepslate_tiles");
    add(operations, { x: -180, y, z: 174 }, { x: -178, y, z: 180 }, "minecraft:deepslate_tiles");
  }

  // Lower station floor, centered elevator car, and illuminated doorway.
  add(operations, { x: -188, y: 69, z: 173 }, { x: -180, y: 69, z: 181 }, "minecraft:polished_diorite");
  add(operations, { x: -187, y: 70, z: 174 }, { x: -181, y: 70, z: 180 }, "minecraft:light_gray_concrete");
  add(operations, { x: -187, y: 71, z: 174 }, { x: -181, y: 73, z: 174 }, "minecraft:cyan_stained_glass");
  add(operations, { x: -187, y: 71, z: 180 }, { x: -181, y: 73, z: 180 }, "minecraft:cyan_stained_glass");
  add(operations, { x: -187, y: 71, z: 175 }, { x: -187, y: 73, z: 179 }, "minecraft:cyan_stained_glass");
  add(operations, { x: -181, y: 71, z: 175 }, { x: -181, y: 73, z: 179 }, "minecraft:cyan_stained_glass");
  add(operations, { x: -187, y: 74, z: 174 }, { x: -181, y: 74, z: 180 }, "minecraft:orange_concrete");
  add(operations, { x: -186, y: 71, z: 175 }, { x: -182, y: 73, z: 179 }, "minecraft:air");
  add(operations, { x: -186, y: 70, z: 177 }, { x: -182, y: 70, z: 177 }, "minecraft:sea_lantern");

  // Lower station animated-door frame; gameplay leaves this opening clear at rest.
  add(operations, { x: -181, y: 71, z: 176 }, { x: -181, y: 73, z: 178 }, "minecraft:air");
  add(operations, { x: -181, y: 71, z: 175 }, { x: -181, y: 74, z: 175 }, "minecraft:orange_concrete");
  add(operations, { x: -181, y: 71, z: 179 }, { x: -181, y: 74, z: 179 }, "minecraft:orange_concrete");
  add(operations, { x: -181, y: 74, z: 175 }, { x: -181, y: 74, z: 179 }, "minecraft:orange_concrete");

  // Lower passenger platform and canopy facing both causeways.
  add(operations, { x: -193, y: 69, z: 169 }, { x: -176, y: 69, z: 185 }, "minecraft:light_gray_concrete");
  add(operations, { x: -192, y: 71, z: 170 }, { x: -177, y: 74, z: 184 }, "minecraft:air");

  // Upper station lobby and matching elevator landing.
  add(operations, { x: -188, y: 90, z: 173 }, { x: -180, y: 90, z: 181 }, "minecraft:polished_diorite");
  add(operations, { x: -188, y: 91, z: 172 }, { x: -180, y: 94, z: 172 }, "minecraft:cyan_stained_glass");
  add(operations, { x: -188, y: 91, z: 182 }, { x: -180, y: 94, z: 182 }, "minecraft:cyan_stained_glass");
  add(operations, { x: -188, y: 95, z: 172 }, { x: -180, y: 95, z: 182 }, "minecraft:orange_concrete");
  add(operations, { x: -187, y: 95, z: 173 }, { x: -181, y: 95, z: 181 }, "minecraft:white_concrete");
  add(operations, { x: -186, y: 95, z: 175 }, { x: -182, y: 95, z: 179 }, "minecraft:sea_lantern");

  // Upper station animated-door frame aligned with the helipad bridge exit.
  add(operations, { x: -188, y: 91, z: 176 }, { x: -188, y: 93, z: 178 }, "minecraft:air");
  add(operations, { x: -188, y: 91, z: 175 }, { x: -188, y: 94, z: 175 }, "minecraft:orange_concrete");
  add(operations, { x: -188, y: 91, z: 179 }, { x: -188, y: 94, z: 179 }, "minecraft:orange_concrete");
  add(operations, { x: -188, y: 94, z: 175 }, { x: -188, y: 94, z: 179 }, "minecraft:orange_concrete");

  // Clear and frame the upper west doorway onto the helipad bridge.
  add(operations, { x: -189, y: 91, z: 175 }, { x: -189, y: 93, z: 179 }, "minecraft:air");
  add(operations, { x: -189, y: 91, z: 174 }, { x: -189, y: 94, z: 174 }, "minecraft:orange_concrete");
  add(operations, { x: -189, y: 91, z: 180 }, { x: -189, y: 94, z: 180 }, "minecraft:orange_concrete");
  add(operations, { x: -189, y: 94, z: 174 }, { x: -189, y: 94, z: 180 }, "minecraft:orange_concrete");
  add(operations, { x: -189, y: 94, z: 176 }, { x: -189, y: 94, z: 178 }, "minecraft:sea_lantern");

  // High-visibility arrival bands and compact waiting benches.
  add(operations, { x: -193, y: 71, z: 170 }, { x: -193, y: 72, z: 184 }, "minecraft:orange_concrete");
  add(operations, { x: -177, y: 71, z: 184 }, { x: -177, y: 72, z: 184 }, "minecraft:sea_lantern");
  add(operations, { x: -190, y: 71, z: 183 }, { x: -187, y: 71, z: 184 }, "minecraft:blue_concrete");
  add(operations, { x: -181, y: 71, z: 170 }, { x: -178, y: 71, z: 171 }, "minecraft:blue_concrete");

  // Remove the personnel shuttle while preserving the roadway beneath it.
  add(operations, { x: -169, y: 70, z: 177 }, { x: -160, y: 74, z: 181 }, "minecraft:air");

  // Remove the former hidden controls.
  add(operations, { x: -186, y: 72, z: 175 }, { x: -186, y: 72, z: 175 }, "minecraft:air");
  add(operations, { x: -184, y: 92, z: 173 }, { x: -184, y: 92, z: 173 }, "minecraft:air");

  // Obvious freestanding gameplay consoles beside each entrance.
  add(operations, { x: -177, y: 70, z: 171 }, { x: -177, y: 70, z: 171 }, "minecraft:polished_blackstone");
  add(operations, { x: -177, y: 71, z: 171 }, { x: -177, y: 71, z: 171 }, "minecraft:gold_block");
  add(operations, { x: -177, y: 72, z: 171 }, { x: -177, y: 72, z: 171 }, "minecraft:sea_lantern");
  add(operations, { x: -190, y: 91, z: 173 }, { x: -190, y: 91, z: 173 }, "minecraft:polished_blackstone");
  add(operations, { x: -190, y: 92, z: 173 }, { x: -190, y: 92, z: 173 }, "minecraft:gold_block");
  add(operations, { x: -190, y: 93, z: 173 }, { x: -190, y: 93, z: 173 }, "minecraft:sea_lantern");

  // Automatic illuminated floor pads inside both elevator landings.
  add(operations, { x: -185, y: 70, z: 176 }, { x: -183, y: 70, z: 178 }, "minecraft:gold_block");
  add(operations, { x: -185, y: 90, z: 176 }, { x: -183, y: 90, z: 178 }, "minecraft:gold_block");

  applyDirectFills(dimension, operations);
  return "Rebuilt the anchored elevator tower, removed the shuttle, and installed automatic elevator pads.";
}

export function rideElevatorUp(ui: IPlayerUISession<unknown>): string {
  ui.extensionContext.player.teleport(
    { x: -184, y: 91, z: 177 },
    { dimension: ui.extensionContext.player.dimension }
  );
  return "Elevator arrived at the upper helipad station.";
}

export function rideElevatorDown(ui: IPlayerUISession<unknown>): string {
  ui.extensionContext.player.teleport(
    { x: -184, y: 71, z: 177 },
    { dimension: ui.extensionContext.player.dimension }
  );
  return "Elevator arrived at the lower transport station.";
}
