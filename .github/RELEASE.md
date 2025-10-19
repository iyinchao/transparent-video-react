# 自动化发布流程

本项目使用 `semantic-release` 实现自动化的语义化版本发布和 Changelog 生成。

## 工作流程

当 PR 合并到 `main` 分支时，GitHub Action 会自动：

1. ✅ 运行测试和构建
2. 📊 分析提交信息（Conventional Commits）
3. 🔢 自动确定版本号（Major.Minor.Patch）
4. 📝 生成 Changelog
5. 📦 发布到 npm
6. 🏷️ 创建 Git 标签和 Release
7. 💬 在 PR 上评论发布信息

## 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

### 主要类型

| 类型 | 说明 | 版本影响 |
|------|------|---------|
| `feat:` | 新功能 | Minor (0.1.0) |
| `fix:` | 修复 Bug | Patch (0.0.1) |
| `perf:` | 性能优化 | Patch (0.0.1) |
| `refactor:` | 代码重构 | Patch (0.0.1) |
| `docs:` | 文档更新 | 无版本 |
| `style:` | 代码风格 | 无版本 |
| `test:` | 测试相关 | 无版本 |
| `chore:` | 构建/依赖 | 无版本 |
| `ci:` | CI/CD 配置 | 无版本 |

### 示例

```bash
# 新功能
git commit -m "feat: add alpha channel blend hook"

# Bug 修复
git commit -m "fix: correct video playback timing issue"

# 破坏性变更（触发 Major 版本）
git commit -m "feat!: redesign component API"
git commit -m "feat: new API\n\nBREAKING CHANGE: old API removed"

# 多行提交
git commit -m "feat: add new feature

This is a longer description of the feature.
It can span multiple lines.

Closes #123"
```

## 环境变量配置

需要在 GitHub 仓库设置中配置以下 Secrets：

### 必需

- **`NPM_TOKEN`** - npm 账户的访问令牌
  - 获取方式：https://www.npmjs.com/settings/~/tokens
  - 需要 "Automation" 类型的令牌

### 可选

- **`GITHUB_TOKEN`** - GitHub 自动提供（无需手动配置）

## 配置文件

### `.releaserc.json`

主要配置文件，定义：
- 发布分支（main）
- 提交类型映射
- Changelog 格式
- npm 发布设置
- Git 提交和标签设置

### `.github/workflows/release.yml`

GitHub Action 工作流，定义：
- 触发条件（push to main）
- 构建和测试步骤
- semantic-release 执行

## 版本号规则

遵循 [Semantic Versioning](https://semver.org/)：

- **Major (X.0.0)** - 破坏性变更（BREAKING CHANGE）
- **Minor (0.X.0)** - 新功能（feat）
- **Patch (0.0.X)** - Bug 修复（fix）

### 示例

```
v0.0.0 (初始版本)
  ↓ feat: add component
v0.1.0 (新功能)
  ↓ fix: correct timing
v0.1.1 (Bug 修复)
  ↓ feat!: redesign API
v1.0.0 (破坏性变更)
```

## 生成的产物

### Changelog

自动生成 `CHANGELOG.md`，包含：
- 每个版本的发布日期
- 功能、修复、性能优化等分类
- 提交者信息和链接

### GitHub Release

自动创建 GitHub Release，包含：
- 版本号和标签
- Release Notes（从 Changelog 生成）
- 发布日期

### npm 包

自动发布到 npm，包含：
- 更新的版本号
- 新的构建产物
- 类型定义文件

## 常见问题

### Q: 如何跳过发布？

在提交信息中添加 `[skip ci]`：

```bash
git commit -m "docs: update README [skip ci]"
```

### Q: 如何手动触发发布？

在本地运行：

```bash
npx semantic-release
```

### Q: 发布失败了怎么办？

检查：
1. `NPM_TOKEN` 是否正确配置
2. 提交信息是否符合 Conventional Commits 格式
3. 构建和测试是否通过
4. GitHub Action 日志中的错误信息

### Q: 如何修改 Changelog 格式？

编辑 `.releaserc.json` 中的 `@semantic-release/release-notes-generator` 配置。

## 参考资源

- [Semantic Release 文档](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

