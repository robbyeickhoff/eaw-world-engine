# EAW 2.0 World-Selection Brief

**Milestone:** Phase 0 — Foundation  
**Status:** Proposed for Creative Director approval  
**Depends on:** [`EAW-2-NORTH-STAR.md`](EAW-2-NORTH-STAR.md)  
**Governing process:** [`MINECRAFT-OS.md`](MINECRAFT-OS.md)

## 1. Objective

Select a Minecraft Bedrock seed and central build region that naturally supports **EAW 2.0 — The World Engine** with minimal destructive terrain work, strong landmark sightlines, distinct district spaces, and room for long-term expansion.

The selected world must make the opening reveal possible. A beautiful seed that cannot support the arrival composition, transportation skeleton, and six-district plan is not suitable.

## 2. Selection principles

- Favor terrain that contributes to the fantasy instead of terrain we must erase.
- Optimize for one exceptional central region, not every desired biome at spawn.
- Treat biome proximity as helpful but secondary to composition and buildability.
- Use portals or themed transit for remote biomes when that produces a better world.
- Reject candidates requiring major early mountain removal, ocean filling, or terrain reconstruction.
- Survey candidates without placing or removing blocks.
- Do not designate any candidate as the master world until Robby approves it.

## 3. Required central composition

The preferred center is a dramatic natural basin, broad valley, mountain amphitheater, or coastal crater-like formation that can frame World Engine Central.

### Central build envelope

The candidate region should provide:

- A roughly **350 × 350 block** central envelope for the crater, vertical city, Crown shadow, and immediate transportation hub.
- A practical build floor with no existing village or rare structure that would need demolition.
- Surrounding elevation changes of approximately **35–100 blocks** to create layered reveals and vertical travel.
- Open sky above the center for a dominant floating Crown silhouette.
- At least three natural approach corridors suitable for roads, rail, waterways, bridges, or tunnels.
- Space below or beside Central for the eventual Null Sector without exposing it from ordinary routes.

These dimensions are planning targets, not construction authorization.

## 4. Opening-reveal requirements

The opening route requires a mountain, ridge, cliff, or constructed visual barrier approximately **120–250 blocks** from the central overlook.

The terrain must support this sequence:

1. Player begins with the main world concealed.
2. A short terminal or transit route builds anticipation.
3. The route exits onto a high bridge or overlook.
4. The Crown and World Engine Central occupy the dominant center of view.
5. At least two distant district silhouettes can eventually appear at the edges or background.
6. The onward route into Central is obvious.

### Reveal rejection rules

Reject a candidate if:

- The center is visible too early and cannot be concealed without a giant artificial wall.
- The intended view faces directly into an unattractive terrain cutoff or ocean horizon with no useful framing.
- The overlook requires removing a large mountain face.
- The arrival route would cross the future Crown or Central footprint.
- Fog and normal Bedrock render distance prevent the main composition from reading at practical settings.

## 5. District-space requirements

District locations are envelopes, not final coordinates. Each district should feel visually separate while remaining reachable through a coherent transportation system.

| District | Preferred terrain | Planning envelope | Central travel target | Essential requirement |
|---|---|---:|---:|---|
| World Engine Central | Basin, valley, amphitheater, or dramatic coast | 350 × 350 | — | Open sky and layered vertical edges |
| Titan’s Reach | Tall mountain chain or jagged ridge | 400 × 400 | 2–4 minutes | One dominant peak and storm-fortress silhouette |
| Sunken Kingdom | Deep ocean or large protected bay | 400 × 400 | 3–6 minutes | Clear underwater volume and shore access |
| Emberfall Frontier | Rocky badlands, stony peaks, or broad industrial valley | 400 × 450 | 3–6 minutes | Long route for lava rail and giant drill silhouette |
| Cloudbreak Isles | Open air above valley, ocean, or low terrain | 450 × 450 | 2–5 minutes | Unobstructed sky and distant visibility |
| The Wild Beyond | Jungle preferred; large forest or expandable wilderness acceptable | 500 × 500 | 4–8 minutes | River or natural expedition corridor |

Remote districts may use story-driven express transit. They do not all need to fit within one render distance.

## 6. Transportation requirements

The candidate must allow a transportation skeleton before district detailing.

Required route types:

- Central arrival line
- Ring or spoke transit connecting the public districts
- At least one water route to the Sunken Kingdom
- At least one high-altitude route serving Cloudbreak Isles
- Service or maintenance routes that can conceal Null Sector access
- Clear walking routes suitable for Luka and Heidi without requiring advanced flight or parkour

Preferred travel rhythm:

- Immediate landmarks: visible or reachable in under 2 minutes
- Main districts: 2–6 minutes by themed transit
- Remote expedition district: up to 8 minutes when the journey itself is entertaining

Long empty travel is a defect, not scale.

