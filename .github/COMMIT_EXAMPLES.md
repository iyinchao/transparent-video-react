# Conventional Commits 示例

本文档提供了各种提交信息的示例。

## 基础示例

### 新功能 (feat)

```bash
git commit -m "feat: add alpha channel blend hook"
```

**结果**：版本号 Minor 增加（0.1.0 → 0.2.0）

### Bug 修复 (fix)

```bash
git commit -m "fix: correct video playback timing issue"
```

**结果**：版本号 Patch 增加（0.1.0 → 0.1.1）

### 性能优化 (perf)

```bash
git commit -m "perf: optimize shader compilation"
```

**结果**：版本号 Patch 增加（0.1.0 → 0.1.1）

### 代码重构 (refactor)

```bash
git commit -m "refactor: simplify component logic"
```

**结果**：版本号 Patch 增加（0.1.0 → 0.1.1）

### 文档更新 (docs)

```bash
git commit -m "docs: update README with examples"
```

**结果**：无版本变化

### 代码风格 (style)

```bash
git commit -m "style: format code with prettier"
```

**结果**：无版本变化

### 测试相关 (test)

```bash
git commit -m "test: add unit tests for TransparentVideo"
```

**结果**：无版本变化

### 构建/依赖 (chore)

```bash
git commit -m "chore: update dependencies"
```

**结果**：无版本变化

### CI/CD 配置 (ci)

```bash
git commit -m "ci: update GitHub Actions workflow"
```

**结果**：无版本变化

## 高级示例

### 带作用域的提交

```bash
git commit -m "feat(hooks): add useTransparentVideo hook"
```

**说明**：`(hooks)` 是作用域，表示变更影响的模块

### 多行提交

```bash
git commit -m "feat: add video clipping functionality

- Add u_enableClip uniform to shader
- Add u_clipRatio uniform for clipping range
- Implement setEnableClip() and setClipRatio() functions
- Add comprehensive tests

Closes #123"
```

**说明**：
- 第一行是简短摘要
- 空行分隔
- 详细描述
- 最后一行关闭相关 issue

### 破坏性变更 (BREAKING CHANGE)

```bash
git commit -m "feat!: redesign component API

BREAKING CHANGE: The ref API has been completely redesigned.
Old: ref.current.play()
New: ref.current.play() (same but with different internal structure)"
```

**结果**：版本号 Major 增加（0.1.0 → 1.0.0）

或者使用 `!` 标记：

```bash
git commit -m "feat(api)!: change ref interface

This is a breaking change that modifies the ref interface.

BREAKING CHANGE: ref.getVideoElement() is now ref.videoElement"
```

### 修复特定 issue

```bash
git commit -m "fix: resolve memory leak in useEffect

Fixes #456"
```

### 多个 issue

```bash
git commit -m "fix: improve error handling

Fixes #123
Fixes #456
Closes #789"
```

## 完整示例流程

### 场景：添加新功能

```bash
# 1. 创建分支
git checkout -b feat/add-clipping

# 2. 开发功能
# ... 编写代码 ...

# 3. 提交代码
git add .
git commit -m "feat: add video clipping functionality

Implement clipping feature with the following:
- Add u_enableClip and u_clipRatio uniforms
- Create setEnableClip() and setClipRatio() functions
- Add comprehensive unit tests
- Update documentation

Closes #100"

# 4. 创建 PR
git push origin feat/add-clipping
# 在 GitHub 上创建 PR

# 5. 合并到 main
# PR 通过 review 后合并

# 6. 自动发布
# GitHub Action 自动：
# - 分析提交信息
# - 版本号从 0.1.0 → 0.2.0
# - 生成 Changelog
# - 发布到 npm
# - 创建 GitHub Release
```

### 场景：修复 Bug

```bash
# 1. 创建分支
git checkout -b fix/timing-issue

# 2. 修复 Bug
# ... 编写修复代码 ...

# 3. 提交代码
git add .
git commit -m "fix: correct video playback timing

The video was starting with a delay due to incorrect
initialization timing in useEffect.

Fixes #200"

# 4. 创建 PR 并合并
# ... 同上 ...

# 5. 自动发布
# GitHub Action 自动：
# - 版本号从 0.1.0 → 0.1.1
# - 生成 Changelog
# - 发布到 npm
```

## 常见错误

### ❌ 错误示例

```bash
# 没有类型前缀
git commit -m "update code"

# 类型不规范
git commit -m "Update: add new feature"

# 没有冒号
git commit -m "feat add new feature"

# 首字母小写
git commit -m "feat: add new feature"  # ✅ 正确
git commit -m "feat: Add new feature"  # ❌ 错误
```

### ✅ 正确示例

```bash
# 规范的格式
git commit -m "feat: add new feature"
git commit -m "fix: resolve issue"
git commit -m "docs: update documentation"

# 带作用域
git commit -m "feat(hooks): add useTransparentVideo"

# 破坏性变更
git commit -m "feat!: redesign API"

# 多行提交
git commit -m "feat: add feature

Detailed description here.

Closes #123"
```

## 提交信息检查清单

在提交前，检查以下项目：

- [ ] 使用了正确的类型（feat, fix, docs 等）
- [ ] 类型后面有冒号和空格
- [ ] 首字母小写
- [ ] 简短摘要（50 字以内）
- [ ] 如果是多行，第一行和详细描述之间有空行
- [ ] 如果修复了 issue，使用 `Fixes #123` 或 `Closes #123`
- [ ] 如果是破坏性变更，使用 `BREAKING CHANGE:` 或 `!` 标记

## 工具推荐

### Commitizen

自动生成规范的提交信息：

```bash
# 安装
npm install -g commitizen

# 使用
cz commit
# 或
git cz
```

### Husky + Commitlint

在提交前自动检查提交信息：

```bash
# 安装
npm install -D husky commitlint

# 初始化
npx husky install
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

## 参考资源

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Semantic Release](https://semantic-release.gitbook.io/)

