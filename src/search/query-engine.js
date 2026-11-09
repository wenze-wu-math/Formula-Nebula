/**
 * ═══════════════════════════════════════════════════════════════
 *  查询引擎 · Query Engine
 * ═══════════════════════════════════════════════════════════════
 *
 * 提供高级查询功能：
 *   · 复杂查询解析
 *   · 查询优化
 *   · 多条件组合
 */

export class QueryEngine {
  constructor(_options = {}) {
    this.operators = {
      AND: 'AND',
      OR: 'OR',
      NOT: 'NOT',
    }

    this.filterOperators = {
      eq: '=',
      neq: '!=',
      gt: '>',
      gte: '>=',
      lt: '<',
      lte: '<=',
      in: 'IN',
      contains: 'CONTAINS',
      startsWith: 'STARTS_WITH',
      endsWith: 'ENDS_WITH',
      between: 'BETWEEN',
    }
  }

  /**
   * 解析查询字符串
   * 支持格式：
   *   - 简单文本: "algebra"
   *   - 字段查询: "type:theorem"
   *   - 范围: "importance:>0.8"
   *   - 组合: "type:theorem AND importance:>0.8"
   */
  parseQuery(queryString) {
    if (!queryString || typeof queryString !== 'string') {
      return { tokens: [], filters: [], error: null }
    }

    const tokens = []
    const filters = []
    const parts = queryString.split(/\s+/)

    let currentTokens = []

    parts.forEach(part => {
      // 检查字段查询
      if (part.includes(':')) {
        const [field, value] = part.split(':', 2)

        if (currentTokens.length > 0) {
          tokens.push(currentTokens.join(' '))
          currentTokens = []
        }

        const filter = this.parseFilter(field, value)
        if (filter) {
          filters.push(filter)
        }
      } else if (
        part.toUpperCase() === 'AND' ||
        part.toUpperCase() === 'OR' ||
        part.toUpperCase() === 'NOT'
      ) {
        if (currentTokens.length > 0) {
          tokens.push(currentTokens.join(' '))
          currentTokens = []
        }
        tokens.push(part.toUpperCase())
      } else {
        currentTokens.push(part)
      }
    })

    if (currentTokens.length > 0) {
      tokens.push(currentTokens.join(' '))
    }

    return { tokens, filters, error: null }
  }

  /**
   * 解析字段过滤
   */
  parseFilter(field, value) {
    // 提取操作符
    let operator = 'contains'
    let actualValue = value

    if (value.startsWith('>=')) {
      operator = 'gte'
      actualValue = value.substring(2)
    } else if (value.startsWith('<=')) {
      operator = 'lte'
      actualValue = value.substring(2)
    } else if (value.startsWith('!=')) {
      operator = 'neq'
      actualValue = value.substring(2)
    } else if (value.startsWith('>')) {
      operator = 'gt'
      actualValue = value.substring(1)
    } else if (value.startsWith('<')) {
      operator = 'lt'
      actualValue = value.substring(1)
    } else if (value.startsWith('~')) {
      operator = 'contains'
      actualValue = value.substring(1)
    } else if (value.startsWith('^')) {
      operator = 'startsWith'
      actualValue = value.substring(1)
    } else if (value.startsWith('$')) {
      operator = 'endsWith'
      actualValue = value.substring(1)
    } else if (value.startsWith('[') && value.endsWith(']')) {
      operator = 'in'
      actualValue = value.slice(1, -1)
    }

    return {
      field: field.toLowerCase(),
      operator,
      value: actualValue,
    }
  }

  /**
   * 构建查询执行计划
   */
  buildExecutionPlan(query, index) {
    const parsed = this.parseQuery(query)
    if (parsed.error) {
      return { error: parsed.error }
    }

    const plan = {
      type: 'combined',
      operations: [],
      estimatedRows: 0,
    }

    // 处理过滤条件
    if (parsed.filters.length > 0) {
      plan.operations.push({
        type: 'filter',
        filters: parsed.filters,
      })
    }

    // 处理全文搜索
    if (parsed.tokens.length > 0) {
      const searchTokens = parsed.tokens.filter(t => !this.isOperator(t))
      if (searchTokens.length > 0) {
        plan.operations.push({
          type: 'search',
          query: searchTokens.join(' '),
          logic: this.extractLogic(parsed.tokens),
        })
      }
    }

    // 估计行数
    plan.estimatedRows = this.estimateRowCount(plan.operations, index)

    return plan
  }

