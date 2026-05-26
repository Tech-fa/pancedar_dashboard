import type { WorkflowRun } from './workflow.interface'
import { getAwaitingActionRoute, getAwaitingActionStep, getCompletedRoute } from './dto'

export type WorkflowRunCardMode = 'compact' | 'full'
export type WorkflowRunLinkMode = 'auto' | 'awaiting' | 'completed' | 'none'

export function workflowRunStatusBadgeClass(status: string): string {
    switch (status) {
        case 'awaiting_action':
            return 'automation-status-badge--awaiting'
        case 'pending':
            return 'automation-status-badge--pending'
        case 'completed':
            return 'automation-status-badge--completed'
        default:
            return 'automation-status-badge--default'
    }
}

export function workflowRunCardHref(
    run: WorkflowRun,
    linkMode: WorkflowRunLinkMode,
): string | null {
    if (linkMode === 'none') return null
    if (linkMode === 'awaiting') return getAwaitingActionRoute(run)
    if (linkMode === 'completed') return getCompletedRoute(run)

    return getAwaitingActionRoute(run) || getCompletedRoute(run)
}

export function workflowRunDisplayContextEntries(
    run: WorkflowRun,
): { key: string; value: unknown }[] {
    if (!run.displayContext) return []
    return Object.keys(run.displayContext).map((key) => ({
        key,
        value: run.displayContext![key],
    }))
}

export function workflowRunMetaLines(
    run: WorkflowRun,
    mode: WorkflowRunCardMode,
): { label: string; value: string }[] {
    const lines: { label: string; value: string }[] = []

    if (mode === 'compact') {
        if (run.status === 'awaiting_action' && run.currentStep) {
            lines.push({ label: 'Step', value: run.currentStep })
        } else if (run.status !== 'completed') {
            lines.push({ label: 'Status', value: run.status })
        }
    } else {
        if (run.currentStep && run.status !== 'completed') {
            lines.push({ label: 'Current step', value: run.currentStep })
        }
        if (run.status === 'awaiting_action') {
            const step = getAwaitingActionStep(run)
            if (step) {
                lines.push({ label: 'Awaiting action', value: step })
            }
        }
    }

    return lines
}

export interface WorkflowRunActionLink {
    label: string
    href: string
}

export function workflowRunActionLinks(run: WorkflowRun): WorkflowRunActionLink[] {
    const links: WorkflowRunActionLink[] = []
    const awaitingRoute = getAwaitingActionRoute(run)
    const completedRoute = getCompletedRoute(run)

    if (run.status === 'awaiting_action' && awaitingRoute) {
        links.push({ label: 'Manually approve', href: awaitingRoute })
    }
    if (completedRoute) {
        links.push({ label: 'View details', href: completedRoute })
    }

    return links
}
