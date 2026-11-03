#!/usr/bin/env node

/**
 * Quality Check Script
 * 综合质量检查脚本
 *
 * Runs all quality checks in sequence and reports overall project health
 * 按顺序运行所有质量检查并报告整体项目健康状况
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function header(title) {
  log('\n' + '='.repeat(70), 'cyan');
  log(`  ${title}`, 'bright');
  log('='.repeat(70), 'cyan');
}

function runCommand(cmd, description, optional = false) {
  try {
    log(`\n▶ ${description}...`, 'blue');
    const output = execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: optional ? 'pipe' : 'inherit'
    });
    log(`✓ ${description} passed`, 'green');
    return { success: true, output };
  } catch (error) {
    if (optional) {
      log(`⚠ ${description} skipped (optional)`, 'yellow');
      return { success: true, skipped: true };
    }
    log(`✗ ${description} failed`, 'red');
    return { success: false, error: error.message };
  }
}

function checkFile(filepath, description) {
  const fullPath = join(ROOT, filepath);
  const exists = existsSync(fullPath);

  if (exists) {
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    log(`✗ ${description} missing: ${filepath}`, 'red');
    return false;
  }
}

function countFiles(dir, extension) {
  let count = 0;
  try {
    const files = readdirSync(dir, { recursive: true });
    count = files.filter(f => f.endsWith(extension)).length;
  } catch (e) {
    // Directory doesn't exist
  }
  return count;
}

function getFileSize(filepath) {
  try {
    const stats = statSync(filepath);
    return stats.size;
  } catch (e) {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

// Main quality checks
const results = {
  checks: [],
  passed: 0,
  failed: 0,
  skipped: 0,
};

// 1. Project Structure
header('1. PROJECT STRUCTURE 项目结构');

const requiredFiles = [
  ['package.json', 'package.json exists'],
  ['README.md', 'README.md exists'],
  ['LICENSE', 'LICENSE file exists'],
  ['CONTRIBUTING.md', 'Contributing guide exists'],
  ['CODE_OF_CONDUCT.md', 'Code of conduct exists'],
  ['SECURITY.md', 'Security policy exists'],
  ['ROADMAP.md', 'Roadmap exists'],
  ['.gitignore', '.gitignore exists'],
  ['vite.config.js', 'Vite config exists'],
  ['eslint.config.js', 'ESLint config exists'],
  ['.prettierrc.json', 'Prettier config exists'],
];

requiredFiles.forEach(([file, desc]) => {
  const passed = checkFile(file, desc);
  results.checks.push({ name: desc, passed });
  passed ? results.passed++ : results.failed++;
});

// 2. Documentation
header('2. DOCUMENTATION 文档');

const docFiles = [
  ['docs/API.md', 'API documentation'],
  ['docs/TUTORIAL.md', 'Tutorial'],
  ['ACKNOWLEDGMENTS.md', 'Acknowledgments'],
  ['CONTRIBUTORS.md', 'Contributors list'],
  ['LICENSE-THIRD-PARTY.md', 'Third-party licenses'],
];

docFiles.forEach(([file, desc]) => {
  const passed = checkFile(file, desc);
  results.checks.push({ name: desc, passed });
  passed ? results.passed++ : results.failed++;
});

// Count documentation lines
const docCount = ['README.md', 'docs/API.md', 'docs/TUTORIAL.md', 'CONTRIBUTING.md']
  .reduce((sum, file) => {
    const path = join(ROOT, file);
    if (existsSync(path)) {
      const lines = readFileSync(path, 'utf8').split('\n').length;
      return sum + lines;
    }
    return sum;
  }, 0);

log(`\nℹ Total documentation lines: ${docCount}`, 'cyan');

// 3. Code Quality
header('3. CODE QUALITY 代码质量');

// Count JavaScript files
const jsCount = countFiles(join(ROOT, 'src'), '.js') +
                countFiles(join(ROOT, 'src'), '.mjs');
log(`ℹ JavaScript files: ${jsCount}`, 'cyan');

// ESLint check
const lintResult = runCommand('npm run lint', 'ESLint check', true);
results.checks.push({ name: 'ESLint', passed: lintResult.success });
lintResult.success ? results.passed++ : results.failed++;
if (lintResult.skipped) results.skipped++;

// Prettier check
const prettierResult = runCommand('npm run format:check', 'Prettier format check', true);
results.checks.push({ name: 'Prettier', passed: prettierResult.success });
prettierResult.success ? results.passed++ : results.failed++;
if (prettierResult.skipped) results.skipped++;

// 4. Data Integrity
header('4. DATA INTEGRITY 数据完整性');

const dataResult = runCommand('npm run check-data', 'Data integrity check');
results.checks.push({ name: 'Data integrity', passed: dataResult.success });
dataResult.success ? results.passed++ : results.failed++;

// 5. Build
header('5. BUILD 构建');

const buildResult = runCommand('npm run build', 'Production build');
results.checks.push({ name: 'Build', passed: buildResult.success });
buildResult.success ? results.passed++ : results.failed++;

// Check build output
if (buildResult.success) {
  const distPath = join(ROOT, 'dist');
  const distExists = existsSync(distPath);

  if (distExists) {
    log('✓ dist/ directory created', 'green');

    // Count built files
    const htmlCount = countFiles(distPath, '.html');
    const jsCount = countFiles(distPath, '.js');
    const cssCount = countFiles(distPath, '.css');

    log(`  HTML files: ${htmlCount}`, 'cyan');
    log(`  JS files: ${jsCount}`, 'cyan');
    log(`  CSS files: ${cssCount}`, 'cyan');
  } else {
    log('✗ dist/ directory not found', 'red');
  }
}

// 6. Dependencies
header('6. DEPENDENCIES 依赖项');

try {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const depCount = Object.keys(pkg.dependencies || {}).length;
  const devDepCount = Object.keys(pkg.devDependencies || {}).length;

  log(`✓ Dependencies: ${depCount}`, 'green');
  log(`✓ Dev dependencies: ${devDepCount}`, 'green');

  // Check for npm audit
  const auditResult = runCommand('npm audit --production', 'Security audit', true);
  results.checks.push({ name: 'Security audit', passed: auditResult.success });
  auditResult.success ? results.passed++ : results.failed++;
} catch (e) {
  log('✗ Failed to read package.json', 'red');
  results.failed++;
}

// 7. Git
header('7. GIT STATUS');

try {
  const gitStatus = execSync('git status --porcelain', {
    cwd: ROOT,
    encoding: 'utf8'
  });

  if (gitStatus.trim()) {
    log('⚠ Uncommitted changes:', 'yellow');
    console.log(gitStatus);
  } else {
    log('✓ Working directory clean', 'green');
  }

  const branch = execSync('git rev-parse --abbrev-ref HEAD', {
    cwd: ROOT,
    encoding: 'utf8'
  }).trim();
  log(`ℹ Current branch: ${branch}`, 'cyan');
} catch (e) {
  log('⚠ Not a git repository', 'yellow');
}

// 8. CI/CD Configuration
header('8. CI/CD CONFIGURATION');

const ciFiles = [
  ['.github/workflows/ci.yml', 'CI workflow'],
  ['.github/workflows/performance.yml', 'Performance workflow'],
  ['.github/workflows/dependency-review.yml', 'Dependency review'],
  ['.github/workflows/codeql.yml', 'CodeQL security'],
];

ciFiles.forEach(([file, desc]) => {
  const passed = checkFile(file, desc);
  results.checks.push({ name: desc, passed });
  passed ? results.passed++ : results.failed++;
});

// 9. Issue & PR Templates
header('9. ISSUE & PR TEMPLATES');

const templateFiles = [
  ['.github/PULL_REQUEST_TEMPLATE.md', 'PR template'],
  ['.github/ISSUE_TEMPLATE/bug_report.md', 'Bug report template'],
  ['.github/ISSUE_TEMPLATE/feature_request.md', 'Feature request template'],
  ['.github/ISSUE_TEMPLATE/config.yml', 'Issue template config'],
];

templateFiles.forEach(([file, desc]) => {
  const passed = checkFile(file, desc);
  results.checks.push({ name: desc, passed });
  passed ? results.passed++ : results.failed++;
});

// 10. Summary
header('10. SUMMARY 总结');

const total = results.passed + results.failed;
const percentage = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;

log(`\nTotal checks: ${total}`, 'cyan');
log(`Passed: ${results.passed}`, 'green');
log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
if (results.skipped > 0) {
  log(`Skipped: ${results.skipped}`, 'yellow');
}
log(`Success rate: ${percentage}%`, percentage >= 90 ? 'green' : percentage >= 70 ? 'yellow' : 'red');

// Overall status
log('\n' + '='.repeat(70), 'cyan');
if (results.failed === 0) {
  log('🎉 ALL QUALITY CHECKS PASSED! 所有质量检查通过！', 'green');
  log('Project is in excellent health. 项目健康状况良好。', 'green');
} else if (percentage >= 90) {
  log('✅ MOSTLY PASSED 大部分通过', 'yellow');
  log(`${results.failed} check(s) failed. Please review. 请审查失败的检查。`, 'yellow');
} else if (percentage >= 70) {
  log('⚠️  NEEDS ATTENTION 需要关注', 'yellow');
  log(`${results.failed} check(s) failed. Action required. 需要采取行动。`, 'yellow');
} else {
  log('❌ CRITICAL ISSUES 关键问题', 'red');
  log(`${results.failed} check(s) failed. Immediate action required. 需要立即采取行动。`, 'red');
}
log('='.repeat(70), 'cyan');

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);
