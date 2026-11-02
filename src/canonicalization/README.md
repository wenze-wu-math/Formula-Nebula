# Formula Canonicalization System

A comprehensive system for normalizing and comparing mathematical formulas to detect semantic equivalence despite syntactic differences.

## Problem Solved

When dealing with mathematical theorems and formulas, the same theorem can be written in many different ways:
- `a + b` vs `b + a` (commutativity)
- `(a + b) + c` vs `a + (b + c)` (associativity)
- `x^1` vs `x` (simplification)
- `\frac{a}{1}` vs `a` (fraction simplification)

This system parses LaTeX formulas into Abstract Syntax Trees (AST), normalizes them to canonical forms, and enables semantic comparison.

## Architecture

### 1. Parser (`normalize.js`)
- **Tokenization**: Breaks LaTeX into tokens (commands, numbers, variables, symbols)
- **Parsing**: Constructs AST using recursive descent parser
- **Operator precedence**: Relations < Addition < Multiplication < Power < Unary
- **Support for**: Numbers, variables, Greek letters, binary/unary ops, powers, fractions, parentheses

### 2. Normalization (`normalize.js`)
- **Commutative operations**: Sort operands (e.g., `b+a` → `a+b`)
- **Associative operations**: Flatten nested operations (e.g., `(a+b)+c` → `a+b+c`)
- **Idempotent operations**: Remove duplicates (e.g., `a∪a` → `a`)
- **Simplifications**:
  - `x^1` → `x`
  - `x^0` → `1`
  - `a/1` → `a`
  - `(x^a)^b` → `x^(a*b)`

### 3. Comparison (`compare.js`)
- **Exact equivalence**: Compare canonical forms
- **Similarity scoring**: Structural similarity for partial matches
- **Batch operations**: Find/group equivalent formulas in collections
- **Indexing**: Build canonical form index for fast lookup

## API Reference

### normalize.js

```javascript
import { parseLatex, normalize, toCanonicalLatex, compareNodes } from './canonicalization/normalize.js'

// Parse LaTeX to AST
const ast = parseLatex('a+b*c')

// Normalize AST to canonical form
const normalized = normalize(ast)

// Convert back to canonical LaTeX
const canonical = toCanonicalLatex(normalized)

// Compare two AST nodes
const comparison = compareNodes(node1, node2) // -1, 0, or 1
```

### compare.js

```javascript
import { 
  compareFormulas, 
  findEquivalentFormulas, 
  groupEquivalentFormulas,
  buildCanonicalIndex 
} from './canonicalization/compare.js'

// Compare two formulas
const result = compareFormulas('a+b', 'b+a')
// {
//   equivalent: true,
//   canonical1: "a+b",
//   canonical2: "a+b",
//   similarity: 1.0,
//   ast1: {...},
//   ast2: {...}
// }

// Find equivalent formulas in collection
const target = 'a+b'
const formulas = [
  { id: '1', latex: 'b+a' },
  { id: '2', latex: 'a*b' }
]
const matches = findEquivalentFormulas(target, formulas, 0.95)

// Group formulas by equivalence
const groups = groupEquivalentFormulas(formulas)

// Build index for fast lookup
const index = buildCanonicalIndex(formulas)
```

## Supported LaTeX Constructs

### Basic Elements
- **Numbers**: `42`, `3.14`
- **Variables**: `x`, `y`, `z`
- **Greek letters**: `\alpha`, `\beta`, `\pi`, `\theta`, etc.

### Operations
- **Arithmetic**: `+`, `-`, `*`, `/`, `\cdot`, `\times`
- **Relations**: `=`, `<`, `>`, `\leq`, `\geq`, `\neq`, `\equiv`
- **Set operations**: `\cap`, `\cup`
- **Power**: `x^2`, `x^{n+1}`
- **Fraction**: `\frac{a}{b}`

### Grouping
- **Parentheses**: `(a+b)`
- **Braces**: `{a+b}`

## Operator Properties

### Commutative
Operations where order doesn't matter:
- `+`, `\cdot`, `\times`
- `\cap`, `\cup`
- `\wedge`, `\vee`

### Associative
Operations that can be regrouped:
- `+`, `\cdot`, `\times`
- `\cap`, `\cup`
- `\wedge`, `\vee`

### Idempotent
Operations where duplicates are removed:
- `\cap`, `\cup`
- `\wedge`, `\vee`
- `\max`, `\min`

## Examples

### Example 1: Commutativity
```javascript
compareFormulas('a+b', 'b+a')
// => { equivalent: true, similarity: 1.0 }
```

### Example 2: Associativity
```javascript
compareFormulas('(a+b)+c', 'a+(b+c)')
// => { equivalent: true, similarity: 1.0 }
```

### Example 3: Mixed
```javascript
compareFormulas('a*b+c*d', 'd*c+b*a')
// => { equivalent: true, similarity: 1.0 }
```

### Example 4: Simplification
```javascript
compareFormulas('x^1', 'x')
// => { equivalent: true, similarity: 1.0 }
```

### Example 5: Finding Duplicates
```javascript
const formulas = [
  { id: 'thm1', latex: 'a^2+b^2=c^2' },
  { id: 'thm2', latex: 'c^2=b^2+a^2' },
  { id: 'thm3', latex: 'x^2+y^2=z^2' }
]

const groups = groupEquivalentFormulas(formulas)
// [
//   [{ id: 'thm1', ... }, { id: 'thm2', ... }],
//   [{ id: 'thm3', ... }]
// ]
```

## Testing

Run the test suite:
```bash
node tests/canonicalization/run-tests.js
```

Tests cover:
- Parsing various LaTeX constructs
- Normalization rules
- Equivalence detection
- Similarity scoring
- Batch operations
- Error handling

## Limitations

1. **Parser scope**: Supports common constructs but not all LaTeX
2. **No symbolic math**: Cannot prove `x^2-1 = (x-1)(x+1)`
3. **No variable substitution**: `a+b` ≠ `x+y` (different variable names)
4. **Limited simplification**: Only structural, not algebraic

## Future Enhancements

1. **Extended parser**:
   - Functions: `\sin`, `\cos`, `\log`
   - Sums: `\sum`, `\prod`
   - Integrals: `\int`
   - Matrices: `\begin{pmatrix}...\end{pmatrix}`

2. **Advanced normalization**:
   - Algebraic identities
   - Trigonometric identities
   - Distribution: `a(b+c)` → `ab+ac`
   - Factoring: `ab+ac` → `a(b+c)`

3. **Variable mapping**:
   - Detect isomorphic formulas with different variables
   - `a+b` ≈ `x+y` (same structure)

4. **Integration with knowledge graph**:
   - Detect duplicate theorems
   - Suggest related formulas
   - Build equivalence classes

## Performance

- **Parsing**: O(n) where n = formula length
- **Normalization**: O(n log n) due to sorting
- **Comparison**: O(n) where n = AST size
- **Index building**: O(mn) where m = number of formulas, n = average size

For large collections, use `buildCanonicalIndex()` to enable O(1) lookups.

## References

- **AST Design**: Standard compiler construction techniques
- **Canonicalization**: Based on term rewriting systems
- **Operator properties**: Abstract algebra (monoids, groups)
- **Similarity metrics**: Tree edit distance variants
