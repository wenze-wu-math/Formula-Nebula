/**
 * Optional, backward-compatible proof data for knowledge graph nodes.
 *
 * A proof record is keyed by the existing node id and has this shape:
 * {
 *   statement: string,                 // precise statement, LaTeX/Markdown
 *   steps: [{ id, title, body, uses, note? }],
 *   conclusion: string,
 *   dependencies?: string[],          // prerequisite node ids
 *   consequences?: string[],          // node ids that use/are derived from this result
 *   references?: [{ title, author?, year?, url?, doi? }],
 *   history?: string,
 *   explanation?: string,             // 直观解释：为什么这件事重要、直觉上该怎么想
 *   deepExplanation?: string,         // 机制与定位：把 steps 收束成因果链，并说明它在理论中的位置
 *   examples?: [{ title, body }],
 *   remarks?: string[],
 *   corollaries?: [{ title, body, uses? }],
 * }
 *
 * `uses` contains existing graph node ids and/or step ids local to this proof.
 * Nodes without an entry remain valid and need no changes to their source data.
 */

export const PROOF_SCHEMA_VERSION = 1

/** Return validation issues for an individual proof record. */
export function validateProofShape(proof) {
  const issues = []
  const nonBlank = (value) => typeof value === 'string' && value.trim().length > 0

  if (!proof || typeof proof !== 'object' || Array.isArray(proof)) {
    return ['proof must be an object']
  }
  if (!nonBlank(proof.statement)) issues.push('statement must be a non-empty string')
  if (!Array.isArray(proof.steps) || proof.steps.length === 0) {
    issues.push('steps must be a non-empty array')
  } else {
    const stepIds = new Set()
    for (const [index, step] of proof.steps.entries()) {
      const prefix = `steps[${index}]`
      if (!step || typeof step !== 'object' || Array.isArray(step)) {
        issues.push(`${prefix} must be an object`)
        continue
      }
      if (!nonBlank(step.id)) issues.push(`${prefix}.id must be a non-empty string`)
      else if (stepIds.has(step.id)) issues.push(`${prefix}.id duplicates ${step.id}`)
      else stepIds.add(step.id)
      if (!nonBlank(step.title)) issues.push(`${prefix}.title must be a non-empty string`)
      if (!nonBlank(step.body)) issues.push(`${prefix}.body must be a non-empty string`)
      if (!Array.isArray(step.uses) || step.uses.some((id) => !nonBlank(id))) {
        issues.push(`${prefix}.uses must be an array of non-empty ids`)
      }
      if (step.note !== undefined && !nonBlank(step.note)) {
        issues.push(`${prefix}.note must be a non-empty string when provided`)
      }
    }
    for (const [index, step] of proof.steps.entries()) {
      if (!Array.isArray(step?.uses)) continue
      for (const id of step.uses) {
        if (typeof id === 'string' && stepIds.has(id)) {
          const referencedIndex = proof.steps.findIndex((candidate) => candidate.id === id)
          if (referencedIndex >= index) issues.push(`steps[${index}].uses must reference an earlier step: ${id}`)
        }
      }
    }
  }
  if (!nonBlank(proof.conclusion)) issues.push('conclusion must be a non-empty string')
  for (const field of ['dependencies', 'consequences']) {
    if (proof[field] !== undefined && (!Array.isArray(proof[field])
      || proof[field].some((id) => !nonBlank(id)))) {
      issues.push(`${field} must be an array of non-empty node ids when provided`)
    }
  }
  if (proof.references !== undefined) {
    if (!Array.isArray(proof.references)) issues.push('references must be an array when provided')
    else for (const [index, ref] of proof.references.entries()) {
      if (!ref || typeof ref !== 'object' || Array.isArray(ref)) {
        issues.push(`references[${index}] must be an object`)
        continue
      }
      if (!nonBlank(ref.title)) issues.push(`references[${index}].title must be a non-empty string`)
      for (const field of ['author', 'url', 'doi']) {
        if (ref[field] !== undefined && !nonBlank(ref[field])) issues.push(`references[${index}].${field} must be a non-empty string`)
      }
      if (ref.year !== undefined && (!Number.isInteger(ref.year) || ref.year < 1000 || ref.year > 2100)) {
        issues.push(`references[${index}].year must be an integer from 1000 to 2100`)
      }
    }
  }
  if (proof.history !== undefined && !nonBlank(proof.history)) issues.push('history must be a non-empty string when provided')
  for (const field of ['explanation']) {
    if (proof[field] !== undefined && !nonBlank(proof[field])) issues.push(`${field} must be a non-empty string when provided`)
  }
  for (const field of ['remarks']) {
    if (proof[field] !== undefined && (!Array.isArray(proof[field]) || proof[field].some((item) => !nonBlank(item)))) {
      issues.push(`${field} must be an array of non-empty strings when provided`)
    }
  }
  for (const field of ['examples', 'corollaries']) {
    if (proof[field] === undefined) continue
    if (!Array.isArray(proof[field])) { issues.push(`${field} must be an array when provided`); continue }
    for (const [index, item] of proof[field].entries()) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        issues.push(`${field}[${index}] must be an object`); continue
      }
      if (!nonBlank(item.title)) issues.push(`${field}[${index}].title must be a non-empty string`)
      if (!nonBlank(item.body)) issues.push(`${field}[${index}].body must be a non-empty string`)
      if (item.uses !== undefined && (!Array.isArray(item.uses) || item.uses.some((id) => !nonBlank(id)))) {
        issues.push(`${field}[${index}].uses must be an array of non-empty ids when provided`)
      }
    }
  }
  return issues
}
