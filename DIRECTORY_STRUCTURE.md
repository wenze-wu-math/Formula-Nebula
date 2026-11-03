# Formula Nebula - Directory Structure

## 📁 Project Organization | 项目结构

```
Formula-Nebula/
├── 📄 Core Documentation | 核心文档
│   ├── README.md                      # Project overview | 项目概览
│   ├── CHANGELOG.md                   # Version history | 版本历史  
│   ├── LICENSE                        # MIT license | MIT 许可证
│   ├── CONTRIBUTING.md                # How to contribute | 贡献指南
│   ├── CODE_OF_CONDUCT.md            # Community guidelines | 社区准则
│   ├── SECURITY.md                    # Security policy | 安全策略
│   ├── ROADMAP.md                     # Future plans | 未来规划
│   └── PROJECT_STATUS.md              # Current status | 当前状态
│
├── 📁 .github/                        # GitHub configuration | GitHub 配置
│   ├── workflows/                     # CI/CD pipelines | CI/CD 流水线
│   │   ├── ci.yml                    # Main CI workflow
│   │   ├── performance.yml           # Performance monitoring
│   │   ├── dependency-review.yml     # Security checks
│   │   └── codeql.yml                # Code scanning
│   ├── ISSUE_TEMPLATE/               # Issue templates | Issue 模板
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── config.yml
│   ├── PULL_REQUEST_TEMPLATE.md      # PR template | PR 模板
│   └── FUNDING.yml                    # Sponsorship | 赞助配置
│
├── 📁 docs/                           # Documentation | 文档
│   ├── API.md                         # API reference | API 参考
│   ├── TUTORIAL.md                    # User tutorial | 使用教程
│   ├── FAQ.md                         # Frequently asked questions
│   ├── TROUBLESHOOTING-GUIDE.md      # Problem solving
│   ├── DEPLOYMENT-GUIDE.md           # Deployment instructions
│   └── case-studies/                 # Usage examples | 使用案例
│
├── 📁 src/                            # Source code | 源代码
│   ├── main.js                        # Application entry point
│   ├── scene.js                       # Three.js scene setup
│   ├── graph.js                       # Graph layout algorithms
│   ├── glyph.js                       # Formula rendering
│   ├── glow.js                        # Glow effects
│   ├── nebula.js                      # Background nebula
│   ├── settings.js                    # Settings management
│   ├── palette.js                     # Color system
│   ├── linkTypes.js                   # Relationship types
│   ├── graphQuery.js                  # Search and pathfinding
│   ├── performance-monitor.js         # Performance tracking
│   ├── sw-register.js                 # Service Worker registration
│   ├── data/                          # Knowledge graph data
│   │   ├── nodes.js                   # Theorem nodes
│   │   ├── links.js                   # Relationships
│   │   ├── cluster.js                 # Conjecture cluster
│   │   └── progress.js                # Conjecture progress
│   ├── types/                         # TypeScript definitions
│   │   └── index.d.ts
│   └── components/                    # UI components
│       ├── SearchManager.js
│       └── SettingsPanel.js
│
├── 📁 scripts/                        # Build and verification scripts
│   ├── quality-check.mjs              # Comprehensive quality check
│   ├── analyze-bundle.mjs             # Bundle size analysis
│   ├── probe-perf.mjs                 # Performance testing
│   ├── check-data.mjs                 # Data integrity check
│   ├── verify-*.mjs                   # Various verification scripts
│   └── run-all.mjs                    # Run all verifications
│
├── 📁 designs/                        # Design explorations
│   ├── index.html                     # Design showcase
│   ├── analytics/                     # Analytics dashboard
│   └── nebula-plus/                   # Alternative visualizations
│
├── 📄 Configuration Files | 配置文件
│   ├── package.json                   # Dependencies and scripts
│   ├── vite.config.js                 # Vite build configuration
│   ├── eslint.config.js               # ESLint rules
│   ├── .prettierrc.json              # Prettier formatting
│   ├── jsconfig.json                  # JavaScript configuration
│   └── .gitignore                     # Git ignore rules
│
├── 📁 Community Files | 社区文件
│   ├── CONTRIBUTORS.md                # Contributor list
│   ├── ACKNOWLEDGMENTS.md            # Credits and thanks
│   ├── SPONSORS.md                    # Sponsorship info
│   └── LICENSE-THIRD-PARTY.md        # Third-party licenses
│
└── 📄 Build Output | 构建输出
    └── dist/                          # Production build (gitignored)
```

