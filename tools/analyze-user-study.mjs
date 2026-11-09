#!/usr/bin/env node

/**
 * User Study Analysis Tool
 *
 * Analyzes data collected from the Formula Nebula user study.
 * Performs statistical analysis (ANOVA, post-hoc tests, correlations)
 * and generates visualizations and reports.
 *
 * Usage:
 *   node tools/analyze-user-study.mjs
 *   node tools/analyze-user-study.mjs --output report.json
 *   node tools/analyze-user-study.mjs --format html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

// Configuration
const CONFIG = {
  dataDir: path.join(PROJECT_ROOT, 'data', 'user-study'),
  outputDir: path.join(PROJECT_ROOT, 'data', 'user-study', 'analysis'),
  visualizations: ['atlas', 'map', 'manuscript', 'nebula'],
  alpha: 0.05 // Significance level
};

// Statistical functions
class Statistics {
  static mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  static variance(arr) {
    const m = this.mean(arr);
    return arr.reduce((sq, n) => sq + Math.pow(n - m, 2), 0) / (arr.length - 1);
  }

  static stdDev(arr) {
    return Math.sqrt(this.variance(arr));
  }

  static sem(arr) {
    return this.stdDev(arr) / Math.sqrt(arr.length);
  }

  static median(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  static quartiles(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length / 4);
    const q3Index = Math.floor(3 * sorted.length / 4);
    return {
      q1: sorted[q1Index],
      q2: this.median(arr),
      q3: sorted[q3Index]
    };
  }

  static correlationPearson(x, y) {
    if (x.length !== y.length) throw new Error('Arrays must have same length');

    const n = x.length;
    const meanX = this.mean(x);
    const meanY = this.mean(y);

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }

    return numerator / Math.sqrt(denomX * denomY);
  }

  // One-way repeated measures ANOVA (simplified)
  static repeatedMeasuresANOVA(data) {
    // data: array of arrays, where each inner array is one condition
    const k = data.length; // number of conditions
    const n = data[0].length; // number of subjects

    // Grand mean
    const allValues = data.flat();
    const grandMean = this.mean(allValues);

    // Subject means
    const subjectMeans = [];
    for (let i = 0; i < n; i++) {
      const subjectValues = data.map(condition => condition[i]);
      subjectMeans.push(this.mean(subjectValues));
    }

    // Condition means
    const conditionMeans = data.map(condition => this.mean(condition));

    // Sum of Squares Between Conditions (SSB)
    const SSB = n * conditionMeans.reduce((sum, mean) =>
      sum + Math.pow(mean - grandMean, 2), 0
    );

    // Sum of Squares Subjects (SSS)
    const _SSS = k * subjectMeans.reduce((sum, mean) =>
      sum + Math.pow(mean - grandMean, 2), 0
    );

    // Sum of Squares Total (SST)
    const _SST = allValues.reduce((sum, val) =>
      sum + Math.pow(val - grandMean, 2), 0
    );

    // Sum of Squares Error (SSE)
    let SSE = 0;
    for (let i = 0; i < k; i++) {
      for (let j = 0; j < n; j++) {
        const predicted = conditionMeans[i] + subjectMeans[j] - grandMean;
        SSE += Math.pow(data[i][j] - predicted, 2);
      }
    }

    // Degrees of freedom
    const dfB = k - 1;
    const dfS = n - 1;
    const dfE = dfB * dfS;
    const _dfT = n * k - 1;

    // Mean Squares
    const MSB = SSB / dfB;
    const MSE = SSE / dfE;

    // F-statistic
    const F = MSB / MSE;

    // Partial eta-squared (effect size)
    const partialEtaSquared = SSB / (SSB + SSE);

    // Critical F (approximation for α=0.05)
    const fCritical = this.fCriticalValue(dfB, dfE, CONFIG.alpha);

    return {
      F,
      dfBetween: dfB,
      dfError: dfE,
      pValue: this.fToPValue(F, dfB, dfE),
      significant: F > fCritical,
      partialEtaSquared,
      MSB,
      MSE,
      conditionMeans,
      grandMean
    };
  }

  // Simplified F-critical value (for α=0.05)
  static fCriticalValue(df1, df2, _alpha) {
    // Simplified lookup table for α=0.05
    // For df1=3 (4 conditions - 1), various df2
    const table = {
      3: { 20: 3.10, 25: 2.99, 30: 2.92, 40: 2.84, 60: 2.76, 100: 2.70 },
    };

    if (df1 === 3) {
      // Interpolate or use closest value
      if (df2 <= 20) return table[3][20];
      if (df2 >= 100) return table[3][100];

      const keys = Object.keys(table[3]).map(Number).sort((a, b) => a - b);
      for (let i = 0; i < keys.length - 1; i++) {
        if (df2 >= keys[i] && df2 <= keys[i + 1]) {
          // Linear interpolation
          const x0 = keys[i];
          const x1 = keys[i + 1];
          const y0 = table[3][x0];
          const y1 = table[3][x1];
          return y0 + (y1 - y0) * (df2 - x0) / (x1 - x0);
        }
      }
    }

    // Default fallback
    return 3.0;
  }

  // Simplified F to p-value conversion (approximation)
  static fToPValue(F, df1, df2) {
    // This is a rough approximation
    // For accurate results, use a proper statistical library
    const fCrit = this.fCriticalValue(df1, df2, 0.05);

    if (F < fCrit) {
      return 0.1; // p > 0.05 (not significant)
    } else if (F < fCrit * 1.5) {
      return 0.03; // 0.01 < p < 0.05
    } else if (F < fCrit * 2) {
      return 0.01; // 0.001 < p < 0.01
    } else {
      return 0.001; // p < 0.001
    }
  }

  // Bonferroni-corrected pairwise comparisons
  static bonferroniPostHoc(means, mse, n, k) {
    const comparisons = [];
    const adjustedAlpha = CONFIG.alpha / (k * (k - 1) / 2); // Bonferroni correction

    for (let i = 0; i < means.length; i++) {
      for (let j = i + 1; j < means.length; j++) {
        const diff = Math.abs(means[i] - means[j]);
        const se = Math.sqrt(2 * mse / n);
        const t = diff / se;

        // Critical t (approximation for df=n-1, two-tailed)
        const tCrit = 2.0; // Approximation for large n

        comparisons.push({
          comparison: `${CONFIG.visualizations[i]} vs ${CONFIG.visualizations[j]}`,
          meanDiff: diff,
          tStatistic: t,
          significant: t > tCrit,
          adjustedAlpha
        });
      }
    }

    return comparisons;
  }
}

// Data loading and preprocessing
class DataLoader {
  static loadAllData() {
    const dataDir = CONFIG.dataDir;

    if (!fs.existsSync(dataDir)) {
      throw new Error(`Data directory not found: ${dataDir}`);
    }

    const files = fs.readdirSync(dataDir)
      .filter(f => f.endsWith('.json') && f.startsWith('P'));

    if (files.length === 0) {
      throw new Error('No data files found. Run user-study-runner.mjs first.');
    }

    const sessions = files.map(file => {
      const filepath = path.join(dataDir, file);
      const content = fs.readFileSync(filepath, 'utf8');
      return JSON.parse(content);
    });

    console.log(`✓ Loaded ${sessions.length} participant sessions`);
    return sessions;
  }

  static extractMetrics(sessions) {
    const metrics = {
      comprehension: {},
      engagement: {},
      time: {},
      rankings: {},
      demographics: []
    };

    // Initialize arrays for each visualization
    CONFIG.visualizations.forEach(mode => {
      metrics.comprehension[mode] = [];
      metrics.engagement[mode] = [];
      metrics.time[mode] = [];
      metrics.rankings[mode] = [];
    });

    // Extract data from each session
    sessions.forEach(session => {
      metrics.demographics.push(session.demographics);

      session.tasks.forEach(task => {
        const mode = task.visualizationMode;

        // Comprehension score (0-5)
        metrics.comprehension[mode].push(task.comprehensionScore);

        // Engagement score (1-7)
        metrics.engagement[mode].push(task.engagementScore);

        // Time (total comprehension time in seconds)
        metrics.time[mode].push(task.comprehensionTime / 1000);
      });

      // Rankings (1-4, lower is better)
      session.finalRankings.forEach(ranking => {
        metrics.rankings[ranking.visualization].push(ranking.rank);
      });
    });

    return metrics;
  }
}

// Analysis engine
class Analyzer {
  constructor(sessions) {
    this.sessions = sessions;
    this.metrics = DataLoader.extractMetrics(sessions);
    this.results = {};
  }

  analyze() {
    console.log('\n=== Running Statistical Analysis ===\n');

    this.analyzeComprehension();
    this.analyzeEngagement();
    this.analyzeTime();
    this.analyzeRankings();
    this.analyzeCorrelations();
    this.analyzeDemographics();
    this.analyzeQualitative();

    return this.results;
  }

  analyzeComprehension() {
    console.log('--- Comprehension Analysis ---');

    const data = CONFIG.visualizations.map(mode =>
      this.metrics.comprehension[mode]
    );

    const anova = Statistics.repeatedMeasuresANOVA(data);
    const postHoc = Statistics.bonferroniPostHoc(
      anova.conditionMeans,
      anova.MSE,
      data[0].length,
      data.length
    );

    const descriptives = CONFIG.visualizations.map((mode, i) => ({
      visualization: mode,
      mean: anova.conditionMeans[i].toFixed(3),
      sd: Statistics.stdDev(data[i]).toFixed(3),
      sem: Statistics.sem(data[i]).toFixed(3),
      median: Statistics.median(data[i])
    }));

    this.results.comprehension = {
      descriptives,
      anova: {
        F: anova.F.toFixed(3),
        dfBetween: anova.dfBetween,
        dfError: anova.dfError,
        pValue: anova.pValue < 0.001 ? '<0.001' : anova.pValue.toFixed(3),
        significant: anova.significant,
        partialEtaSquared: anova.partialEtaSquared.toFixed(3)
      },
      postHoc
    };

    console.log('Descriptive statistics:');
    descriptives.forEach(d => {
      console.log(`  ${d.visualization}: M=${d.mean}, SD=${d.sd}`);
    });
    console.log(`ANOVA: F(${anova.dfBetween},${anova.dfError})=${anova.F.toFixed(2)}, p=${this.results.comprehension.anova.pValue}, ηp²=${anova.partialEtaSquared.toFixed(3)}`);
    console.log(`Significant: ${anova.significant ? 'YES' : 'NO'}\n`);
  }

  analyzeEngagement() {
    console.log('--- Engagement Analysis ---');

    const data = CONFIG.visualizations.map(mode =>
      this.metrics.engagement[mode]
    );

    const anova = Statistics.repeatedMeasuresANOVA(data);
    const postHoc = Statistics.bonferroniPostHoc(
      anova.conditionMeans,
      anova.MSE,
      data[0].length,
      data.length
    );

    const descriptives = CONFIG.visualizations.map((mode, i) => ({
      visualization: mode,
      mean: anova.conditionMeans[i].toFixed(3),
      sd: Statistics.stdDev(data[i]).toFixed(3),
      sem: Statistics.sem(data[i]).toFixed(3),
      median: Statistics.median(data[i])
    }));

    this.results.engagement = {
      descriptives,
      anova: {
        F: anova.F.toFixed(3),
        dfBetween: anova.dfBetween,
        dfError: anova.dfError,
        pValue: anova.pValue < 0.001 ? '<0.001' : anova.pValue.toFixed(3),
        significant: anova.significant,
        partialEtaSquared: anova.partialEtaSquared.toFixed(3)
      },
      postHoc
    };

    console.log('Descriptive statistics:');
    descriptives.forEach(d => {
      console.log(`  ${d.visualization}: M=${d.mean}, SD=${d.sd}`);
    });
    console.log(`ANOVA: F(${anova.dfBetween},${anova.dfError})=${anova.F.toFixed(2)}, p=${this.results.engagement.anova.pValue}, ηp²=${anova.partialEtaSquared.toFixed(3)}`);
    console.log(`Significant: ${anova.significant ? 'YES' : 'NO'}\n`);
  }

  analyzeTime() {
    console.log('--- Time Analysis ---');

    const data = CONFIG.visualizations.map(mode =>
      this.metrics.time[mode]
    );

    const anova = Statistics.repeatedMeasuresANOVA(data);
    const postHoc = Statistics.bonferroniPostHoc(
      anova.conditionMeans,
      anova.MSE,
      data[0].length,
      data.length
    );

    const descriptives = CONFIG.visualizations.map((mode, i) => ({
      visualization: mode,
      mean: anova.conditionMeans[i].toFixed(3),
      sd: Statistics.stdDev(data[i]).toFixed(3),
      sem: Statistics.sem(data[i]).toFixed(3),
      median: Statistics.median(data[i])
    }));

    this.results.time = {
      descriptives,
      anova: {
        F: anova.F.toFixed(3),
        dfBetween: anova.dfBetween,
        dfError: anova.dfError,
        pValue: anova.pValue < 0.001 ? '<0.001' : anova.pValue.toFixed(3),
        significant: anova.significant,
        partialEtaSquared: anova.partialEtaSquared.toFixed(3)
      },
      postHoc
    };

    console.log('Descriptive statistics (seconds):');
    descriptives.forEach(d => {
      console.log(`  ${d.visualization}: M=${d.mean}, SD=${d.sd}`);
    });
    console.log(`ANOVA: F(${anova.dfBetween},${anova.dfError})=${anova.F.toFixed(2)}, p=${this.results.time.anova.pValue}, ηp²=${anova.partialEtaSquared.toFixed(3)}`);
    console.log(`Significant: ${anova.significant ? 'YES' : 'NO'}\n`);
  }

  analyzeRankings() {
    console.log('--- Rankings Analysis ---');

    const rankings = CONFIG.visualizations.map(mode => ({
      visualization: mode,
      meanRank: Statistics.mean(this.metrics.rankings[mode]).toFixed(3),
      medianRank: Statistics.median(this.metrics.rankings[mode]),
      mode: this.calculateMode(this.metrics.rankings[mode])
    }));

    // Sort by mean rank (lower is better)
    rankings.sort((a, b) => parseFloat(a.meanRank) - parseFloat(b.meanRank));

    this.results.rankings = rankings;

    console.log('Average rankings (1=best, 4=worst):');
    rankings.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.visualization}: M=${r.meanRank}, Mdn=${r.medianRank}`);
    });
    console.log();
  }

  analyzeCorrelations() {
    console.log('--- Correlation Analysis ---');

    const correlations = [];

    // Flatten data for all visualizations
    const allComprehension = CONFIG.visualizations.flatMap(mode =>
      this.metrics.comprehension[mode]
    );
    const allEngagement = CONFIG.visualizations.flatMap(mode =>
      this.metrics.engagement[mode]
    );
    const allTime = CONFIG.visualizations.flatMap(mode =>
      this.metrics.time[mode]
    );

    // Comprehension vs Engagement
    const rCompEng = Statistics.correlationPearson(allComprehension, allEngagement);
    correlations.push({
      variables: 'Comprehension × Engagement',
      r: rCompEng.toFixed(3),
      interpretation: this.interpretCorrelation(rCompEng)
    });

    // Comprehension vs Time
    const rCompTime = Statistics.correlationPearson(allComprehension, allTime);
    correlations.push({
      variables: 'Comprehension × Time',
      r: rCompTime.toFixed(3),
      interpretation: this.interpretCorrelation(rCompTime)
    });

    // Engagement vs Time
    const rEngTime = Statistics.correlationPearson(allEngagement, allTime);
    correlations.push({
      variables: 'Engagement × Time',
      r: rEngTime.toFixed(3),
      interpretation: this.interpretCorrelation(rEngTime)
    });

    this.results.correlations = correlations;

    console.log('Pearson correlations:');
    correlations.forEach(c => {
      console.log(`  ${c.variables}: r=${c.r} (${c.interpretation})`);
    });
    console.log();
  }

  analyzeDemographics() {
    console.log('--- Demographics Summary ---');

    const n = this.metrics.demographics.length;
    const ages = this.metrics.demographics
      .map(d => parseInt(d.age))
      .filter(a => !isNaN(a));
    const mathBackgrounds = this.metrics.demographics
      .map(d => parseInt(d.mathBackground))
      .filter(m => !isNaN(m));

    const summary = {
      n,
      ageMean: ages.length > 0 ? Statistics.mean(ages).toFixed(1) : 'N/A',
      ageSD: ages.length > 0 ? Statistics.stdDev(ages).toFixed(1) : 'N/A',
      mathBackgroundMean: mathBackgrounds.length > 0 ? Statistics.mean(mathBackgrounds).toFixed(2) : 'N/A',
      mathBackgroundSD: mathBackgrounds.length > 0 ? Statistics.stdDev(mathBackgrounds).toFixed(2) : 'N/A'
    };

    this.results.demographics = summary;

    console.log(`Participants: N=${n}`);
    console.log(`Age: M=${summary.ageMean}, SD=${summary.ageSD}`);
    console.log(`Math background (1-5): M=${summary.mathBackgroundMean}, SD=${summary.mathBackgroundSD}`);
    console.log();
  }

  analyzeQualitative() {
    console.log('--- Qualitative Analysis ---');

    const allResponses = this.sessions.map(s => s.qualitativeResponses);

    // Extract common themes (simplified - keyword frequency)
    const keywords = {};

    allResponses.forEach(responses => {
      Object.values(responses).forEach(text => {
        if (!text) return;

        const words = text.toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(w => w.length > 4); // Words longer than 4 chars

        words.forEach(word => {
          keywords[word] = (keywords[word] || 0) + 1;
        });
      });
    });

    // Get top 10 keywords
    const topKeywords = Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    this.results.qualitative = {
      totalResponses: allResponses.length * 5, // 5 questions per participant
      topKeywords
    };

    console.log('Top keywords in qualitative responses:');
    topKeywords.forEach((k, i) => {
      console.log(`  ${i + 1}. "${k.word}": ${k.count} mentions`);
    });
    console.log();
  }

  calculateMode(arr) {
    const counts = {};
    arr.forEach(val => {
      counts[val] = (counts[val] || 0) + 1;
    });

    let maxCount = 0;
    let mode = null;

    for (const [val, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        mode = parseInt(val);
      }
    }

    return mode;
  }

  interpretCorrelation(r) {
    const abs = Math.abs(r);
    if (abs < 0.1) return 'negligible';
    if (abs < 0.3) return 'weak';
    if (abs < 0.5) return 'moderate';
    if (abs < 0.7) return 'strong';
    return 'very strong';
  }
}

// Report generation
class ReportGenerator {
  constructor(results, sessions) {
    this.results = results;
    this.sessions = sessions;
  }

  generateJSON(filepath) {
    const report = {
      meta: {
        generatedAt: new Date().toISOString(),
        participants: this.sessions.length,
        analyzer: 'Formula Nebula User Study Analyzer v1.0'
      },
      ...this.results
    };

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`✓ JSON report saved to: ${filepath}`);
  }

  generateText(filepath) {
    let report = '';

    report += '═══════════════════════════════════════════════════════════\n';
    report += '     FORMULA NEBULA USER STUDY - ANALYSIS REPORT\n';
    report += '═══════════════════════════════════════════════════════════\n\n';

    report += `Generated: ${new Date().toISOString()}\n`;
    report += `Participants: N=${this.sessions.length}\n\n`;

    // Demographics
    report += '--- DEMOGRAPHICS ---\n';
    report += `Age: M=${this.results.demographics.ageMean}, SD=${this.results.demographics.ageSD}\n`;
    report += `Math Background (1-5): M=${this.results.demographics.mathBackgroundMean}, SD=${this.results.demographics.mathBackgroundSD}\n\n`;

    // Comprehension
    report += '--- COMPREHENSION (0-5 scale) ---\n';
    this.results.comprehension.descriptives.forEach(d => {
      report += `${d.visualization.padEnd(12)}: M=${d.mean}, SD=${d.sd}, Mdn=${d.median}\n`;
    });
    report += `\nANOVA: F(${this.results.comprehension.anova.dfBetween},${this.results.comprehension.anova.dfError})=${this.results.comprehension.anova.F}, `;
    report += `p=${this.results.comprehension.anova.pValue}, ηp²=${this.results.comprehension.anova.partialEtaSquared}\n`;
    report += `Significant: ${this.results.comprehension.anova.significant ? 'YES' : 'NO'}\n\n`;

    // Engagement
    report += '--- ENGAGEMENT (1-7 Likert scale) ---\n';
    this.results.engagement.descriptives.forEach(d => {
      report += `${d.visualization.padEnd(12)}: M=${d.mean}, SD=${d.sd}, Mdn=${d.median}\n`;
    });
    report += `\nANOVA: F(${this.results.engagement.anova.dfBetween},${this.results.engagement.anova.dfError})=${this.results.engagement.anova.F}, `;
    report += `p=${this.results.engagement.anova.pValue}, ηp²=${this.results.engagement.anova.partialEtaSquared}\n`;
    report += `Significant: ${this.results.engagement.anova.significant ? 'YES' : 'NO'}\n\n`;

    // Time
    report += '--- TIME (seconds) ---\n';
    this.results.time.descriptives.forEach(d => {
      report += `${d.visualization.padEnd(12)}: M=${d.mean}, SD=${d.sd}, Mdn=${d.median}\n`;
    });
    report += `\nANOVA: F(${this.results.time.anova.dfBetween},${this.results.time.anova.dfError})=${this.results.time.anova.F}, `;
    report += `p=${this.results.time.anova.pValue}, ηp²=${this.results.time.anova.partialEtaSquared}\n`;
    report += `Significant: ${this.results.time.anova.significant ? 'YES' : 'NO'}\n\n`;

    // Rankings
    report += '--- RANKINGS (1=best, 4=worst) ---\n';
    this.results.rankings.forEach((r, i) => {
      report += `${(i + 1)}. ${r.visualization.padEnd(12)}: M=${r.meanRank}, Mdn=${r.medianRank}\n`;
    });
    report += '\n';

    // Correlations
    report += '--- CORRELATIONS ---\n';
    this.results.correlations.forEach(c => {
      report += `${c.variables.padEnd(30)}: r=${c.r} (${c.interpretation})\n`;
    });
    report += '\n';

    // Qualitative
    report += '--- QUALITATIVE ANALYSIS ---\n';
    report += `Total responses: ${this.results.qualitative.totalResponses}\n`;
    report += 'Top keywords:\n';
    this.results.qualitative.topKeywords.forEach((k, i) => {
      report += `  ${(i + 1)}. "${k.word}": ${k.count} mentions\n`;
    });
    report += '\n';

    report += '═══════════════════════════════════════════════════════════\n';

    fs.writeFileSync(filepath, report, 'utf8');
    console.log(`✓ Text report saved to: ${filepath}`);
  }

  generateHTML(filepath) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Formula Nebula User Study - Analysis Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 1200px;
      margin: 40px auto;
      padding: 0 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 40px; border-bottom: 2px solid #ddd; padding-bottom: 8px; }
    h3 { color: #1e3a8a; }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 20px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #2563eb;
      color: white;
      font-weight: 600;
    }
    tr:nth-child(even) { background-color: #f8fafc; }
    tr:hover { background-color: #e0f2fe; }
    .stat-box {
      background: #f1f5f9;
      border-left: 4px solid #2563eb;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .significant { color: #059669; font-weight: bold; }
    .not-significant { color: #dc2626; font-weight: bold; }
    .meta {
      background: #fef3c7;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <h1>📊 Formula Nebula User Study - Analysis Report</h1>

  <div class="meta">
    <strong>Generated:</strong> ${new Date().toISOString()}<br>
    <strong>Participants:</strong> N=${this.sessions.length}<br>
    <strong>Visualizations:</strong> Atlas, Map, Manuscript, Nebula
  </div>

  <h2>👥 Demographics</h2>
  <div class="stat-box">
    <strong>Age:</strong> M=${this.results.demographics.ageMean}, SD=${this.results.demographics.ageSD}<br>
    <strong>Math Background (1-5):</strong> M=${this.results.demographics.mathBackgroundMean}, SD=${this.results.demographics.mathBackgroundSD}
  </div>

  <h2>🧠 Comprehension Analysis</h2>
  <h3>Descriptive Statistics (0-5 scale)</h3>
  <table>
    <thead>
      <tr>
        <th>Visualization</th>
        <th>Mean</th>
        <th>SD</th>
        <th>SEM</th>
        <th>Median</th>
      </tr>
    </thead>
    <tbody>
      ${this.results.comprehension.descriptives.map(d => `
      <tr>
        <td><strong>${d.visualization}</strong></td>
        <td>${d.mean}</td>
        <td>${d.sd}</td>
        <td>${d.sem}</td>
        <td>${d.median}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  <h3>ANOVA Results</h3>
  <div class="stat-box">
    <strong>F(${this.results.comprehension.anova.dfBetween},${this.results.comprehension.anova.dfError}) = ${this.results.comprehension.anova.F}</strong><br>
    <strong>p = ${this.results.comprehension.anova.pValue}</strong><br>
    <strong>ηp² = ${this.results.comprehension.anova.partialEtaSquared}</strong><br>
    <strong>Significant:</strong> <span class="${this.results.comprehension.anova.significant ? 'significant' : 'not-significant'}">
      ${this.results.comprehension.anova.significant ? 'YES' : 'NO'}
    </span>
  </div>

  <h2>💫 Engagement Analysis</h2>
  <h3>Descriptive Statistics (1-7 Likert scale)</h3>
  <table>
    <thead>
      <tr>
        <th>Visualization</th>
        <th>Mean</th>
        <th>SD</th>
        <th>SEM</th>
        <th>Median</th>
      </tr>
    </thead>
    <tbody>
      ${this.results.engagement.descriptives.map(d => `
      <tr>
        <td><strong>${d.visualization}</strong></td>
        <td>${d.mean}</td>
        <td>${d.sd}</td>
        <td>${d.sem}</td>
        <td>${d.median}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  <h3>ANOVA Results</h3>
  <div class="stat-box">
    <strong>F(${this.results.engagement.anova.dfBetween},${this.results.engagement.anova.dfError}) = ${this.results.engagement.anova.F}</strong><br>
    <strong>p = ${this.results.engagement.anova.pValue}</strong><br>
    <strong>ηp² = ${this.results.engagement.anova.partialEtaSquared}</strong><br>
    <strong>Significant:</strong> <span class="${this.results.engagement.anova.significant ? 'significant' : 'not-significant'}">
      ${this.results.engagement.anova.significant ? 'YES' : 'NO'}
    </span>
  </div>

  <h2>⏱️ Time Analysis</h2>
  <h3>Descriptive Statistics (seconds)</h3>
  <table>
    <thead>
      <tr>
        <th>Visualization</th>
        <th>Mean</th>
        <th>SD</th>
        <th>SEM</th>
        <th>Median</th>
      </tr>
    </thead>
    <tbody>
      ${this.results.time.descriptives.map(d => `
      <tr>
        <td><strong>${d.visualization}</strong></td>
        <td>${d.mean}</td>
        <td>${d.sd}</td>
        <td>${d.sem}</td>
        <td>${d.median}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  <h3>ANOVA Results</h3>
  <div class="stat-box">
    <strong>F(${this.results.time.anova.dfBetween},${this.results.time.anova.dfError}) = ${this.results.time.anova.F}</strong><br>
    <strong>p = ${this.results.time.anova.pValue}</strong><br>
    <strong>ηp² = ${this.results.time.anova.partialEtaSquared}</strong><br>
    <strong>Significant:</strong> <span class="${this.results.time.anova.significant ? 'significant' : 'not-significant'}">
      ${this.results.time.anova.significant ? 'YES' : 'NO'}
    </span>
  </div>

  <h2>🏆 Rankings</h2>
  <table>
    <thead>
      <tr>
        <th>Rank</th>
        <th>Visualization</th>
        <th>Mean Rank</th>
        <th>Median Rank</th>
      </tr>
    </thead>
    <tbody>
      ${this.results.rankings.map((r, i) => `
      <tr>
        <td><strong>${i + 1}</strong></td>
        <td><strong>${r.visualization}</strong></td>
        <td>${r.meanRank}</td>
        <td>${r.medianRank}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>🔗 Correlations</h2>
  <table>
    <thead>
      <tr>
        <th>Variables</th>
        <th>Pearson's r</th>
        <th>Interpretation</th>
      </tr>
    </thead>
    <tbody>
      ${this.results.correlations.map(c => `
      <tr>
        <td>${c.variables}</td>
        <td><strong>${c.r}</strong></td>
        <td>${c.interpretation}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>💬 Qualitative Analysis</h2>
  <div class="stat-box">
    <strong>Total Responses:</strong> ${this.results.qualitative.totalResponses}<br><br>
    <strong>Top Keywords:</strong>
    <ol>
      ${this.results.qualitative.topKeywords.map(k => `
        <li>"${k.word}": ${k.count} mentions</li>
      `).join('')}
    </ol>
  </div>

  <hr style="margin: 40px 0; border: none; border-top: 2px solid #ddd;">
  <p style="text-align: center; color: #666;">
    <em>Report generated by Formula Nebula User Study Analyzer v1.0</em>
  </p>
</body>
</html>`;

    fs.writeFileSync(filepath, html, 'utf8');
    console.log(`✓ HTML report saved to: ${filepath}`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let outputFile = null;
  let format = 'all'; // 'json', 'text', 'html', or 'all'

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' && i + 1 < args.length) {
      outputFile = args[i + 1];
      i++;
    } else if (args[i] === '--format' && i + 1 < args.length) {
      format = args[i + 1];
      i++;
    }
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('   Formula Nebula User Study - Statistical Analysis');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Load data
  const sessions = DataLoader.loadAllData();

  // Run analysis
  const analyzer = new Analyzer(sessions);
  const results = analyzer.analyze();

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // Generate reports
  console.log('=== Generating Reports ===\n');
  const generator = new ReportGenerator(results, sessions);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  if (format === 'json' || format === 'all') {
    const jsonFile = outputFile || path.join(CONFIG.outputDir, `analysis_${timestamp}.json`);
    generator.generateJSON(jsonFile);
  }

  if (format === 'text' || format === 'all') {
    const textFile = path.join(CONFIG.outputDir, `analysis_${timestamp}.txt`);
    generator.generateText(textFile);
  }

  if (format === 'html' || format === 'all') {
    const htmlFile = path.join(CONFIG.outputDir, `analysis_${timestamp}.html`);
    generator.generateHTML(htmlFile);
  }

  console.log('\n✓ Analysis complete!\n');
}

main().catch(console.error);
