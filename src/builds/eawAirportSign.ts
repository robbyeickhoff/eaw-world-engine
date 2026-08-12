import type { IPlayerUISession } from "@minecraft/server-editor";
import { glyphOperations, type BitmapGlyph } from "../engine/bitmapText";
import { applyDirectFills, type FillOperation } from "../engine/transaction";

const SIGN_MIN = { x: -107, y: 85, z: 35 } as const;
const SIGN_SIZE = { x: 5, y: 19, z: 31 } as const;

const E: BitmapGlyph = {
  block: "minecraft:blue_concrete",
  rows: ["######", "######", "##....", "##....", "##....", "#####.", "#####.", "##....", "##....", "##....", "##....", "######", "######"]
};

const A: BitmapGlyph = {
  block: "minecraft:lime_concrete",
  rows: ["..###..", ".##.##.", "##...##", "##...##", "##...##", "##...##", "#######", "#######", "##...##", "##...##", "##...##", "##...##", "##...##"]
};

const W: BitmapGlyph = {
  block: "minecraft:magenta_concrete",
  rows: ["##.....##", "##.....##", "##.....##", "##.....##", "##.....##", "##.....##", "##.....##", "##.....##", "##..#..##", ".##.#.##.", ".##.#.##.", "..#####..", "...###..."]
};

function bounds() {
  return {
    min: SIGN_MIN,
    max: {
      x: SIGN_MIN.x + SIGN_SIZE.x - 1,
      y: SIGN_MIN.y + SIGN_SIZE.y - 1,
      z: SIGN_MIN.z + SIGN_SIZE.z - 1
    }
  };
}

function signOperations(): FillOperation[] {
  const { min, max } = bounds();
  const operations: FillOperation[] = [
    { from: min, to: max, block: "minecraft:air" },
    { from: { x: min.x + 2, y: min.y + 1, z: min.z + 1 }, to: { x: min.x + 2, y: max.y - 1, z: max.z - 1 }, block: "minecraft:gray_concrete" },
    { from: { x: min.x, y: min.y, z: min.z }, to: { x: max.x, y: min.y, z: max.z }, block: "minecraft:orange_concrete" },
    { from: { x: min.x, y: max.y, z: min.z }, to: { x: max.x, y: max.y, z: max.z }, block: "minecraft:orange_concrete" },
    { from: { x: min.x, y: min.y + 1, z: min.z }, to: { x: max.x, y: max.y - 1, z: min.z }, block: "minecraft:orange_concrete" },
    { from: { x: min.x, y: min.y + 1, z: max.z }, to: { x: max.x, y: max.y - 1, z: max.z }, block: "minecraft:orange_concrete" }
  ];

  const textOrigin = { x: min.x, y: min.y + 3, z: min.z };
  for (const { glyph, offset } of [
    { glyph: E, offset: 2 },
    { glyph: A, offset: 10 },
    { glyph: W, offset: 19 }
  ]) {
    operations.push(
      ...glyphOperations(textOrigin, glyph, min.x, offset, false, min.z, max.z),
      ...glyphOperations(textOrigin, glyph, max.x, offset, true, min.z, max.z)
    );
  }

  for (const x of [min.x, max.x]) {
    for (const y of [min.y, max.y]) {
      for (const z of [min.z, max.z]) {
        operations.push({ from: { x, y, z }, to: { x, y, z }, block: "minecraft:sea_lantern" });
      }
    }
  }
  return operations;
}

export function buildFinalEawAirportSign(ui: IPlayerUISession<unknown>): string {
  applyDirectFills(ui.extensionContext.player.dimension, signOperations());
  return `Built final EAW airport sign at ${SIGN_MIN.x}, ${SIGN_MIN.y}, ${SIGN_MIN.z}.`;
}
