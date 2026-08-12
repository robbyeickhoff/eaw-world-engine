import type { Vector3 } from "@minecraft/server";
import type { BuildBoundary } from "./transaction";

export interface BuildTicket {
  readonly id: string;
  readonly objective: string;
  readonly boundary: BuildBoundary;
  readonly stages: readonly string[];
}

export interface SurveyApproval {
  readonly ticketId: string;
  readonly surveyedAt: number;
  readonly approvedStage: number;
}

export function createBuildTicket(
  id: string,
  objective: string,
  from: Vector3,
  to: Vector3,
  maxChangedBlocks: number,
  stages: readonly string[]
): BuildTicket {
  if (!id.trim() || !objective.trim()) throw new Error("Build ticket requires an ID and objective.");
  if (maxChangedBlocks <= 0) throw new Error("Build ticket requires a positive block-change limit.");
  if (stages.length === 0) throw new Error("Build ticket requires at least one reviewable stage.");
  return { id, objective, boundary: { from, to, maxChangedBlocks }, stages };
}

export function approveSurveyedStage(ticket: BuildTicket, stage: number): SurveyApproval {
  if (!ticket.stages[stage]) throw new Error("Build refused: requested stage is not part of the approved ticket.");
  return { ticketId: ticket.id, surveyedAt: Date.now(), approvedStage: stage };
}

export function requireStageApproval(ticket: BuildTicket, approval: SurveyApproval | undefined, stage: number): void {
  if (!approval || approval.ticketId !== ticket.id || approval.approvedStage !== stage) {
    throw new Error("Build refused: this stage has not been surveyed and armed.");
  }
}
