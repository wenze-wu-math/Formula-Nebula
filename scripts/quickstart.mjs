#!/usr/bin/env node

/**
 * 快速启动助手
 * 用途: npm run quickstart
 * 功能: 一键检查环境、安装依赖、启动开发服务器
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(level, message) {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    info: `${colors.cyan}ℹ${colors.reset}`,
    success: `${colors.green}✓${colors.reset}`,
    warning: `${colors.yellow}⚠${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
  }[level] || '•';

  console.log(`${prefix} ${message}`);
}

async function runCommand(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      stdio: 'inherit',
      ...options,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function main() {
  console.clear();

  console.log(
    `\n${colors.cyan}${colors.bright}╭─────────────────────────────────────────╮${colors.reset}`
  );
  console.log(
    `${colors.cyan}${colors.bright}│   公式诗云 · Formula Nebula 快速启动      │${colors.reset}`
  );
  console.log(
    `${colors.cyan}${colors.bright}╰─────────────────────────────────────────╯${colors.reset}\n`
  );

  try {
    // 检查 Node.js
    log('info', '检查环境...');
    const nodeVersion = process.version;
    log('success', `Node.js ${nodeVersion}`);

    // 检查项目
    const projectRoot = path.resolve(import.meta.url, '../../');
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (!existsSync(packageJsonPath)) {
      log('error', '找不到 package.json');
      process.exit(1);
    }

    // 检查依赖
    const nodeModulesPath = path.join(projectRoot, 'node_modules');
    if (!existsSync(nodeModulesPath)) {
      log('warning', '依赖未安装');
      log('info', '正在安装依赖...');
      try {
        await runCommand('npm', ['install', '--legacy-peer-deps'], {
          cwd: projectRoot,
        });
        log('success', '依赖安装完成');
      } catch (error) {
        log('error', 'npm install 失败');
        process.exit(1);
      }
    } else {
      log('success', '依赖已安装');
    }

    console.log();

    // 启动开发服务器
    log('info', '启动开发服务器...');
    console.log(`   ${colors.cyan}→ http://localhost:5175${colors.reset}`);
    console.log(
      `   ${colors.yellow}浏览器将在 1-2 秒后打开${colors.reset}`
    );
    console.log();

    // 显示快速提示
    console.log(
      `${colors.green}${colors.bright}📌 快速操作${colors.reset}`
    );
    console.log(
      `   ${colors.yellow}拖拽${colors.reset} = 旋转  ${colors.yellow}滚轮${colors.reset} = 缩放  ${colors.yellow}单击${colors.reset} = 详情`
    );
    console.log(
      `   ${colors.yellow}S 键${colors.reset} = 设置  ${colors.yellow}Esc${colors.reset} = 关闭  ${colors.yellow}搜索${colors.reset} = 查找`
    );
    console.log();

    // 启动 Vite
    await runCommand('npm', ['run', 'dev'], { cwd: projectRoot });
  } catch (error) {
    log('error', error.message);
    process.exit(1);
  }
}

main();
