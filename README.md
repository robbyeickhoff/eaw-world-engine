# EAW Local Builder

Code-driven construction tooling for **Eickhoff Adventure World**.

## Governing source document

All Minecraft work must follow [`docs/MINECRAFT-OS.md`](docs/MINECRAFT-OS.md).

## EAW 2.0 north star

The approved creative vision, scope boundaries, world structure, and delivery gates for **EAW 2.0 — The World Engine** are maintained in [`docs/EAW-2-NORTH-STAR.md`](docs/EAW-2-NORTH-STAR.md).

Terrain requirements, candidate scoring, rejection rules, and the read-only seed survey process are maintained in [`docs/EAW-2-WORLD-SELECTION.md`](docs/EAW-2-WORLD-SELECTION.md).

## Intended workflow

1. Define a build in `src/builds`.
2. Validate and compile the project.
3. Deploy the generated Editor extension.
4. Review the build inside Minecraft Bedrock Editor.

Minecraft world saves are not stored in this repository.

## Safety principles

- Builds require explicit coordinates.
- Build size is validated before placement.
- Minecraft-specific APIs stay behind the engine layer.
- Generated output is kept in `dist`.
- World changes should use Editor transactions for undo/redo.
