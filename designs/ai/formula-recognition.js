/**
 * designs/ai/formula-recognition.js — CV-Based Formula Recognition & Extraction
 *
 * Provides handwritten/printed formula recognition with LaTeX extraction,
 * automatic categorization, and theorem recommendation from knowledge graph.
 *
 * ML Backend Integration:
 * - Primary: Mathpix API (commercial, high accuracy)
 * - Fallback: TensorFlow.js + Custom trained model
 * - PDF: pdf.js + OCR pipeline
 */

import { getGraph, FAMILIES } from '../shared/kb.js'

/* ─────────────────────────────────────────────────────────────────
 * Configuration & API Keys
 * ───────────────────────────────────────────────────────────────── */

const CONFIG = {
  // Mathpix API credentials (use environment variables in production)
  MATHPIX_APP_ID: import.meta.env?.VITE_MATHPIX_APP_ID || '',
  MATHPIX_APP_KEY: import.meta.env?.VITE_MATHPIX_APP_KEY || '',

  // Recognition parameters
  CONFIDENCE_THRESHOLD: 0.65,
  MAX_IMAGE_SIZE: 4096,
  SUPPORTED_FORMATS: ['image/png', 'image/jpeg', 'image/webp'],

  // Categorization weights
  KEYWORD_WEIGHTS: {
    foundation: ['ring', 'ideal', 'module', 'noetherian', 'zariski'],
    scheme: ['scheme', 'sheaf', 'morphism', 'stalk', 'spec'],
    cohomology: ['cohomology', 'ext', 'tor', 'derived', 'spectral'],
    map: ['singularity', 'blow-up', 'resolution', 'exceptional'],
    curve: ['curve', 'surface', 'genus', 'canonical', 'divisor'],
    intersect: ['intersection', 'chern', 'characteristic', 'cycle'],
    birational: ['birational', 'rational', 'mori', 'minimal model'],
    modern: ['moduli', 'stack', 'deformation', 'gromov-witten']
  }
}

/* ─────────────────────────────────────────────────────────────────
 * Core Recognition: RecognizeFormula(imageData) → LaTeX
 * ───────────────────────────────────────────────────────────────── */

/**
 * Recognize handwritten or printed formula from image data
 * @param {ImageData|HTMLCanvasElement|Blob|string} imageData - Image source
 * @returns {Promise<{latex: string, confidence: number, alternatives: Array, error?: string}>}
 */
export async function RecognizeFormula(imageData) {
  const startTime = performance.now()

  try {
    // Convert input to base64
    const base64 = await imageToBase64(imageData)

    // Try Mathpix API first
    if (CONFIG.MATHPIX_APP_ID && CONFIG.MATHPIX_APP_KEY) {
      const result = await recognizeWithMathpix(base64)
      if (result.confidence >= CONFIG.CONFIDENCE_THRESHOLD) {
        return {
          ...result,
          processingTime: performance.now() - startTime,
          method: 'mathpix'
        }
      }
    }

    // Fallback to TensorFlow.js model
    const tfResult = await recognizeWithTensorFlow(imageData)
    return {
      ...tfResult,
      processingTime: performance.now() - startTime,
      method: 'tensorflow'
    }

  } catch (error) {
    return {
      latex: '',
      confidence: 0,
      alternatives: [],
      error: error.message,
      processingTime: performance.now() - startTime
    }
  }
}

/**
 * Mathpix OCR API integration
 */
