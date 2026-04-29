import type { WorkflowRun } from "./workflow.interface";

const relatedViewRouteMap: Record<string, (id: string) => string> = {
  incoming_emails: (id: string) => `/automation/incoming-emails/${id}`,
  agent_communications: (id: string) =>
    `/automation/workflow-runs/${id}/communications`,
};
type RelatedView = {
  subject?: string;
  id?: string;
};

export const getRelatedView = (run: WorkflowRun): RelatedView | null => {
  const lastStepContext = run.stepsContext?.[run.currentStep as string];
  if (!lastStepContext || typeof lastStepContext !== "object") {
    return null;
  }
  const fromSingular = lastStepContext.relatedView;
  const fromPlural = lastStepContext.relatedViews;
  const relatedView = fromSingular || fromPlural;
  if (!relatedView || typeof relatedView !== "object") {
    return null;
  }
  return relatedView as RelatedView;
};

export const getAwaitingActionStep = (run: WorkflowRun): string | null => {
  if (run.status !== "awaiting_action") {
    return null;
  }
  return run.currentStep || null;
};

export const getAwaitingActionRoute = (run: WorkflowRun): string | null => {
  if (run.status !== "awaiting_action") {
    return null;
  }
  const relatedView = getRelatedView(run);
  if (!relatedView?.subject || !relatedView.id) {
    return null;
  }
  const routeResolver = relatedViewRouteMap[relatedView.subject];
  if (!routeResolver) {
    return null;
  }
  return routeResolver(relatedView.id);
};

export const getCompletedRoute = (run: WorkflowRun): string | null => {
  if (run.status !== "completed") {
    return null;
  }
  if (!run.completedView?.subject || !run.completedView.id) {
    return null;
  }
  const routeResolver = relatedViewRouteMap[run.completedView.subject];
  if (!routeResolver) {
    return null;
  }
  return routeResolver(run.completedView.id);
};
