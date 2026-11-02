/**
 * kb-src/summarize-papers.mjs — Automated paper summarization & citation extraction
 *
 * ═══ Core Functions ═══
 *
 * 1. FetchRelatedPapers(theoremId) → [Paper]
 *    - Searches arXiv for papers related to a theorem
 *    - Uses theorem title/keywords for semantic search
 *    - Returns paper metadata with abstracts
 *
 * 2. SummarizePaper(paper) → {abstract, keyResults, citations}
 *    - Extracts structured information from paper text
 *    - Identifies key theorems and results
 *    - Extracts citations to other work
 *
 * 3. ExtractCitations(text) → [TheoremId]
 *    - Parses paper text for theorem references
 *    - Maps citations to knowledge graph theorem IDs
 *    - Uses fuzzy matching + LaTeX formula similarity
 *
 * 4. GenerateReadingList(startTheorem, depth) → [Paper]
 *    - Builds citation network from starting theorem
 *    - Traverses depth levels through citation graph
 *    - Returns prioritized reading list
 *
 * ═══ Data Sources ═══
 *
 * - arXiv API (primary): Full-text papers with LaTeX source
 * - zbMATH Open API: Bibliographic metadata + reviews
 * - MathSciNet (future): Citation network data
 * - CrossRef: DOI resolution & citation counts
 *
 * ═══ NLP Pipeline ═══
 *
 * Text → Sentence segmentation → LaTeX extraction →
 * Theorem detection → Citation parsing → Entity linking
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const OUT_DIR = join(HERE, 'out')
const CACHE_DIR = join(OUT_DIR, 'papers-cache')

// Ensure directories exist
mkdirSync(OUT_DIR, { recursive: true })
mkdirSync(CACHE_DIR, { recursive: true })

// Load knowledge graph for theorem lookup
let KNOWLEDGE_NODES = []
try {
  const kbPath = join(ROOT, 'src', 'data', 'knowledge.js')
  if (existsSync(kbPath)) {
    const kbContent = readFileSync(kbPath, 'utf8')
    // Extract NODES array from module (simplified parser)
    const match = kbContent.match(/export const NODES\s*=\s*(\[[^\]]+\])/s)
    if (match) {
      KNOWLEDGE_NODES = eval(match[1])
    }
  }
} catch (e) {
  console.warn('Warning: Could not load knowledge graph nodes')
}

/**
 * FetchRelatedPapers — Search arXiv for papers related to a theorem
 *
 * @param {string} theoremId - ID from knowledge graph (e.g., 'nullstellensatz')
 * @param {object} options - Search options
 * @returns {Promise<Array>} Array of paper objects
 */
export async function FetchRelatedPapers(theoremId, options = {}) {
  const {
    maxResults = 20,
    sortBy = 'relevance', // 'relevance' | 'date'
    category = 'math.AG', // Default to algebraic geometry
  } = options

  // Find theorem in knowledge graph
  const theorem = KNOWLEDGE_NODES.find(n => n.id === theoremId)
  if (!theorem) {
    throw new Error(`Theorem not found: ${theoremId}`)
  }

  const cacheFile = join(CACHE_DIR, `${theoremId}-papers.json`)

  // Check cache first
  if (existsSync(cacheFile)) {
    const cached = JSON.parse(readFileSync(cacheFile, 'utf8'))
    const age = Date.now() - cached.timestamp
    if (age < 7 * 24 * 60 * 60 * 1000) { // 7 days
      console.log(`Using cached papers for ${theoremId}`)
      return cached.papers
    }
  }

  // Build search query from theorem metadata
  const searchTerms = []
  if (theorem.name) searchTerms.push(theorem.name)
  if (theorem.en) searchTerms.push(theorem.en)

  // Extract key terms from LaTeX (remove markup)
  if (theorem.latex) {
    const cleaned = theorem.latex
      .replace(/\\[a-zA-Z]+/g, ' ')
      .replace(/[{}$]/g, ' ')
      .trim()
    if (cleaned.length > 3) searchTerms.push(cleaned)
  }

  const query = searchTerms.slice(0, 3).join(' ')
  console.log(`Searching arXiv for: ${query}`)

  // Construct arXiv API query
  const encodedQuery = encodeURIComponent(`all:${query} AND cat:${category}`)
  const url = `http://export.arxiv.org/api/query?search_query=${encodedQuery}&max_results=${maxResults}&sortBy=${sortBy}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`arXiv API error: ${response.status}`)
    }

    const xml = await response.text()
    const papers = parseArxivXML(xml, theoremId)

    // Cache results
    writeFileSync(cacheFile, JSON.stringify({
      theoremId,
      timestamp: Date.now(),
      papers
    }, null, 2))

    console.log(`Found ${papers.length} papers for ${theorem.name}`)
    return papers

  } catch (error) {
    console.error(`Error fetching papers for ${theoremId}:`, error.message)
    return []
  }
}

/**
 * Parse arXiv API XML response
 */
function parseArxivXML(xml, theoremId) {
  const papers = []

  // Simple XML parsing for arXiv feed
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  let match

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1]

    const getTag = (tag) => {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`)
      const m = entry.match(regex)
      return m ? m[1].trim() : ''
    }

    const id = getTag('id').replace('http://arxiv.org/abs/', '')
    const title = getTag('title').replace(/\s+/g, ' ')
    const summary = getTag('summary').replace(/\s+/g, ' ')
    const published = getTag('published').split('T')[0]

    // Extract authors
    const authorMatches = entry.matchAll(/<author>[\s\S]*?<name>([^<]+)<\/name>/g)
    const authors = Array.from(authorMatches, m => m[1])

    // Extract categories
    const catMatches = entry.matchAll(/<category[^>]+term="([^"]+)"/g)
    const categories = Array.from(catMatches, m => m[1])

    papers.push({
      id,
      arxivId: id,
      title,
      abstract: summary,
      authors,
      published,
      categories,
      url: `https://arxiv.org/abs/${id}`,
      pdfUrl: `https://arxiv.org/pdf/${id}.pdf`,
      relatedTo: theoremId
    })
  }

  return papers
}

