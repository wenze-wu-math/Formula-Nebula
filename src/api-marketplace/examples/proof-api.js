/**
 * Proof Verification API
 * Example API for proof checking and assistance
 */

export async function createProofAPI(marketplace) {
  const api = await marketplace.publishAPI({
    name: 'Proof Assistant',
    version: '1.0.0',
    description: 'Verify proofs, suggest strategies, and format mathematical proofs',
    category: ['proof', 'verification', 'logic'],
    publisher: {
      userId: 'formula-nebula',
      displayName: 'Formula Nebula Team',
      reputation: 100
    },
    endpoints: [
      {
        path: '/verify',
        method: 'POST',
        description: 'Verify proof validity',
        handler: verifyProof,
        exampleRequest: {
          theorem: 'For all real x, x^2 >= 0',
          proof: {
            steps: [
              'Let x be an arbitrary real number',
              'Case 1: x >= 0, then x^2 >= 0',
              'Case 2: x < 0, then x^2 = (-x)^2 >= 0',
              'Therefore x^2 >= 0 for all real x'
            ]
          }
        },
        exampleResponse: {
          valid: true,
          confidence: 0.92,
          gaps: [],
          suggestions: []
        }
      },
      {
        path: '/suggest',
        method: 'POST',
        description: 'Get proof strategy suggestions',
        handler: suggestStrategy,
        exampleRequest: {
          theorem: 'If a and b are odd integers, then a + b is even',
          context: 'number theory'
        },
        exampleResponse: {
          strategies: [
            {
              name: 'Direct Proof',
              description: 'Use definition of odd integers',
              steps: [
                'Write a = 2k + 1, b = 2m + 1',
                'Show a + b = 2(k + m + 1)'
              ],
              difficulty: 'easy'
            }
          ],
          similarTheorems: [
            { name: 'Sum of even integers', similarity: 0.85 }
          ]
        }
      },
      {
        path: '/format',
        method: 'POST',
        description: 'Format proof in standard notation',
        handler: formatProof,
        exampleRequest: {
          proof: {
            steps: ['assume x>0', 'then x^2>0', 'QED']
          },
          format: 'latex'
        },
        exampleResponse: {
          formatted: '\\begin{proof}\n\\text{Assume } x > 0...\n\\end{proof}',
          format: 'latex'
        }
      },
      {
        path: '/check-logic',
        method: 'POST',
        description: 'Check logical validity of argument',
        handler: checkLogic,
        exampleRequest: {
          premises: ['All A are B', 'x is A'],
          conclusion: 'x is B'
        },
        exampleResponse: {
          valid: true,
          rule: 'Modus Ponens',
          explanation: 'Valid syllogism'
        }
      }
    ],
    pricing: {
      model: 'tiered',
      tiers: [
        { name: 'free', limit: 100, price: 0 },
        { name: 'student', limit: 5000, price: 4.99 },
        { name: 'researcher', limit: 50000, price: 29.99 }
      ]
    },
    rateLimits: {
      requestsPerMinute: 30,
      requestsPerDay: 2000,
      burstLimit: 60
    }
  });

  return api;
}

async function verifyProof(data, context) {
  const { theorem, proof } = data;

  if (!theorem || !proof) {
    throw new Error('Theorem and proof required');
  }

  // Simple heuristic verification (use formal verifier in production)
  const steps = proof.steps || [];
  const gaps = [];
  const suggestions = [];

  // Check proof structure
  if (steps.length === 0) {
    gaps.push({ type: 'missing_steps', message: 'Proof contains no steps' });
  }

  // Check for common patterns
  const hasAssumption = steps.some(s =>
    s.toLowerCase().includes('let') ||
    s.toLowerCase().includes('assume')
  );

  if (!hasAssumption && theorem.toLowerCase().includes('for all')) {
    gaps.push({
      type: 'missing_assumption',
      message: 'Universal statement should start with variable introduction'
    });
  }

  const hasConclusion = steps.some(s =>
    s.toLowerCase().includes('therefore') ||
    s.toLowerCase().includes('thus') ||
    s.toLowerCase().includes('qed')
  );

  if (!hasConclusion) {
    suggestions.push({
      type: 'add_conclusion',
      message: 'Consider adding explicit conclusion statement'
    });
  }

  // Calculate confidence based on checks
  const gapPenalty = gaps.length * 0.2;
  const confidence = Math.max(0, Math.min(1, 1 - gapPenalty));

  return {
    valid: gaps.length === 0,
    confidence,
    gaps,
    suggestions,
    steps: steps.length
  };
}