async function recognizeWithMathpix(base64Image) {
  const response = await fetch('https://api.mathpix.com/v3/text', {
    method: 'POST',
    headers: {
      'app_id': CONFIG.MATHPIX_APP_ID,
      'app_key': CONFIG.MATHPIX_APP_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      src: base64Image,
      formats: ['text', 'latex_styled'],
      data_options: {
        include_asciimath: true,
        include_latex: true
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Mathpix API error: ${response.status}`)
  }

  const data = await response.json()

  return {
    latex: data.latex_styled || data.text || '',
    confidence: data.confidence || 0,
    alternatives: data.latex_list || [],
    metadata: {
      detectionList: data.detection_list,
      detectionMap: data.detection_map
    }
  }
}

/**
 * TensorFlow.js fallback (mock implementation - requires trained model)
 */
async function recognizeWithTensorFlow(_imageData) {
  // This would use a trained model like Im2LaTeX or similar
  // For now, return a placeholder that indicates the need for model training

  console.warn('TensorFlow.js recognition not yet implemented - requires trained model')

  return {
    latex: '',
    confidence: 0,
    alternatives: [],
    error: 'TensorFlow model not loaded. Please configure Mathpix API or train a custom model.'
  }
}

/* ─────────────────────────────────────────────────────────────────
 * PDF Extraction: ExtractFromPDF(buffer) → [Formula]
 * ───────────────────────────────────────────────────────────────── */

/**
 * Extract all formulas from a PDF document
 * @param {ArrayBuffer|Blob} buffer - PDF file buffer
 * @returns {Promise<Array<{latex: string, page: number, bbox: Object, confidence: number}>>}
 */
export async function ExtractFromPDF(buffer) {
  try {
    // Dynamic import pdf.js to keep bundle size small
    const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs')

    // Set worker
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

    const arrayBuffer = buffer instanceof Blob ? await buffer.arrayBuffer() : buffer
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    const formulas = []

    // Process each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 2.0 })

      // Render page to canvas
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const context = canvas.getContext('2d')

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise

      // Detect formula regions (heuristic: look for math-like patterns)
      const regions = await detectFormulaRegions(canvas)

      // Recognize each region
      for (const region of regions) {
        const regionCanvas = extractRegion(canvas, region)
        const result = await RecognizeFormula(regionCanvas)

        if (result.latex && result.confidence >= CONFIG.CONFIDENCE_THRESHOLD) {
          formulas.push({
            latex: result.latex,
            page: pageNum,
            bbox: region,
            confidence: result.confidence
          })
        }
      }
    }

    return formulas

  } catch (error) {
    console.error('PDF extraction error:', error)
    return []
  }
}

/**
 * Detect formula regions using image processing heuristics
 */
async function detectFormulaRegions(canvas) {
  const ctx = canvas.getContext('2d')
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const regions = []

  // Simple heuristic: look for dense text regions with mathematical symbols
  // In production, use a trained object detection model (YOLO, Faster R-CNN)

  const SCAN_STEP = 50
  const REGION_SIZE = 200

  for (let y = 0; y < canvas.height - REGION_SIZE; y += SCAN_STEP) {
    for (let x = 0; x < canvas.width - REGION_SIZE; x += SCAN_STEP) {
      const density = calculatePixelDensity(imageData, x, y, REGION_SIZE, REGION_SIZE)

      // Formula regions typically have moderate density (not too sparse, not solid)
      if (density > 0.1 && density < 0.6) {
        regions.push({ x, y, width: REGION_SIZE, height: REGION_SIZE })
      }
    }
  }

  // Merge overlapping regions
  return mergeRegions(regions)
}

function calculatePixelDensity(imageData, x, y, width, height) {
  let darkPixels = 0
  let totalPixels = 0

  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const px = x + dx
      const py = y + dy
      if (px >= imageData.width || py >= imageData.height) continue

      const idx = (py * imageData.width + px) * 4
      const brightness = (imageData.data[idx] + imageData.data[idx + 1] + imageData.data[idx + 2]) / 3

      if (brightness < 128) darkPixels++
      totalPixels++
    }
  }

  return darkPixels / totalPixels
}

function mergeRegions(regions) {
  // Simple merge: combine overlapping boxes
  const merged = []
  const used = new Set()

  for (let i = 0; i < regions.length; i++) {
    if (used.has(i)) continue

    let rect = { ...regions[i] }

    for (let j = i + 1; j < regions.length; j++) {
      if (used.has(j)) continue

      if (overlaps(rect, regions[j])) {
        rect = union(rect, regions[j])
        used.add(j)
      }
    }

    merged.push(rect)
  }

  return merged
}

function overlaps(r1, r2) {
  return !(r1.x + r1.width < r2.x || r2.x + r2.width < r1.x ||
           r1.y + r1.height < r2.y || r2.y + r2.height < r1.y)
}

function union(r1, r2) {
  const x = Math.min(r1.x, r2.x)
  const y = Math.min(r1.y, r2.y)
  const right = Math.max(r1.x + r1.width, r2.x + r2.width)
  const bottom = Math.max(r1.y + r1.height, r2.y + r2.height)
  return { x, y, width: right - x, height: bottom - y }
}

function extractRegion(canvas, region) {
  const extracted = document.createElement('canvas')
  extracted.width = region.width
  extracted.height = region.height
  const ctx = extracted.getContext('2d')

  ctx.drawImage(canvas,
    region.x, region.y, region.width, region.height,
    0, 0, region.width, region.height
  )

  return extracted
}

/* ─────────────────────────────────────────────────────────────────
 * Categorization: CategorizeFormula(latex) → family
 * ───────────────────────────────────────────────────────────────── */

/**
 * Automatically categorize formula into knowledge graph family
 * @param {string} latex - LaTeX formula string
 * @returns {{family: string, confidence: number, scores: Object}}
 */
export function CategorizeFormula(latex) {
  const normalized = latex.toLowerCase()
  const scores = {}

  // Calculate keyword matching score for each family
  for (const [family, keywords] of Object.entries(CONFIG.KEYWORD_WEIGHTS)) {
    let score = 0
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        score += 1
      }
    }
    scores[family] = score / keywords.length
  }

  // Structural analysis: LaTeX command patterns
  const structuralScores = analyzeLatexStructure(latex)

  // Combine keyword and structural scores
  for (const family in scores) {
    scores[family] = 0.6 * scores[family] + 0.4 * (structuralScores[family] || 0)
  }

  // Find best match
  const entries = Object.entries(scores)
  entries.sort((a, b) => b[1] - a[1])

  const [bestFamily, bestScore] = entries[0]

  return {
    family: bestScore > 0.1 ? bestFamily : 'foundation', // default to foundation
    confidence: bestScore,
    scores: Object.fromEntries(entries),
    reasoning: explainCategorization(latex, bestFamily, bestScore)
  }
}

/**
 * Analyze LaTeX structure for categorization hints
 */
function analyzeLatexStructure(latex) {
  const scores = {}

  // Cohomology: H^n, Ext, Tor, derived functors
  if (/\\mathrm\{(Ext|Tor|H)\}|H\^|\\mathcal\{D\}/.test(latex)) {
    scores.cohomology = 0.8
  }

  // Scheme theory: Spec, sheaf notation
  if (/\\mathrm\{Spec\}|\\mathcal\{O\}|\\mathcal\{F\}/.test(latex)) {
    scores.scheme = 0.7
  }

  // Intersection theory: Classes, cycles
  if (/\\cdot|\\cap|\\mathrm\{CH\}|c_\d/.test(latex)) {
    scores.intersect = 0.6
  }

  // Curves: Genus, divisors
  if (/\\mathrm\{Pic\}|\\mathrm\{Div\}|K_X|\[omega\]/.test(latex)) {
    scores.curve = 0.7
  }

  // Birational: K-theory, MMP notation
  if (/K_X|\\sim|\\mathrm\{bir\}/.test(latex)) {
    scores.birational = 0.5
  }

  return scores
}

function explainCategorization(latex, family, score) {
  if (score < 0.1) {
    return 'No strong indicators found; defaulting to foundation category.'
  }

  const familyInfo = FAMILIES[family]
  return `Classified as "${familyInfo?.name || family}" based on keyword and structural analysis (confidence: ${(score * 100).toFixed(1)}%).`
}

/* ─────────────────────────────────────────────────────────────────
 * Theorem Recommendation: FindRelated(latex) → [TheoremId]
 * ───────────────────────────────────────────────────────────────── */

/**
 * Find related theorems from knowledge graph based on formula
 * @param {string} latex - LaTeX formula string
 * @returns {Array<{id: string, name: string, similarity: number, reason: string}>}
 */
export function FindRelated(latex) {
  const graph = getGraph()
  const category = CategorizeFormula(latex)

  const candidates = []

  // Find nodes in the same family
  const familyNodes = graph.nodes.filter(n => n.family === category.family)

  for (const node of familyNodes) {
    const similarity = calculateSimilarity(latex, node.latex, node)

    if (similarity > 0.2) {
      candidates.push({
        id: node.id,
        name: node.name,
        en: node.en,
        latex: node.latex,
        similarity: similarity,
        reason: explainSimilarity(latex, node, similarity),
        family: node.family,
        importance: node.importance
      })
    }
  }

  // Also check cross-family connections for high-importance nodes
  const otherNodes = graph.nodes.filter(n =>
    n.family !== category.family && n.importance > 0.8
  )

  for (const node of otherNodes) {
    const similarity = calculateSimilarity(latex, node.latex, node)

    if (similarity > 0.4) { // Higher threshold for cross-family
      candidates.push({
        id: node.id,
        name: node.name,
        en: node.en,
        latex: node.latex,
        similarity: similarity,
        reason: explainSimilarity(latex, node, similarity),
        family: node.family,
        importance: node.importance
      })
    }
  }

  // Sort by similarity × importance
  candidates.sort((a, b) => {
    const scoreA = a.similarity * (0.5 + 0.5 * a.importance)
    const scoreB = b.similarity * (0.5 + 0.5 * b.importance)
    return scoreB - scoreA
  })

  return candidates.slice(0, 10)
}

/**
 * Calculate similarity between input LaTeX and a knowledge graph node
 */
function calculateSimilarity(inputLatex, nodeLatex, node) {
  let score = 0

  // 1. Direct LaTeX substring matching
  const normalizedInput = normalizeLatex(inputLatex)
  const normalizedNode = normalizeLatex(nodeLatex)

  if (normalizedInput === normalizedNode) {
    return 1.0 // Exact match
  }

  // 2. Token overlap (split by LaTeX commands and symbols)
  const inputTokens = tokenizeLatex(normalizedInput)
  const nodeTokens = tokenizeLatex(normalizedNode)

  const commonTokens = inputTokens.filter(t => nodeTokens.includes(t))
  const tokenOverlap = commonTokens.length / Math.max(inputTokens.length, nodeTokens.length)
  score += 0.4 * tokenOverlap

  // 3. Symbol similarity (key mathematical symbols)
  const symbolScore = compareSymbols(inputLatex, nodeLatex)
  score += 0.3 * symbolScore

  // 4. Keyword matching from node metadata
  if (node.name || node.summary) {
    const text = `${node.name} ${node.summary || ''}`.toLowerCase()
    const inputWords = extractKeywords(inputLatex)

    const keywordMatches = inputWords.filter(w => text.includes(w)).length
    score += 0.3 * (keywordMatches / Math.max(inputWords.length, 1))
  }

  return Math.min(score, 1.0)
}

function normalizeLatex(latex) {
  return latex
    .replace(/\s+/g, ' ')
    .replace(/\\,/g, '')
    .replace(/\\;/g, '')
    .replace(/\\!/g, '')
    .trim()
}

function tokenizeLatex(latex) {
  // Split by LaTeX commands and mathematical symbols
  const tokens = latex.match(/\\[a-zA-Z]+|[a-zA-Z]+|[^a-zA-Z\s\\]+/g) || []
  return tokens.filter(t => t.length > 1)
}

function compareSymbols(latex1, latex2) {
  const symbols1 = extractSymbols(latex1)
  const symbols2 = extractSymbols(latex2)

  const common = symbols1.filter(s => symbols2.includes(s))
  return common.length / Math.max(symbols1.length, symbols2.length, 1)
}

function extractSymbols(latex) {
  const mathSymbols = latex.match(/\\(alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega|in|subset|supset|cap|cup|int|sum|prod|infty|partial|nabla|rightarrow|leftarrow|mapsto|to|cdot|times|otimes|oplus|wedge|vee)/g) || []
  return [...new Set(mathSymbols)]
}

function extractKeywords(latex) {
  // Extract English words from LaTeX (often in \text{} or \mathrm{})
  const words = latex.match(/(?:\\(?:text|mathrm|operatorname)\{([^}]+)\})|([a-z]{3,})/gi) || []
  return words.map(w => w.replace(/^\\(?:text|mathrm|operatorname)\{|\}$/g, '').toLowerCase())
}

function explainSimilarity(inputLatex, node, _similarity) {
  const reasons = []

  const inputTokens = tokenizeLatex(normalizeLatex(inputLatex))
  const nodeTokens = tokenizeLatex(normalizeLatex(node.latex))
  const common = inputTokens.filter(t => nodeTokens.includes(t))

  if (common.length > 0) {
    reasons.push(`Shares ${common.length} LaTeX tokens: ${common.slice(0, 3).join(', ')}`)
  }

  const symbols1 = extractSymbols(inputLatex)
  const symbols2 = extractSymbols(node.latex)
  const commonSymbols = symbols1.filter(s => symbols2.includes(s))

  if (commonSymbols.length > 0) {
    reasons.push(`Common symbols: ${commonSymbols.slice(0, 3).join(', ')}`)
  }

  if (node.importance > 0.8) {
    reasons.push('Core theorem in knowledge graph')
  }

  return reasons.join('; ') || 'Structural similarity detected'
}

/* ─────────────────────────────────────────────────────────────────
 * Utilities
 * ───────────────────────────────────────────────────────────────── */

/**
 * Convert various image formats to base64 data URL
 */
async function imageToBase64(input) {
  // Already base64
  if (typeof input === 'string' && input.startsWith('data:')) {
    return input
  }

  // Blob or File
  if (input instanceof Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(input)
    })
  }

  // Canvas
  if (input instanceof HTMLCanvasElement) {
    return input.toDataURL('image/png')
  }

  // ImageData - convert to canvas first
  if (input instanceof ImageData) {
    const canvas = document.createElement('canvas')
    canvas.width = input.width
    canvas.height = input.height
    canvas.getContext('2d').putImageData(input, 0, 0)
    return canvas.toDataURL('image/png')
  }

  throw new Error('Unsupported image format')
}

/**
 * Get accuracy statistics from recognition history
 * (Requires a backend/storage system to track recognition history)
 */
export function GetAccuracyStats() {
  // Mock implementation - in production, fetch from database
  return {
    totalRecognitions: 0,
    successfulRecognitions: 0,
    averageConfidence: 0,
    accuracyByMethod: {
      mathpix: { count: 0, avgConfidence: 0 },
      tensorflow: { count: 0, avgConfidence: 0 }
    },
    accuracyByFamily: Object.fromEntries(
      Object.keys(FAMILIES).map(f => [f, { count: 0, avgSimilarity: 0 }])
    )
  }
}

export default {
  RecognizeFormula,
  ExtractFromPDF,
  CategorizeFormula,
  FindRelated,
  GetAccuracyStats,
  CONFIG
}