/**
 * SummarizePaper — Extract structured information from a paper
 *
 * @param {object} paper - Paper object from FetchRelatedPapers
 * @returns {Promise<object>} Structured summary
 */
export async function SummarizePaper(paper) {
  console.log(`Summarizing paper: ${paper.title}`)

  const summary = {
    paperId: paper.id,
    title: paper.title,
    abstract: paper.abstract,
    keyResults: [],
    citations: [],
    theorems: [],
    methods: [],
    relevanceScore: 0
  }

  // Extract key results from abstract
  summary.keyResults = extractKeyResults(paper.abstract)

  // Detect theorem statements in abstract
  summary.theorems = extractTheoremStatements(paper.abstract)

  // Extract method keywords
  summary.methods = extractMethods(paper.abstract)

  // Calculate relevance score based on content
  summary.relevanceScore = calculateRelevance(paper, summary)

  return summary
}

/**
 * Extract key results from text using pattern matching
 */
function extractKeyResults(text) {
  const results = []
  const patterns = [
    /we (prove|show|establish|demonstrate) (?:that )?([^.]{20,150})/gi,
    /our main result is ([^.]{20,150})/gi,
    /theorem[:\s]+([^.]{20,150})/gi,
    /we obtain ([^.]{20,150})/gi
  ]

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      const result = match[match.length - 1].trim()
      if (result.length >= 20 && result.length <= 150) {
        results.push(result)
      }
    }
  }

  return [...new Set(results)].slice(0, 5)
}

/**
 * Extract theorem statements from text
 */
function extractTheoremStatements(text) {
  const theorems = []

  // Look for formal theorem statements
  const patterns = [
    /Theorem(?:\s+\d+(?:\.\d+)?)?[:\s.]+([^.]{30,200})/gi,
    /Lemma(?:\s+\d+(?:\.\d+)?)?[:\s.]+([^.]{30,200})/gi,
    /Proposition(?:\s+\d+(?:\.\d+)?)?[:\s.]+([^.]{30,200})/gi,
    /Corollary(?:\s+\d+(?:\.\d+)?)?[:\s.]+([^.]{30,200})/gi
  ]

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      theorems.push({
        type: match[0].split(/\s/)[0].toLowerCase(),
        statement: match[1].trim()
      })
    }
  }

  return theorems.slice(0, 3)
}

/**
 * Extract mathematical methods mentioned
 */
function extractMethods(text) {
  const methods = []
  const keywords = [
    'cohomology', 'homology', 'spectral sequence', 'sheaf theory',
    'derived category', 'intersection theory', 'moduli space',
    'deformation theory', 'étale topology', 'scheme theory',
    'algebraic stack', 'resolution of singularities', 'blow-up',
    'vector bundle', 'line bundle', 'divisor', 'Chern class'
  ]

  const lowerText = text.toLowerCase()
  for (const keyword of keywords) {
    if (lowerText.includes(keyword)) {
      methods.push(keyword)
    }
  }

  return methods
}

