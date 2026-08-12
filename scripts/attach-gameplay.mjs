import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const appData = process.env.APPDATA;
if (!appData) throw new Error("Windows APPDATA is unavailable.");

const worldFolder = path.join(
  appData,
  "Minecraft Bedrock",
  "Users",
  "15813489988928834280",
  "games",
  "com.mojang",
  "minecraftWorlds",
  "1p8CwENr3Bk="
);
const metadataPath = path.join(worldFolder, "world_behavior_packs.json");
const packs = JSON.parse(await readFile(metadataPath, "utf8"));
const gameplayPack = {
  pack_id: "f5a7f610-b9f3-4fdb-a59d-923d1113e5f7",
  version: [0, 1, 0]
};

const existing = packs.findIndex((pack) => pack.pack_id === gameplayPack.pack_id);
if (existing >= 0) packs[existing] = gameplayPack;
else packs.push(gameplayPack);

await writeFile(metadataPath, `${JSON.stringify(packs, null, 2)}\n`, "utf8");
console.log("Attached EAW Gameplay Systems to the imported EAW world.");
