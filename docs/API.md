# API 文档

## 概述

AI Proxy Service 提供统一的 API 代理接口，支持 OpenAI、Claude、Google 和 Deepseek API。

## 基础信息

- **Base URL**: `http://localhost:3000` (开发环境)
- **认证方式**: Bearer Token 或 X-API-Key

## 认证

所有代理端点都需要认证。支持以下两种方式：

### Bearer Token

```http
Authorization: Bearer <your-api-key>
```

### X-API-Key Header

```http
X-API-Key: <your-api-key>
```

## 端点

### 健康检查

#### GET /health

检查服务健康状态。

**响应**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

#### GET /ready

检查服务就绪状态。

**响应**

```json
{
  "status": "ready",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### OpenAI 代理

#### 路径前缀

```
/openai/*
```

#### 示例

原始 OpenAI API:
```
https://api.openai.com/v1/chat/completions
```

代理后:
```
http://localhost:3000/openai/v1/chat/completions
```

#### 请求示例

```bash
curl -X POST http://localhost:3000/openai/v1/chat/completions \
  -H "Authorization: Bearer <proxy-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

---

### Claude 代理

#### 路径前缀

```
/claude/*
```

#### 示例

原始 Claude API:
```
https://api.anthropic.com/v1/messages
```

代理后:
```
http://localhost:3000/claude/v1/messages
```

#### 请求示例

```bash
curl -X POST http://localhost:3000/claude/v1/messages \
  -H "Authorization: Bearer <proxy-api-key>" \
  -H "x-api-key: <anthropic-api-key>" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-opus-20240229",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

---

### Google 代理

#### 路径前缀

```
/google/*
```

#### 示例

原始 Google API:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
```

代理后:
```
http://localhost:3000/google/v1beta/models/gemini-pro:generateContent
```

---

### Deepseek 代理

#### 路径前缀

```
/deepseek/*
```

#### 示例

原始 Deepseek API:
```
https://api.deepseek.com/v1/chat/completions
```

代理后:
```
http://localhost:3000/deepseek/v1/chat/completions
```

---

## 错误响应

### 401 Unauthorized

API Key 缺失或无效。

```json
{
  "error": "Unauthorized",
  "message": "API key is required"
}
```

### 404 Not Found

路由不存在。

```json
{
  "error": "Not Found",
  "message": "Route GET /unknown not found"
}
```

### 502 Bad Gateway

代理目标服务不可用。

```json
{
  "error": "Bad Gateway",
  "message": "Failed to proxy request to OpenAI"
}
```

### 500 Internal Server Error

服务内部错误。

```json
{
  "error": "Internal Server Error"
}
```

---

## 速率限制

默认配置：

- 窗口时间: 60 秒
- 最大请求数: 100 次/窗口

超出限制时返回 429 Too Many Requests。

---

## 日志

服务会记录所有代理请求的以下信息：

- 请求方法和路径
- 源 IP 地址
- 响应状态码
- 响应时间

日志文件位置：
- `logs/combined.log` - 所有日志
- `logs/error.log` - 错误日志
