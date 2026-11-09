#!/usr/bin/env node

/**
 * 发布笔记生成助手
 *
 * 用法：
 *   node scripts/create-release-notes.mjs v0.1.0           # 创建发布笔记
 *   node scripts/create-release-notes.mjs v0.1.0 --draft   # 仅预览，不创建文件
 *
 * 输出：docs/releases/v0.1.0-release-notes.md（基于模板填充）
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const args = process.argv.slice(2);
const version = args[0];
const draftMode = args.includes('--draft');

if (!version || !version.match(/^v\d+\.\d+\.\d+$/)) {
  console.error('❌ 用法: node scripts/create-release-notes.mjs v0.1.0 [--draft]');
  process.exit(1);
}

const TEMPLATE_PATH = resolve(process.cwd(), 'RELEASE-NOTES-TEMPLATE.md');
const OUTPUT_DIR = resolve(process.cwd(), 'docs', 'releases');
const OUTPUT_PATH = resolve(OUTPUT_DIR, `${version}-release-notes.md`);

/**
 * 生成本次发布的笔记内容
 */
function generateReleaseNotes(version) {
  const now = new Date().toISOString().split('T')[0];
  const versionNum = version.slice(1); // v0.1.0 → 0.1.0
  const prevVersion = `v${getPrevVersion(versionNum)}`;

  const template = readFileSync(TEMPLATE_PATH, 'utf8');

  const content = template
    // 填充版本信息
    .replace(/`v0\.x\.y`/g, `\`${version}\``)
    .replace(/YYYY-MM-DD/g, now)
    .replace(/release\/v0\.x\.y/g, `release/${version}`)
    .replace(/v0\.\(x-1\)\.z/g, prevVersion)
    .replace(/v0\.(x-1)\.z/g, prevVersion)

    // 删除默认占位符
    .replace(/\[一句话描述[\s\S]*?\n\n/, '') // 示例
    .replace(/例如:\n[\s\S]*?\n\n/, '') // 示例

    // 填充常用章节
    .replace(/### ✨ 新增\n\n- \n\n/, `### ✨ 新增\n\n<!-- 在此列举新功能 -->\n\n`)
    .replace(/### 🔧 改进\n\n- \n\n/, `### 🔧 改进\n\n<!-- 在此列举改进 -->\n\n`)
    .replace(/### 🐛 修复\n\n- \n\n/, `### 🐛 修复\n\n<!-- 在此列举修复 -->\n\n`);

  return content;
}

/**
 * 从 package.json 推断上个版本号
 */
function getPrevVersion(_current) {
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    const ver = pkg.version;

    // 简单递减 patch 版本
    const [major, minor, patch] = ver.split('.').map(Number);
    if (patch > 0) {
      return `${major}.${minor}.${patch - 1}`;
    }
    if (minor > 0) {
      return `${major}.${minor - 1}.99`;
    }
    return `${major - 1}.99.99`;
  } catch {
    return '0.0.3'; // 默认
  }
}

/**
 * 主流程
 */
function main() {
  console.log(`📝 生成发布笔记 ${version}\n`);

  // 检查模板
  if (!existsSync(TEMPLATE_PATH)) {
    console.error(`❌ 找不到模板: ${TEMPLATE_PATH}`);
    process.exit(1);
  }

  // 生成内容
  const content = generateReleaseNotes(version);

  if (draftMode) {
    console.log('📄 预览 (--draft 模式):\n');
    console.log(content.slice(0, 500) + '...\n');
    console.log('✅ 预览完成，未保存文件');
    return;
  }

  // 保存文件
  try {
    if (!existsSync(OUTPUT_DIR)) {
      mkdirSync(OUTPUT_DIR, { recursive: true });
      console.log(`📁 创建目录: ${OUTPUT_DIR}`);
    }

    if (existsSync(OUTPUT_PATH)) {
      console.warn(`⚠️  文件已存在: ${OUTPUT_PATH}`);
      console.warn('💡 使用 --draft 预览，或手动删除旧文件后重试');
      return;
    }

    writeFileSync(OUTPUT_PATH, content, 'utf8');
    console.log(`✅ 已创建: ${OUTPUT_PATH}`);
    console.log(`\n📌 下一步:`);
    console.log(`   1. 编辑此文件，填充新增/改进/修复等内容`);
    console.log(`   2. 运行: npm run verify  (验证数据和脚本)`);
    console.log(`   3. 提交并标记: git tag ${version}`);
    console.log(`   4. 推送: git push origin main --tags`);
  } catch (err) {
    console.error(`❌ 创建失败: ${err.message}`);
    process.exit(1);
  }
}

main();
