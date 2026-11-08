#!/usr/bin/env node

/**
 * 自动化 CHANGELOG 生成脚本
 *
 * 用法：
 *   node scripts/generate-changelog.mjs              # 从 Git 提交生成
 *   node scripts/generate-changelog.mjs --from v0.0.3 --to v0.1.0  # 指定范围
 *   node scripts/generate-changelog.mjs --dry-run    # 预览不保存
 *
 * 输出：CHANGELOG.md（自动更新"未发布"部分）
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const fromTag = args[args.indexOf('--from') + 1] || null;
const toTag = args[args.indexOf('--to') + 1] || 'HEAD';

const CHANGELOG_PATH = resolve(process.cwd(), 'CHANGELOG.md');
const GIT_LOG_FORMAT = '%h %s %b';

/**
 * 执行 git 命令获取提交
 */
function getCommits(from, to) {
  try {
    const range = from ? `${from}..${to}` : `${to}`;
    const output = execSync(`git log ${range} --format="${GIT_LOG_FORMAT}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return output.trim().split('\n').filter(Boolean);
  } catch (err) {
    console.warn('⚠️  无法读取 Git 历史，可能不在仓库中');
    return [];
  }
}

/**
 * 解析提交消息到分类
 *
 * 约定：
 * - feat: 新功能
 * - fix: 修复
 * - perf: 性能改进
 * - refactor: 重构（不涉及功能改动）
 * - docs: 文档
 * - style: 样式（格式、空格等）
 * - test: 测试
 * - chore: 工具链、依赖更新等
 * - BREAKING CHANGE: 破坏性变更（在提交正文中用 BREAKING CHANGE: 标记）
 */
function categorizeCommits(commits) {
  const categories = {
    breaking: [],
    new: [],
    improve: [],
    fix: [],
    other: []
  };

  commits.forEach(line => {
    if (!line.trim()) return;

    const match = line.match(/^([a-f0-9]+)\s+(.+?)(\s+(.+))?$/);
    if (!match) return;

    const [, hash, subject, , body] = match;
    const entry = { hash: hash.slice(0, 7), subject, body: body || '' };

    // 检查破坏性变更
    if (entry.body.includes('BREAKING CHANGE:') || subject.includes('!:')) {
      categories.breaking.push(entry);
    }
    // 新功能
    else if (subject.startsWith('feat:') || subject.startsWith('feat!:')) {
      categories.new.push(entry);
    }
    // 改进（perf, refactor）
    else if (subject.match(/^(perf|refactor):/)) {
      categories.improve.push(entry);
    }
    // 修复
    else if (subject.startsWith('fix:')) {
      categories.fix.push(entry);
    }
    // 其他
    else {
      categories.other.push(entry);
    }
  });

  return categories;
}

/**
 * 格式化分类内容为 Markdown
 */
function formatCategory(label, entries, emoji = '') {
  if (entries.length === 0) return '';

  let md = `### ${emoji} ${label}\n\n`;
  entries.forEach(entry => {
    // 清理提交消息
    const cleanSubject = entry.subject
      .replace(/^(feat|fix|perf|refactor|docs|style|test|chore)(!)?:\s*/, '')
      .trim();

    md += `- **${cleanSubject}** — [\`${entry.hash}\`](https://github.com/user/repo/commit/${entry.hash})\n`;
  });
  md += '\n';

  return md;
}

/**
 * 生成新的"未发布"部分
 */
function generateUnreleasedSection(commits) {
  if (commits.length === 0) {
    return '### 新增\n\n- \n\n### 改进\n\n-\n\n### 修复\n\n-\n\n';
  }

  const categories = categorizeCommits(commits);
  let section = '';

  if (categories.breaking.length > 0) {
    section += '⚠️ **破坏性变更**\n\n';
    categories.breaking.forEach(e => {
      section += `- ${e.subject}\n`;
    });
    section += '\n';
  }

  section += formatCategory('新增', categories.new, '✨');
  section += formatCategory('改进', categories.improve, '🔧');
  section += formatCategory('修复', categories.fix, '🐛');

  if (categories.other.length > 0) {
    section += formatCategory('其他', categories.other, '📝');
  }

  return section;
}

/**
 * 更新 CHANGELOG.md 的"未发布"部分
 */
function updateChangelog(newSection) {
  const changelog = readFileSync(CHANGELOG_PATH, 'utf8');

  // 找到 "## 未发布" 部分。
  //
  // 这里原本写的是 (?=\n---\n## |\Z) —— 但 JavaScript 的正则**没有 \Z**，
  // 它被当成字面字母 Z 处理。后果是：只有当"未发布"段落后面跟着一个字母 Z
  // 时才会匹配，否则整段抓不到，脚本永远走 "找不到未发布部分" 的失败分支。
  // 正确的"到文末"写法是 $（配合下面的 m 标志：$ = 行尾；这里用 (?![\s\S]) 表示绝对结尾）。
  const unreleasePattern = /## 未发布\n\n([\s\S]*?)(?=\n---\n## |(?![\s\S]))/;
  const match = changelog.match(unreleasePattern);

  if (!match) {
    console.error('❌ 找不到 CHANGELOG.md 中的"未发布"部分');
    process.exit(1);
  }

  const updated = changelog.replace(unreleasePattern, `## 未发布\n\n${newSection}`);

  return updated;
}

/**
 * 主流程
 */
async function main() {
  console.log('📝 生成 CHANGELOG...\n');

  // 获取提交
  const commits = getCommits(fromTag, toTag);
  console.log(`📊 发现 ${commits.length} 个提交\n`);

  if (commits.length === 0) {
    console.warn('⚠️  没有找到提交，跳过更新');
    return;
  }

  // 生成新部分
  const newSection = generateUnreleasedSection(commits);
  console.log('预览:\n');
  console.log('## 未发布\n');
  console.log(newSection);

  // 更新文件
  if (!dryRun) {
    try {
      const updated = updateChangelog(newSection);
      writeFileSync(CHANGELOG_PATH, updated, 'utf8');
      console.log(`✅ 已更新 ${CHANGELOG_PATH}`);
    } catch (err) {
      console.error('❌ 更新失败:', err.message);
      process.exit(1);
    }
  } else {
    console.log('\n🔍 (--dry-run 模式，不保存)');
  }
}

main().catch(err => {
  console.error('❌ 错误:', err.message);
  process.exit(1);
});
