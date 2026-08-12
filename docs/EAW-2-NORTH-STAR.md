# EAW 2.0 North Star

**Project:** Eickhoff Adventure World 2.0  
**Working title:** The World Engine  
**Creative Director:** Robby Eickhoff  
**Lead Engineer and Builder:** ChatGPT  
**Status:** Vision, master seed, clean master world, and baseline checkpoint approved; implementation not yet approved
**Governing process:** [`MINECRAFT-OS.md`](MINECRAFT-OS.md)

## 1. The promise

Build a coherent, explorable Minecraft adventure world for Erik, Luka, and Heidi that feels enormous, surprising, and personal. EAW 2.0 must deliver memorable reveals, playable adventures, connected mysteries, and reasons to return. It must not become a collection of unrelated impressive-looking buildings.

The primary reaction we are designing for is:

> “Whoa—how did you make this?”

## 2. Honesty boundary

This document is a design commitment, not a claim that every described feature already works.

- **Committed core** items define the identity of EAW 2.0 and may change only with Robby’s approval.
- **Planned** items are intended deliverables but must still pass technical prototyping and visual review.
- **Aspirational** items are possibilities, not promises, until a prototype proves they work reliably in Bedrock.
- No build is complete until it is visually inspected in Minecraft and approved by Robby.
- If Bedrock limitations prevent an effect, preserve the intended experience using a simpler reliable method.
- Never sacrifice the protected master world to prove an untested idea.

## 3. Governing concept — committed core

Deep beneath the world, an ancient machine called **the World Engine** has awakened. Its energy fractures the surrounding landscape into extraordinary realms. Suspended above its glowing central crater is **the Crown**, a mountain-scale floating citadel visible from across the world.

The World Engine was created or protected by three legendary young explorers: **The Eickhoff Three**.

| Explorer | Title | Symbol | Color | Experience |
|---|---|---|---|---|
| Erik | Keeper of the Crown | Crown | Electric blue | Advanced puzzles, engineering, height, mastery, deep mysteries |
| Luka | Pathfinder of the Wilds | Compass | Emerald green | Exploration, vehicles, treasure, creatures, secret routes |
| Heidi | Champion of Chaos | Comet | Magenta | Racing, speed, color, surprises, shortcuts, playful mayhem |

The three symbols recur throughout the world. Reuniting their three explorer keys is central to restoring the World Engine. None of the three is secondary; the world can only be saved by all three.

## 4. Design pillars — committed core

Every major district and attraction must support these pillars.

1. **Reveal:** Approach views hide enough that the main landmark arrives as a dramatic surprise.
2. **Scale:** Each district has one silhouette that remains recognizable from far away.
3. **Play:** Major builds contain something to do, not merely something to see.
4. **Discovery:** Main routes are clear, while optional routes reward curiosity.
5. **Connection:** Transportation and story make the districts feel like one world.
6. **Three-player accessibility:** Erik receives genuine challenge, Luka receives meaningful adventure, and Heidi receives understandable immediate fun.
7. **Return value:** Secrets, alternate routes, races, collectibles, or changing states give players a reason to revisit.
8. **Safety:** All implementation follows the Minecraft OS, disposable-world testing, checkpoints, boundaries, staged construction, and visual verification.

## 5. The opening experience — planned flagship milestone

The player begins inside a controlled mountain transit terminal with no view of the larger world. A short transit sequence emerges onto a high reveal bridge and exposes, in one composed panorama:

- The Crown floating above the World Engine crater
- World Engine Central wrapped vertically around the crater
- Waterfalls descending from floating terrain
- A major aerial silhouette such as an airship
- A colossal dragon skeleton spanning part of the canyon
- At least two distant district landmarks
- Monumental EAW identity integrated into the landscape

The route then descends into World Engine Central, the transportation and narrative hub.

### Opening milestone acceptance test

The opening is accepted only if:

- The reveal reads clearly from the intended player path without free-camera assistance.
- At least three distinct layers of scale are visible: foreground, central landmark, distant destination.
- The player understands where to go next.
- The frame looks intentional during both day and night.
- Robby visually approves the experience before district-scale expansion begins.

## 6. World structure — planned

### World Engine Central

A vertical city and adventure lobby surrounding the reactor crater. It establishes the visual language, story, transportation network, and explorer-key mystery.

Signature elements: central beacon sculpture, transit hub, glass elevators, skybridges, maintenance passages, reactor overlook, and the Crown above.

### Titan’s Reach

A storm mountain dominated by a colossal fallen stone titan. Exploration moves through armor, interior chambers, and the titan’s raised hand toward a lightning fortress.

### The Sunken Kingdom

An underwater civilization of glass domes, temple ruins, flooded passages, submarines, sea-creature monuments, and a concealed abyssal laboratory.

### Emberfall Frontier

A volcanic industrial frontier with lava transit, a giant drill, foundries, mining routes, and a dangerous energy-launch system.

### Cloudbreak Isles

Floating islands, airships, rope bridges, waterfalls, launch pads, and a sky-pirate fortress embedded in a permanent storm cloud.

### The Wild Beyond

A prehistoric overgrown wilderness with fossils, research ruins, river travel, creature encounters, and a temple tied to discoveries across the world.

### Null Sector — hidden finale

