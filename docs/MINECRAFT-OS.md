# EAW Minecraft OS

## Operating System for Planning, Coding, Building, and Protecting Eickhoff Adventure World

**Document status:** Governing source document  
**Applies to:** ChatGPT, EAW Builder, Minecraft Bedrock Editor, gameplay behavior packs, build tickets, terrain work, and world backups  
**Primary objective:** Build unforgettable experiences that make kids say “Whoa!” without risking completed work.

---

## 1. Authority and Roles

### Robby — Creative Director

Robby owns:

- Vision and priorities
- Major design choices
- Final approval
- Authorization to modify, duplicate, restore, relocate, or delete Minecraft world data
- Approval of major demolition, terrain changes, landmark relocation, district redesign, and theme changes

### ChatGPT — Lead Engineer and Builder

ChatGPT owns:

- Engineering strategy
- Survey and measurement design
- Build planning and sequencing
- Code quality
- Risk reduction
- Construction boundaries
- Verification
- Efficient use of Robby’s time and ChatGPT usage

ChatGPT must solve the intended objective, not blindly execute the literal wording of a request.

---

## 2. Non-Negotiable Safety Rules

1. **Never change blocks before surveying the complete affected area.** Coordinates identify a location; they do not describe terrain or nearby structures.
2. **Never perform major construction without a closed-world checkpoint.** Robby must close Minecraft completely and explicitly authorize copying the world.
3. **Never guess while restoring terrain.** Exact recovery requires a pre-build snapshot. Without one, the work is reconstruction and must be described honestly.
4. **Never use direct block writes.** Every construction stage must use an Editor undo transaction.
5. **Every build requires a hard 3D boundary and maximum block-change count.** The builder must refuse operations outside either limit.
6. **Large builds must be divided into independently reviewable stages.** Only one stage is armed at a time.
7. **Terrain work requires additional safeguards.** See Section 7.
8. **A preview must not be confused with construction.** Any preview that places temporary blocks is still a world change and requires authorization and an undo transaction.
9. **Never promise visual quality that has not been verified.** Describe an unreviewed build as a draft.
10. **Never continue after a failed stage.** Stop, preserve evidence, diagnose, and obtain approval for the revised approach.
11. **Completed work outside the approved boundary must remain untouched.**
12. **No replacement build is included in demolition or recovery unless the build ticket explicitly includes it.**

---

## 3. Minecraft Coordinates and Directions

- **X** = east/west
  - Positive X = east
  - Negative X = west
- **Y** = elevation
  - Higher Y = upward/sky
  - Lower Y = downward/ground
- **Z** = north/south
  - Positive Z = south
  - Negative Z = north

The player’s flying elevation does not need to equal the future build elevation. Record a block on the intended structure or ground whenever possible. A location is a reference point, not an automatic build origin.

---

## 4. EAW Builder Keyboard Shortcuts

| Shortcut | Command | Purpose | Safety status |
|---|---|---|---|
| `Ctrl+B` | Show EAW Builder panel | Reopens and expands the EAW Builder panel | Read-only UI action |
| `Ctrl+M` | Record build location | Records the block under the cursor and facing direction | Read-only measurement action |

To use `Ctrl+M`, aim the crosshair directly at a visible block face. It does not record empty air.

---

## 5. Current EAW Builder Controls

EAW Builder currently starts in **Safe Mode**. Legacy construction is locked until each build is migrated to the governed workflow.

### Active safe controls

| Control | Purpose | World impact |
|---|---|---|
| Show / hide navigation display | Toggles coordinates and compass direction | None |
| Record build location | Records the targeted block and facing direction | None |
| Survey damaged mountain (READ ONLY) | Measures terrain heights and distinctive artificial blocks along the failed Stage 11 route | None |
| Run Stage 1 recovery preflight (READ ONLY) | Inventories the proposed recovery boundary, risks, chunk coverage, change limit, and undo readiness | None |
| Locate giant boxes and ribs (READ ONLY) | Scans 35 blocks to both sides of the failed route and reports residual anomaly coordinates | None |
| Run safe connection test | Confirms that the extension is connected | None |
| Teleport to active build | Moves the Editor player to the helipad hub | Player movement only |
| Ride elevator UP | Moves the player to the upper elevator station | Player movement only |
| Ride elevator DOWN | Moves the player to the lower elevator station | Player movement only |

### Legacy construction controls — safety locked

These controls remain listed for historical reference and maintenance planning. They must not change blocks until migrated to build tickets, approved boundaries, change limits, and undoable stages.

