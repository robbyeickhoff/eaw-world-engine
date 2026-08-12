import { BlockVolume, system, world, type Dimension, type Player, type Vector3 } from "@minecraft/server";

const LOWER_CONTROL = { x: -177, y: 71, z: 171 } as const;
const UPPER_CONTROL = { x: -190, y: 92, z: 173 } as const;
const LOWER_ARRIVAL = { x: -184, y: 71, z: 177 } as const;
const UPPER_ARRIVAL = { x: -184, y: 91, z: 177 } as const;
const traveling = new Set<string>();
const lastStation = new Map<string, "lower" | "upper">();
let craneMoving = false;
let craneLowered = false;

const DOORS = {
  lower: { from: { x: -181, y: 71, z: 176 }, to: { x: -181, y: 73, z: 178 } },
  upper: { from: { x: -188, y: 91, z: 176 }, to: { x: -188, y: 93, z: 178 } }
} as const;

function setDoors(dimension: Dimension, station: "lower" | "upper", open: boolean): void {
  const door = DOORS[station];
  dimension.fillBlocks(
    new BlockVolume(door.from, door.to),
    open ? "minecraft:air" : "minecraft:orange_stained_glass"
  );
}

function sameBlock(a: Vector3, b: Vector3): boolean {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

function isCraneControl(location: Vector3): boolean {
  return location.x === -96 && location.y >= 70 && location.y <= 71 && location.z >= 55 && location.z <= 56;
}

function travel(
  player: Player,
  destination: Vector3,
  destinationStation: "lower" | "upper",
  label: string
): void {
  if (traveling.has(player.id)) return;
  traveling.add(player.id);
  const originStation = destinationStation === "upper" ? "lower" : "upper";
  const dimension = player.dimension;
  setDoors(dimension, originStation, false);
  setDoors(dimension, destinationStation, false);
  player.onScreenDisplay.setActionBar("EAW Elevator | Doors closing...");
  player.playSound("beacon.activate", { volume: 0.8, pitch: 1.1 });
  system.runTimeout(() => {
    try {
      lastStation.set(player.id, destinationStation);
      player.teleport(destination, { dimension: player.dimension });
      player.playSound("random.orb", { volume: 1, pitch: 0.8 });
      setDoors(dimension, originStation, true);
      player.onScreenDisplay.setActionBar(`EAW Elevator | ${label} - arriving...`);
      system.runTimeout(() => {
        setDoors(dimension, destinationStation, true);
        player.playSound("random.click", { volume: 0.8, pitch: 1.2 });
        player.onScreenDisplay.setActionBar(`EAW Elevator | ${label} - doors open`);
      }, 10);
    } finally {
      system.runTimeout(() => traveling.delete(player.id), 20);
    }
  }, 30);
}

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  if (!event.isFirstEvent || event.block.typeId !== "minecraft:gold_block") return;
  const location = event.block.location;
  if (isCraneControl(location)) {
    event.cancel = true;
    system.run(() => operateCrane(event.player));
  } else if (sameBlock(location, LOWER_CONTROL)) {
    event.cancel = true;
    system.run(() => travel(event.player, UPPER_ARRIVAL, "upper", "Upper helipad station"));
  } else if (sameBlock(location, UPPER_CONTROL)) {
    event.cancel = true;
    system.run(() => travel(event.player, LOWER_ARRIVAL, "lower", "Lower transport station"));
  }
});

function drawCraneCargo(dimension: Dimension, bottomY: number, revealed: boolean): void {
  dimension.fillBlocks(new BlockVolume({ x: -85, y: 70, z: 48 }, { x: -81, y: 78, z: 52 }), "minecraft:air");
  dimension.fillBlocks(new BlockVolume({ x: -83, y: bottomY + 4, z: 50 }, { x: -83, y: 80, z: 50 }), "minecraft:chain");
  dimension.fillBlocks(new BlockVolume({ x: -85, y: bottomY, z: 48 }, { x: -81, y: bottomY + 3, z: 52 }), "minecraft:polished_blackstone_bricks");
  dimension.fillBlocks(new BlockVolume({ x: -84, y: bottomY + 1, z: 49 }, { x: -82, y: bottomY + 2, z: 51 }), revealed ? "minecraft:amethyst_block" : "minecraft:purple_stained_glass");
  for (const x of [-85, -81]) {
    for (const z of [48, 52]) {
      dimension.fillBlocks(new BlockVolume({ x, y: bottomY, z }, { x, y: bottomY + 3, z }), "minecraft:orange_concrete");
    }
  }
  if (revealed) {
    // Open the south face so the secret core can be seen and reached.
    dimension.fillBlocks(new BlockVolume({ x: -84, y: bottomY + 1, z: 48 }, { x: -82, y: bottomY + 2, z: 48 }), "minecraft:air");
    dimension.fillBlocks(new BlockVolume({ x: -83, y: bottomY + 1, z: 49 }, { x: -83, y: bottomY + 2, z: 49 }), "minecraft:diamond_block");
  } else {
    dimension.fillBlocks(new BlockVolume({ x: -83, y: bottomY, z: 48 }, { x: -83, y: bottomY + 3, z: 48 }), "minecraft:yellow_concrete");
  }
}

function operateCrane(player: Player): void {
  if (craneMoving) {
    player.onScreenDisplay.setActionBar("EAW Cargo Crane | Operation already in progress");
    return;
  }
  craneMoving = true;
  const dimension = player.dimension;
  const lowering = !craneLowered;
  player.onScreenDisplay.setActionBar(`EAW Cargo Crane | ${lowering ? "Lowering mystery cargo..." : "Resetting cargo..."}`);
  player.playSound("beacon.activate", { volume: 0.8, pitch: lowering ? 0.7 : 1.1 });
  const heights = lowering ? [72, 71, 70] : [71, 72, 73];
  heights.forEach((height, index) => {
    system.runTimeout(() => {
      drawCraneCargo(dimension, height, lowering && index === heights.length - 1);
      player.playSound("random.anvil_land", { volume: 0.35, pitch: 1.4 - index * 0.15 });
      if (index === heights.length - 1) {
        craneLowered = lowering;
        craneMoving = false;
        if (lowering) {
          player.playSound("random.levelup", { volume: 1, pitch: 0.9 });
          player.onScreenDisplay.setTitle("EAW SECRET #1 FOUND!", { subtitle: "The gantry crane's mystery cargo", fadeInDuration: 5, stayDuration: 60, fadeOutDuration: 15 });
        } else {
          player.onScreenDisplay.setActionBar("EAW Cargo Crane | Mystery cargo reset");
        }
      }
    }, 15 * (index + 1));
  });
}

function stationAt(player: Player): "lower" | "upper" | undefined {
  const { x, y, z } = player.location;
  if (x >= -185 && x < -182 && y >= 71 && y < 72.5 && z >= 176 && z < 179) return "lower";
  if (x >= -185 && x < -182 && y >= 91 && y < 92.5 && z >= 176 && z < 179) return "upper";
  return undefined;
}

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    if (traveling.has(player.id)) continue;
    const station = stationAt(player);
    if (!station) {
      lastStation.delete(player.id);
      continue;
    }
    if (lastStation.get(player.id) === station) continue;
    lastStation.set(player.id, station);
    if (station === "lower") {
      travel(player, UPPER_ARRIVAL, "upper", "Upper helipad station");
    } else {
      travel(player, LOWER_ARRIVAL, "lower", "Lower transport station");
    }
  }
}, 5);
