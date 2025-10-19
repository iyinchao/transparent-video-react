# Storybook GitHub Pages 部署指南

本文档说明如何配置和使用 GitHub Action 自动将 Storybook 部署到 GitHub Pages。

## 📋 工作流程说明

### 文件位置
- **Workflow 文件**: `.github/workflows/deploy-storybook.yml`

### 触发条件

工作流在以下情况下触发：

1. **Push 到 main 分支** - 自动构建并部署 Storybook
2. **PR 到 main 分支** - 自动构建（不部署）

### 工作流步骤

```
┌─────────────────────────────────────────────────────────┐
│ 代码 Push 到 main 或创建 PR                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Build Job                                               │
├─────────────────────────────────────────────────────────┤
│ 1. 检出代码                                              │
│ 2. 设置 Node.js 20                                       │
│ 3. 安装 pnpm 9                                           │
│ 4. 缓存 pnpm 依赖                                        │
│ 5. 安装项目依赖                                          │
│ 6. 构建 Storybook                                        │
│ 7. 上传构建产物                                          │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   ┌─────────┐            ┌──────────────┐
   │ PR 构建 │            │ Main 分支    │
   │ 完成   │            │ 部署到 Pages │
   └─────────┘            └──────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ Deploy Job       │
                        ├──────────────────┤
                        │ 部署到 GitHub    │
                        │ Pages            │
                        └──────────────────┘
```

## 🚀 初始化设置

### 第一步：启用 GitHub Pages

1. 进入仓库 **Settings**
2. 左侧菜单选择 **Pages**
3. 在 "Build and deployment" 部分：
   - **Source** 选择 "GitHub Actions"
   - 点击 **Save**

### 第二步：验证工作流

1. 进入仓库 **Actions** 标签
2. 查看 "Deploy Storybook to GitHub Pages" workflow
3. 确保工作流已启用

### 第三步：首次部署

1. 创建一个 PR 或 push 到 main 分支
2. 等待 GitHub Action 完成
3. 检查 Actions 日志确认成功

## 📖 访问 Storybook

部署完成后，可以通过以下 URL 访问 Storybook：

```
https://<username>.github.io/<repository-name>/
```

例如：
```
https://iyinchao.github.io/transparent-video-react/
```

## 🔍 监控部署

### 查看部署日志

1. 进入仓库 **Actions** 标签
2. 选择 "Deploy Storybook to GitHub Pages" workflow
3. 点击最新的运行记录
4. 查看详细日志

### 常见状态

| 状态 | 说明 |
|------|------|
| ✅ Success | 部署成功 |
| ❌ Failed | 部署失败，查看日志 |
| ⏳ In Progress | 正在部署 |
| ⊘ Skipped | 跳过部署（PR 时） |

## 🛠️ 故障排除

### 问题 1：部署失败 - "Build failed"

**原因**：Storybook 构建失败

**解决**：
1. 检查 `pnpm build-storybook` 是否能在本地运行
2. 查看 Action 日志中的错误信息
3. 修复错误后重新 push

### 问题 2：部署失败 - "Pages not enabled"

**原因**：GitHub Pages 未启用

**解决**：
1. 进入 Settings → Pages
2. 选择 "GitHub Actions" 作为 source
3. 点击 Save

### 问题 3：访问 404

**原因**：部署成功但无法访问

**解决**：
1. 等待 5-10 分钟（GitHub Pages 需要时间更新）
2. 清除浏览器缓存
3. 检查 URL 是否正确

### 问题 4：样式或资源加载失败

**原因**：基础路径配置问题

**解决**：
1. 检查 `.storybook/main.ts` 中的 `staticDirs` 配置
2. 确保所有资源路径正确
3. 在本地运行 `pnpm build-storybook` 测试

## 📝 配置说明

### Workflow 配置

```yaml
on:
  push:
    branches:
      - main          # 只在 main 分支部署
  pull_request:
    branches:
      - main          # PR 时构建但不部署
```

### 权限配置

```yaml
permissions:
  contents: read      # 读取代码
  pages: write        # 写入 Pages
  id-token: write     # 用于 OIDC 认证
```

### 并发控制

```yaml
concurrency:
  group: pages
  cancel-in-progress: false  # 不取消进行中的部署
```

## 🎯 最佳实践

1. ✅ **定期检查部署** - 确保 Storybook 保持最新
2. ✅ **在 PR 中测试** - 构建会在 PR 时运行
3. ✅ **监控日志** - 及时发现和修复问题
4. ✅ **保持依赖更新** - 定期更新 Node.js 版本
5. ✅ **文档完整** - 在 Storybook 中添加充分的文档

## 📚 相关文档

- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Storybook 文档](https://storybook.js.org/)
- [Storybook 部署指南](https://storybook.js.org/docs/sharing/publish-storybook)

## 🔗 相关 Workflow

- [Release Workflow](./.github/workflows/release.yml) - 自动化版本发布
- [Release 文档](./RELEASE.md) - 发布流程说明

## 💡 提示

### 自定义部署 URL

如果你有自定义域名，可以在 GitHub Pages 设置中配置。

### 预览部署

在 PR 中，可以通过 GitHub Actions 的 artifact 预览构建结果。

### 性能优化

- 使用 pnpm 缓存加速构建
- 定期清理旧的 artifact
- 考虑使用 CDN 加速访问

## 📞 需要帮助？

- 查看 [GitHub Pages 常见问题](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)
- 查看 [Storybook 部署常见问题](https://storybook.js.org/docs/sharing/publish-storybook#troubleshooting)
- 检查 GitHub Actions 日志获取详细错误信息

