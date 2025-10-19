# Storybook GitHub Pages 快速开始

## ⚡ 5 分钟快速设置

### 步骤 1：启用 GitHub Pages（一次性）

```
Settings → Pages → Source: GitHub Actions → Save
```

### 步骤 2：完成！

工作流已自动配置。现在：

- 🟢 **Push 到 main** → 自动构建并部署 Storybook
- 🟡 **创建 PR** → 自动构建（不部署）

## 📖 访问你的 Storybook

```
https://iyinchao.github.io/transparent-video-react/
```

## 🔄 工作流程

```
你的代码 → Push/PR → GitHub Action → 构建 Storybook → 部署到 Pages
```

## ✅ 验证部署

1. 进入 **Actions** 标签
2. 查看 "Deploy Storybook to GitHub Pages" 
3. 等待 ✅ 完成
4. 访问上面的 URL

## 🐛 常见问题

### Q: 为什么看不到我的更新？

**A**: 
- 等待 5-10 分钟
- 清除浏览器缓存（Ctrl+Shift+Delete）
- 检查 Actions 是否成功

### Q: 如何查看构建日志？

**A**: 
- Actions → Deploy Storybook → 点击最新运行 → 查看日志

### Q: 为什么 PR 没有部署？

**A**: 
- 这是正常的！PR 只构建不部署
- 合并到 main 后才会部署

### Q: 如何跳过部署？

**A**: 
- 在提交信息中添加 `[skip ci]`
- 例如：`git commit -m "docs: update [skip ci]"`

## 📚 详细文档

- [完整部署指南](./STORYBOOK_DEPLOY.md)
- [Workflow 文件](./.github/workflows/deploy-storybook.yml)

## 🎯 下一步

1. ✅ 推送代码到 main
2. ✅ 等待 GitHub Action 完成
3. ✅ 访问你的 Storybook
4. ✅ 分享链接给团队！

---

**提示**: 每次 push 到 main 时，Storybook 都会自动更新。无需手动操作！