async function suggestStrategy(data, context) {
  const { theorem, context: mathContext = 'general' } = data;

  if (!theorem) {
    throw new Error('Theorem required');
  }

  const strategies = [];

  // Suggest direct proof
  strategies.push({
    name: 'Direct Proof',
    description: 'Prove the statement directly from definitions and axioms',
    steps: [
      'Start with assumptions',
      'Apply definitions and known theorems',
      'Derive conclusion step by step'
    ],
    difficulty: 'medium',
    applicable: true
  });

  // If contains negation, suggest contradiction
  if (theorem.toLowerCase().includes('not') || theorem.toLowerCase().includes('no')) {
    strategies.push({
      name: 'Proof by Contradiction',
      description: 'Assume the opposite and derive a contradiction',
      steps: [
        'Assume the negation of the statement',
        'Derive logical consequences',
        'Find a contradiction',
        'Conclude original statement is true'
      ],
      difficulty: 'medium',
      applicable: true
    });
  }

  // If contains "for all", suggest universal instantiation
  if (theorem.toLowerCase().includes('for all') || theorem.toLowerCase().includes('every')) {
    strategies.push({
      name: 'Universal Generalization',
      description: 'Prove for arbitrary element',
      steps: [
        'Let x be an arbitrary element',
        'Prove the property holds for x',
        'Conclude it holds for all elements'
      ],
      difficulty: 'easy',
      applicable: true
    });
  }

  // If contains cases, suggest case analysis
  if (theorem.toLowerCase().includes('or') || mathContext === 'number theory') {
    strategies.push({
      name: 'Proof by Cases',
      description: 'Break into exhaustive cases',
      steps: [
        'Identify all possible cases',
        'Prove statement for each case',
        'Conclude statement holds in all cases'
      ],
      difficulty: 'medium',
      applicable: true
    });
  }

  return {
    theorem,
    strategies,
    similarTheorems: [
      { name: 'Related theorem 1', similarity: 0.75 },
      { name: 'Related theorem 2', similarity: 0.68 }
    ],
    context: mathContext
  };
}

async function formatProof(data, context) {
  const { proof, format = 'latex' } = data;

  if (!proof || !proof.steps) {
    throw new Error('Proof steps required');
  }

  let formatted = '';

  if (format === 'latex') {
    formatted = '\\begin{proof}\n';
    proof.steps.forEach((step, i) => {
      formatted += `  ${formatStepLatex(step)}\n`;
      if (i < proof.steps.length - 1) {
        formatted += '  \\\\\n';
      }
    });
    formatted += '\\end{proof}';
  } else if (format === 'html') {
    formatted = '<div class="proof">\n';
    proof.steps.forEach((step, i) => {
      formatted += `  <p class="proof-step">${escapeHtml(step)}</p>\n`;
    });
    formatted += '</div>';
  } else {
    // Plain text
    formatted = 'Proof:\n';
    proof.steps.forEach((step, i) => {
      formatted += `${i + 1}. ${step}\n`;
    });
    formatted += '□';
  }

  return {
    original: proof.steps,
    formatted,
    format
  };
}

async function checkLogic(data, context) {
  const { premises, conclusion } = data;

  if (!premises || !conclusion) {
    throw new Error('Premises and conclusion required');
  }

  // Simple logical rule matching
  const premiseText = premises.join(' ');
  let valid = false;
  let rule = 'unknown';
  let explanation = '';

  // Modus Ponens: P -> Q, P ⊢ Q
  if (premises.length === 2) {
    const hasImplication = premises[0].toLowerCase().includes('if') ||
                          premises[0].toLowerCase().includes('all') ||
                          premises[0].toLowerCase().includes('are');
    const hasAntecedent = premises[1];

    if (hasImplication && hasAntecedent) {
      valid = true;
      rule = 'Modus Ponens';
      explanation = 'Valid syllogism: from P→Q and P, we can conclude Q';
    }
  }

  // Universal Instantiation
  if (premises[0].toLowerCase().includes('all') || premises[0].toLowerCase().includes('every')) {
    valid = true;
    rule = 'Universal Instantiation';
    explanation = 'Valid: from universal statement, we can conclude particular instance';
  }

  return {
    valid,
    rule,
    explanation,
    premises,
    conclusion
  };
}

// Helper functions

function formatStepLatex(step) {
  return step
    .replace(/>=|≥/g, '\\geq ')
    .replace(/<=|≤/g, '\\leq ')
    .replace(/\^(\d+)/g, '^{$1}')
    .replace(/=/g, ' = ')
    .replace(/\+/g, ' + ')
    .replace(/-/g, ' - ');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default createProofAPI;