| Control | Intended purpose | Current status |
|---|---|---|
| 1 - Build elevator and bridge | Builds the elevator hub and bridge connection | Locked |
| 2 - Build runway causeway | Builds both halves of the runway causeway | Locked |
| 3 - Build land causeway | Builds both halves of the land causeway | Locked |
| 4 - Build stations and shuttle | Builds elevator stations, helipad exit, and shuttle | Locked |
| 5 - Build runway arrival terminal | Builds the runway turnaround and passenger terminal | Locked |
| 6 - Build land terminal and mountain road | Builds the land station and switchback road to air traffic control | Locked |
| 7 - Remove old tunnel and reconnect roads | Removes the original tunnel structure and reconnects roads | Locked |
| 8 - Rebuild sign-airport road cleanly | Replaces the jagged connector with a bridge and turning plaza | Locked |
| 9 - Build cargo gateway and mountain portal | Builds the cargo district, approach, and starter portal | Locked |
| 10 - Build crane Easter egg | Builds the interactive mystery-cargo crane feature | Locked |
| Rebuild final airport sign | Rebuilds the coded EAW airport sign | Locked |

Locked commands must fail safely with no block changes. They should eventually be migrated or retired rather than silently unlocked.

---

## 6. Standard Build Process

Every new feature follows this sequence.

### Phase 1 — Objective

Robby describes the desired experience and approximate location. ChatGPT identifies the actual engineering objective and evaluates multiple approaches.

Deliverable:

- One-sentence objective
- Recommended approach
- Major decision requiring Robby’s approval, if any

### Phase 2 — Read-Only Survey

EAW Builder measures the proposed area before construction code is finalized.

The survey must capture, as applicable:

- Terrain surface heights
- Existing natural and artificial blocks
- Roads, supports, structures, water, caves, and open air
- Loaded-chunk coverage
- Proposed entrance, exit, and connection points
- Collision risks
- Required clearance

No blocks may change during surveying.

### Phase 3 — Build Ticket

Create a ticket in `build-tickets/` containing:

- Objective
- Survey evidence
- Deliverables
- Exclusions
- Exact 3D boundary
- Maximum estimated block changes
- Construction stages
- Completion criteria
- Rollback plan

### Phase 4 — Closed-World Checkpoint

1. Robby saves and closes Minecraft completely.
2. Robby explicitly authorizes a checkpoint copy.
3. The backup tool verifies Minecraft is not running.
4. The full world is copied to a uniquely dated checkpoint folder.
5. The checkpoint manifest records its source, date, and purpose.
6. The checkpoint is verified before construction code is deployed.

A checkpoint is mandatory before demolition, terrain modification, district-scale work, or changes near difficult completed structures.

### Phase 5 — Preflight

Before a stage can be armed, EAW Builder must report:

- Ticket ID
- Stage name
- Exact boundary
- Estimated block changes
- Blocks or structures at risk
- Required loaded chunks
- Whether an undo transaction is available

If preflight differs materially from the ticket, stop and revise the ticket.

### Phase 6 — Preview

Use the least invasive preview possible:

1. Read-only coordinates and route report
2. Editor overlays or non-block visualization
3. Temporary marker blocks only when necessary and explicitly authorized

Preview the route, footprint, scale, and elevation—not decorative detail.

### Phase 7 — Arm One Stage

Only the surveyed and approved stage may be armed. Arming a stage does not automatically authorize later stages.

### Phase 8 — Undoable Construction

- One Editor transaction per stage
- Hard boundary enforcement
- Block-change limit enforcement
- Automatic refusal if chunks are unloaded
- Automatic refusal if the Editor is busy or cannot track undo
- No direct block writes

### Phase 9 — Verification

Review the completed stage from useful viewpoints and test its gameplay purpose.

Check:

- Does it achieve the objective?
- Is it visually coherent?
- Are paths actually usable?
- Did it collide with or damage anything?
- Does it improve the area?
- Can it be safely continued?

Use one meaningful checkpoint review rather than many unnecessary screenshots.

### Phase 10 — Approval or Rollback

- If approved, arm the next stage.
- If revisions are minor, create a separate polish stage.
- If the stage failed, undo it immediately while the Editor transaction is available.
- If undo is unavailable or uncertain, stop and use the verified checkpoint only with Robby’s explicit authorization.

---

## 7. Terrain, Mountain, and Tunnel Process

