# Removes exactly the proof-of-concept construction box.
tellraw @s {"rawtext":[{"text":"EAW: Removing freight gateway..."}]}
# Split vertically so each fill stays below Bedrock's 32,768-block limit.
fill ~10 ~0 ~10 ~46 ~15 ~46 air
fill ~10 ~16 ~10 ~46 ~32 ~46 air
fill ~10 ~-1 ~10 ~46 ~-1 ~46 grass_block
tellraw @s {"rawtext":[{"text":"EAW: Freight gateway removed."}]}
