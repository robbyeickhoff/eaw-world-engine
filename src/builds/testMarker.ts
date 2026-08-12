import type { IPlayerUISession } from "@minecraft/server-editor";
import type { Vector3 } from "@minecraft/server";
import { requireSingleSelection } from "../engine/selection";
import { applyDirectFills, type FillOperation } from "../engine/transaction";

const TEST_SIZE = { x: 5, y: 3, z: 5 } as const;

function buildAt(ui: IPlayerUISession<unknown>, min: Vector3, max: Vector3): string {

  const operations: FillOperation[] = [
    { from: min, to: max, block: "minecraft:air" },
    {
      from: { x: min.x, y: min.y, z: min.z },
      to: { x: max.x, y: min.y, z: max.z },
      block: "minecraft:black_concrete"
    },
    {
      from: { x: min.x, y: min.y + 1, z: min.z },
      to: { x: max.x, y: min.y + 1, z: max.z },
      block: "minecraft:orange_concrete"
    },
    {
      from: { x: min.x + 1, y: min.y + 1, z: min.z + 1 },
      to: { x: max.x - 1, y: min.y + 1, z: max.z - 1 },
      block: "minecraft:smooth_quartz"
    },
    {
      from: { x: min.x + 2, y: min.y + 2, z: min.z + 2 },
      to: { x: min.x + 2, y: min.y + 2, z: min.z + 2 },
      block: "minecraft:sea_lantern"
    }
  ];

  applyDirectFills(ui.extensionContext.player.dimension, operations);

  return `Built test marker at ${min.x}, ${min.y}, ${min.z}.`;
}

export function buildTestMarker(ui: IPlayerUISession<unknown>): string {
  const selection = requireSingleSelection(ui, TEST_SIZE);
  return buildAt(ui, selection.min, selection.max);
}

export function buildFixedTestMarker(ui: IPlayerUISession<unknown>): string {
  const min = { x: 29, y: 112, z: 206 };
  const max = {
    x: min.x + TEST_SIZE.x - 1,
    y: min.y + TEST_SIZE.y - 1,
    z: min.z + TEST_SIZE.z - 1
  };
  return buildAt(ui, min, max);
}

export function removeFixedTestMarker(ui: IPlayerUISession<unknown>): string {
  const min = { x: 29, y: 112, z: 206 };
  const max = {
    x: min.x + TEST_SIZE.x - 1,
    y: min.y + TEST_SIZE.y - 1,
    z: min.z + TEST_SIZE.z - 1
  };

  applyDirectFills(ui.extensionContext.player.dimension, [
    { from: min, to: max, block: "minecraft:air" }
  ]);
  return "Removed the fixed test marker.";
}
