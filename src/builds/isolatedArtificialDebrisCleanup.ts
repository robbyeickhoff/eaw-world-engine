import { system, type Vector3 } from "@minecraft/server";
import type { IPlayerUISession } from "@minecraft/server-editor";
import { applyFillTransaction, type FillOperation } from "../engine/transaction";

const SCAN_BOUNDS = { from: { x: -92, y: 67, z: 141 }, to: { x: -15, y: 118, z: 198 } } as const;
const BUILD_BOUNDS = { from: { x: -73, y: 71, z: 150 }, to: { x: -15, y: 100, z: 193 } } as const;
const EXPECTED_COMPONENTS = 29;
const EXPECTED_BLOCKS = 846;
const STRUCTURE_BLOCKS = new Set([
  "minecraft:deepslate_tiles", "minecraft:gray_concrete", "minecraft:orange_concrete",
  "minecraft:yellow_concrete", "minecraft:sea_lantern"
]);

interface LocatedBlock extends Vector3 { readonly typeId: string }

export function startIsolatedArtificialDebrisCleanup(
  ui: IPlayerUISession<unknown>,
  onProgress: (message: string) => void,
  onComplete: (message: string) => void,
  onError: (message: string) => void
): void {
  const dimension = ui.extensionContext.player.dimension;
  const chunks: { x: number; z: number }[] = [];
  for (let x = Math.floor(SCAN_BOUNDS.from.x / 16); x <= Math.floor(SCAN_BOUNDS.to.x / 16); x += 1) {
    for (let z = Math.floor(SCAN_BOUNDS.from.z / 16); z <= Math.floor(SCAN_BOUNDS.to.z / 16); z += 1) chunks.push({ x, z });
  }
  const found = new Map<string, LocatedBlock>();
  let chunkIndex = 0;

  const identifyAndBuild = (): void => {
    const remaining = new Set(found.keys());
    const selected: LocatedBlock[][] = [];
    const neighbors = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]] as const;
    while (remaining.size > 0) {
      const first = remaining.values().next().value as string;
      const queue = [first];
      remaining.delete(first);
      const component: LocatedBlock[] = [];
      while (queue.length > 0) {
        const key = queue.pop()!;
        const block = found.get(key)!;
        component.push(block);
        for (const [dx, dy, dz] of neighbors) {
          const neighbor = `${block.x + dx},${block.y + dy},${block.z + dz}`;
          if (remaining.delete(neighbor)) queue.push(neighbor);
        }
      }
      if (component.length >= 6 && component.length <= 200) selected.push(component);
    }
    const selectedBlocks = selected.flat();
    if (selected.length !== EXPECTED_COMPONENTS || selectedBlocks.length !== EXPECTED_BLOCKS) {
      onError(`Build refused: expected ${EXPECTED_COMPONENTS} approved components and ${EXPECTED_BLOCKS} blocks, but found ${selected.length} components and ${selectedBlocks.length} blocks.`);
      return;
    }
    for (const block of selectedBlocks) {
      if (block.x < BUILD_BOUNDS.from.x || block.x > BUILD_BOUNDS.to.x
        || block.y < BUILD_BOUNDS.from.y || block.y > BUILD_BOUNDS.to.y
        || block.z < BUILD_BOUNDS.from.z || block.z > BUILD_BOUNDS.to.z) {
        onError(`Build refused: approved debris block ${block.x},${block.y},${block.z} is outside the approved cleanup boundary.`);
        return;
      }
    }

    ui.extensionContext.player.teleport({ x: -44, y: 120, z: 171 }, { dimension });
    onProgress("Loading the approved 840-block cleanup boundary...");
    system.runTimeout(() => {
      try {
        const requiredChunks = new Set(selectedBlocks.map((block) => `${Math.floor(block.x / 16)},${Math.floor(block.z / 16)}`));
        for (const key of requiredChunks) {
          const [x, z] = key.split(",").map(Number);
          if (!dimension.isChunkLoaded({ x: x * 16 + 8, y: 90, z: z * 16 + 8 })) {
            throw new Error(`Build refused: cleanup chunk ${x},${z} is not loaded.`);
          }
        }
        const operations: FillOperation[] = selectedBlocks.map((block) => ({ from: block, to: block, block: "minecraft:air" }));
        applyFillTransaction(
          ui.extensionContext.transactionManager,
          dimension,
          "EAW isolated artificial debris cleanup",
          BUILD_BOUNDS.from,
          BUILD_BOUNDS.to,
          operations,
          { ...BUILD_BOUNDS, maxChangedBlocks: EXPECTED_BLOCKS }
        );
        const message = "Removed exactly 846 isolated artificial debris blocks in one undoable transaction. Components 1 and 2 were protected. Stop and review.";
        console.warn(`EAW_ISOLATED_DEBRIS_CLEANUP_COMPLETE ${message}`);
        onComplete(message);
      } catch (error) {
        onError(error instanceof Error ? error.message : String(error));
      }
    }, 80);
  };

  const scanChunk = (): void => {
    if (chunkIndex >= chunks.length) { identifyAndBuild(); return; }
    const chunk = chunks[chunkIndex];
    ui.extensionContext.player.teleport({ x: chunk.x * 16 + 8, y: 125, z: chunk.z * 16 + 8 }, { dimension });
    onProgress(`Approved cleanup inventory: chunk ${chunkIndex + 1} of ${chunks.length}...`);
    system.runTimeout(() => {
      if (!dimension.isChunkLoaded({ x: chunk.x * 16 + 8, y: 90, z: chunk.z * 16 + 8 })) { onError(`Chunk ${chunk.x},${chunk.z} did not load.`); return; }
      const columns: { x: number; z: number }[] = [];
      const minX = Math.max(SCAN_BOUNDS.from.x, chunk.x * 16); const maxX = Math.min(SCAN_BOUNDS.to.x, chunk.x * 16 + 15);
      const minZ = Math.max(SCAN_BOUNDS.from.z, chunk.z * 16); const maxZ = Math.min(SCAN_BOUNDS.to.z, chunk.z * 16 + 15);
      for (let x = minX; x <= maxX; x += 1) for (let z = minZ; z <= maxZ; z += 1) columns.push({ x, z });
      let columnIndex = 0;
      const scanColumns = (): void => {
        try {
          const end = Math.min(columns.length, columnIndex + 16);
          for (; columnIndex < end; columnIndex += 1) {
            const at = columns[columnIndex];
            for (let y = SCAN_BOUNDS.from.y; y <= SCAN_BOUNDS.to.y; y += 1) {
              const typeId = dimension.getBlock({ x: at.x, y, z: at.z })?.typeId;
              if (typeId && STRUCTURE_BLOCKS.has(typeId)) found.set(`${at.x},${y},${at.z}`, { ...at, y, typeId });
            }
          }
          if (columnIndex < columns.length) { system.runTimeout(scanColumns, 1); return; }
          chunkIndex += 1; scanChunk();
        } catch (error) { onError(error instanceof Error ? error.message : String(error)); }
      };
      scanColumns();
    }, 25);
  };
  scanChunk();
}
