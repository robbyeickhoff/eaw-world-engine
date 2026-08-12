# EAW proof-of-concept freight gateway
# Stand on flat ground. The build appears 10 blocks southeast of the player.
tellraw @s {"rawtext":[{"text":"EAW: Building freight gateway..."}]}

# Clear the protected construction box and lay the freight yard
# Split vertically so each fill stays below Bedrock's 32,768-block limit.
fill ~10 ~0 ~10 ~46 ~15 ~46 air
fill ~10 ~16 ~10 ~46 ~32 ~46 air
fill ~10 ~-1 ~10 ~46 ~-1 ~46 smooth_stone
fill ~10 ~-1 ~10 ~46 ~-1 ~10 yellow_concrete
fill ~10 ~-1 ~46 ~46 ~-1 ~46 yellow_concrete
fill ~10 ~-1 ~10 ~10 ~-1 ~46 yellow_concrete
fill ~46 ~-1 ~10 ~46 ~-1 ~46 yellow_concrete

# Main access road and lane markings
fill ~23 ~0 ~10 ~33 ~0 ~46 gray_concrete
fill ~28 ~0 ~10 ~28 ~0 ~46 yellow_concrete
fill ~23 ~0 ~10 ~23 ~0 ~46 white_concrete
fill ~33 ~0 ~10 ~33 ~0 ~46 white_concrete

# Left cargo tower shell
fill ~12 ~0 ~29 ~22 ~23 ~43 polished_deepslate
fill ~14 ~2 ~28 ~20 ~17 ~28 cyan_stained_glass
fill ~14 ~19 ~28 ~20 ~21 ~28 sea_lantern
fill ~14 ~2 ~44 ~20 ~17 ~44 cyan_stained_glass
fill ~12 ~24 ~29 ~22 ~24 ~43 cyan_concrete

# Right cargo tower shell
fill ~34 ~0 ~29 ~44 ~23 ~43 polished_deepslate
fill ~36 ~2 ~28 ~42 ~17 ~28 cyan_stained_glass
fill ~36 ~19 ~28 ~42 ~21 ~28 sea_lantern
fill ~36 ~2 ~44 ~42 ~17 ~44 cyan_stained_glass
fill ~34 ~24 ~29 ~44 ~24 ~43 cyan_concrete

# Hollow tower interiors and add floors
fill ~14 ~1 ~31 ~20 ~22 ~41 air
fill ~36 ~1 ~31 ~42 ~22 ~41 air
fill ~14 ~8 ~31 ~20 ~8 ~41 smooth_stone
fill ~14 ~16 ~31 ~20 ~16 ~41 smooth_stone
fill ~36 ~8 ~31 ~42 ~8 ~41 smooth_stone
fill ~36 ~16 ~31 ~42 ~16 ~41 smooth_stone

# Glowing skybridge over the road
fill ~23 ~16 ~31 ~33 ~23 ~41 black_concrete
fill ~23 ~18 ~30 ~33 ~21 ~30 cyan_stained_glass
fill ~23 ~18 ~42 ~33 ~21 ~42 cyan_stained_glass
fill ~24 ~17 ~33 ~32 ~17 ~39 smooth_stone
fill ~24 ~22 ~33 ~32 ~22 ~39 sea_lantern
fill ~26 ~16 ~31 ~30 ~17 ~41 air

# Drive-through gateway opening
fill ~24 ~0 ~29 ~32 ~15 ~43 air
fill ~24 ~0 ~29 ~32 ~0 ~43 gray_concrete
fill ~28 ~0 ~29 ~28 ~0 ~43 yellow_concrete

# Three cargo loading bays on each side
fill ~13 ~1 ~30 ~13 ~6 ~34 iron_block
fill ~13 ~1 ~35 ~13 ~6 ~39 iron_block
fill ~13 ~1 ~40 ~13 ~6 ~43 iron_block
fill ~43 ~1 ~30 ~43 ~6 ~34 iron_block
fill ~43 ~1 ~35 ~43 ~6 ~39 iron_block
fill ~43 ~1 ~40 ~43 ~6 ~43 iron_block
fill ~13 ~2 ~31 ~13 ~5 ~33 black_concrete
fill ~13 ~2 ~36 ~13 ~5 ~38 black_concrete
fill ~13 ~2 ~41 ~13 ~5 ~42 black_concrete
fill ~43 ~2 ~31 ~43 ~5 ~33 black_concrete
fill ~43 ~2 ~36 ~43 ~5 ~38 black_concrete
fill ~43 ~2 ~41 ~43 ~5 ~42 black_concrete

# EAW crown and beacon
fill ~24 ~24 ~32 ~32 ~29 ~40 polished_deepslate
fill ~25 ~25 ~31 ~31 ~28 ~31 cyan_stained_glass
fill ~25 ~25 ~41 ~31 ~28 ~41 cyan_stained_glass
fill ~25 ~30 ~33 ~31 ~30 ~39 sea_lantern
setblock ~28 ~31 ~36 beacon
fill ~27 ~29 ~35 ~29 ~29 ~37 iron_block

# Lit approach pylons
fill ~12 ~0 ~12 ~12 ~6 ~12 polished_deepslate
setblock ~12 ~7 ~12 sea_lantern
fill ~44 ~0 ~12 ~44 ~6 ~12 polished_deepslate
setblock ~44 ~7 ~12 sea_lantern
fill ~12 ~0 ~22 ~12 ~6 ~22 polished_deepslate
setblock ~12 ~7 ~22 sea_lantern
fill ~44 ~0 ~22 ~44 ~6 ~22 polished_deepslate
setblock ~44 ~7 ~22 sea_lantern

# Yard landing-pad symbol and accents
fill ~13 ~0 ~13 ~21 ~0 ~21 cyan_concrete
fill ~15 ~0 ~15 ~19 ~0 ~19 black_concrete
fill ~16 ~0 ~15 ~18 ~0 ~19 white_concrete
fill ~15 ~0 ~17 ~19 ~0 ~17 white_concrete
fill ~35 ~0 ~13 ~43 ~0 ~21 cyan_concrete
fill ~37 ~0 ~15 ~41 ~0 ~19 black_concrete
fill ~38 ~0 ~15 ~40 ~0 ~19 white_concrete
fill ~37 ~0 ~17 ~41 ~0 ~17 white_concrete

tellraw @s {"rawtext":[{"text":"EAW: Freight gateway complete. Use /function eaw/remove_gateway to undo it."}]}
