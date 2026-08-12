import type { Dimension, Vector3 } from "@minecraft/server";
import { BlockVolume } from "@minecraft/server";
import type { TransactionManager } from "@minecraft/server-editor";

export interface FillOperation {
  readonly from: Vector3;
  readonly to: Vector3;
  readonly block: string;
}

export interface BuildBoundary {
  readonly from: Vector3;
  readonly to: Vector3;
  readonly maxChangedBlocks: number;
}

function low(a: number, b: number): number { return Math.min(a, b); }
function high(a: number, b: number): number { return Math.max(a, b); }

export function estimateChangedBlocks(operations: readonly FillOperation[]): number {
  return operations.reduce((total, operation) => total
    + (Math.abs(operation.to.x - operation.from.x) + 1)
    * (Math.abs(operation.to.y - operation.from.y) + 1)
    * (Math.abs(operation.to.z - operation.from.z) + 1), 0);
}

export function validateBuildBoundary(operations: readonly FillOperation[], boundary: BuildBoundary): number {
  const minX = low(boundary.from.x, boundary.to.x);
  const maxX = high(boundary.from.x, boundary.to.x);
  const minY = low(boundary.from.y, boundary.to.y);
  const maxY = high(boundary.from.y, boundary.to.y);
  const minZ = low(boundary.from.z, boundary.to.z);
  const maxZ = high(boundary.from.z, boundary.to.z);
  for (const operation of operations) {
    if (low(operation.from.x, operation.to.x) < minX || high(operation.from.x, operation.to.x) > maxX
      || low(operation.from.y, operation.to.y) < minY || high(operation.from.y, operation.to.y) > maxY
      || low(operation.from.z, operation.to.z) < minZ || high(operation.from.z, operation.to.z) > maxZ) {
      throw new Error("Build refused: an operation extends outside its approved boundary.");
    }
  }
  const estimate = estimateChangedBlocks(operations);
  if (estimate > boundary.maxChangedBlocks) {
    throw new Error(`Build refused: estimated ${estimate} block changes exceeds the approved limit of ${boundary.maxChangedBlocks}.`);
  }
  return estimate;
}

export function applyDirectFills(dimension: Dimension, operations: readonly FillOperation[]): void {
  void dimension;
  void operations;
  throw new Error("Legacy direct building is safety-locked. This build must be migrated to an approved, undoable transaction.");
}

export function applyFillTransaction(
  transactionManager: TransactionManager,
  dimension: Dimension,
  name: string,
  trackedFrom: Vector3,
  trackedTo: Vector3,
  operations: readonly FillOperation[],
  boundary?: BuildBoundary
): void {
  if (!boundary) throw new Error("Build refused: no approved boundary was supplied.");
  validateBuildBoundary(operations, boundary);

  type PendingTransactionCompat = {
    trackBlockChangeArea(from: Vector3, to: Vector3): boolean;
    commitTrackedChanges(): number;
    submit(): void;
    discardTrackedChanges(): number;
    discard(): void;
  };
  type TransactionManagerCompat = TransactionManager & {
    createPendingTransaction?: (name: string) => PendingTransactionCompat;
  };
  const compatibleManager = transactionManager as TransactionManagerCompat;

  // Minecraft Editor's current API uses PendingTransaction. Keep the older
  // path only for projects running an earlier compatible Editor build.
  if (typeof compatibleManager.createPendingTransaction === "function") {
    const pending = compatibleManager.createPendingTransaction(name);
    try {
      if (!pending.trackBlockChangeArea(trackedFrom, trackedTo)) {
        throw new Error("Editor could not track the approved area for undo.");
      }
      for (const operation of operations) {
        dimension.fillBlocks(new BlockVolume(operation.from, operation.to), operation.block);
      }
      pending.commitTrackedChanges();
      pending.submit();
      return;
    } catch (error) {
      try {
        pending.discardTrackedChanges();
        pending.discard();
      } catch {
        // Preserve the original build error.
      }
      throw error;
    }
  }

  if (typeof transactionManager.isBusy !== "function") {
    throw new Error("Build refused: this Editor exposes no supported undo transaction API.");
  }
  if (transactionManager.isBusy()) throw new Error("Editor is busy with another undoable operation. Try again in a moment.");

  let opened = false;
  try {
    opened = transactionManager.openTransaction(name);
    if (!opened) throw new Error("Editor could not open an undo transaction.");

    if (!transactionManager.trackBlockChangeArea(trackedFrom, trackedTo)) {
      throw new Error("Editor could not track the selected area for undo.");
    }

    for (const operation of operations) {
      dimension.fillBlocks(new BlockVolume(operation.from, operation.to), operation.block);
    }

    transactionManager.commitTrackedChanges();
    transactionManager.commitOpenTransaction();
  } catch (error) {
    if (opened) {
      try {
        transactionManager.discardTrackedChanges();
        transactionManager.discardOpenTransaction();
      } catch {
        // Preserve the original build error.
      }
    }
    throw error;
  }
}