/**
 * Calculate relevance score for paper
 */
function calculateRelevance(paper, summary) {
  let score = 0

  // More recent papers get higher scores
  const year = parseInt(paper.published.split('-')[0])
  if (year >= 2020) score += 0.3
  else if (year >= 2015) score += 0.2
  else if (year >= 2010) score += 0.1

  // Papers with more key results
  score += Math.min(0.3, summary.keyResults.length * 0.1)

  // Papers with theorem statements
  score += Math.min(0.2, summary.theorems.length * 0.1)

  // Papers with relevant methods
  score += Math.min(0.2, summary.methods.length * 0.05)

  return Math.min(1.0, score)
}

/**
 * ExtractCitations — Parse citations from paper text
 *
 * @param {string} text - Paper text (abstract or full text)
 * @returns {Array<string>} Array of theorem IDs from knowledge graph
 */
export function ExtractCitations(text) {
  const citations = []

  // Match theorem names and keywords against knowledge graph
  for (const node of KNOWLEDGE_NODES) {
    // Check for English name
    if (node.en && text.toLowerCase().includes(node.en.toLowerCase())) {
      citations.push(node.id)
      continue
    }

    // Check for Chinese name (if text contains Chinese)
    if (node.name && /[一-龥]/.test(text)) {
      if (text.includes(node.name)) {
        citations.push(node.id)
        continue
      }
    }

    // Check for LaTeX formula similarity
    if (node.latex) {
      const normalizedLatex = normalizeLatex(node.latex)
      const textLatex = extractLatexFromText(text)
      for (const candidate of textLatex) {
        if (latexSimilarity(normalizedLatex, candidate) > 0.8) {
          citations.push(node.id)
          break
        }
      }
    }
  }

  return [...new Set(citations)]
}

/**
 * Normalize LaTeX for comparison
 */
function normalizeLatex(latex) {
  return latex
    .replace(/\s+/g, ' ')
    .replace(/\\,/g, '')
    .replace(/\\;/g, '')
    .replace(/\\\s/g, ' ')
    .toLowerCase()
    .trim()
}

/**
 * Extract LaTeX formulas from text
 */
function extractLatexFromText(text) {
  const formulas = []

  // Match $...$ and $$...$$ patterns
  const patterns = [
    /\$\$([^$]+)\$\$/g,
    /\$([^$]+)\$/g
  ]

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      formulas.push(normalizeLatex(match[1]))
    }
  }

  return formulas
}

/**
 * Calculate LaTeX similarity using token overlap
 */
function latexSimilarity(latex1, latex2) {
  const tokens1 = new Set(latex1.split(/[\s{}()[\]]/))
  const tokens2 = new Set(latex2.split(/[\s{}()[\]]/))

  const intersection = new Set([...tokens1].filter(t => tokens2.has(t)))
  const union = new Set([...tokens1, ...tokens2])

  return intersection.size / union.size
}

/**
 * GenerateReadingList — Build citation-based reading list
 *
 * @param {string} startTheorem - Starting theorem ID
 * @param {number} depth - Citation traversal depth (default 2)
 * @returns {Promise<Array>} Prioritized reading list
 */
