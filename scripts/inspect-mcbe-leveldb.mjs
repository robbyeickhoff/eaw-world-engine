import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { LevelDB } = require("../.tools/mcbe-leveldb/node_modules/@8crafter/leveldb-zlib");
const dbPath = process.argv[2];
if (!dbPath) throw new Error("Provide a copied Bedrock database path.");

const db = new LevelDB(dbPath, { createIfMissing: false });
await db.open();
let total = 0;
let chunkRecords = 0;
const samples = [];
for await (const [key] of db.getIterator({ keyAsBuffer: true, valueAsBuffer: true })) {
  total += 1;
  if (key.length >= 9) {
    const x = key.readInt32LE(0);
    const z = key.readInt32LE(4);
    if (x >= -6 && x <= 4 && z >= 7 && z <= 16) {
      chunkRecords += 1;
      if (samples.length < 10) samples.push({ length: key.length, x, z, hex: key.toString("hex") });
    }
  }
}
await db.close();
console.log(JSON.stringify({ total, chunkRecords, samples }, null, 2));
