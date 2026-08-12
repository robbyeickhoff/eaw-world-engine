import { system } from "@minecraft/server";
import {
  ActionTypes,
  EditorInputContext,
  InputModifier,
  KeyboardKey,
  registerEditorExtension,
  makeObservable,
  RootPaneLocation,
  type IDisposable,
  type IPropertyPane,
  type IPlayerUISession
} from "@minecraft/server-editor";
import { buildFinalEawAirportSign } from "./builds/eawAirportSign";
import { buildRunwayArrivalTerminal } from "./builds/runwayArrivalTerminal";
import {
  buildLandArrivalTerminal,
  buildMountainRoadSegment,
  MOUNTAIN_ROUTE
} from "./builds/landArrivalMountainRoad";
import {
  buildSignAirportConnector,
  removeTunnelSection,
  TUNNEL_SECTIONS
} from "./builds/tunnelDistrictRedesign";
import {
  buildCargoRoundabout,
  buildMountainApproach,
  buildMountainPortalStarter
} from "./builds/cargoGatewayDistrict";
import {
  buildHelipadElevatorStations,
  rideElevatorDown,
  rideElevatorUp
} from "./builds/helipadElevator";
import {
  buildElevatorHub,
  buildLandCausewaySection,
  buildRunwayCausewaySection
} from "./builds/helipadTransportHub";
import { createNavigationControls } from "./engine/navigation";
import { buildCraneEasterEgg } from "./builds/craneEasterEgg";
import { startIsolatedArtificialDebrisCleanup } from "./builds/isolatedArtificialDebrisCleanup";

interface EawSessionState {
  connectedAt: number;
}