export async function GenerateReadingList(startTheorem, depth = 2) {
  console.log(`Generating reading list starting from ${startTheorem}, depth ${depth}`)

  const readingList = []
  const visited = new Set()
  const queue = [{ theoremId: startTheorem, level: 0 }]

  while (queue.length > 0) {
    const { theoremId, level } = queue.shift()

    if (visited.has(theoremId) || level > depth) {
      continue
    }

    visited.add(theoremId)

    // Fetch papers for this theorem
    const papers = await FetchRelatedPapers(theoremId, { maxResults: 10 })

    // Summarize each paper
    for (const paper of papers) {
      const summary = await SummarizePaper(paper)

      readingList.push({
        ...paper,
        summary,
        level,
        sourceTheorem: theoremId
      })

      // Extract citations to find next level theorems
      if (level < depth) {
        const citedTheorems = ExtractCitations(paper.abstract)
        for (const cited of citedTheorems) {
          if (!visited.has(cited)) {
            queue.push({ theoremId: cited, level: level + 1 })
          }
        }
      }

      // Rate limit: wait 3 seconds between API calls
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }

  // Sort by relevance and remove duplicates
  const uniquePapers = new Map()
  for (const paper of readingList) {
    if (!uniquePapers.has(paper.id)) {
      uniquePapers.set(paper.id, paper)
    } else {
      // Keep the one with higher relevance or lower level
      const existing = uniquePapers.get(paper.id)
      if (paper.summary.relevanceScore > existing.summary.relevanceScore ||
          paper.level < existing.level) {
        uniquePapers.set(paper.id, paper)
      }
    }
  }

  const sortedList = Array.from(uniquePapers.values())
    .sort((a, b) => {
      // Primary: level (closer to start is better)
      if (a.level !== b.level) return a.level - b.level
      // Secondary: relevance score
      return b.summary.relevanceScore - a.summary.relevanceScore
    })

  console.log(`Generated reading list with ${sortedList.length} papers`)
  return sortedList
}

/**
 * ExportReadingList — Export reading list to JSON/Markdown
 */
export function ExportReadingList(readingList, format = 'json') {
  if (format === 'json') {
    return JSON.stringify(readingList, null, 2)
  }

  if (format === 'markdown') {
    let md = '# Reading List\n\n'

    const byLevel = {}
    for (const paper of readingList) {
      if (!byLevel[paper.level]) byLevel[paper.level] = []
      byLevel[paper.level].push(paper)
    }

    for (const [level, papers] of Object.entries(byLevel)) {
      md += `## Level ${level}\n\n`
      for (const paper of papers) {
        md += `### ${paper.title}\n\n`
        md += `**Authors:** ${paper.authors.join(', ')}\n\n`
        md += `**arXiv:** [${paper.arxivId}](${paper.url})\n\n`
        md += `**Published:** ${paper.published}\n\n`
        md += `**Relevance:** ${(paper.summary.relevanceScore * 100).toFixed(0)}%\n\n`

        if (paper.summary.keyResults.length > 0) {
          md += `**Key Results:**\n\n`
          for (const result of paper.summary.keyResults) {
            md += `- ${result}\n`
          }
          md += '\n'
        }

        if (paper.summary.methods.length > 0) {
          md += `**Methods:** ${paper.summary.methods.join(', ')}\n\n`
        }

        md += `**Abstract:** ${paper.abstract}\n\n`
        md += '---\n\n'
      }
    }

    return md
  }

  throw new Error(`Unknown format: ${format}`)
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, '/')) {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log(`
Usage:
  node kb-src/summarize-papers.mjs fetch <theoremId>     Fetch papers for a theorem
  node kb-src/summarize-papers.mjs reading <theoremId>   Generate reading list
  node kb-src/summarize-papers.mjs cite <text>           Extract citations from text

Examples:
  node kb-src/summarize-papers.mjs fetch nullstellensatz
  node kb-src/summarize-papers.mjs reading nullstellensatz --depth 2
  node kb-src/summarize-papers.mjs cite "The Nullstellensatz shows that..."
`)
    process.exit(0)
  }

  const command = args[0]

  if (command === 'fetch') {
    const theoremId = args[1]
    if (!theoremId) {
      console.error('Error: theoremId required')
      process.exit(1)
    }

    FetchRelatedPapers(theoremId).then(papers => {
      console.log(JSON.stringify(papers, null, 2))
    }).catch(err => {
      console.error('Error:', err.message)
      process.exit(1)
    })
  }

  else if (command === 'reading') {
    const theoremId = args[1]
    const depthIdx = args.indexOf('--depth')
    const depth = depthIdx >= 0 ? parseInt(args[depthIdx + 1]) : 2

    if (!theoremId) {
      console.error('Error: theoremId required')
      process.exit(1)
    }

    GenerateReadingList(theoremId, depth).then(list => {
      const format = args.includes('--markdown') ? 'markdown' : 'json'
      const output = ExportReadingList(list, format)

      const outFile = join(OUT_DIR, `reading-list-${theoremId}.${format === 'markdown' ? 'md' : 'json'}`)
      writeFileSync(outFile, output, 'utf8')
      console.log(`\nReading list saved to: ${outFile}`)
    }).catch(err => {
      console.error('Error:', err.message)
      process.exit(1)
    })
  }

  else if (command === 'cite') {
    const text = args.slice(1).join(' ')
    if (!text) {
      console.error('Error: text required')
      process.exit(1)
    }

    const citations = ExtractCitations(text)
    console.log('Extracted citations:')
    console.log(JSON.stringify(citations, null, 2))
  }

  else {
    console.error(`Unknown command: ${command}`)
    process.exit(1)
  }
}

