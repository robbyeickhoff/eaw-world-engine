import { cp, mkdir, stat, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const run = promisify(execFile);
const args = process.argv.slice(2);
const value = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};
const world = value("--world");
const label = value("--label");
if (!world || !label) throw new Error("Usage: npm run backup:world -- --world <closed-world-folder> --label <checkpoint-name>");
if (!/^[a-zA-Z0-9_-]+$/.test(label)) throw new Error("Backup label may contain only letters, numbers, dashes, and underscores.");

const { stdout } = await run("tasklist.exe", ["/FO", "CSV", "/NH"]);
if (/Minecraft/i.test(stdout)) throw new Error("Backup refused: Minecraft or Minecraft Editor is still running. Close it completely first.");

const source = path.resolve(world);
const sourceInfo = await stat(source);
if (!sourceInfo.isDirectory()) throw new Error("World path is not a directory.");
await stat(path.join(source, "level.dat"));
await stat(path.join(source, "db"));

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const destination = path.resolve("backups", "world-snapshots", `${stamp}-${label}`);
await mkdir(path.dirname(destination), { recursive: true });
await cp(source, destination, { recursive: true, errorOnExist: true, force: false });
await writeFile(path.join(destination, "EAW-BACKUP-MANIFEST.json"), JSON.stringify({
  createdAt: new Date().toISOString(),
  source,
  label,
  policy: "Created only while Minecraft was fully closed. Restore requires explicit Robby authorization."
}, null, 2));
console.log(`Created closed-world checkpoint: ${destination}`);
