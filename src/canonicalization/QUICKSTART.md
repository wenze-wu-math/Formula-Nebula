# Canonicalization System - Quick Start

Get up and running with formula canonicalization in 5 minutes.

## Installation

No installation needed - it's already part of Formula Nebula!

## Run the Demo

```bash
# See the system in action
node src/canonicalization/demo.js

# Run tests
node tests/canonicalization/run-tests.js
```

## Basic Examples

### 1. Check if two formulas are equivalent

```javascript
import { compareFormulas } from './canonicalization/compare.js'

const result = compareFormulas('a+b', 'b+a')

console.log(result.equivalent)  // true
console.log(result.canonical1)  // "a+b"
console.log(result.canonical2)  // "a+b"
```

### 2. Find equivalent formulas in a list

```javascript
import { findEquivalentFormulas } from './canonicalization/compare.js'

const target = 'a+b'
const formulas = [
  { id: '1', latex: 'b+a' },      // equivalent
  { id: '2', latex: 'a*b' },      // different
  { id: '3', latex: 'a+b+0' }     // similar
]

const matches = findEquivalentFormulas(target, formulas)
console.log(matches)
// [{ id: '1', latex: 'b+a', similarity: 1.0, equivalent: true }, ...]
```

### 3. Group duplicates

```javascript
import { groupEquivalentFormulas } from './canonicalization/compare.js'

const formulas = [
  { id: '1', latex: 'a+b' },
  { id: '2', latex: 'b+a' },
  { id: '3', latex: 'x^2' },
  { id: '4', latex: 'x^2' }
]

const groups = groupEquivalentFormulas(formulas)
console.log(groups.length) // 2 groups
// [[{id:'1',...}, {id:'2',...}], [{id:'3',...}, {id:'4',...}]]
```

### 4. Parse and normalize manually

```javascript
import { parseLatex, normalize, toCanonicalLatex } from './canonicalization/normalize.js'

// Step by step
const ast = parseLatex('b+a')
console.log(ast)
// { type: 'binary_op', operator: '+', left: {type: 'variable', name: 'b'}, ... }

const normalized = normalize(ast)
const canonical = toCanonicalLatex(normalized)
console.log(canonical) // "a+b"
```

## What It Detects

✓ **Commutativity**: `a+b` = `b+a`
✓ **Associativity**: `(a+b)+c` = `a+(b+c)`
✓ **Simplification**: `x^1` = `x`, `x^0` = `1`, `a/1` = `a`
✓ **Multiple terms**: `a+b+c` = `c+b+a`
✓ **Complex expressions**: `a+b*c` = `b*c+a`
✓ **Fractions**: `\frac{a+b}{c}` = `\frac{b+a}{c}`

✗ **Algebraic identities**: `x^2-1` ≠ `(x-1)(x+1)` (not detected)
✗ **Variable substitution**: `a+b` ≠ `x+y` (different variables)

## Common Use Cases

### Detect duplicates in knowledge graph

```javascript
import { NODES } from '../data/knowledge.js'
import { groupEquivalentFormulas } from './canonicalization/compare.js'

const duplicates = groupEquivalentFormulas(NODES.map(n => ({
  id: n.id,
  latex: n.latex,
  name: n.name
}))).filter(g => g.length > 1)

console.log(`Found ${duplicates.length} duplicate groups`)
```

### Build search index

```javascript
import { buildCanonicalIndex } from './canonicalization/compare.js'
import { NODES } from '../data/knowledge.js'

const index = buildCanonicalIndex(NODES)

// O(1) lookup
for (const [canonical, theorems] of index.entries()) {
  console.log(`${canonical} has ${theorems.length} variants`)
}
```

### Validate new theorem isn't duplicate

```javascript
import { compareFormulas } from './canonicalization/compare.js'

function isDuplicate(newLatex, existingFormulas) {
  for (const formula of existingFormulas) {
    const result = compareFormulas(newLatex, formula.latex)
    if (result.equivalent) {
      return { isDuplicate: true, existingId: formula.id }
    }
  }
  return { isDuplicate: false }
}
```

## Supported LaTeX

### Works Great ✓
- Numbers: `42`, `3.14`
- Variables: `a`, `x`, `y`
- Greek: `\alpha`, `\beta`, `\pi`
- Operators: `+`, `-`, `*`, `/`, `\cdot`, `\times`
- Relations: `=`, `<`, `>`, `\leq`, `\geq`
- Power: `x^2`, `x^{10}`
- Fractions: `\frac{a}{b}`
- Parentheses: `(a+b)`

### Not Yet Supported ✗
- Functions: `\sin`, `\cos`, `\log`
- Summation: `\sum`, `\prod`
- Integration: `\int`
- Matrices: `\begin{matrix}...\end{matrix}`

## Troubleshooting

### "Formulas should be equivalent but aren't detected"

Check if:
1. Both formulas parse correctly (run `parseLatex()`)
2. Operators are supported (see list above)
3. Variables have same names (`a+b` ≠ `x+y`)

### "Parse error"

Simplify the LaTeX:
```javascript
// Instead of complex LaTeX
'\sum_{i=1}^n x_i'

// Use simpler notation
'x_1 + x_2 + ... + x_n'
```

### "Similarity score is low but formulas look similar"

The system only does structural comparison. Algebraic equivalence like `a+a = 2a` is not detected.

## Next Steps

- Read [README.md](./README.md) for full API documentation
- See [integration-example.js](./integration-example.js) for advanced usage
- Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for architecture details
- Run [demo.js](./demo.js) for interactive examples

## Quick Reference

```javascript
// Core imports
import { parseLatex, normalize, toCanonicalLatex } from './canonicalization/normalize.js'
import { compareFormulas, findEquivalentFormulas, groupEquivalentFormulas, buildCanonicalIndex } from './canonicalization/compare.js'

// Check equivalence
compareFormulas(latex1, latex2)
// → { equivalent, canonical1, canonical2, similarity, ast1, ast2 }

// Find matches
findEquivalentFormulas(target, collection, threshold)
// → [{ id, latex, canonical, similarity, equivalent }, ...]

// Group by equivalence
groupEquivalentFormulas(formulas)
// → [[formula, formula], [formula], ...]

// Build index
buildCanonicalIndex(formulas)
// → Map<canonical, [formula, formula, ...]>

// Manual normalization
parseLatex(latex)           // → AST
normalize(ast)              // → normalized AST
toCanonicalLatex(ast)       // → canonical LaTeX string
```

## Need Help?

- Check test files for more examples: `tests/canonicalization/*.test.js`
- Read the comprehensive [README.md](./README.md)
- Review [integration-example.js](./integration-example.js)
