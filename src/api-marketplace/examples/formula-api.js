/**
 * Formula Evaluation API
 * Example API for mathematical formula operations
 */

import { APIMarketplace } from '../marketplace.js';

/**
 * Initialize and publish Formula API
 */
export async function createFormulaAPI(marketplace) {
  const api = await marketplace.publishAPI({
    name: 'Formula Evaluator',
    version: '1.0.0',
    description: 'Evaluate, parse, and simplify mathematical formulas',
    category: ['mathematics', 'algebra', 'calculus'],
    publisher: {
      userId: 'formula-nebula',
      displayName: 'Formula Nebula Team',
      reputation: 100
    },
    endpoints: [
      {
        path: '/evaluate',
        method: 'POST',
        description: 'Evaluate a mathematical expression',
        handler: evaluateFormula,
        exampleRequest: {
          expression: 'x^2 + 2*x + 1',
          variables: { x: 5 }
        },
        exampleResponse: {
          result: 36,
          symbolic: '(x + 1)^2',
          latex: '(x + 1)^{2}'
        }
      },
      {
        path: '/parse',
        method: 'POST',
        description: 'Parse formula into abstract syntax tree',
        handler: parseFormula,
        exampleRequest: {
          expression: 'a + b * c'
        },
        exampleResponse: {
          ast: {
            type: 'BinaryOp',
            operator: '+',
            left: { type: 'Variable', name: 'a' },
            right: {
              type: 'BinaryOp',
              operator: '*',
              left: { type: 'Variable', name: 'b' },
              right: { type: 'Variable', name: 'c' }
            }
          }
        }
      },
      {
        path: '/simplify',
        method: 'POST',
        description: 'Simplify algebraic expression',
        handler: simplifyFormula,
        exampleRequest: {
          expression: '2*x + 3*x - x'
        },
        exampleResponse: {
          original: '2*x + 3*x - x',
          simplified: '4*x',
          steps: [
            { expression: '2*x + 3*x - x', rule: 'original' },
            { expression: '5*x - x', rule: 'combine like terms' },
            { expression: '4*x', rule: 'simplify' }
          ]
        }
      },
      {
        path: '/derivative',
        method: 'POST',
        description: 'Calculate derivative of expression',
        handler: calculateDerivative,
        exampleRequest: {
          expression: 'x^3 + 2*x^2 + x',
          variable: 'x'
        },
        exampleResponse: {
          original: 'x^3 + 2*x^2 + x',
          derivative: '3*x^2 + 4*x + 1',
          latex: '3x^{2} + 4x + 1'
        }
      },
      {
        path: '/convert',
        method: 'POST',
        description: 'Convert formula between notations',
        handler: convertNotation,
        exampleRequest: {
          expression: 'x^2 + y^2',
          from: 'ascii',
          to: 'latex'
        },
        exampleResponse: {
          input: 'x^2 + y^2',
          output: 'x^{2} + y^{2}',
          format: 'latex'
        }
      }
    ],
    pricing: {
      model: 'tiered',
      tiers: [
        { name: 'free', limit: 1000, price: 0 },
        { name: 'basic', limit: 50000, price: 9 },
        { name: 'professional', limit: 500000, price: 49 },
        { name: 'enterprise', limit: Infinity, price: 199 }
      ]
    },
    rateLimits: {
      requestsPerMinute: 100,
      requestsPerDay: 10000,
      burstLimit: 200
    }
  });

  return api;
}

// Endpoint handlers

