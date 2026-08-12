import type { Vector3 } from "@minecraft/server";
import type { FillOperation } from "./transaction";

export interface BitmapGlyph {
  readonly rows: readonly string[];
  readonly block: string;
}

export function glyphOperations(
  origin: Vector3,
  glyph: BitmapGlyph,
  x: number,
  zOffset: number,
  mirrorZ: boolean,
  signMinZ: number,
  signMaxZ: number
): FillOperation[] {
  const operations: FillOperation[] = [];
  const height = glyph.rows.length;

  glyph.rows.forEach((row, rowIndex) => {
    let runStart = -1;
    for (let column = 0; column <= row.length; column += 1) {
      const filled = column < row.length && row[column] === "#";
      if (filled && runStart < 0) runStart = column;
      if (!filled && runStart >= 0) {
        const runEnd = column - 1;
        const rawStartZ = origin.z + zOffset + runStart;
        const rawEndZ = origin.z + zOffset + runEnd;
        const startZ = mirrorZ ? signMinZ + signMaxZ - rawEndZ : rawStartZ;
        const endZ = mirrorZ ? signMinZ + signMaxZ - rawStartZ : rawEndZ;
        const y = origin.y + height - 1 - rowIndex;

        operations.push({
          from: { x, y, z: Math.min(startZ, endZ) },
          to: { x, y, z: Math.max(startZ, endZ) },
          block: glyph.block
        });
        runStart = -1;
      }
    }
  });

  return operations;
}
