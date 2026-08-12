import type { BlockBoundingBox, Vector3 } from "@minecraft/server";
import type { IPlayerUISession } from "@minecraft/server-editor";

export interface SelectionBox {
  readonly min: Vector3;
  readonly max: Vector3;
  readonly size: Vector3;
  readonly blockCount: number;
}

function normalize(box: BlockBoundingBox): SelectionBox {
  const min = {
    x: Math.min(box.min.x, box.max.x),
    y: Math.min(box.min.y, box.max.y),
    z: Math.min(box.min.z, box.max.z)
  };
  const max = {
    x: Math.max(box.min.x, box.max.x),
    y: Math.max(box.min.y, box.max.y),
    z: Math.max(box.min.z, box.max.z)
  };
  const size = {
    x: max.x - min.x + 1,
    y: max.y - min.y + 1,
    z: max.z - min.z + 1
  };

  return {
    min,
    max,
    size,
    blockCount: size.x * size.y * size.z
  };
}

export function requireSingleSelection(
  ui: IPlayerUISession<unknown>,
  expectedSize: Vector3
): SelectionBox {
  const selection = ui.extensionContext.selectionManager.volume;

  if (selection.isEmpty || selection.volumeCount !== 1) {
    throw new Error("Create one selection box before running this build.");
  }

  const box = normalize(selection.getBoundingBox());
  if (
    box.size.x !== expectedSize.x ||
    box.size.y !== expectedSize.y ||
    box.size.z !== expectedSize.z
  ) {
    throw new Error(
      `Selection must be exactly ${expectedSize.x} x ${expectedSize.y} x ${expectedSize.z}; ` +
        `current size is ${box.size.x} x ${box.size.y} x ${box.size.z}.`
    );
  }

  return box;
}
