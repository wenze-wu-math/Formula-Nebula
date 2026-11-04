import { buildGraph, FAMILIES, CONJECTURE_STATUS, RESEARCHER_AREAS, CONJECTURE_FIELDS } from 'file:///D:/xiangmu/Formula%20Nebula/designs/shared/kb.js'
const g = buildGraph()
const c = {}
for (const n of g.nodes) c[n.family]=(c[n.family]||0)+1
console.log(c)
console.log(Object.entries(FAMILIES).map(([k,v])=>[k,v.name,v.color,v.arm]))
console.log(CONJECTURE_STATUS, RESEARCHER_AREAS, CONJECTURE_FIELDS)
console.log(g.stats)
const lens = g.nodes.map(n=>n.latex.length).sort((a,b)=>a-b); console.log('latex len median', lens[lens.length>>1], 'max', lens.at(-1))
