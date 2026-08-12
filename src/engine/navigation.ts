import { system, type Player, type Vector3 } from "@minecraft/server";
import {
  makeObservable,
  type IDisposable,
  type IObservable,
  type IPlayerUISession,
  type IStatusBarItem
} from "@minecraft/server-editor";

export interface RecordedBuildLocation {
  x: number;
  y: number;
  z: number;
  facing: string;
}

export interface NavigationControls {
  readonly navigationStatus: IObservable<string>;
  readonly recordedLocation: IObservable<string>;
  toggleNavigation(): void;
  recordBuildLocation(): string;
  teardown(): void;
}

function wholeBlock(location: Vector3): Vector3 {
  return {
    x: Math.floor(location.x),
    y: Math.floor(location.y),
    z: Math.floor(location.z)
  };
}

function facingFromView(view: Vector3): string {
  if (Math.abs(view.x) > Math.abs(view.z)) {
    return view.x >= 0 ? "EAST" : "WEST";
  }

  return view.z >= 0 ? "SOUTH" : "NORTH";
}

function navigationText(player: Player): string {
  const position = wholeBlock(player.location);
  const facing = facingFromView(player.getViewDirection());
  return `EAW | Facing ${facing} | X ${position.x} | Y ${position.y} | Z ${position.z}`;
}

function recordedText(location: RecordedBuildLocation): string {
  return `RECORDED BUILD LOCATION: X ${location.x} | Y ${location.y} | Z ${location.z} | Facing ${location.facing}`;
}

export function createNavigationControls(
  ui: IPlayerUISession<unknown>
): NavigationControls & IDisposable {
  const player = ui.extensionContext.player;
  const navigationStatus = makeObservable("Navigation display: ON");
  const recordedLocation = makeObservable(
    "No build location recorded yet. Aim at a block and click the button below."
  );
  const statusItem: IStatusBarItem = ui.statusBar.createItem({
    text: navigationText(player),
    visible: true,
    size: 420
  });
  let navigationVisible = true;

  const intervalId = system.runInterval(() => {
    if (navigationVisible) {
      statusItem.setText(navigationText(player));
    }
  }, 5);

  const toggleNavigation = (): void => {
    navigationVisible = !navigationVisible;
    if (navigationVisible) {
      statusItem.setText(navigationText(player));
      statusItem.show();
      navigationStatus.set("Navigation display: ON");
    } else {
      statusItem.hide();
      navigationStatus.set("Navigation display: OFF");
    }
  };

  const recordBuildLocation = (): string => {
    const cursor = ui.extensionContext.cursor;
    const ray = cursor.getRay();
    if (!ray.hit) {
      throw new Error(
        "The Editor mouse cursor is not touching a block. Hover over the desired block in the world view and try again."
      );
    }
    const location = wholeBlock(cursor.getPosition());
    const rayDirection = {
      x: ray.end.x - ray.start.x,
      y: ray.end.y - ray.start.y,
      z: ray.end.z - ray.start.z
    };
    const message = recordedText({
      x: location.x,
      y: location.y,
      z: location.z,
      facing: facingFromView(rayDirection)
    });
    recordedLocation.set(message);
    return message;
  };

  const teardown = (): void => {
    system.clearRun(intervalId);
    ui.statusBar.removeItem(statusItem.id);
  };

  return {
    navigationStatus,
    recordedLocation,
    toggleNavigation,
    recordBuildLocation,
    teardown
  };
}
