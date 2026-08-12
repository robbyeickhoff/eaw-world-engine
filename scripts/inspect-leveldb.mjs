import { Level } from "../.tools/leveldb/node_modules/level/index.js";

const dbPath = process.argv[2];
if (!dbPath) throw new Error("Provide a copied database path.");

const db = new Level(dbPath, { keyEncoding: "buffer", valueEncoding: "buffer", createIfMissing: false });
let total = 0;
let chunkLike = 0;
const samples = [];
for await (const [key] of db.iterator()) {
  total += 1;
  if (key.length >= 9) {
    const x = key.readInt32LE(0);
    const z = key.readInt32LE(4);
    if (x >= -20 && x <= 20 && z >= -20 && z <= 30) {
      chunkLike += 1;
      if (samples.length < 8) samples.push({ length: key.length, x, z, hex: key.toString("hex") });
    }
  }
}
await db.close();
console.log(JSON.stringify({ total, chunkLike, samples }, null, 2));