function activate(ui: IPlayerUISession<EawSessionState>): IDisposable[] {
  ui.scratchStorage = { connectedAt: Date.now() };

  const rootPane = ui.createPropertyPane({
    uniqueId: "eaw:builder",
    title: "EAW Builder",
    location: RootPaneLocation.Drawer
  });
  let pane: IPropertyPane = rootPane;

  const showBuilderAction = ui.actionManager.createAction({
    actionType: ActionTypes.NoArgsAction,
    onExecute: () => {
      rootPane.show();
      rootPane.expand();
    }
  });
  ui.inputManager.registerKeyBinding(
    EditorInputContext.GlobalEditor,
    showBuilderAction,
    { key: KeyboardKey.KEY_B, modifier: InputModifier.Control },
    {
      uniqueId: "eaw:show_builder_panel",
      label: "Show EAW Builder panel",
      tooltip: "Reopens the EAW Builder panel"
    }
  );

  const status = makeObservable("Ready to rebuild the approved airport sign area.");
  const navigation = createNavigationControls(ui);
  const recordLocation = (): void => {
    try {
      const message = navigation.recordBuildLocation();
      status.set("Build location recorded successfully.");
      ui.log.info(message);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      status.set(`Location not recorded: ${message}`);
      ui.log.error(`EAW Builder could not record the location: ${message}`);
    }
  };
  const recordLocationAction = ui.actionManager.createAction({
    actionType: ActionTypes.NoArgsAction,
    onExecute: recordLocation
  });
  ui.inputManager.registerKeyBinding(
    EditorInputContext.Viewport,
    recordLocationAction,
    { key: KeyboardKey.KEY_M, modifier: InputModifier.Control },
    {
      uniqueId: "eaw:record_build_location",
      label: "Record EAW build location",
      tooltip: "Records the block currently under the Editor mouse cursor"
    }
  );

  pane.addText("Navigation and build locations");
  pane.addText(navigation.navigationStatus);
  pane.addText(status);
  pane.addButton(
    () => navigation.toggleNavigation(),
    {
      title: "Show / hide navigation display",
      tooltip: "Toggles the always-visible coordinates and compass direction at the bottom of the screen"
    }
  );
  pane.addText(navigation.recordedLocation);
  pane.addButton(
    recordLocation,
    {
      title: "Record build location",
      tooltip: "Records the exact block under the mouse cursor plus the direction you are facing"
    }
  );
  pane.addText("SAFE MODE: construction is locked");
  pane.addText("SAFE MODE: accepted Section 2 is disarmed");
  pane.addText("ARMED: remove exactly 846 isolated artificial debris blocks");
  pane.addText("Protected: Components 1 and 2, terrain, roads, supports, and stone ribs");
  pane.addButton(
    () => {
      startIsolatedArtificialDebrisCleanup(
        ui,
        (message) => status.set(message),
        (message) => {
          status.set(message);
          ui.log.info(`EAW isolated debris cleanup complete: ${message}`);
        },
        (message) => {
          status.set(`Isolated debris cleanup refused: ${message}`);
          ui.log.error(`EAW isolated debris cleanup refused: ${message}`);
        }
      );
    },
    {
      title: "REMOVE approved 846 debris blocks",
      tooltip: "Removes only the 29 approved isolated components in one undoable transaction"
    }
  );

  // Completed construction remains available without filling the main toolbar.
  pane = rootPane.createSubPane({
    title: "Previous builds and maintenance",
    collapsed: true,
    hasExpander: true
  });
  pane.addButton(
    () => {
      const dimension = ui.extensionContext.player.dimension;
      ui.extensionContext.player.teleport({ x: -89, y: 80, z: 55 }, { dimension });
      status.set("Stage 10: loading the gantry-crane area...");
      system.runTimeout(() => {
        try {
          const message = buildCraneEasterEgg(ui);
          status.set(`Stage 10 complete: ${message}`);
          ui.log.info(message);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          status.set(`Stage 10 crane build failed: ${message}`);
          ui.log.error(`EAW Builder could not build the crane Easter egg: ${message}`);
        }
      }, 40);
    },
    { title: "10 - Build crane Easter egg", tooltip: "Builds the interactive mystery cargo, landing pad, and control console" }
  );
  pane.addText("Airport sign");
  pane.addText(
    "Approved final sign area: X -107 to -103, Y 85 to 103, Z 35 to 65."
  );
  pane.addButton(
    () => ui.log.info("EAW Builder is connected. No world changes were made."),
    {
      title: "Run safe connection test",
      tooltip: "Writes a diagnostic message without changing the world"
    }
  );

  pane.addText("Helipad transport hub");
  pane.addText(
    "Elevator tower plus vehicle-width causeways to the runway and land. Includes lighting and seabed pylons."
  );
  pane.addButton(
    () => {
      try {
        ui.extensionContext.player.teleport(
          { x: -184, y: 80, z: 177 },
          { dimension: ui.extensionContext.player.dimension }
        );
        status.set("Teleported to the helipad transport hub build area.");
        ui.log.info("Teleported to active build at X -184, Y 80, Z 177.");
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        status.set(`Teleport failed: ${message}`);
        ui.log.error(`EAW Builder could not teleport to the active build: ${message}`);
      }
    },
    {
      title: "Teleport to active build",
      tooltip: "Teleports you safely above the helipad transport hub without requiring cheats"
    }
  );
  const addTransportStage = (
    title: string,
    destination: { x: number; y: number; z: number },
    build: () => string
  ): void => {
    pane.addButton(
      () => {
        try {
          ui.extensionContext.player.teleport(destination, {
            dimension: ui.extensionContext.player.dimension
          });
          status.set(`${title}: loading the build area...`);
          system.runTimeout(() => {
            try {
              const message = build();
              status.set(message);
              ui.log.info(message);
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              status.set(`${title} paused: ${message}`);
              ui.log.error(`EAW Builder paused ${title}: ${message}`);
            }
          }, 40);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          status.set(`${title} failed: ${message}`);
          ui.log.error(`EAW Builder could not start ${title}: ${message}`);
        }
      },
      {
        title,
        tooltip: "Teleports to the correct area, waits for it to load, and builds this section"
      }
    );
  };

  addTransportStage("1 - Build elevator and bridge", { x: -184, y: 80, z: 177 }, () =>
    buildElevatorHub(ui)
  );
  pane.addButton(
    () => {
      ui.extensionContext.player.teleport({ x: -188, y: 82, z: 72 }, { dimension: ui.extensionContext.player.dimension });
      status.set("Stage 2: loading the runway end...");
      system.runTimeout(() => {
        try {
          buildRunwayCausewaySection(ui, 40, 105, false);
          ui.extensionContext.player.teleport({ x: -186, y: 82, z: 139 }, { dimension: ui.extensionContext.player.dimension });
          status.set("Stage 2: first half complete; loading the elevator half...");
          system.runTimeout(() => {
            try {
              const message = buildRunwayCausewaySection(ui, 106, 171, true);
              status.set(message);
              ui.log.info(message);
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              status.set(`Stage 2 paused on second half: ${message}`);
              ui.log.error(`EAW Builder paused stage 2: ${message}`);
            }
          }, 40);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          status.set(`Stage 2 paused on first half: ${message}`);
          ui.log.error(`EAW Builder paused stage 2: ${message}`);
        }
      }, 40);
    },
    { title: "2 - Build runway causeway", tooltip: "Automatically loads and rebuilds both halves of the runway route" }
  );
  pane.addButton(
    () => {
      ui.extensionContext.player.teleport({ x: -106, y: 82, z: 182 }, { dimension: ui.extensionContext.player.dimension });
      status.set("Stage 3: loading the land end...");
      system.runTimeout(() => {
        try {
          buildLandCausewaySection(ui, -129, -83, false);
          ui.extensionContext.player.teleport({ x: -154, y: 82, z: 180 }, { dimension: ui.extensionContext.player.dimension });
          status.set("Stage 3: first half complete; loading the elevator half...");
          system.runTimeout(() => {
            try {
              const message = buildLandCausewaySection(ui, -178, -130, true);
              status.set(message);
              ui.log.info(message);
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              status.set(`Stage 3 paused on second half: ${message}`);
              ui.log.error(`EAW Builder paused stage 3: ${message}`);
            }
          }, 40);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          status.set(`Stage 3 paused on first half: ${message}`);
          ui.log.error(`EAW Builder paused stage 3: ${message}`);
        }
      }, 40);
    },
    { title: "3 - Build land causeway", tooltip: "Automatically loads and rebuilds both halves of the land route" }
  );
  pane.addButton(
    () => {
      try {
        ui.extensionContext.player.teleport({ x: -184, y: 82, z: 177 }, { dimension: ui.extensionContext.player.dimension });
        status.set("Loading the elevator station build area...");
        system.runTimeout(() => {
          try {
            const message = buildHelipadElevatorStations(ui);
            status.set(message);
            ui.log.info(message);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            status.set(`Elevator stations not built: ${message}`);
            ui.log.error(`EAW Builder could not build the elevator stations: ${message}`);
          }
        }, 40);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        status.set(`Elevator station build failed: ${message}`);
      }
    },
    { title: "4 - Build stations and shuttle", tooltip: "Builds both stations, opens the helipad exit, and parks the personnel shuttle" }
  );
  pane.addButton(
    () => {
      const message = rideElevatorUp(ui);
      status.set(message);
      ui.log.info(message);
    },
    { title: "Ride elevator UP", tooltip: "Travels to the upper helipad station" }
  );
  pane.addButton(
    () => {
      const message = rideElevatorDown(ui);
      status.set(message);
      ui.log.info(message);
    },
    { title: "Ride elevator DOWN", tooltip: "Travels to the lower transport station" }
  );
  pane.addButton(
    () => {
      try {
        ui.extensionContext.player.teleport({ x: -188, y: 82, z: 40 }, { dimension: ui.extensionContext.player.dimension });
        status.set("Loading the runway arrival area...");
        system.runTimeout(() => {
          try {
            const message = buildRunwayArrivalTerminal(ui);
            status.set(message);
            ui.log.info(message);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            status.set(`Runway terminal not built: ${message}`);
            ui.log.error(`EAW Builder could not build the runway terminal: ${message}`);
          }
        }, 40);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        status.set(`Runway terminal build failed: ${message}`);
      }
    },
    { title: "5 - Build runway arrival terminal", tooltip: "Builds the airside turnaround and passenger terminal at the runway causeway endpoint" }
  );
  pane.addButton(
    () => {
      const dimension = ui.extensionContext.player.dimension;
      const runSegment = (segment: number): void => {
        if (segment >= MOUNTAIN_ROUTE.length - 1) {
          status.set("Stage 6 complete: built the land terminal and full mountain switchback road to air traffic control.");
          ui.log.info("Stage 6 complete: land terminal and mountain road built.");
          return;
        }
        const from = MOUNTAIN_ROUTE[segment];
        const to = MOUNTAIN_ROUTE[segment + 1];
        ui.extensionContext.player.teleport(
          { x: Math.round((from.x + to.x) / 2), y: Math.max(from.y, to.y) + 12, z: Math.round((from.z + to.z) / 2) },
          { dimension }
        );
        status.set(`Stage 6: loading mountain-road section ${segment + 1}...`);
        system.runTimeout(() => {
          try {
            const message = buildMountainRoadSegment(ui, segment);
            status.set(message);
            runSegment(segment + 1);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            status.set(`Stage 6 paused at section ${segment + 1}: ${message}`);
            ui.log.error(`EAW Builder paused stage 6: ${message}`);
          }
        }, 40);
      };

      ui.extensionContext.player.teleport({ x: -83, y: 82, z: 182 }, { dimension });
      status.set("Stage 6: loading the land arrival terminal...");
      system.runTimeout(() => {
        try {
          buildLandArrivalTerminal(ui);
          runSegment(0);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          status.set(`Stage 6 terminal build failed: ${message}`);
          ui.log.error(`EAW Builder could not start stage 6: ${message}`);
        }
      }, 40);
    },
    { title: "6 - Build land terminal and mountain road", tooltip: "Builds the land arrival station and scenic switchback road to air traffic control" }
  );
  pane.addButton(
    () => {
      const dimension = ui.extensionContext.player.dimension;
      const removeSection = (section: number): void => {
        if (section >= TUNNEL_SECTIONS.length) {
          ui.extensionContext.player.teleport({ x: -154, y: 82, z: 43 }, { dimension });
          status.set("Stage 7: loading the new road connection...");
          system.runTimeout(() => {
            try {
              const message = buildSignAirportConnector(ui);
              status.set(`Stage 7 complete: ${message}`);
              ui.log.info("Stage 7 complete: tunnel removed and road network reconnected.");
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              status.set(`Stage 7 road build paused: ${message}`);
              ui.log.error(`EAW Builder paused stage 7 road build: ${message}`);
            }
          }, 40);
          return;
        }
        const range = TUNNEL_SECTIONS[section];
        ui.extensionContext.player.teleport({ x: -137, y: 85, z: Math.round((range.fromZ + range.toZ) / 2) }, { dimension });
        status.set(`Stage 7: loading tunnel-removal section ${section + 1}...`);
        system.runTimeout(() => {
          try {
            removeTunnelSection(ui, range.fromZ, range.toZ);
            removeSection(section + 1);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            status.set(`Stage 7 paused at tunnel section ${section + 1}: ${message}`);
            ui.log.error(`EAW Builder paused stage 7: ${message}`);
          }
        }, 40);
      };
      removeSection(0);
    },
    { title: "7 - Remove old tunnel and reconnect roads", tooltip: "Deletes the approved tunnel structure, restores the water, and builds the curved airport road connection" }
  );
  pane.addButton(
    () => {
      const dimension = ui.extensionContext.player.dimension;
      ui.extensionContext.player.teleport({ x: -154, y: 82, z: 49 }, { dimension });
      status.set("Stage 8: loading the road correction area...");
      system.runTimeout(() => {
        try {
          const message = buildSignAirportConnector(ui);
          status.set(`Stage 8 complete: ${message}`);
          ui.log.info(message);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          status.set(`Stage 8 road correction failed: ${message}`);
          ui.log.error(`EAW Builder could not correct the road: ${message}`);
        }
      }, 40);
    },
    { title: "8 - Rebuild sign-airport road cleanly", tooltip: "Removes the jagged S-curve and replaces it with a straight bridge and turning plaza" }
  );
  pane.addButton(
    () => {
      const dimension = ui.extensionContext.player.dimension;
      ui.extensionContext.player.teleport({ x: -80, y: 88, z: 50 }, { dimension });
      status.set("Stage 9: loading the freight roundabout...");
      system.runTimeout(() => {
        try {
          buildCargoRoundabout(ui);
          ui.extensionContext.player.teleport({ x: -73, y: 88, z: 98 }, { dimension });
          status.set("Stage 9: loading the mountain approach...");
          system.runTimeout(() => {
            try {
              buildMountainApproach(ui);
              ui.extensionContext.player.teleport({ x: -64, y: 92, z: 145 }, { dimension });
              status.set("Stage 9: loading the Heidi Haven portal...");
              system.runTimeout(() => {
                try {
                  const message = buildMountainPortalStarter(ui);
                  status.set(`Stage 9 complete: ${message}`);
                  ui.log.info("Stage 9 complete: cargo gateway district and Heidi Haven starter portal built.");
                } catch (error) {
                  const message = error instanceof Error ? error.message : String(error);
                  status.set(`Stage 9 portal build failed: ${message}`);
                }
              }, 40);
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              status.set(`Stage 9 mountain approach failed: ${message}`);
            }
          }, 40);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          status.set(`Stage 9 roundabout failed: ${message}`);
        }
      }, 40);
    },
    { title: "9 - Build cargo gateway and mountain portal", tooltip: "Organizes the cargo district, builds the gantry road, and starts the Heidi Haven tunnel" }
  );
  pane.addButton(
    () => {
      try {
        const message = buildFinalEawAirportSign(ui);
        status.set(message);
        ui.log.info(message);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        status.set(`Build refused: ${message}`);
        ui.log.error(`EAW Builder refused the operation: ${message}`);
      }
    },
    {
      title: "Rebuild final airport sign",
      tooltip: "Replaces only the approved airport sign volume with the coded EAW design"
    }
  );

  rootPane.show();

  ui.log.info("EAW Builder extension loaded.");
  return [navigation];
}

function shutdown(_ui: IPlayerUISession<EawSessionState>): void {
  // Editor owns and removes the player-specific pane automatically.
}

registerEditorExtension<EawSessionState>("EAW Builder", activate, shutdown, {
  description: "Code-driven construction tools for Eickhoff Adventure World",
  notes: "The airport sign build is restricted to Robby's explicitly approved coordinates."
});
