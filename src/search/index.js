/**
 * ═══════════════════════════════════════════════════════════════
 *  搜索索引 · Search Index
 * ═══════════════════════════════════════════════════════════════
 *
 * 提供高效的搜索和索引功能：
 *   · 倒排索引构建
 *   · TF-IDF 相关性排名
 *   · 全文搜索
 *   · 字段索引
 */

export class SearchIndex {
  constructor(options = {}) {
    this.items = options.items || []
    this.searchableFields = options.searchableFields || ['name', 'description', 'content']
    this.indexedFields = options.indexedFields || ['id', 'type', 'category']

    // 索引结构
    this.invertedIndex = new Map()      // 词 -> 文档 ID 列表
    this.fieldIndex = new Map()         // 字段值 -> 文档 ID 列表
    this.documentIndex = new Map()      // 文档 ID -> 文档
    this.documentFreq = new Map()       // 文档 ID -> 词频

    this.buildIndex()
  }

  /**
   * 构建搜索索引
   */
  buildIndex() {
    this.invertedIndex.clear()
    this.fieldIndex.clear()
    this.documentIndex.clear()
    this.documentFreq.clear()

    this.items.forEach((item, index) => {
      const docId = item.id || index

      // 索引文档
      this.documentIndex.set(docId, item)

      // 构建词频表
      const termFreq = new Map()

      // 构建倒排索引（可搜索字段）
      this.searchableFields.forEach(field => {
        const value = item[field]
        if (value) {
          const terms = this.tokenize(String(value))
          terms.forEach(term => {
            // 更新倒排索引
            if (!this.invertedIndex.has(term)) {
              this.invertedIndex.set(term, [])
            }
            const docs = this.invertedIndex.get(term)
            if (!docs.includes(docId)) {
              docs.push(docId)
            }

            // 累计词频
            termFreq.set(term, (termFreq.get(term) || 0) + 1)
          })
        }
      })

      this.documentFreq.set(docId, termFreq)

      // 构建字段索引（可过滤字段）
      this.indexedFields.forEach(field => {
        const value = item[field]
        if (value !== undefined && value !== null) {
          const key = `${field}:${String(value).toLowerCase()}`
          if (!this.fieldIndex.has(key)) {
            this.fieldIndex.set(key, [])
          }
          const docs = this.fieldIndex.get(key)
          if (!docs.includes(docId)) {
            docs.push(docId)
          }
        }
      })
    })
  }

