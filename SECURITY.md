# Security Policy | 安全策略

## Supported Versions | 支持的版本

Currently supported versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

当前接受安全更新的版本：

- **0.1.x**: ✅ 完全支持
- **< 0.1**: ❌ 不再支持

## Reporting a Vulnerability | 报告安全漏洞

### English

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

1. **DO NOT** open a public GitHub issue
2. Send a detailed report to the project maintainer via:
   - GitHub Security Advisories (preferred)
   - Direct email to the maintainer listed in package.json
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

**Response Timeline:**
- Initial response: Within 48 hours
- Status update: Within 7 days
- Fix release: Depends on severity (critical issues within 7 days)

### 中文

我们认真对待安全漏洞。如果您发现安全问题，请遵循以下步骤：

1. **请勿**公开提交 GitHub issue
2. 通过以下方式向项目维护者发送详细报告：
   - GitHub Security Advisories（推荐）
   - 直接发送邮件给 package.json 中列出的维护者
3. 包含以下信息：
   - 漏洞描述
   - 复现步骤
   - 潜在影响
   - 建议的修复方案（如果有）

**响应时间线：**
- 首次响应：48 小时内
- 状态更新：7 天内
- 修复发布：取决于严重程度（关键问题 7 天内）

## Security Best Practices | 安全最佳实践

### For Users | 用户

- Always use the latest stable version
- Review the CHANGELOG for security-related updates
- Report suspicious behavior immediately
- Enable HTTPS when deploying to production

### For Contributors | 贡献者

- Never commit sensitive data (API keys, passwords, tokens)
- Use environment variables for configuration
- Validate all user inputs
- Follow secure coding practices
- Run security audits: `npm audit`
- Keep dependencies up to date

## Known Security Considerations | 已知安全考虑

### Client-Side Only | 纯客户端

This project is a client-side visualization tool. Security considerations:

1. **No Backend Authentication**: The demo doesn't include user authentication
2. **Local Storage**: Settings are stored in browser localStorage (not sensitive data)
3. **XSS Prevention**: LaTeX formulas are sanitized before rendering
4. **Content Security Policy**: Recommended for production deployments

### Dependencies | 依赖项

We regularly monitor and update dependencies for security issues:

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (if possible)
npm audit fix
```

### Deployment Security | 部署安全

When deploying to production:

1. ✅ Use HTTPS
2. ✅ Set appropriate Content-Security-Policy headers
3. ✅ Enable CORS restrictions if needed
4. ✅ Implement rate limiting for API endpoints (if added)
5. ✅ Regular backups of custom data

## Security Audit History | 安全审计历史

| Date       | Type          | Status | Notes |
|------------|---------------|--------|-------|
| 2026-11-03 | Dependency    | ✅ Pass | No critical vulnerabilities |
| 2026-11-03 | Code Review   | ✅ Pass | Initial security review |

## Vulnerability Disclosure Policy | 漏洞披露政策

### Coordinated Disclosure | 协调披露

We follow coordinated vulnerability disclosure:

1. Researcher reports vulnerability privately
2. We acknowledge and investigate
3. We develop and test a fix
4. We release the fix
5. We publicly disclose the issue (with credit to researcher)

### Public Recognition | 公开致谢

Researchers who responsibly disclose vulnerabilities will be:
- Credited in the security advisory (unless they prefer anonymity)
- Listed in our Hall of Fame (if they agree)
- Given priority response for future reports

## Security Contact | 安全联系方式

- **GitHub Security Advisories**: https://github.com/wenze-wu-math/Formula-Nebula/security/advisories
- **Issue Tracker** (for non-security bugs): https://github.com/wenze-wu-math/Formula-Nebula/issues

---

**Last Updated**: 2026-11-03  
**Version**: 1.0