Terrain work is high risk because natural blocks do not reveal whether they were generated by Minecraft or placed by a failed build.

### Mandatory terrain snapshot

Before terrain excavation or reconstruction, capture the exact approved volume in two independent ways when practical:

1. Full closed-world checkpoint
2. Editor clipboard/structure snapshot of the affected volume

The terrain snapshot must include enough undisturbed land around the build for exact edge matching.

### Tunnel route requirements

A tunnel route requires:

- Entrance coordinate and facing direction
- Exit coordinate and facing direction
- Optional control points only when needed to avoid structures
- Desired usable width and height
- Minimum terrain cover above the ceiling
- Maximum grade or step interval
- Collision survey for roads, supports, caves, water, and buildings

The route solver must calculate the tunnel centerline from the actual terrain survey. Robby should not need to manually supply every coordinate.

### Tunnel review sequence

1. Survey the mountain.
2. Save terrain snapshots.
3. Calculate a route that remains underground.
4. Preview entrance, exit, centerline, grade, and overhead cover.
5. Build only the entrance and first short section.
6. Verify that only the entrance is visible from outside.
7. Build the interior in short undoable stages.
8. Build the exit last.
9. Add lining, lighting, features, and Easter eggs only after the tunnel geometry is approved.

### Tunnel completion criteria

- The tunnel is inside the mountain.
- Only the designed entrance and exit are externally visible.
- The complete route is open and traversable.
- No terrain pillars obstruct movement.
- No sealed entrances or exits exist.
- No open-air trench, exposed roof, giant exterior wall, or artificial terrain wedge remains.
- Roads and supports outside the ticket boundary remain intact.

---

## 8. Recovery and Restoration Rules

### Exact restore

“Restore” may be used only when an exact pre-change snapshot or verified checkpoint exists.

### Reconstruction

If no exact snapshot exists, the work must be called “reconstruction.” Reconstruction requires:

- Survey evidence
- Conservative boundaries
- Independently undoable sections
- Review after the first section
- Honest acknowledgement that the original terrain cannot be reproduced exactly

Never attempt reconstruction by extending narrow sampled strips across a complex slope. Never classify stone, dirt, or grass as unquestionably natural after terrain-building code has touched the area.

---

## 9. Backup and Restore Policy

- Backups are created only while Minecraft is fully closed.
- Each major build session receives a new dated checkpoint.
- Backups are never overwritten.
- A damaged world may be preserved separately for forensic comparison.
- Backup creation does not authorize restoration.
- Restoring, replacing, or deleting world data always requires Robby’s explicit authorization.
- After restoration, verify the world identity and recent builds before resuming construction.

---

## 10. Tooling Policy

The preferred stack is:

- Minecraft Bedrock Editor
- EAW Builder Editor extension
- EAW gameplay behavior pack
- VS Code project
- Local TypeScript build and validation tools
- Closed-world checkpoint tool
- Build tickets and source documentation

Do not add third-party world editors merely because a task is difficult. Add a tool only when it provides a verified capability the current stack cannot safely provide, such as reliable Bedrock world visualization or snapshot export. Test new tools on a disposable copy, never the active world.

---

## 11. Efficiency and Communication

- Robby supplies creative direction and approximate locations.
- ChatGPT handles surveying, calculation, boundaries, staging, and engineering details.
- Combine related work into meaningful batches.
- Interrupt Robby only for major decisions, authorization, or genuine blockers.
- Explain recommendations in plain language.
- Do not require Robby to learn Editor mechanics that the extension can automate.
- Minimize screenshots; use persistent surveys, logs, and checkpoint reviews.
- Never trade safety for token savings.

---

## 12. Source-of-Truth Order

When instructions conflict, use this order:

1. Robby’s explicit instruction for the current task
2. This Minecraft OS document
3. Approved build ticket
4. `AGENTS.md`
5. District plans and other project documentation
6. Existing implementation details

Implementation that conflicts with this document must be changed; this document must not be ignored merely because older code behaves differently.

---

## 13. Definition of Done

A build is complete only when:

- The ticket’s deliverables are finished.
- Completion criteria pass.
- The feature works in gameplay where applicable.
- No unintended damage is found.
- Robby approves the result.
- Relevant documentation is updated.
- A safe checkpoint exists before the next major objective begins.

---

## Golden Rule

**Survey first. Preserve before changing. Build one undoable stage at a time. Verify before continuing.**

The goal is not to place the most blocks. The goal is to create the most impressive world possible while protecting everything already built.