An unmarked forbidden district beneath Central. Clues from the six public districts unlock a shifting corrupted complex and the final World Engine chamber.

Null Sector remains planned in story but is implemented only after the public world provides enough gameplay to support a satisfying finale.

## 7. Signature attractions — planned

- **Erik’s Crownspire:** A vertical mastery challenge culminating at the highest accessible point in EAW.
- **Luka’s Lost Expedition:** A vehicle-and-treasure journey through wilderness, fossils, caves, ruins, and a hidden temple.
- **Heidi’s Comet Circuit:** A colorful cross-world racing experience with shortcuts, boosts, jumps, traps, and playful chaos.

Specific mechanics are aspirational until proven in disposable Bedrock prototypes. The experience remains committed even if the implementation changes.

## 8. The central icon — committed core

World Engine Central contains a monumental beacon sculpture formed by three energy trails:

- Crown blue
- Compass green
- Comet magenta

The trails spiral upward and combine into the EAW beacon. This is the visual and emotional center of the project: a world built for Erik, Luka, and Heidi to conquer together.

## 9. World layout rules

- District silhouettes must not visually cancel one another from the opening reveal.
- The Crown remains the dominant world landmark.
- Major transportation routes are planned before district detailing.
- Districts require visual buffers so their themes remain distinct.
- Natural terrain is used as composition, not treated as empty space to cover.
- Hidden routes may connect districts, but the primary network must remain understandable to a seven-year-old player.
- No district begins fine detailing until its landmark, route, boundary, and neighboring sightlines are approved.

## 10. Implementation sequence

### Phase 0 — foundation

1. Preserve the original damaged EAW as a read-only reference world.
2. Keep disposable worlds separate from both EAW master worlds.
3. Select a suitable seed using read-only exploration.
4. Establish a coordinate system, district envelopes, protected areas, and travel distances.
5. Create a closed-world baseline checkpoint before construction.

### Phase 1 — prove the promise

1. Prototype the arrival terminal and reveal geometry.
2. Prototype the Crown silhouette at low detail.
3. Prototype World Engine Central’s crater and skyline massing.
4. Establish the first usable transit route.
5. Perform one visual milestone review.

No district expansion occurs until Phase 1 earns approval.

### Phase 2 — build the world skeleton

1. Finalize district locations and landmark sightlines.
2. Build primary roads, rails, waterways, portals, and air routes.
3. Block out all district silhouettes at approximately 80 percent concept fidelity.
4. Verify travel times and navigation.

### Phase 3 — one complete district

Complete a single district end to end, including landmark, adventure, secrets, access, night lighting, removal/rollback support, and documentation. Use its lessons to revise the remaining district plans.

### Phase 4 — expansion

Build remaining districts one at a time. Each receives its own survey, ticket, prototype, staged deployment, and approval.

### Phase 5 — mystery and finale

Connect the explorer symbols, keys, district clues, Null Sector, and World Engine finale only after the public world is coherent and playable.

### Phase 6 — polish

Add atmosphere, sound where supported, signage, small stories, Easter eggs, alternate routes, accessibility improvements, and final night lighting.

## 11. Required district deliverables

Every district plan must define:

- One-sentence fantasy
- Landmark silhouette
- Intended first reveal
- Primary playable adventure
- Erik challenge
- Luka discovery
- Heidi fun element
- Explorer symbols and larger mystery clue
- Main and alternate transportation connections
- Day and night identity
- Exact surveyed boundary
- Block-change budget
- Construction stages
- Removal or rollback plan
- Completion criteria

## 12. Scope control

To prevent overpromising and underdelivering:

- We build the opening milestone before committing to full production scale.
- Only one major construction stage is armed at a time.
- New ideas go into a future-ideas section until the current milestone is approved.
- “Looks impressive in a description” is not an acceptance criterion.
- Repeated systems are built as reusable code modules rather than copied manually.
- Details do not outrank layout, navigation, landmarks, or gameplay.
- A failed prototype is evidence, not something to hide or deploy.

## 13. Current decisions

### Approved

- Begin EAW 2.0 as a new master world.
- Preserve damaged original EAW as a read-only reference and idea library.
- Use **The World Engine** as the governing concept.
- Make Erik, Luka, and Heidi central to the world’s story and gameplay identity.
- Continue disposable-world testing for code-generated builds.
- Master seed `69427194527559476` (Candidate D — Jungle Valley).
- Clean master world `EAW 2.0 — The World Engine`.
- Verified closed-world baseline checkpoint created before construction.

### Not yet approved

- Final district coordinates
- Final dimensions of the Crown, crater, or city
- Any construction in the new master world
- Specific redstone, command, entity, animation, or scripted mechanics

## 14. Immediate next milestone

Perform the read-only coordinate survey defined in [`EAW-2-MASTER-LAYOUT.md`](EAW-2-MASTER-LAYOUT.md), then approve exact district envelopes, protected terrain, transportation corridors, and the Phase 1 prototype plan. No construction begins during this survey.

## North-star test

Before approving any major idea, ask:

1. Does it strengthen The World Engine concept?
2. Does it create a memorable reveal, adventure, or discovery?
3. Does it give at least one of the Eickhoff Three a meaningful moment?
4. Does it improve the connected world rather than distract from it?
5. Can we prototype, verify, and safely reverse it?

If the answer is not clearly yes, the idea does not enter the active build.
