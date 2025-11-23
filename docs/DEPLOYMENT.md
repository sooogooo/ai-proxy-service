# 部署指南

本文档详细介绍如何在各种环境中部署 AI Proxy Service。

## 目录

- [Docker Compose 部署](#docker-compose-部署)
- [Kubernetes 部署](#kubernetes-部署)
- [手动部署](#手动部署)
- [环境配置](#环境配置)
- [监控与日志](#监控与日志)
- [故障排除](#故障排除)

---

## Docker Compose 部署

### 前置要求

- Docker >= 20.10
- Docker Compose >= 2.0

### 部署步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd ai-proxy-service
```

2. **配置环境变量**

```bash
cp .env.example .env
# 编辑 .env 文件设置你的配置
```

3. **构建并启动服务**

```bash
docker-compose up -d
```

4. **验证部署**

```bash
# 检查容器状态
docker-compose ps

# 检查健康状态
curl http://localhost/health
```

### 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并部署
docker-compose up -d --build
```

### 查看日志

```bash
# 所有服务日志
docker-compose logs -f

# 特定服务日志
docker-compose logs -f app
docker-compose logs -f nginx
```

### 停止服务

```bash
docker-compose down
```

---

## Kubernetes 部署

### 示例 Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-proxy-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-proxy-service
  template:
    metadata:
      labels:
        app: ai-proxy-service
    spec:
      containers:
      - name: ai-proxy
        image: ai-proxy-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-proxy-secrets
              key: api-key
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "100m"
            memory: "128Mi"
```

### 示例 Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ai-proxy-service
spec:
  selector:
    app: ai-proxy-service
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

---

## 手动部署

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Nginx (可选)

### 部署步骤

1. **安装依赖**

```bash
npm ci --only=production
```

2. **构建项目**

```bash
npm run build
```

3. **配置环境变量**

```bash
export NODE_ENV=production
export PORT=3000
export API_KEY=your-secret-key
export LOG_LEVEL=info
```

4. **启动服务**

```bash
npm start
```

### 使用 PM2 管理进程

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start dist/index.js --name ai-proxy-service

# 查看状态
pm2 status

# 查看日志
pm2 logs ai-proxy-service

# 重启服务
pm2 restart ai-proxy-service
```

### 配置 systemd 服务

创建 `/etc/systemd/system/ai-proxy.service`:

```ini
[Unit]
Description=AI Proxy Service
After=network.target

[Service]
Type=simple
User=nodejs
WorkingDirectory=/opt/ai-proxy-service
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

启用并启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable ai-proxy
sudo systemctl start ai-proxy
```

---

## 环境配置

### 必需变量

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `API_KEY` | API 认证密钥 | 无 |

### 可选变量

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `NODE_ENV` | 运行环境 | development |
| `PORT` | 服务端口 | 3000 |
| `LOG_LEVEL` | 日志级别 | info |
| `RATE_LIMIT_WINDOW_MS` | 速率限制窗口 (ms) | 60000 |
| `RATE_LIMIT_MAX` | 窗口内最大请求数 | 100 |

### 代理目标变量

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `OPENAI_API_URL` | OpenAI API 地址 | https://api.openai.com |
| `CLAUDE_API_URL` | Claude API 地址 | https://api.anthropic.com |
| `GOOGLE_API_URL` | Google API 地址 | https://generativelanguage.googleapis.com |
| `DEEPSEEK_API_URL` | Deepseek API 地址 | https://api.deepseek.com |

---

## 监控与日志

### 日志位置

- 开发环境: 控制台输出
- 生产环境:
  - `logs/combined.log` - 所有日志
  - `logs/error.log` - 错误日志

### 健康检查端点

- `GET /health` - 服务健康状态
- `GET /ready` - 服务就绪状态

### 日志级别

支持的日志级别 (从低到高):
- error
- warn
- info
- debug

---

## 故障排除

### 常见问题

#### 1. 容器无法启动

检查日志：
```bash
docker-compose logs app
```

常见原因：
- 环境变量未配置
- 端口被占用

#### 2. 代理请求失败

检查：
- API Key 是否正确
- 目标 API 是否可访问
- 网络连接是否正常

#### 3. 速率限制触发

增加 `RATE_LIMIT_MAX` 或 `RATE_LIMIT_WINDOW_MS` 的值。

### 调试模式

启用调试日志：
```bash
LOG_LEVEL=debug npm start
```

### 性能问题

1. 检查容器资源限制
2. 监控内存和 CPU 使用
3. 考虑增加副本数
4. 检查网络延迟

---

## 安全建议

1. **使用强 API Key** - 至少 32 个字符，包含字母、数字和特殊字符
2. **启用 HTTPS** - 在生产环境使用 SSL/TLS
3. **网络隔离** - 使用防火墙限制访问
4. **定期更新** - 保持依赖和镜像更新
5. **日志审计** - 监控异常请求模式
