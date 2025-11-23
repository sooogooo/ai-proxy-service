# AI Proxy Service

一个基于 Node.js 和 Nginx 的反向代理服务，实现了 OpenAI、Claude、Google 和 Deepseek API 的统一代理访问。

## 功能特性

- 统一代理多个 AI API 服务
- API Key 认证保护
- 请求日志记录
- 速率限制
- 健康检查端点
- Docker 容器化部署
- TypeScript 类型安全

## 支持的 API 服务

| 服务 | 代理路径 | 目标地址 |
|------|----------|----------|
| OpenAI | `/openai/*` | https://api.openai.com |
| Claude | `/claude/*` | https://api.anthropic.com |
| Google | `/google/*` | https://generativelanguage.googleapis.com |
| Deepseek | `/deepseek/*` | https://api.deepseek.com |

## 快速开始

### 前置要求

- Node.js >= 18.0.0
- Docker & Docker Compose (可选)

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd ai-proxy-service

# 安装依赖
npm install

# 复制环境变量配置
cp .env.example .env
```

### 配置

编辑 `.env` 文件设置你的配置：

```env
# 应用配置
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# 认证
API_KEY=your-secret-api-key-here

# 速率限制
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

### 运行

#### 开发模式

```bash
npm run dev
```

#### 生产模式

```bash
npm run build
npm start
```

#### Docker 部署

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## API 使用

### 认证

所有代理请求需要提供 API Key，支持两种方式：

1. Authorization Header:
```bash
curl -H "Authorization: Bearer your-api-key" http://localhost:3000/openai/v1/models
```

2. X-API-Key Header:
```bash
curl -H "X-API-Key: your-api-key" http://localhost:3000/openai/v1/models
```

### 示例请求

#### OpenAI

```bash
curl -X POST http://localhost:3000/openai/v1/chat/completions \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

#### Claude

```bash
curl -X POST http://localhost:3000/claude/v1/messages \
  -H "Authorization: Bearer your-api-key" \
  -H "x-api-key: your-anthropic-key" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-opus-20240229",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### 健康检查

```bash
# 健康状态
curl http://localhost:3000/health

# 就绪状态
curl http://localhost:3000/ready
```

### 监控端点

```bash
# Prometheus 指标
curl http://localhost:3000/metrics

# 熔断器状态
curl http://localhost:3000/circuit-breakers
```

## 监控与可观测性

### Prometheus 指标

服务暴露以下 Prometheus 指标：

| 指标名称 | 类型 | 说明 |
|----------|------|------|
| `http_requests_total` | Counter | HTTP 请求总数 |
| `http_request_duration_seconds` | Histogram | HTTP 请求耗时 |
| `proxy_requests_total` | Counter | 代理请求总数 |
| `proxy_request_duration_seconds` | Histogram | 代理请求耗时 |
| `proxy_errors_total` | Counter | 代理错误总数 |
| `circuit_breaker_state` | Gauge | 熔断器状态 |
| `active_connections` | Gauge | 活跃连接数 |

### 熔断器

每个代理服务都有独立的熔断器，用于保护系统免受级联故障影响：

- **关闭状态 (Closed)**: 正常运行，请求正常转发
- **半开状态 (Half-Open)**: 测试服务是否恢复
- **打开状态 (Open)**: 服务不可用，快速失败

配置参数：
- 最大重试次数: 3
- 连续失败触发熔断: 5
- 半开等待时间: 30 秒

## 开发

### 项目结构

```
ai-proxy-service/
├── src/
│   ├── config/         # 配置管理
│   ├── middleware/     # 中间件
│   ├── proxy/          # 代理逻辑
│   ├── routes/         # 路由
│   ├── utils/          # 工具函数
│   └── index.ts        # 入口文件
├── nginx/              # Nginx 配置
├── tests/              # 测试文件
├── docker-compose.yml  # Docker 编排
└── Dockerfile          # Docker 镜像
```

### 脚本命令

```bash
npm run dev          # 开发模式
npm run build        # 构建
npm start            # 生产模式
npm test             # 运行测试
npm run test:coverage # 测试覆盖率
npm run lint         # 代码检查
npm run lint:fix     # 自动修复
npm run format       # 代码格式化
```

### 测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式
npm run test:watch
```

## 部署

### Docker Compose 部署

1. 确保 Docker 和 Docker Compose 已安装
2. 复制并配置 `.env` 文件
3. 运行 `docker-compose up -d`
4. 服务将在端口 80 (Nginx) 可用

### 手动部署

1. 安装 Node.js >= 18
2. 运行 `npm ci --only=production`
3. 运行 `npm run build`
4. 配置环境变量
5. 运行 `npm start`

## 安全建议

- 使用强密码作为 API_KEY
- 在生产环境中启用 HTTPS
- 定期轮换 API Key
- 监控异常请求
- 配置适当的速率限制

## 许可证

MIT License
