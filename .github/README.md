# GitHub Actions 和自动化发布

本目录包含项目的 GitHub Actions 工作流和相关文档。

## 📁 文件结构

```
.github/
├── workflows/
│   └── release.yml          # 自动化发布工作流
├── README.md                # 本文件
├── SETUP.md                 # 设置指南
└── RELEASE.md               # 发布流程详细文档
```

## 🚀 快速开始

### 1. 初始化设置（一次性）

```bash
# 1. 获取 NPM Token
# 访问 https://www.npmjs.com/settings/~/tokens

# 2. 配置 GitHub Secret
# 进入 Settings → Secrets and variables → Actions
# 创建 NPM_TOKEN secret

# 3. 验证配置
pnpm install
```

详见 [SETUP.md](./SETUP.md)

### 2. 日常开发

使用 Conventional Commits 格式提交代码：

```bash
# 新功能
git commit -m "feat: add new feature"

# Bug 修复
git commit -m "fix: resolve issue"

# 其他
git commit -m "docs: update docs"
```

### 3. 创建 PR 并合并

1. 创建 PR 到 main 分支
2. 通过 review 和 CI 检查
3. 合并到 main 分支
4. GitHub Action 自动发布！

## 📊 工作流程

```
┌─────────────────────────────────────────────────────────┐
│ 代码合并到 main 分支                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ GitHub Action 触发 (release.yml)                        │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    ┌────────┐  ┌────────┐  ┌────────┐
    │ 安装   │  │ 构建   │  │ 测试   │
    │ 依赖   │  │ 项目   │  │ 代码   │
    └────────┘  └────────┘  └────────┘
        │            │            │
        └────────────┼────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ semantic-release 分析提交                               │
│ - 分析 Conventional Commits                             │
│ - 确定版本号 (Major.Minor.Patch)                        │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    ┌────────┐  ┌────────┐  ┌────────┐
    │ 生成   │  │ 发布   │  │ 创建   │
    │ 更新   │  │ 到     │  │ Git    │
    │ 版本   │  │ npm    │  │ 标签   │
    └────────┘  └────────┘  └────────┘
        │            │            │
        └────────────┼────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 完成！✅                                                 │
│ - CHANGELOG.md 已更新                                   │
│ - GitHub Release 已创建                                 │
│ - npm 包已发布                                          │
└─────────────────────────────────────────────────────────┘
```

## 🔑 关键概念

### Conventional Commits

提交信息格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型**：
- `feat` - 新功能 → Minor 版本
- `fix` - Bug 修复 → Patch 版本
- `perf` - 性能优化 → Patch 版本
- `refactor` - 代码重构 → Patch 版本
- `docs` - 文档更新 → 无版本
- `style` - 代码风格 → 无版本
- `test` - 测试相关 → 无版本
- `chore` - 构建/依赖 → 无版本
- `ci` - CI/CD 配置 → 无版本

**破坏性变更**：

```
feat!: redesign API
# 或
feat: new API

BREAKING CHANGE: old API removed
```

### Semantic Versioning

版本号格式：`Major.Minor.Patch`

- **Major** - 破坏性变更
- **Minor** - 新功能（向后兼容）
- **Patch** - Bug 修复（向后兼容）

示例：
```
v0.0.0 → v0.1.0 (feat)
v0.1.0 → v0.1.1 (fix)
v0.1.1 → v1.0.0 (feat!)
```

## 📚 详细文档

- [SETUP.md](./SETUP.md) - 详细的设置步骤
- [RELEASE.md](./RELEASE.md) - 发布流程和规范

## 🔍 监控和调试

### 查看 Action 日志

1. 进入仓库 → `Actions` 标签
2. 选择 "Release" workflow
3. 点击最新运行
4. 查看详细日志

### 常见问题

**Q: 为什么没有创建新版本？**
- 检查提交信息是否使用了 `feat:`, `fix:` 等前缀
- 查看 Action 日志中的错误信息

**Q: npm 发布失败？**
- 检查 NPM_TOKEN 是否正确
- 确保 token 有发布权限

**Q: 如何跳过发布？**
- 在提交信息中添加 `[skip ci]`

## 🎯 最佳实践

1. ✅ 始终使用 Conventional Commits 格式
2. ✅ 在 PR 中清晰描述变更
3. ✅ 确保所有测试通过
4. ✅ 定期检查 Changelog 和 Release
5. ✅ 保持 NPM_TOKEN 安全

## 📞 需要帮助？

- 查看 [SETUP.md](./SETUP.md) 的常见问题部分
- 阅读 [Semantic Release 文档](https://semantic-release.gitbook.io/)
- 查看 [Conventional Commits](https://www.conventionalcommits.org/)

