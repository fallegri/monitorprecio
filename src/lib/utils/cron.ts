/**
 * Validates a cron expression (5-field standard format).
 * Supports: * / - , ranges and step values.
 */
export function isValidCronExpression(expr: string): boolean {
  if (!expr || typeof expr !== 'string') return false

  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return false

  const ranges = [
    { min: 0, max: 59 }, // minute
    { min: 0, max: 23 }, // hour
    { min: 1, max: 31 }, // day of month
    { min: 1, max: 12 }, // month
    { min: 0, max: 7 },  // day of week (0 and 7 = Sunday)
  ]

  return parts.every((part, i) => isValidField(part, ranges[i]))
}

function isValidField(
  field: string,
  range: { min: number; max: number }
): boolean {
  if (field === '*') return true

  // Step: */n or n/n
  if (field.includes('/')) {
    const [base, step] = field.split('/')
    const stepNum = parseInt(step, 10)
    if (isNaN(stepNum) || stepNum < 1) return false
    if (base === '*') return true
    return isValidValue(base, range)
  }

  // List: a,b,c
  if (field.includes(',')) {
    return field.split(',').every((v) => isValidValue(v, range))
  }

  // Range: a-b
  if (field.includes('-')) {
    const [start, end] = field.split('-').map(Number)
    return (
      !isNaN(start) &&
      !isNaN(end) &&
      start >= range.min &&
      end <= range.max &&
      start <= end
    )
  }

  return isValidValue(field, range)
}

function isValidValue(
  value: string,
  range: { min: number; max: number }
): boolean {
  const num = parseInt(value, 10)
  return !isNaN(num) && num >= range.min && num <= range.max
}
