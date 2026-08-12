import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const appData = process.env.APPDATA;
if (!appData) throw new Error("Windows APPDATA is unavailable.");
const source = path.join(process.cwd(), "dist", "gameplay_pack");
const targetRoot = path.join(appData, "Minecraft Bedrock", "Users", "Shared", "games", "com.mojang", "development_behavior_packs");
const target = path.join(targetRoot, "EAW_Gameplay_Systems");
await mkdir(targetRoot, { recursive: true });
await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });
console.log(`Deployed EAW Gameplay Systems to ${target}`);
