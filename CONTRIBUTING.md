# 贡献指南

感谢你对 AI Proxy Service 项目的关注！我们欢迎任何形式的贡献。

## 开发流程

### 1. Fork 和克隆

```bash
# Fork 项目到你的 GitHub 账户
# 然后克隆你的 fork
git clone https://github.com/your-username/ai-proxy-service.git
cd ai-proxy-service
```

### 2. 创建分支

```bash
git checkout -b feature/your-feature-name
```

### 3. 安装依赖

```bash
npm install
```

### 4. 开发

进行你的修改，确保遵循代码规范。

### 5. 测试

```bash
# 运行测试
npm test

# 运行代码检查
npm run lint

# 格式化代码
npm run format
```

### 6. 提交

```bash
git add .
git commit -m "feat: your feature description"
```

### 7. 推送并创建 PR

```bash
git push origin feature/your-feature-name
```

然后在 GitHub 上创建 Pull Request。

## 代码规范

### TypeScript

- 使用 TypeScript 编写所有新代码
- 启用严格模式
- 为所有导出函数添加类型注解
- 避免使用 `any` 类型

### 代码风格

项目使用 ESLint 和 Prettier 进行代码检查和格式化：

- 使用单引号
- 使用分号
- 缩进使用 2 个空格
- 最大行宽 100 字符

### 提交信息

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

示例：

```
feat: add rate limiting middleware
fix: resolve proxy timeout issue
docs: update API documentation
```

## 测试

### 编写测试

- 为所有新功能编写单元测试
- 测试文件放在 `tests/` 目录
- 命名格式: `*.test.ts` 或 `*.spec.ts`

### 测试覆盖率

我们要求至少 70% 的代码覆盖率。运行以下命令查看：

```bash
npm run test:coverage
```

## Pull Request

### PR 清单

在提交 PR 前，请确保：

- [ ] 代码通过所有测试
- [ ] 代码通过 lint 检查
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] PR 描述清楚说明了更改内容

### PR 模板

```markdown
## 描述

简要描述你的更改。

## 更改类型

- [ ] Bug 修复
- [ ] 新功能
- [ ] 重大更改
- [ ] 文档更新

## 测试

描述你如何测试了这些更改。

## 相关 Issue

Closes #(issue number)
```

## 问题报告

发现 Bug 或有功能建议？请创建 Issue：

1. 使用清晰的标题
2. 提供详细的描述
3. 包含复现步骤（如果是 Bug）
4. 提供环境信息

## 行为准则

请保持友善和专业。我们欢迎所有人参与贡献。

## 获取帮助

如有问题，可以：

- 查看项目文档
- 搜索已有 Issues
- 创建新 Issue 提问

再次感谢你的贡献！
