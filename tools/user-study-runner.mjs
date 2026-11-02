#!/usr/bin/env node

/**
 * User Study Runner for Formula Nebula
 *
 * This tool orchestrates the user study comparing four visualization modes:
 * - Atlas, Map, Manuscript, and Nebula
 *
 * Features:
 * - Counterbalanced presentation order (Latin square)
 * - Automated timing and interaction tracking
 * - Comprehension questions with validation
 * - Engagement questionnaires
 * - Data collection and storage
 *
 * Usage:
 *   node tools/user-study-runner.mjs --participant <id>
 *   node tools/user-study-runner.mjs --participant P001
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

// Configuration
const CONFIG = {
  visualizationModes: ['atlas', 'map', 'manuscript', 'nebula'],

  // Latin square counterbalancing (4x4)
  orderGroups: [
    ['atlas', 'map', 'manuscript', 'nebula'],
    ['map', 'manuscript', 'nebula', 'atlas'],
    ['manuscript', 'nebula', 'atlas', 'map'],
    ['nebula', 'atlas', 'map', 'manuscript']
  ],

  // Test proofs (one per visualization)
  proofs: {
    atlas: {
      title: 'Irrationality of √2',
      file: 'designs/atlas/index.html',
      description: 'Classic proof by contradiction showing √2 cannot be expressed as a ratio of integers'
    },
    map: {
      title: 'Infinitude of Primes',
      file: 'designs/map/index.html',
      description: 'Euclid\'s proof that there are infinitely many prime numbers'
    },
    manuscript: {
      title: 'Sum of Arithmetic Series',
      file: 'designs/manuscript/index.html',
      description: 'Derivation of the formula for the sum 1+2+3+...+n = n(n+1)/2'
    },
    nebula: {
      title: 'Derivative of x^n',
      file: 'designs/nebula-plus/index.html',
      description: 'Proof that d/dx(x^n) = nx^(n-1) using the limit definition'
    }
  },

  // Comprehension questions (5 per proof)
  questions: {
    atlas: [
      {
        question: 'What is the main technique used in this proof?',
        options: ['Induction', 'Contradiction', 'Direct proof', 'Contrapositive'],
        correct: 1
      },
      {
        question: 'What assumption leads to the contradiction?',
        options: ['√2 is rational', '√2 is irrational', '√2 = 0', '√2 > 1'],
        correct: 0
      },
      {
        question: 'Which property of even numbers is crucial to the proof?',
        options: ['Sum of evens is even', 'Square of even is even', 'Product of evens is even', 'All of the above'],
        correct: 1
      },
      {
        question: 'What does it mean for a fraction to be in "lowest terms"?',
        options: ['Numerator is 1', 'Denominator is 1', 'No common factors', 'Both are prime'],
        correct: 2
      },
      {
        question: 'Why must both a and b be even?',
        options: ['By assumption', 'From a²=2b²', 'They don\'t have to be', 'Only a must be even'],
        correct: 1
      }
    ],
    map: [
      {
        question: 'What does Euclid assume for contradiction?',
        options: ['Primes are finite', 'Primes are infinite', 'All numbers are prime', 'No numbers are prime'],
        correct: 0
      },
      {
        question: 'What is N in the proof?',
        options: ['A prime number', 'Product of all primes plus 1', 'Sum of all primes', 'The largest prime'],
        correct: 1
      },
      {
        question: 'Why can\'t N be divided by any of the known primes?',
        options: ['N is too large', 'N always has remainder 1', 'N is prime itself', 'N is negative'],
        correct: 1
      },
      {
        question: 'What are the two possible cases for N?',
        options: ['Even or odd', 'Prime or composite', 'Positive or negative', 'Large or small'],
        correct: 1
      },
      {
        question: 'What does finding a new prime prove?',
        options: ['N is largest', 'Assumption was wrong', 'Primes are even', 'N equals p₁'],
        correct: 1
      }
    ],
    manuscript: [
      {
        question: 'What technique is used to derive the formula?',
        options: ['Write sum twice in reverse order', 'Use induction', 'Use calculus', 'Count rectangles'],
        correct: 0
      },
      {
        question: 'What is S in the proof?',
        options: ['Sum 1+2+...+n', 'Product 1×2×...×n', 'n(n+1)', 'n(n+1)/2'],
        correct: 0
      },
      {
        question: 'After adding S to itself in reverse, what does each pair sum to?',
        options: ['n', '2n', 'n+1', '2n+1'],
        correct: 2
      },
      {
        question: 'How many pairs of (n+1) are there?',
        options: ['n-1', 'n', 'n+1', '2n'],
        correct: 1
      },
      {
        question: 'Why do we divide by 2 at the end?',
        options: ['To simplify', 'We counted each number twice', 'To get average', 'Standard formula'],
        correct: 1
      }
    ],
    nebula: [
      {
        question: 'What is the definition of derivative used?',
        options: ['Power rule', 'Limit of difference quotient', 'Chain rule', 'Product rule'],
        correct: 1
      },
      {
        question: 'What is the difference quotient for x^n?',
        options: ['(x+h)^n - x^n', '[(x+h)^n - x^n]/h', 'nx^(n-1)', 'x^n - x^(n-1)'],
        correct: 1
      },
      {
        question: 'How is (x+h)^n expanded?',
        options: ['x^n + h^n', 'Binomial theorem', 'Distributive property', 'No expansion needed'],
        correct: 1
      },
      {
        question: 'After canceling, what is the leading term in the numerator?',
        options: ['x^n', 'nx^(n-1)h', 'h^n', 'nx^n'],
        correct: 1
      },
      {
        question: 'What happens to terms with h as h→0?',
        options: ['They become 1', 'They approach 0', 'They diverge', 'They become x'],
        correct: 1
      }
    ]
  },

  // Engagement questionnaire (7-point Likert scale)
  engagementItems: [
    'I found this visualization engaging',
    'I would want to use this visualization again',
    'This visualization held my attention',
    'I enjoyed exploring proofs with this visualization'
  ],

  // Timing constraints
  explorationTime: 180, // 3 minutes to explore proof
  questionTime: 60,     // 1 minute per question
  engagementTime: 60    // 1 minute for engagement survey
};

// Data structures
class StudySession {
  constructor(participantId) {
    this.participantId = participantId;
    this.orderGroup = this.assignOrderGroup(participantId);
    this.order = CONFIG.orderGroups[this.orderGroup];
    this.startTime = new Date().toISOString();
    this.demographics = {};
    this.tasks = [];
    this.finalRankings = [];
    this.qualitativeResponses = {};
    this.completedAt = null;
  }

  assignOrderGroup(pid) {
    // Extract numeric portion from participant ID
    const match = pid.match(/\d+/);
    const num = match ? parseInt(match[0]) : 0;
    return num % 4; // 4 order groups
  }

  addTask(mode, data) {
    this.tasks.push({
      visualizationMode: mode,
      ...data
    });
  }

  complete() {
    this.completedAt = new Date().toISOString();
  }

  save() {
    const dataDir = path.join(PROJECT_ROOT, 'data', 'user-study');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filename = `${this.participantId}_${Date.now()}.json`;
    const filepath = path.join(dataDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(this, null, 2), 'utf8');
    console.log(`\n✓ Data saved to: ${filepath}`);
    return filepath;
  }
}

class TaskData {
  constructor(mode) {
    this.mode = mode;
    this.startTime = Date.now();
    this.explorationDuration = 0;
    this.interactions = [];
    this.comprehensionResponses = [];
    this.comprehensionScore = 0;
    this.comprehensionTime = 0;
    this.engagementRatings = [];
    this.engagementScore = 0;
  }

  recordExploration(duration) {
    this.explorationDuration = duration;
  }

  recordInteraction(type, timestamp, data = {}) {
    this.interactions.push({
      type,
      timestamp,
      relativeTime: timestamp - this.startTime,
      ...data
    });
  }

  recordComprehensionResponse(questionIndex, response, correct, responseTime) {
    this.comprehensionResponses.push({
      questionIndex,
      response,
      correct,
      responseTime
    });

    if (correct) {
      this.comprehensionScore++;
    }
    this.comprehensionTime += responseTime;
  }

  recordEngagementRating(itemIndex, rating) {
    this.engagementRatings.push({
      itemIndex,
      item: CONFIG.engagementItems[itemIndex],
      rating
    });
  }

  calculateEngagementScore() {
    const sum = this.engagementRatings.reduce((acc, r) => acc + r.rating, 0);
    this.engagementScore = sum / this.engagementRatings.length;
  }
}

// Interactive CLI Interface
class UserStudyCLI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.session = null;
  }

  async question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async multipleChoice(prompt, options) {
    console.log(`\n${prompt}`);
    options.forEach((opt, i) => {
      console.log(`  ${i + 1}. ${opt}`);
    });

    let answer;
    do {
      answer = await this.question('Your answer (1-4): ');
    } while (!/^[1-4]$/.test(answer));

    return parseInt(answer) - 1;
  }

  async likertScale(statement) {
    console.log(`\n${statement}`);
    console.log('1 = Strongly Disagree, 7 = Strongly Agree');

    let rating;
    do {
      rating = await this.question('Your rating (1-7): ');
    } while (!/^[1-7]$/.test(rating));

    return parseInt(rating);
  }

  async run(participantId) {
    console.clear();
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     Formula Nebula - Proof Comprehension Study        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    this.session = new StudySession(participantId);

    // Introduction
    await this.introduction();

    // Demographics
    await this.collectDemographics();

    // Training
    await this.training();

    // Main tasks (4 visualizations)
    for (const mode of this.session.order) {
      await this.runTask(mode);
    }

    // Final rankings
    await this.finalRankings();

    // Qualitative interview
    await this.qualitativeInterview();

    // Complete and save
    this.session.complete();
    this.session.save();

    // Thank you
    await this.debrief();

    this.rl.close();
  }

  async introduction() {
    console.log('Welcome to the user study!\n');
    console.log('This study compares four different visualizations for understanding mathematical proofs.');
    console.log('You will explore proofs in each visualization and answer comprehension questions.\n');
    console.log(`Participant ID: ${this.session.participantId}`);
    console.log(`Order group: ${this.session.orderGroup + 1}`);
    console.log(`Presentation order: ${this.session.order.join(' → ')}\n`);

    await this.question('Press Enter to continue...');
  }

  async collectDemographics() {
    console.clear();
    console.log('=== Demographics ===\n');

    this.session.demographics.age = await this.question('Age: ');
    this.session.demographics.gender = await this.question('Gender (or prefer not to say): ');
    this.session.demographics.education = await this.question('Education level: ');
    this.session.demographics.field = await this.question('Field of study/work: ');
    this.session.demographics.mathBackground = await this.question('Math background (1=beginner, 5=expert): ');
    this.session.demographics.proofExperience = await this.question('Proof-reading experience (years): ');

    console.log('\n✓ Demographics recorded');
    await this.question('Press Enter to continue...');
  }

  async training() {
    console.clear();
    console.log('=== Training ===\n');
    console.log('Before we begin, let\'s briefly review each visualization mode:\n');

    console.log('1. ATLAS: Grid-based layout with hierarchical card structure');
    console.log('2. MAP: Interactive geographical metaphor with spatial navigation');
    console.log('3. MANUSCRIPT: Traditional linear document format');
    console.log('4. NEBULA: Particle-based 3D visualization\n');

    console.log('In each task, you will:');
    console.log('  • Explore the proof for 3 minutes');
    console.log('  • Answer 5 comprehension questions');
    console.log('  • Rate your engagement with the visualization\n');

    console.log('Note: In the actual study, you would interact with each visualization in a web browser.');
    console.log('This CLI version simulates the data collection process.\n');

    await this.question('Press Enter to begin the study...');
  }

  async runTask(mode) {
    console.clear();
    console.log(`═══════════════════════════════════════════════════════════`);
    console.log(`  Task ${this.session.tasks.length + 1}/4: ${mode.toUpperCase()} Visualization`);
    console.log(`═══════════════════════════════════════════════════════════\n`);

    const proof = CONFIG.proofs[mode];
    const taskData = new TaskData(mode);

    console.log(`Proof: ${proof.title}`);
    console.log(`Description: ${proof.description}\n`);

    // Exploration phase
    await this.explorationPhase(mode, taskData);

    // Comprehension questions
    await this.comprehensionPhase(mode, taskData);

    // Engagement survey
    await this.engagementPhase(mode, taskData);

    // Store task data
    this.session.addTask(mode, taskData);

    console.log(`\n✓ Task ${this.session.tasks.length} complete`);
    console.log(`  Comprehension: ${taskData.comprehensionScore}/5`);
    console.log(`  Engagement: ${taskData.engagementScore.toFixed(2)}/7\n`);

    await this.question('Press Enter to continue...');
  }

  async explorationPhase(mode, taskData) {
    console.log('--- Exploration Phase (3 minutes) ---\n');
    console.log('In the actual study, you would now interact with the visualization in a web browser.');
    console.log('Your interactions (clicks, hovers, zooms) would be automatically recorded.\n');

    const startTime = Date.now();

    // Simulate exploration
    console.log('Simulating exploration...');
    await this.sleep(2000);

    // Record simulated interactions
    const interactionTypes = ['click', 'hover', 'zoom', 'pan', 'scroll'];
    const numInteractions = Math.floor(Math.random() * 30) + 20; // 20-50 interactions

    for (let i = 0; i < numInteractions; i++) {
      const type = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
      const timestamp = startTime + Math.random() * CONFIG.explorationTime * 1000;
      taskData.recordInteraction(type, timestamp);
    }

    const explorationDuration = Date.now() - startTime;
    taskData.recordExploration(explorationDuration);

    console.log(`✓ Exploration complete (${interactionTypes.length} interaction types recorded)\n`);
  }

  async comprehensionPhase(mode, taskData) {
    console.log('--- Comprehension Questions (5 questions) ---\n');

    const questions = CONFIG.questions[mode];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const startTime = Date.now();

      const response = await this.multipleChoice(
        `Q${i + 1}. ${q.question}`,
        q.options
      );

      const responseTime = Date.now() - startTime;
      const correct = (response === q.correct);

      taskData.recordComprehensionResponse(i, response, correct, responseTime);

      // Provide immediate feedback
      if (correct) {
        console.log('✓ Correct!');
      } else {
        console.log(`✗ Incorrect. Correct answer: ${q.options[q.correct]}`);
      }
    }

    console.log(`\n✓ Comprehension phase complete: ${taskData.comprehensionScore}/5 correct\n`);
  }

  async engagementPhase(mode, taskData) {
    console.log('--- Engagement Survey ---\n');
    console.log('Please rate your experience with this visualization:\n');

    for (let i = 0; i < CONFIG.engagementItems.length; i++) {
      const rating = await this.likertScale(CONFIG.engagementItems[i]);
      taskData.recordEngagementRating(i, rating);
    }

    taskData.calculateEngagementScore();
    console.log(`\n✓ Engagement survey complete (mean: ${taskData.engagementScore.toFixed(2)}/7)\n`);
  }

  async finalRankings() {
    console.clear();
    console.log('=== Final Rankings ===\n');
    console.log('Now that you have experienced all four visualizations, please rank them:\n');

    const modes = ['Atlas', 'Map', 'Manuscript', 'Nebula'];

    console.log('Rank each visualization from 1 (best) to 4 (worst):\n');

    for (const mode of modes) {
      let rank;
      do {
        rank = await this.question(`${mode}: `);
      } while (!/^[1-4]$/.test(rank));

      this.session.finalRankings.push({
        visualization: mode.toLowerCase(),
        rank: parseInt(rank)
      });
    }

    console.log('\n✓ Rankings recorded\n');
    await this.question('Press Enter to continue...');
  }

  async qualitativeInterview() {
    console.clear();
    console.log('=== Qualitative Feedback ===\n');

    const questions = [
      'Which visualization did you prefer overall, and why?',
      'What did you find most helpful about each visualization?',
      'What was most frustrating or confusing about each visualization?',
      'For what types of proofs would each visualization be most useful?',
      'How would you improve each visualization?'
    ];

    for (let i = 0; i < questions.length; i++) {
      console.log(`\nQ${i + 1}. ${questions[i]}`);
      const response = await this.question('Your answer: ');
      this.session.qualitativeResponses[`q${i + 1}`] = response;
    }

    console.log('\n✓ Interview complete\n');
    await this.question('Press Enter to finish...');
  }

  async debrief() {
    console.clear();
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║              Study Complete - Thank You!               ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('Your participation helps us understand how different visualizations');
    console.log('support mathematical proof comprehension. Your data has been saved.');
    console.log('\nThank you for your time and insights!\n');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2 || args[0] !== '--participant') {
    console.error('Usage: node tools/user-study-runner.mjs --participant <id>');
    console.error('Example: node tools/user-study-runner.mjs --participant P001');
    process.exit(1);
  }

  const participantId = args[1];

  // Validate participant ID format
  if (!/^P\d{3}$/.test(participantId)) {
    console.error('Error: Participant ID must be in format P001, P002, etc.');
    process.exit(1);
  }

  const cli = new UserStudyCLI();
  await cli.run(participantId);
}

main().catch(console.error);