async function evaluateFormula(data, context) {
  const { expression, variables = {} } = data;

  if (!expression) {
    throw new Error('Expression required');
  }

  // Simple evaluation (in production, use a proper math library)
  try {
    // Replace variables
    let expr = expression;
    for (const [varName, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\b${varName}\\b`, 'g');
      expr = expr.replace(regex, value.toString());
    }

    // Replace math operators
    expr = expr.replace(/\^/g, '**');

    // Evaluate (unsafe - use math.js in production)
    const result = eval(expr);

    return {
      result,
      symbolic: expression,
      latex: convertToLatex(expression),
      variables
    };
  } catch (error) {
    throw new Error(`Evaluation failed: ${error.message}`);
  }
}

async function parseFormula(data, context) {
  const { expression } = data;

  if (!expression) {
    throw new Error('Expression required');
  }

  // Simple parser (use a real parser library in production)
  const ast = simpleParser(expression);

  return {
    expression,
    ast,
    tokens: tokenize(expression)
  };
}

async function simplifyFormula(data, context) {
  const { expression } = data;

  if (!expression) {
    throw new Error('Expression required');
  }

  // Simple simplification (use CAS library in production)
  const steps = [];
  let current = expression;

  steps.push({ expression: current, rule: 'original' });

  // Combine like terms: 2*x + 3*x -> 5*x
  const combined = combineLikeTerms(current);
  if (combined !== current) {
    current = combined;
    steps.push({ expression: current, rule: 'combine like terms' });
  }

  return {
    original: expression,
    simplified: current,
    steps,
    latex: convertToLatex(current)
  };
}

async function calculateDerivative(data, context) {
  const { expression, variable = 'x' } = data;

  if (!expression) {
    throw new Error('Expression required');
  }

  // Simple derivative rules (use CAS library in production)
  const derivative = simpleDerivative(expression, variable);

  return {
    original: expression,
    variable,
    derivative,
    latex: convertToLatex(derivative)
  };
}

async function convertNotation(data, context) {
  const { expression, from = 'ascii', to = 'latex' } = data;

  if (!expression) {
    throw new Error('Expression required');
  }

  let output = expression;

  if (from === 'ascii' && to === 'latex') {
    output = convertToLatex(expression);
  } else if (from === 'latex' && to === 'ascii') {
    output = convertFromLatex(expression);
  }

  return {
    input: expression,
    output,
    from,
    to
  };
}

// Helper functions

function convertToLatex(expr) {
  return expr
    .replace(/\^(\d+)/g, '^{$1}')
    .replace(/\*\*/g, '^')
    .replace(/\*/g, '')
    .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
    .replace(/pi/g, '\\pi')
    .replace(/theta/g, '\\theta');
}

function convertFromLatex(expr) {
  return expr
    .replace(/\^{(\d+)}/g, '^$1')
    .replace(/\\sqrt{([^}]+)}/g, 'sqrt($1)')
    .replace(/\\pi/g, 'pi')
    .replace(/\\theta/g, 'theta');
}

function tokenize(expr) {
  return expr.match(/[a-zA-Z_]\w*|\d+\.?\d*|[+\-*/^()]/g) || [];
}

function simpleParser(expr) {
  const tokens = tokenize(expr);
  // Simplified AST (use a real parser in production)
  return {
    type: 'Expression',
    tokens,
    raw: expr
  };
}

function combineLikeTerms(expr) {
  // Very simplified (use a CAS library in production)
  const match = expr.match(/(\d+)\*(\w+)\s*\+\s*(\d+)\*(\2)/);
  if (match) {
    const sum = parseInt(match[1]) + parseInt(match[3]);
    return expr.replace(match[0], `${sum}*${match[2]}`);
  }
  return expr;
}

function simpleDerivative(expr, variable) {
  // Power rule: x^n -> n*x^(n-1)
  const powerMatch = expr.match(new RegExp(`${variable}\\^(\\d+)`));
  if (powerMatch) {
    const n = parseInt(powerMatch[1]);
    if (n === 2) {
      return `2*${variable}`;
    }
    return `${n}*${variable}^${n - 1}`;
  }

  // Linear: x -> 1
  if (expr === variable) {
    return '1';
  }

  // Constant: c -> 0
  return '0';
}

export default createFormulaAPI;
