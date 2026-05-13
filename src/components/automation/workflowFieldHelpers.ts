import type { WorkflowFieldConfig } from './workflow.interface'

export function fieldKey(field: WorkflowFieldConfig): string {
  return field.name || field.label
}

/** Backend step configs use `string`; map to dashboard input types. */
export function normalizeWorkflowFieldForInput(
  field: WorkflowFieldConfig,
): WorkflowFieldConfig {
  if (field.type === 'string') {
    return { ...field, type: 'text' }
  }
  return field
}

function defaultJsonRow(items: WorkflowFieldConfig['items']): Record<string, unknown> {
  if (!items || items.type !== 'json' || !items.fields?.length) {
    return {}
  }
  const row: Record<string, unknown> = {}
  for (const sub of items.fields) {
    row[fieldKey(sub)] = defaultValueForWorkflowField(sub)
  }
  return row
}

/** One empty object for a new row in an `array` field whose `items` are `json`. */
export function defaultRowForArrayField(field: WorkflowFieldConfig): Record<string, unknown> {
  return defaultJsonRow(field.items)
}

export function defaultValueForWorkflowField(field: WorkflowFieldConfig): unknown {
  switch (field.type) {
    case 'boolean':
      return false
    case 'number':
      return null
    case 'select':
      return null
    case 'files':
      return null
    case 'array':
      if (field.required && field.items?.type === 'json') {
        return [defaultJsonRow(field.items)]
      }
      return []
    case 'json': {
      const obj: Record<string, unknown> = {}
      for (const sub of field.fields || []) {
        obj[fieldKey(sub)] = defaultValueForWorkflowField(sub)
      }
      return obj
    }
    case 'string':
      return ''
    default:
      return ''
  }
}

export function isRequiredWorkflowFieldMissing(
  field: WorkflowFieldConfig,
  value: unknown,
): boolean {
  if (!field.required) return false

  const effectiveType = field.type === 'string' ? 'text' : field.type

  if (effectiveType === 'array') {
    if (!Array.isArray(value) || value.length === 0) return true
    const items = field.items
    if (items?.type === 'json' && items.fields?.length) {
      for (const row of value) {
        for (const sub of items.fields) {
          if (isRequiredWorkflowFieldMissing(sub, (row as Record<string, unknown>)?.[fieldKey(sub)])) {
            return true
          }
        }
      }
    }
    return false
  }

  if (effectiveType === 'json') {
    for (const sub of field.fields || []) {
      if (isRequiredWorkflowFieldMissing(sub, (value as Record<string, unknown>)?.[fieldKey(sub)])) {
        return true
      }
    }
    return false
  }

  if (field.type === 'files') {
    return !Array.isArray(value) || value.length === 0
  }

  if (field.type === 'number') {
    if (value === null || value === undefined || value === '') return true
    if (Number.isNaN(Number(value))) return true
    return false
  }

  const missing =
    value === undefined ||
    value === null ||
    value === ''

  return missing
}