  /**
   * 检查是否为操作符
   */
  isOperator(token) {
    return ['AND', 'OR', 'NOT'].includes(token.toUpperCase())
  }

  /**
   * 提取逻辑运算符
   */
  extractLogic(tokens) {
    const logic = []
    for (let i = 1; i < tokens.length; i++) {
      if (this.isOperator(tokens[i])) {
        logic.push(tokens[i].toUpperCase())
      }
    }
    return logic.length > 0 ? logic : ['AND']
  }

  /**
   * 估计行数
   */
  estimateRowCount(operations, index) {
    let estimate = index ? index.items.length : 1000

    operations.forEach(op => {
      if (op.type === 'filter') {
        // 每个过滤条件约减少 50%
        estimate *= Math.pow(0.5, op.filters.length)
      } else if (op.type === 'search') {
        // 搜索约返回前 20%
        estimate *= 0.2
      }
    })

    return Math.max(Math.ceil(estimate), 0)
  }

  /**
   * 优化查询
   */
  optimizeQuery(query) {
    let optimized = query

    // 移除多余空格
    optimized = optimized.replace(/\s+/g, ' ').trim()

    // 规范化操作符
    optimized = optimized.replace(/\sand\s/gi, ' AND ')
    optimized = optimized.replace(/\sor\s/gi, ' OR ')
    optimized = optimized.replace(/\snot\s/gi, ' NOT ')

    // 合并相同条件
    optimized = this.mergeDuplicateFilters(optimized)

    return optimized
  }

  /**
   * 合并重复的过滤条件
   */
  mergeDuplicateFilters(query) {
    const parts = query.split(/\s+/)
    const seen = new Map()
    const result = []

    parts.forEach(part => {
      if (part.includes(':')) {
        const [field] = part.split(':', 1)
        if (!seen.has(field)) {
          seen.set(field, true)
          result.push(part)
        }
      } else {
        result.push(part)
      }
    })

    return result.join(' ')
  }

  /**
   * 验证查询
   */
  validateQuery(query) {
    const errors = []

    // 检查平衡的括号
    if (this.countChar(query, '(') !== this.countChar(query, ')')) {
      errors.push('不平衡的括号')
    }

    // 检查引号
    if (this.countChar(query, '"') % 2 !== 0) {
      errors.push('不匹配的引号')
    }

    // 检查无效的操作符
    const invalidOps = query.match(/\s(AND|OR|NOT)\s$/m)
    if (invalidOps) {
      errors.push('操作符位置不正确')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * 计数字符
   */
  countChar(str, char) {
    return (str.match(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || [])
      .length
  }

  /**
   * 生成查询建议
   */
  generateSuggestions(partialQuery, availableFields = []) {
    const suggestions = []
    const lastPart = partialQuery.split(/\s+/).pop() || ''

    // 建议字段
    if (lastPart.includes(':')) {
      const [field] = lastPart.split(':')
      const fieldSuggestions = availableFields.filter(f =>
        f.toLowerCase().startsWith(field.toLowerCase())
      )
      suggestions.push(
        ...fieldSuggestions.map(f => ({
          type: 'field',
          text: f + ':',
          description: `按 ${f} 过滤`,
        }))
      )
    } else {
      // 建议可用字段
      suggestions.push(
        ...availableFields.map(f => ({
          type: 'field',
          text: f + ':',
          description: `按 ${f} 过滤`,
        }))
      )
    }

    // 建议操作符
    if (!this.isOperator(lastPart)) {
      suggestions.push(
        { type: 'operator', text: 'AND', description: '并且' },
        { type: 'operator', text: 'OR', description: '或者' },
        { type: 'operator', text: 'NOT', description: '非' }
      )
    }

    return suggestions.slice(0, 10)
  }

  /**
   * 将查询转换为过滤对象数组
   */
  toFilterObjects(query) {
    const parsed = this.parseQuery(query)
    return parsed.filters
  }

  /**
   * 比较两个查询
   */
  compareQueries(query1, query2) {
    const p1 = this.parseQuery(query1)
    const p2 = this.parseQuery(query2)

    return {
      sameFilters:
        JSON.stringify(p1.filters.sort()) === JSON.stringify(p2.filters.sort()),
      sameTokens: JSON.stringify(p1.tokens.sort()) === JSON.stringify(p2.tokens.sort()),
      same: query1 === query2,
    }
  }
}