## 🎯 Key Directories | 关键目录

### `/src` - Source Code
The heart of the application. Contains all visualization logic, data, and components.

应用程序的核心。包含所有可视化逻辑、数据和组件。

### `/docs` - Documentation  
User-facing documentation including API reference, tutorials, and guides.

面向用户的文档，包括 API 参考、教程和指南。

### `/scripts` - Build & Verification
Scripts for building, testing, and verifying the application.

用于构建、测试和验证应用程序的脚本。

### `/.github` - GitHub Configuration
CI/CD workflows, issue templates, and GitHub-specific configuration.

CI/CD 工作流、Issue 模板和 GitHub 特定配置。

## 📝 Important Files | 重要文件

| File | Purpose | 用途 |
|------|---------|------|
| `README.md` | Project overview and quick start | 项目概览和快速开始 |
| `package.json` | Dependencies and npm scripts | 依赖项和 npm 脚本 |
| `vite.config.js` | Build configuration | 构建配置 |
| `src/main.js` | Application entry point | 应用程序入口 |
| `src/data/nodes.js` | 405 theorem nodes | 405 个定理节点 |
| `src/data/cluster.js` | 59 conjecture nodes | 59 个猜想节点 |

## 🚫 Excluded from Git | Git 排除项

The following are not tracked in version control:

以下内容不在版本控制中跟踪：

- `node_modules/` - Dependencies
- `dist/` - Build output  
- `.claude/` - AI session data
- `*.log` - Log files
- Temporary files and work-in-progress

## 📦 Bundle Structure | 打包结构

After running `npm run build`, the `dist/` directory contains:

运行 `npm run build` 后，`dist/` 目录包含：

```
dist/
├── index.html                    # Main HTML
├── assets/
│   ├── index-[hash].js          # Main bundle (~1.9 MB gzipped)
│   ├── three-[hash].js          # Three.js chunk
│   ├── mathjax-[hash].js        # MathJax chunk (lazy loaded)
│   └── *.css                    # Stylesheets
└── sw.js                        # Service Worker
```

## 🔍 Finding Things | 查找内容

### "Where is...?"

- **Visualization code?** → `src/scene.js`, `src/graph.js`
- **Data?** → `src/data/`
- **Documentation?** → `docs/` and root-level `.md` files
- **Tests?** → `scripts/verify-*.mjs`
- **Configuration?** → Root-level `*.config.js` files
- **CI/CD?** → `.github/workflows/`

### "How do I...?"

- **Start developing?** → See [README.md](README.md)
- **Contribute?** → See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Deploy?** → See [docs/DEPLOYMENT-GUIDE.md](docs/DEPLOYMENT-GUIDE.md)
- **Understand the API?** → See [docs/API.md](docs/API.md)
- **Learn to use it?** → See [docs/TUTORIAL.md](docs/TUTORIAL.md)

## 🧹 Keeping it Clean | 保持整洁

### Before Committing | 提交前

```bash
npm run quality      # Run all quality checks
npm run format       # Format code
npm run lint         # Check code quality
```

### Cleanup | 清理

```bash
rm -rf node_modules dist     # Remove dependencies and build
npm install                   # Fresh install
npm run build                 # Clean build
```

## 📊 Project Stats | 项目统计

```
Source Files         : ~50 files
Lines of Code        : ~15,000 lines
Documentation        : ~5,000 lines  
Tests/Scripts        : 40+ scripts
Dependencies         : 11 runtime + 4 dev
Bundle Size          : ~1.9 MB (gzipped)
```

---

**Last Updated**: 2026-11-03  
**Maintained by**: Formula Nebula Team
