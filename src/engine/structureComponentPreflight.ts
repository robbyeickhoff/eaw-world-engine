import { system, type Vector3 } from "@minecraft/server";
import type { IPlayerUISession } from "@minecraft/server-editor";

const BOUNDS = { from: { x: -92, y: 67, z: 141 }, to: { x: -15, y: 118, z: 198 } } as const;
const STRUCTURE_BLOCKS = new Set([
  "minecraft:deepslate_tiles", "minecraft:gray_concrete", "minecraft:orange_concrete",
  "minecraft:yellow_concrete", "minecraft:sea_lantern"
]);

interface LocatedBlock extends Vector3 { readonly typeId: string }
interface ComponentReport {
  readonly size: number;
  readonly bounds: { readonly from: Vector3; readonly to: Vector3 };
  readonly materials: Readonly<Record<string, number>>;
}

export function startStructureComponentPreflight(
  ui: IPlayerUISession<unknown>,
  onProgress: (message: string) => void,
  onComplete: (componentCount: number, blockCount: number) => void,
  onError: (message: string) => void
): void {
  const dimension = ui.extensionContext.player.dimension;
  const chunks: { x: number; z: number }[] = [];
  for (let x = Math.floor(BOUNDS.from.x / 16); x <= Math.floor(BOUNDS.to.x / 16); x += 1) {
    for (let z = Math.floor(BOUNDS.from.z / 16); z <= Math.floor(BOUNDS.to.z / 16); z += 1) chunks.push({ x, z });
  }
  const found = new Map<string, LocatedBlock>();
  let chunkIndex = 0;

  const scanChunk = (): void => {
    if (chunkIndex >= chunks.length) {
      const remaining = new Set(found.keys());
      const components: ComponentReport[] = [];
      const neighbors = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]] as const;
      while (remaining.size > 0) {
        const first = remaining.values().next().value as string;
        const queue = [first];
        remaining.delete(first);
        const blocks: LocatedBlock[] = [];
        while (queue.length > 0) {
          const key = queue.pop()!;
          const block = found.get(key)!;
          blocks.push(block);
          for (const [dx, dy, dz] of neighbors) {
            const neighbor = `${block.x + dx},${block.y + dy},${block.z + dz}`;
            if (remaining.delete(neighbor)) queue.push(neighbor);
          }
        }
        const materials = blocks.reduce<Record<string, number>>((result, block) => {
          result[block.typeId] = (result[block.typeId] ?? 0) + 1;
          return result;
        }, {});
        components.push({
          size: blocks.length,
          bounds: {
            from: { x: Math.min(...blocks.map((b) => b.x)), y: Math.min(...blocks.map((b) => b.y)), z: Math.min(...blocks.map((b) => b.z)) },
            to: { x: Math.max(...blocks.map((b) => b.x)), y: Math.max(...blocks.map((b) => b.y)), z: Math.max(...blocks.map((b) => b.z)) }
          },
          materials
        });
      }
      components.sort((a, b) => b.size - a.size);
      console.warn(`EAW_STRUCTURE_COMPONENT_SUMMARY ${JSON.stringify({ bounds: BOUNDS, scannedChunks: chunks.length, blockCount: found.size, componentCount: components.length })}`);
      for (let index = 0; index < Math.min(components.length, 40); index += 1) {
        console.warn(`EAW_STRUCTURE_COMPONENT_${index + 1} ${JSON.stringify(components[index])}`);
      }
      ui.log.info(`EAW structure component preflight saved: ${found.size} blocks in ${components.length} components.`);
      onComplete(components.length, found.size);
      return;
    }

    const chunk = chunks[chunkIndex];
    ui.extensionContext.player.teleport({ x: chunk.x * 16 + 8, y: 125, z: chunk.z * 16 + 8 }, { dimension });
    onProgress(`Structure inventory: loading chunk ${chunkIndex + 1} of ${chunks.length}...`);
    system.runTimeout(() => {
      if (!dimension.isChunkLoaded({ x: chunk.x * 16 + 8, y: 90, z: chunk.z * 16 + 8 })) {
        onError(`Dedicated chunk ${chunk.x},${chunk.z} did not load.`);
        return;
      }
      const columns: { x: number; z: number }[] = [];
      const minX = Math.max(BOUNDS.from.x, chunk.x * 16);
      const maxX = Math.min(BOUNDS.to.x, chunk.x * 16 + 15);
      const minZ = Math.max(BOUNDS.from.z, chunk.z * 16);
      const maxZ = Math.min(BOUNDS.to.z, chunk.z * 16 + 15);
      for (let x = minX; x <= maxX; x += 1) for (let z = minZ; z <= maxZ; z += 1) columns.push({ x, z });
      let columnIndex = 0;
      const scanColumns = (): void => {
        try {
          const end = Math.min(columns.length, columnIndex + 16);
          for (; columnIndex < end; columnIndex += 1) {
            const at = columns[columnIndex];
            for (let y = BOUNDS.from.y; y <= BOUNDS.to.y; y += 1) {
              const typeId = dimension.getBlock({ x: at.x, y, z: at.z })?.typeId;
              if (typeId && STRUCTURE_BLOCKS.has(typeId)) found.set(`${at.x},${y},${at.z}`, { ...at, y, typeId });
            }
          }
          if (columnIndex < columns.length) { system.runTimeout(scanColumns, 1); return; }
          chunkIndex += 1;
          scanChunk();
        } catch (error) {
          onError(error instanceof Error ? error.message : String(error));
        }
      };
      scanColumns();
    }, 25);
  };
  scanChunk();
}
