# 自动化发布设置指南

## 第一步：获取 NPM Token

1. 访问 https://www.npmjs.com/settings/~/tokens
2. 点击 "Generate New Token"
3. 选择 "Automation" 类型（推荐）
4. 复制生成的 token

## 第二步：配置 GitHub Secrets

1. 进入仓库设置：`Settings` → `Secrets and variables` → `Actions`
2. 点击 "New repository secret"
3. 创建以下 Secret：

| Name | Value |
|------|-------|
| `NPM_TOKEN` | 从第一步复制的 token |

## 第三步：验证配置

### 检查文件是否存在

```bash
# 检查工作流文件
ls -la .github/workflows/release.yml

# 检查配置文件
ls -la .releaserc.json

# 检查依赖
grep semantic-release package.json
```

### 检查 package.json 配置

确保 `package.json` 中有以下字段：

```json
{
  "name": "transparent-video-react",
  "version": "0.0.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/transparent-video-react.git"
  }
}
```

## 第四步：测试工作流

### 方式 1：通过 PR 测试

1. 创建一个新分支
2. 修改代码并提交（使用 Conventional Commits 格式）
3. 创建 PR 并合并到 main
4. 观察 GitHub Action 运行

### 方式 2：本地测试

```bash
# 安装依赖
pnpm install

# 运行 semantic-release（需要 GITHUB_TOKEN 和 NPM_TOKEN）
GITHUB_TOKEN=your_token NPM_TOKEN=your_npm_token npx semantic-release
```

## 第五步：提交规范

从现在开始，使用 Conventional Commits 格式提交代码：

```bash
# 新功能
git commit -m "feat: add new feature"

# Bug 修复
git commit -m "fix: resolve issue"

# 其他
git commit -m "docs: update documentation"
git commit -m "chore: update dependencies"
```

## 常见问题排查

### 问题 1：Action 失败 - "npm ERR! 401 Unauthorized"

**原因**：NPM_TOKEN 无效或过期

**解决**：
1. 重新生成 NPM Token
2. 更新 GitHub Secret

### 问题 2：Action 失败 - "fatal: could not read Username"

**原因**：Git 配置问题

**解决**：
- 这通常由 GitHub Action 自动处理，检查 Action 日志

### 问题 3：没有创建新版本

**原因**：提交信息不符合 Conventional Commits 格式

**解决**：
- 确保使用 `feat:`, `fix:`, `perf:` 等前缀
- 检查 `.releaserc.json` 中的 `releaseRules` 配置

### 问题 4：Changelog 格式不对

**原因**：配置需要调整

**解决**：
- 编辑 `.releaserc.json` 中的 `presetConfig`
- 参考 [Conventional Commits 文档](https://www.conventionalcommits.org/)

## 监控发布

### 查看 Action 日志

1. 进入仓库的 `Actions` 标签
2. 选择 "Release" workflow
3. 点击最新的运行记录
4. 查看详细日志

### 查看发布结果

- **GitHub Release**：`Releases` 标签
- **npm 包**：https://www.npmjs.com/package/transparent-video-react
- **Changelog**：仓库根目录的 `CHANGELOG.md`

## 下一步

- 阅读 [RELEASE.md](.github/RELEASE.md) 了解详细信息
- 查看 [Semantic Release 文档](https://semantic-release.gitbook.io/)
- 学习 [Conventional Commits](https://www.conventionalcommits.org/)

