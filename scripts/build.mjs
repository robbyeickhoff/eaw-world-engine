import { cp, mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "dist", "behavior_pack");

await rm(output, { recursive: true, force: true });
await mkdir(path.join(output, "scripts"), { recursive: true });

const compiler = path.join(root, "node_modules", "typescript", "bin", "tsc");
const result = spawnSync(process.execPath, [compiler, "-p", "tsconfig.build.json"], {
  cwd: root,
  stdio: "inherit",
  shell: false
});

if (result.status !== 0) {
  throw new Error(`TypeScript build failed with exit code ${result.status ?? "unknown"}.`);
}

await cp(path.join(root, "pack", "manifest.json"), path.join(output, "manifest.json"));

console.log("Built EAW Builder Extension.");
