# Stage 11 Mountain Recovery

## Objective

Remove the failed tunnel construction and return the affected mountainside to a believable natural landform. Do not build a replacement tunnel during recovery.

## Survey evidence

- Route section 1: indices 0-27, `(-67,71,133)` through `(-62,74,160)`, surface Y 37-114, 77 distinctive artificial samples.
- Route section 2: indices 28-55, `(-61,75,161)` through `(-36,82,178)`, surface Y 61-117, 166 distinctive artificial samples.
- Route section 3: indices 56-83, `(-35,82,178)` through `(-8,90,193)`, surface Y 78-117, 48 distinctive artificial samples.
- Sections 4-5, from approximately `(-7,90,194)` to `(32,103,222)`, have smooth height profiles and no distinctive tunnel-material samples. They are excluded from the initial recovery scope.
- Stone, dirt, and grass created by the failed builds resemble natural blocks, so material counts alone are insufficient. Abrupt plateaus and vertical height discontinuities identify the damaged landform.
- Future tunnel entrance reference: approximately `(-55,74,150)`. This is a reference only, not part of the recovery build.

## Required safeguards

1. Create a closed-world checkpoint before recovery.
2. Generate a non-building recovery preflight with exact boundary and estimated block changes.
3. Divide recovery into three independently undoable stages matching the surveyed sections.
4. Recover section 1 only, then review in Editor before arming sections 2 or 3.
5. Do not touch sections 4-5 during the initial recovery.
6. Do not construct a replacement tunnel during this ticket.

## Verified checkpoint

- Checkpoint: `backups/world-snapshots/2026-08-10T02-18-53-785Z-pre-mountain-recovery`
- Source and checkpoint file counts: 36 / 36
- Source and checkpoint total bytes: 18,406,858 / 18,406,858
- Source and checkpoint database files: 5 / 5
- Source and checkpoint database bytes: 4,839,528 / 4,839,528
- `level.dat` and `EAW-BACKUP-MANIFEST.json` verified present
- This checkpoint preserves the current damaged state and does not authorize restoration.

## Next gate

Prepare a read-only Stage 1 preflight. It must report the exact proposed boundary, estimated block changes, block-type inventory, nearby structures at risk, loaded chunks, and undo availability. No recovery stage may be armed until Robby reviews and approves that preflight.

## Stage 1 preflight review — rejected

- Survey boundary: `(-87,37,125)` through `(-42,120,168)`
- Boundary volume: 170,016 blocks
- Proposed 31-block corridor: 790 columns; maximum 48,190 block changes
- Loaded chunks: 16/16
- Protected road/portal materials detected: 1,290 blocks
- Undo was reported unavailable because the compatibility probe checked the retired transaction API. The installed Editor uses the newer pending-transaction API.
- Decision: **REJECTED.** Do not arm. Upgrade the transaction adapter and compare narrower 15-, 19-, 23-, 27-, and 31-block corridors before selecting a Stage 1 recovery boundary.

## Stage 1 revised preflight — passed for planning

- Loaded chunks: 16/16
- Undo API: current pending-transaction system
- Undo available: yes
- Corridor comparisons:
  - 15 blocks: 388 columns; maximum 23,668 changes
  - 19 blocks: 493 columns; maximum 30,073 changes
  - 23 blocks: 597 columns; maximum 36,417 changes
  - 27 blocks: 699 columns; maximum 42,639 changes
  - 31 blocks: 790 columns; maximum 48,190 changes
- Protected road/portal blocks inside every candidate corridor: 0
- Protected road/portal blocks elsewhere in the larger survey volume: 1,290; these remain excluded from recovery operations.
- Recommended recovery corridor: **27 blocks**. The failed reconstruction touched approximately 25 blocks across, so 27 provides one block of cleanup margin without expanding to the widest option.
- Hard survey boundary remains `(-87,37,125)` through `(-42,120,168)`, but recovery operations must be additionally restricted to the 27-block route corridor.
- Maximum approved Stage 1 change estimate if armed: 42,639 blocks.
- Status: **PREFLIGHT PASSED FOR PLANNING. NOT YET ARMED.**

## Stage 1 authorization

- Robby approved arming Stage 1 using the 27-block corridor and 42,639-block maximum.
- Reconstruction method: sample untouched terrain at widths 15-17 on both sides, median-filter the samples, smooth them along the route, interpolate the approved corridor as a continuous slope, and partition every changed column between Y 60 and Y 120.
- Stage 1 is one pending Editor transaction and must stop for review after completion.
- Stage 2, Stage 3, and replacement tunnel work remain unarmed.

## Stage 1 review

- Stage 1 completed as one undoable pending transaction.
- Robby accepted Stage 1 and closed the Editor.
- The Stage 1 armed control must be removed before the next Editor session.
- Remaining giant boxes, ribs, blackstone columns, and roadway fragments are explicitly unaddressed damage, not Stage 1 output.
- Next action: read-only survey of every remaining route section. No additional recovery stage is armed.

