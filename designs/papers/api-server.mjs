/**
 * designs/papers/api-server.mjs — Simple API server for paper browser
 *
 * Provides REST endpoints for the paper browser interface:
 *   GET /api/papers/search - Search papers by theorem or query
 *   GET /api/papers/reading-list - Generate reading list
 *   GET /api/papers/summarize - Summarize a specific paper
 */

import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  FetchRelatedPapers,
  SummarizePaper,
  GenerateReadingList,
  ExtractCitations,
  ExportReadingList
} from '../../kb-src/summarize-papers.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3456

// CORS headers for local development
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Parse URL query parameters
function parseQuery(url) {
  const params = new URLSearchParams(url.split('?')[1] || '')
  return Object.fromEntries(params.entries())
}

// Send JSON response
function sendJSON(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    ...CORS_HEADERS
  })
  res.end(JSON.stringify(data, null, 2))
}

// Send error response
function sendError(res, message, status = 400) {
  sendJSON(res, { error: message }, status)
}

// Handle requests
async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`)

  console.log(`${req.method} ${url.pathname}`)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, CORS_HEADERS)
    res.end()
    return
  }

  // Serve static files
  if (url.pathname === '/' || url.pathname === '/index.html') {
    try {
      const html = readFileSync(join(HERE, 'index.html'), 'utf8')
      res.writeHead(200, { 'Content-Type': 'text/html', ...CORS_HEADERS })
      res.end(html)
      return
    } catch (e) {
      sendError(res, 'File not found', 404)
      return
    }
  }

  // API endpoints
  if (url.pathname === '/api/papers/search') {
    try {
      const query = parseQuery(req.url)
      const { theoremId, query: searchQuery, sortBy, category, maxResults } = query

      if (!theoremId && !searchQuery) {
        sendError(res, 'theoremId or query required')
        return
      }

      let papers = []

      if (theoremId) {
        papers = await FetchRelatedPapers(theoremId, {
          maxResults: parseInt(maxResults) || 20,
          sortBy: sortBy || 'relevance',
          category: category || 'math.AG'
        })
      } else {
        // For direct query search, we need to create a temporary theorem-like object
        // This is a simplified approach - in production, you'd have better search
        const tempTheorem = {
          id: 'query',
          name: searchQuery,
          en: searchQuery,
          latex: ''
        }

        // Mock search by using arXiv API directly
        const encodedQuery = encodeURIComponent(`all:${searchQuery} AND cat:${category || 'math'}`)
        const arxivUrl = `http://export.arxiv.org/api/query?search_query=${encodedQuery}&max_results=${maxResults || 20}&sortBy=${sortBy || 'relevance'}`

        const response = await fetch(arxivUrl)
        const xml = await response.text()

        // Parse XML (same as in summarize-papers.mjs)
        papers = parseArxivXML(xml, 'query')
      }

      // Summarize each paper
      const summarizedPapers = []
      for (const paper of papers) {
        const summary = await SummarizePaper(paper)
        summarizedPapers.push({
          ...paper,
          summary
        })
      }

      sendJSON(res, summarizedPapers)

    } catch (error) {
      console.error('Search error:', error)
      sendError(res, error.message, 500)
    }
    return
  }

  if (url.pathname === '/api/papers/reading-list') {
    try {
      const query = parseQuery(req.url)
      const { theoremId, depth } = query

      if (!theoremId) {
        sendError(res, 'theoremId required')
        return
      }

      const readingList = await GenerateReadingList(
        theoremId,
        parseInt(depth) || 2
      )

      sendJSON(res, readingList)

    } catch (error) {
      console.error('Reading list error:', error)
      sendError(res, error.message, 500)
    }
    return
  }

  if (url.pathname === '/api/papers/summarize') {
    try {
      const query = parseQuery(req.url)
      const { arxivId } = query

      if (!arxivId) {
        sendError(res, 'arxivId required')
        return
      }

      // Fetch paper from arXiv
      const arxivUrl = `http://export.arxiv.org/api/query?id_list=${arxivId}`
      const response = await fetch(arxivUrl)
      const xml = await response.text()

      const papers = parseArxivXML(xml, 'direct')
      if (papers.length === 0) {
        sendError(res, 'Paper not found', 404)
        return
      }

      const summary = await SummarizePaper(papers[0])
      sendJSON(res, {
        ...papers[0],
        summary
      })

    } catch (error) {
      console.error('Summarize error:', error)
      sendError(res, error.message, 500)
    }
    return
  }

  if (url.pathname === '/api/papers/extract-citations') {
    try {
      let body = ''
      req.on('data', chunk => body += chunk)
      req.on('end', () => {
        try {
          const { text } = JSON.parse(body)
          if (!text) {
            sendError(res, 'text required')
            return
          }

          const citations = ExtractCitations(text)
          sendJSON(res, { citations })

        } catch (error) {
          sendError(res, 'Invalid JSON', 400)
        }
      })
      return

    } catch (error) {
      console.error('Citation extraction error:', error)
      sendError(res, error.message, 500)
    }
    return
  }

  // 404
  sendError(res, 'Not found', 404)
}

// Parse arXiv XML (duplicated from summarize-papers.mjs for standalone server)
function parseArxivXML(xml, theoremId) {
  const papers = []
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

    const authorMatches = entry.matchAll(/<author>[\s\S]*?<name>([^<]+)<\/name>/g)
    const authors = Array.from(authorMatches, m => m[1])

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

// Start server
const server = createServer(handleRequest)

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  Paper Browser API Server                                 ║
║  Running on http://localhost:${PORT}                        ║
╚═══════════════════════════════════════════════════════════╝

Endpoints:
  GET  /                          Paper browser interface
  GET  /api/papers/search         Search papers
  GET  /api/papers/reading-list   Generate reading list
  GET  /api/papers/summarize      Summarize paper
  POST /api/papers/extract-citations  Extract citations

Press Ctrl+C to stop
`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...')
  server.close(() => {
    console.log('Server stopped')
    process.exit(0)
  })
})
