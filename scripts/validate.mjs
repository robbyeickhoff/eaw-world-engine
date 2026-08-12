import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../pack/manifest.json", import.meta.url), "utf8"));
const project = JSON.parse(await readFile(new URL("../config/project.json", import.meta.url), "utf8"));

if (!manifest.capabilities?.includes("editorExtension")) {
  throw new Error("Manifest is missing the editorExtension capability.");
}

if (!Number.isInteger(project.maximumBlocksPerBuild) || project.maximumBlocksPerBuild <= 0) {
  throw new Error("maximumBlocksPerBuild must be a positive whole number.");
}

console.log("EAW project configuration is valid.");