  /**
   * 分词
   */
  tokenize(text) {
    return text
      .toLowerCase()
      .split(/[\s\-_.(),;:'"]+/)
      .filter(term => term.length > 0)
  }

  /**
   * 全文搜索
   */
  search(query, options = {}) {
    const {
      limit = 50,
      minScore = 0,
      fields = this.searchableFields,
      boostFields = {},
    } = options

    if (!query || query.trim().length === 0) {
      return []
    }

    const terms = this.tokenize(query)
    if (terms.length === 0) {
      return []
    }

    // 计算每个文档的得分
    const scores = new Map()

    terms.forEach(term => {
      const docs = this.invertedIndex.get(term) || []

      // 计算 IDF（逆文档频率）
      const idf = Math.log(this.items.length / (docs.length + 1))

      docs.forEach(docId => {
        const termFreq = this.documentFreq.get(docId)?.get(term) || 0
        const tfidf = (termFreq + 1) * idf

        if (!scores.has(docId)) {
          scores.set(docId, 0)
        }

        let score = scores.get(docId) + tfidf

        // 应用字段权重
        const doc = this.documentIndex.get(docId)
        fields.forEach(field => {
          if (doc[field] && String(doc[field]).toLowerCase().includes(term)) {
            const boost = boostFields[field] || 1
            score += boost * 2
          }
        })

        scores.set(docId, score)
      })
    })

    // 排序并返回结果
    const results = Array.from(scores.entries())
      .filter(([_, score]) => score >= minScore)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([docId, score]) => ({
        document: this.documentIndex.get(docId),
        score,
        matchTerms: terms,
      }))

    return results
  }

  /**
   * 前缀搜索（自动完成）
   */
  autocomplete(prefix, field = 'name', limit = 10) {
    if (!prefix || prefix.length === 0) {
      return []
    }

    const prefixLower = prefix.toLowerCase()
    const results = []

    this.items.forEach(item => {
      const value = item[field]
      if (value && String(value).toLowerCase().startsWith(prefixLower)) {
        results.push({
          value: String(value),
          document: item,
        })
      }
    })

    // 按相关性排序
    results.sort((a, b) => {
      // 完全匹配的优先
      if (a.value.toLowerCase() === prefixLower) return -1
      if (b.value.toLowerCase() === prefixLower) return 1
      // 长度短的优先
      return a.value.length - b.value.length
    })

    return results.slice(0, limit)
  }

  /**
   * 字段值搜索
   */
  searchByField(field, value) {
    const key = `${field}:${String(value).toLowerCase()}`
    const docIds = this.fieldIndex.get(key) || []
    return docIds.map(docId => this.documentIndex.get(docId))
  }

  /**
   * 范围搜索
   */
  rangeSearch(field, min, max) {
    const results = []
    this.items.forEach(item => {
      const value = Number(item[field])
      if (!isNaN(value) && value >= min && value <= max) {
        results.push(item)
      }
    })
    return results
  }

  /**
   * 模糊搜索（编辑距离）
   */
  fuzzySearch(query, field = 'name', maxDistance = 2, limit = 10) {
    const results = []

    this.items.forEach(item => {
      const value = String(item[field]).toLowerCase()
      const queryLower = query.toLowerCase()
      const distance = this.levenshteinDistance(value, queryLower)

      if (distance <= maxDistance) {
        results.push({
          document: item,
          distance,
          similarity: 1 - distance / Math.max(value.length, queryLower.length),
        })
      }
    })

    results.sort((a, b) => {
      if (a.distance !== b.distance) {
        return a.distance - b.distance
      }
      return b.similarity - a.similarity
    })

    return results.slice(0, limit)
  }

  /**
   * 编辑距离算法
   */
  levenshteinDistance(a, b) {
    const matrix = []

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[b.length][a.length]
  }

  /**
   * 获取建议
   */
  getSuggestions(query, options = {}) {
    const {
      limit = 5,
      type = 'spelling', // 'spelling', 'related', 'popular'
    } = options

    if (type === 'spelling') {
      return this.fuzzySearch(query, 'name', 2, limit)
    }

    if (type === 'related') {
      const results = this.search(query, { limit: limit * 3 })
      return results.slice(0, limit)
    }

    // 'popular' - 返回最常见的匹配
    return this.search(query, { limit })
  }

  /**
   * 统计索引信息
   */
  getStats() {
    return {
      totalDocuments: this.items.length,
      totalTerms: this.invertedIndex.size,
      avgTermsPerDocument:
        Array.from(this.documentFreq.values())
          .reduce((sum, freq) => sum + freq.size, 0) / (this.items.length || 1),
      indexSize: {
        inverted: this.invertedIndex.size,
        field: this.fieldIndex.size,
        documents: this.documentIndex.size,
      },
    }
  }

  /**
   * 更新索引
   */
  updateItem(item) {
    const index = this.items.findIndex(i => i.id === item.id)
    if (index >= 0) {
      this.items[index] = item
    } else {
      this.items.push(item)
    }
    this.buildIndex()
  }

  /**
   * 删除项
   */
  removeItem(itemId) {
    this.items = this.items.filter(i => i.id !== itemId)
    this.buildIndex()
  }

  /**
   * 批量添加
   */
  addItems(items) {
    this.items.push(...items)
    this.buildIndex()
  }

  /**
   * 清空索引
   */
  clear() {
    this.items = []
    this.buildIndex()
  }
}