## Remaining route-corridor survey

- Section 2: 606 columns; 143 excess; 2 deficit; 16 severe; maximum +11/-11; 163 distinctive blocks.
- Section 3: 634 columns; 116 excess; 2 deficit; 15 severe; maximum +9/-7; 53 distinctive blocks.
- Section 4: 681 columns; 9 excess; 0 deficit; no severe; maximum +4/-3; no distinctive blocks.
- Section 5: 393 columns; 4 excess; 0 deficit; no severe; maximum +4/-2; no distinctive blocks.
- Interpretation: Sections 2 and 3 require recovery inside the route corridor. Sections 4 and 5 do not show serious corridor anomalies.
- Visual review still shows giant stone boxes and ribs outside the route corridor. Do not arm Sections 2 or 3 until a wider read-only locator identifies those residual structures precisely.

## Wide residual locator

- Entrance-side residual field: approximately X -102 to -40, Z 133 to 176. It overlaps nearby infrastructure and requires a separately protected cleanup.
- Section 2 wide field: X -92 to -12, Z 138 to 200; 265 center, 185 shoulder, and 89 outer anomalies; 1,768 distinctive blocks.
- Section 3 wide field: X -42 to -9, Z 147 to 200; 132 center, 48 shoulder, and 8 outer anomalies; 500 distinctive blocks.
- Section 4: only minor differences and no distinctive tunnel blocks. Exclude from reconstruction.
- Exit-side residual field: approximately X 17 to 64, Z 187 to 224; substantial positive stone-mass anomalies. Handle separately from route reconstruction.

## Proposed next stage — Section 2 reconstruction

- Route indices: 28-55
- Approved-candidate corridor width: 27 blocks
- Exact corridor extent: X -73 to -28, Z 153 to 190
- Tracked Y range: 60-130
- Unique columns: 606
- Maximum cells: 43,026
- This stage is not armed.
- Before arming: create and verify a new closed-world checkpoint preserving accepted Stage 1, then run the Section 2 preflight for protected-block intersections and undo availability.

## Accepted Stage 1 checkpoint

- Created after Robby accepted Stage 1 and fully closed Minecraft and the Editor.
- Checkpoint: `backups/world-snapshots/2026-08-10T10-25-35-933Z-post-stage1-accepted`
- Verified by full relative-path, byte-size, and SHA-256 comparison against the closed source world.
- Source/checkpoint files: 36/36
- Source/checkpoint bytes: 18,269,651/18,269,651
- Database files: 5/5
- File differences: 0
- Backup manifest and `level.dat`: present
- This is the protected recovery point before any Section 2 work.

## Section 2 recovery preflight

- Exact route indices: 28-55
- Corridor width: 27 blocks
- Exact extent: X -73 to -28, Z 153 to 190, Y 60 to 130
- Unique columns: 606
- Maximum cells: 43,026
- Loaded chunks: 9/9
- Undo API: pending transaction
- Undo available: yes
- Surface range: Y 71-107
- Protected/material intersections: 163 total
  - deepslate tiles: 84
  - gray concrete: 65
  - yellow concrete: 9
  - sea lanterns: 5
- Intersection bounds: `(-65,76,163)` through `(-32,105,190)`
- No black concrete, orange concrete, polished-blackstone structure, glass, iron, or chain intersections were found.
- The 163 intersections exactly match the 163 distinctive failed-tunnel blocks previously identified in the Section 2 route survey. They are contained along the failed route rather than adjacent airport infrastructure.
- Decision: **PREFLIGHT PASSED FOR PLANNING. NOT ARMED.**
- Recommendation: arm Section 2 as one undoable transaction, constrained to these 606 columns and 43,026 cells, then stop for visual review.

## Section 2 authorization

- Robby approved arming Section 2 using the 606-column corridor and 43,026-block maximum.
- The operation must run as one pending Editor transaction and stop for visual review immediately after completion.
- No Section 3 work or wide-field cleanup is armed.

## Section 2 review

- Section 2 completed as one undoable pending Editor transaction.
- Robby accepted Section 2 and closed the Editor.
- The Section 2 construction control was removed immediately after acceptance.
- Large ribs, black columns/roadway, the entrance-side tower, and the exit-side stone box remain outside the approved Section 2 corridor.
- Next action: targeted read-only preflight for the central ribs and black columns. No cleanup operation is armed.

## Accepted Sections 1 and 2 checkpoint

- Created after Robby accepted Section 2 and fully closed Minecraft and the Editor.
- Checkpoint: `backups/world-snapshots/2026-08-10T11-36-58-179Z-post-stage2-accepted`
- Verified by full relative-path, byte-size, and SHA-256 comparison against the closed source world.
- Source/checkpoint files: 36/36
- Source/checkpoint bytes: 18,282,713/18,282,713
- Database files: 5/5
- File differences: 0
- Backup manifest and `level.dat`: present
- This is the protected recovery point before targeted wide-field debris cleanup.