## 7. Terrain and biome priorities

### High priority

- Dramatic central elevation and natural framing
- Large uninterrupted build envelopes
- Mountain access
- Ocean or deep-water access
- Useful rivers, ravines, cliffs, and caves
- Strong day and sunset sightlines

### Medium priority

- Jungle within practical express-transit distance
- Badlands, stony peaks, or dramatic exposed rock
- Natural arches, waterfalls, lush caves, or ancient-city proximity
- Nearby villages that can remain preserved and narratively separate

### Low priority

- Every biome near spawn
- Naturally perfect district shapes
- Rare structures that do not strengthen the World Engine experience
- Spawn point convenience; the intended arrival can be established elsewhere after approval

## 8. Hard rejection criteria

A candidate is rejected if any of these are true:

- No viable 350 × 350 central envelope exists without major terrain destruction.
- The central region collides with a village, monument, mansion, stronghold feature, or other structure we intend to preserve.
- District routes would require crossing or demolishing major completed terrain features.
- The Crown cannot remain the dominant skyline landmark.
- The opening reveal cannot be concealed and staged naturally.
- Ocean access is impractically distant with no entertaining transit opportunity.
- The region is predominantly flat and visually unframed.
- The terrain is so extreme that ordinary navigation becomes frustrating for younger players.
- Candidate inspection reveals generation defects, severe performance problems, or unusable chunk transitions.

## 9. Candidate scoring model

Each candidate receives a score out of 100.

| Category | Weight |
|---|---:|
| Opening reveal potential | 20 |
| Central composition and Crown dominance | 20 |
| District capacity and separation | 15 |
| Transportation opportunities | 15 |
| Mountain and vertical gameplay | 10 |
| Ocean and underwater potential | 10 |
| Exploration variety and future expansion | 5 |
| Build safety and low terrain-removal burden | 5 |

### Decision thresholds

- **85–100:** Exceptional candidate; eligible for final approval.
- **75–84:** Strong candidate; retain for comparison.
- **65–74:** Compromised; retain only if it offers a uniquely powerful feature.
- **Below 65:** Reject.

Any hard rejection overrides the numerical score.

## 10. Candidate survey process

### Stage A — seed shortlist

1. Identify candidate Bedrock seeds from current-version sources or random generation.
2. Record the exact seed and Bedrock version.
3. Create a temporary Creative survey world clearly named `EAW2 Seed Survey — <candidate>`.
4. Enable coordinates; do not activate EAW construction packs.

### Stage B — read-only aerial inspection

Inspect without changing blocks:

- Central envelope
- Candidate arrival barrier and overlook
- Cardinal and diagonal skyline views
- Mountain, ocean, river, cave, and wilderness access
- Approximate district envelopes
- Likely transit corridors
- Existing structures and collision risks
- Normal render-distance visibility

Commands used solely for movement, time, weather, or locating biomes/structures may be used in disposable survey worlds. No fill, clone, structure, function, or block-changing commands are permitted.

### Stage C — evidence capture

For each viable candidate, record:

- Seed
- Bedrock version
- Proposed Central coordinate
- Proposed arrival coordinate and facing
- Terrain-height observations
- Candidate district directions and approximate distances
- Collision risks
- Day panorama
- Night panorama
- One map or coordinate sketch
- Completed scorecard

Use a small number of meaningful screenshots rather than exhaustive image capture.

### Stage D — finalist comparison

Only the strongest three candidates receive full scorecards. Compare them side by side and recommend one, including the most important compromise.

### Stage E — approval and baseline

After Robby selects a candidate:

1. Create a new clean master world from the approved seed.
2. Confirm world identity, version, seed, and intended Central region.
3. Close Minecraft completely.
4. Obtain Robby’s explicit authorization for the baseline checkpoint.
5. Create and verify the closed-world checkpoint.
6. Produce the master coordinate and district-envelope plan.

No construction occurs during world selection or before the verified baseline checkpoint.

## 11. Candidate record template

```text
Candidate ID:
Seed:
Bedrock version:
Central coordinate:
Arrival coordinate and facing:
Central terrain type:
Mountain access:
Ocean access:
Wild district access:
Existing structures at risk:
Best feature:
Largest compromise:
Hard rejection triggered: Yes / No
Score: /100
Recommendation: Reject / Retain / Finalist
```

## 12. Deliverable and approval gate

World selection is complete only when:

- At least three credible candidates have been compared.
- Every finalist has reproducible coordinates and survey evidence.
- One candidate scores at least 85, or Robby explicitly approves a documented compromise.
- Robby approves the seed and central region.
- The approved master world remains unmodified until its baseline checkpoint is verified.

## 13. Immediate next action

Find candidate Bedrock seeds compatible with the current installed version, create disposable survey worlds, and perform read-only inspections. The first output is a shortlist—not a new master world.
