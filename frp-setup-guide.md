# FRP + Auth Proxy 内网穿透配置

## 访问信息

| 项目 | 值 |
|------|-----|
| 域名（HTTPS） | https://opencode.example.com/ |
| 用户名 | youruser |
| 密码 | `<YOUR_PASSWORD>` |

## 架构

```
HTTP 隧道（OpenCode）:
用户浏览器/手机
    ↓ HTTPS
云服务器 Nginx (<SERVER_IP>:443/63901)
    ↓ HTTP
frps vhostHTTPPort (63902，仅本机访问)
    ↓ frp 隧道
OpenCode (127.0.0.1:63901) ← 自带认证

TCP 隧道（SSH）:
SSH 客户端
    ↓ TCP
云服务器 (<SERVER_IP>:63922)
    ↓ frp TCP 隧道
本地 Mac SSH (127.0.0.1:22)
```

## 本地服务 (macOS)

### 1. FRP 客户端

配置文件: `~/.frp/frpc.toml`

```toml
serverAddr = "<SERVER_IP>"
serverPort = 7000
auth.token = "<YOUR_FRP_TOKEN>"
transport.tls.enable = true

[[proxies]]
name = "opencode"
type = "http"
localIP = "127.0.0.1"
localPort = 63901
customDomains = ["<SERVER_IP>", "opencode.example.com"]

[[proxies]]
name = "ssh"
type = "tcp"
localIP = "127.0.0.1"
localPort = 22
remotePort = 63922
```

#### 开机自启动 (推荐)

launchd 配置文件: `~/Library/LaunchAgents/com.youruser.frpc.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.youruser.frpc</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/frpc</string>
        <string>-c</string>
        <string>/Users/youruser/.frp/frpc.toml</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/youruser/.frp/frpc.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/youruser/.frp/frpc.log</string>
    <key>WorkingDirectory</key>
    <string>/Users/youruser/.frp</string>
</dict>
</plist>
```

管理命令:
```bash
# 加载（启用自启动）
launchctl load ~/Library/LaunchAgents/com.youruser.frpc.plist

# 卸载（停止并禁用自启动）
launchctl unload ~/Library/LaunchAgents/com.youruser.frpc.plist

# 查看状态
launchctl list | grep frpc
```

#### 手动运行 (不推荐)

```bash
# 前台运行
frpc -c ~/.frp/frpc.toml

# 后台运行
nohup frpc -c ~/.frp/frpc.toml > ~/.frp/frpc.log 2>&1 &
```

### 2. OpenCode

启动:
```bash
OPENCODE_SERVER_USERNAME=youruser OPENCODE_SERVER_PASSWORD=<YOUR_PASSWORD> \
  opencode web --port 63901 --hostname 127.0.0.1
```

## 启动服务

frpc 已配置开机自启动（通过 launchd），正常情况下无需手动操作。

只需启动 OpenCode:
```bash
OPENCODE_SERVER_USERNAME=youruser OPENCODE_SERVER_PASSWORD=<YOUR_PASSWORD> \
  opencode web --port 63901 --hostname 127.0.0.1
```

如需手动重启 frpc:
```bash
launchctl unload ~/Library/LaunchAgents/com.youruser.frpc.plist
launchctl load ~/Library/LaunchAgents/com.youruser.frpc.plist
```

## 服务端

配置文件: `/home/youruser/frp/frps.toml`

```toml
bindPort = 7000
vhostHTTPPort = 63902
auth.token = "<YOUR_FRP_TOKEN>"
transport.tls.force = true
# 注意：不要设置 proxyBindAddr = "127.0.0.1"，否则 TCP 代理无法从公网访问
```

启动:
```bash
sudo nohup /home/youruser/frp/frps -c /home/youruser/frp/frps.toml > /home/youruser/frp/frps.log 2>&1 &
```

SSH 访问服务器:
```bash
ssh -i ~/Documents/your-server-key.pem ecs-user@<SERVER_IP>
```

SSH 访问本地 Mac（通过 frp 隧道）:
```bash
ssh -p 63922 youruser@<SERVER_IP>
```

可在 `~/.ssh/config` 添加别名简化使用:
```
Host mac-remote
    HostName <SERVER_IP>
    Port 63922
    User youruser
```
然后直接 `ssh mac-remote` 即可。

## Nginx (服务器)

- 443: https://opencode.example.com
- 63901: https://opencode.example.com:63901（可选保留）
- 反代到 `127.0.0.1:63902`（frps vhostHTTPPort）

关键反代配置要点（必须保留 Host + WebSocket/SSE）：
```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

proxy_set_header Host $host;
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $connection_upgrade;
proxy_buffering off;
proxy_read_timeout 3600;
proxy_send_timeout 3600;
```

## 云服务配置

### DNS
| 记录类型 | 主机记录 | 记录值 |
|---------|---------|--------|
| A | opencode | `<SERVER_IP>` |

### 安全组
| 端口 | 用途 | 访问来源 |
|------|------|---------|
| 443 | HTTPS 访问 | 0.0.0.0/0 |
| 63901 | HTTPS 访问（可选） | 0.0.0.0/0 |
| 63902 | frps vhostHTTPPort | 不对公网开放 |
| 63922 | SSH 端口转发 | 0.0.0.0/0（或限制 IP） |
| 7000 | frp 控制端口 | 仅 frpc 客户端所在公网 IP |

说明：
- 如不需要端口访问，建议关闭 63901，仅保留 443

## 代理放行规则 (Clash Verge)

添加到 `~/Library/Application Support/io.github.clash-verge-rev.clash-verge-rev/profiles/Merge.yaml`:

```yaml
prepend-rules:
  - PROCESS-NAME,frpc,DIRECT
  - DOMAIN-SUFFIX,example.com,DIRECT
  - IP-CIDR,<SERVER_IP>/32,DIRECT,no-resolve
```

修改后需要重启 Clash Verge 生效。

## 安全性

| 层面 | 状态 |
|------|------|
| 传输加密 | HTTPS (Nginx 证书，用户→服务器) |
| 隧道加密 | frp TLS 传输加密 |
| 加密边界 | Nginx → frps 为本机回环 HTTP |
| 登录验证 | 用户名 + 密码 + Cookie |
| WebSocket | 支持实时通信 |
| frp 隧道 | Token 认证 |
| 手机兼容 | 表单登录（无弹窗） |

## 故障排查

### 服务状态检查
```bash
# 本地 frpc（launchd 管理）
launchctl list | grep frpc      # 第一列为 PID，"-" 表示未运行
ps aux | grep frpc | grep -v grep

# 服务器端口（需 SSH 到服务器）
lsof -i :443    # Nginx HTTPS
lsof -i :63902  # frps vhostHTTPPort
```

### 日志查看
```bash
# frpc 日志
tail -50 ~/.frp/frpc.log

# 实时查看
tail -f ~/.frp/frpc.log
```

### 连通性测试
```bash
curl http://127.0.0.1:63901/  # 本地 OpenCode
curl -I https://opencode.example.com/  # Nginx 443
curl -I https://opencode.example.com:63901/  # Nginx 63901
```