## Central debris preflight

- Chunk-by-chunk scan completed across 56 chunks; undo API available.
- Scanned columns: 4,727
- Broad anomaly candidates: 2,977
- Excess/deficit candidates: 1,674/1,303
- Severe candidates: 2,416
- Candidate bounds: X -102 to -3, Z 133 to 205
- Unsafe broad maximum: 211,367 cells
- Candidate surface types included 2,221 grass-topped columns, proving that a broad terrain rewrite would capture substantial healthy terrain.
- Artificial structure intersections: 1,796
  - deepslate tiles: 994
  - gray concrete: 724
  - orange concrete: 38
  - yellow concrete: 24
  - sea lanterns: 16
- Structure bounds: `(-92,67,141)` through `(-15,118,198)`
- Decision: **REJECTED FOR CONSTRUCTION.** Do not arm the 2,977-column broad recovery.
- Next action: read-only connected-component inventory of the 1,796 artificial blocks, followed by separately bounded cleanup proposals for failed-build objects and protected infrastructure.

## Artificial debris component inventory

- Focused bounds: `(-92,67,141)` through `(-15,118,198)`
- Scanned chunks: 30
- Artificial blocks inventoried: 5,252
- Connected components: 235
- Two large mixed/infrastructure components are protected and excluded:
  - Component 1: 2,094 blocks, bounds `(-92,67,173)` through `(-31,86,198)`
  - Component 2: 1,715 blocks, bounds `(-49,99,141)` through `(-15,118,167)`
- Components 3-30 form the isolated failed-tunnel frames and fragments visible along the route.
- Confirmed isolated cleanup set: 840 blocks across 28 components, each sized 6-200 blocks.
- Cleanup-set union bounds: approximately `(-73,71,150)` through `(-15,100,193)`.
- Recommendation: remove only those 840 exact artificial blocks in one undoable transaction. Do not alter Components 1 or 2, natural terrain, stone ribs, roads, supports, or any component smaller than six blocks.
- Status: **PREFLIGHT PASSED FOR PLANNING. NOT ARMED.**

## Isolated artificial debris authorization

- Robby approved removing the 840 isolated artificial debris blocks while protecting Components 1 and 2.
- Exact selection rule: connected components sized 6-200 blocks inside the focused inventory, with an invariant of exactly 28 components and exactly 840 blocks.
- Hard cleanup boundary: `(-73,71,150)` through `(-15,100,193)`.
- One pending Editor transaction; stop for review immediately after completion.
- Stone ribs, terrain reconstruction, Components 1 and 2, and all other cleanup remain unarmed.

## Isolated cleanup invariant refusal

- The armed cleanup safely refused before changing blocks.
- Approved expectation: 28 components / 840 blocks.
- Runtime result: 29 components / 846 blocks.
- Cause: the original inventory log displayed only the 30 largest overall components; an additional six-block component fell below that reporting cutoff.
- Decision: cleanup disarmed. Run an expanded read-only component inventory and identify the extra component before requesting revised authorization.

## Expanded component review

- Extra Component 31: 6 blocks at X -60, Y 91-96, Z 170.
- Materials: 5 deepslate tiles and 1 gray concrete.
- It is a vertical failed-tunnel fragment directly beside Component 30 at X -61, Y 90-95, Z 172.
- It is not connected to Components 1 or 2 and is not part of the protected airport infrastructure.
- Revised confirmed cleanup set: 29 isolated components / 846 blocks.
- Status: **PREFLIGHT PASSED FOR PLANNING. NOT ARMED.** Revised authorization required because the approved maximum was 840 blocks.

## Revised isolated debris authorization

- Robby approved removing the revised 846 isolated debris blocks while protecting Components 1 and 2.
- Exact invariant: 29 connected components / 846 blocks.
- Hard cleanup boundary remains `(-73,71,150)` through `(-15,100,193)`.
- One pending Editor transaction; stop for review immediately after completion.
- Stone ribs, terrain reconstruction, Components 1 and 2, and all other cleanup remain unarmed.

## Creative-shift baseline checkpoint

- Robby rejected restoration and chose to continue from the current world state with an intentional redevelopment strategy.
- Checkpoint: `backups/world-snapshots/2026-08-11T12-09-21-656Z-pre-creative-shift-current-state`
- Verified by full relative-path, byte-size, and SHA-256 comparison against the closed source world.
- Source/checkpoint files: 36/36
- Source/checkpoint bytes: 18,511,188/18,511,188
- Database files: 5/5
- File differences: 0
- Backup manifest and `level.dat`: present
- This checkpoint is the baseline before defining or excavating the new redevelopment district.

## Completion criteria

- No exposed tunnel walls, ribs, roadway, lighting, portals, or sealed tunnel faces remain in the approved recovery sections.
- The mountainside reads as a continuous natural slope from normal viewing distances.
- Existing airport roads and support structures outside the approved boundary remain intact.
- Robby approves the recovered mountain before any tunnel design resumes.
