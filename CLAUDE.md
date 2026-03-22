# YouTube Insight Dashboard - 开发沉淀文档

> 本文档记录项目开发过程中的经验教训、遇到的坑和解决方案，避免重复踩坑。

---

## 一、项目概述

**项目名称**: YouTube Insight Dashboard
**功能**: AI 驱动的 YouTube 内容分析工具，通过 Claude Code Skill 自动获取频道新视频、提取字幕、AI 分析内容、生成口播稿

**技术栈**:
- 前端：React + TypeScript + Vite + Tailwind CSS
- 后端：Node.js + Express + TypeScript (tsx)
- 字幕 API: Supadata.ai
- AI 分析：Claude Code Skill

---

## 二、网络配置问题（重要）

### 问题 1：无法访问 YouTube 服务

**现象**:
- YouTube RSS Feed 请求超时（exit code 28）
- oEmbed API 请求超时
- 无法获取频道视频列表和字幕

**原因**:
- YouTube 在中国大陆被防火墙封锁
- 直接请求 `https://www.youtube.com` 和 `https://api.supadata.ai` 会被阻断

**解决方案**: 配置 HTTP/HTTPS 代理

1. **检测代理端口**:
```bash
netstat -ano | findstr "7890 7891 10808"
# 找到代理服务器监听的端口（通常是 7890）
```

2. **配置环境变量** (`.env`):
```env
SUPADATA_API_KEY=your_api_key_here
PORT=3001
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
```

3. **后端代码中启用代理**:
```typescript
// server/services/analyzer.ts
import HttpsProxyAgent from 'https-proxy-agent';

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const proxyAgent = proxyUrl ? HttpsProxyAgent(proxyUrl) : undefined;

const axiosInstance = axios.create({
  httpsAgent: proxyAgent,
  httpAgent: proxyAgent,
});
```

4. **安装依赖**:
```bash
npm install https-proxy-agent@5  # 注意版本，v6+ 的导入方式不同
```

**关键注意点**:
- `https-proxy-agent` v6+ 的导入方式改为 `import HttpsProxyAgent from 'https-proxy-agent'`
- v5 版本的导入方式是 `const HttpsProxyAgent = require('https-proxy-agent')`
- 如果使用 ESM (import/export)，需要确保 package.json 中配置正确

---

### 问题 2：Supadata API 参数格式

**现象**: API 返回 200 但 transcript 为空数组

**原因**: Supadata API 对视频 ID 参数的格式有特定要求

**解决方案**: 使用完整 URL 而非 videoId

```javascript
// ❌ 不工作
axios.get('https://api.supadata.ai/v1/youtube/transcript', {
  params: { video_id: 'RECLTp_YxSU' }
})

// ✅ 工作
axios.get('https://api.supadata.ai/v1/youtube/transcript', {
  params: { url: 'https://youtu.be/RECLTp_YxSU' }  // 使用 youtu.be 短链接
})
```

**返回数据格式**:
```json
{
  "lang": "en",
  "availableLangs": ["en"],
  "content": [
    {
      "lang": "en",
      "text": "字幕文本",
      "offset": 240,      // 毫秒
      "duration": 4480    // 毫秒
    }
  ]
}
```

---

## 三、后端服务问题

### 问题 3：ESM 模块导入问题

**现象**:
```
SyntaxError: The requested module 'https-proxy-agent' does not provide an export named 'HttpsProxyAgent'
```

**原因**: `https-proxy-agent` v6+ 改变了导出方式

**解决方案**:
```typescript
// ❌ 错误（v5 写法）
import { HttpsProxyAgent } from 'https-proxy-agent';

// ✅ 正确（v6+ 写法）
import HttpsProxyAgent from 'https-proxy-agent';
```

或者使用 v5 版本：
```bash
npm install https-proxy-agent@5
```

---

### 问题 4：端口占用

**现象**:
```
Error: listen EADDRINUSE: address already in use :::3001
```

**解决方案**:
```bash
# 1. 查找占用端口的进程
netstat -ano | findstr ":3001"

# 2. 杀死进程（Windows cmd）
taskkill /F /PID <进程 ID>

# 或者在 package.json 中使用不同的端口
PORT=3002
```

---

## 四、前端配置问题

### 问题 5：API 端口不一致

**现象**: Dashboard 可以加载，但点击视频详情页时显示 "Video not found"

**原因**:
- Dashboard.tsx 使用 `http://localhost:3001`
- DetailPage.tsx 使用 `http://localhost:3002`

**解决方案**: 统一端口
```typescript
// DetailPage.tsx
const response = await fetch(`http://localhost:3001/api/videos/${videoId}`);
```

---

## 五、Claude Code Skill 配置

### Skill 命令文件对应关系

**重要**: 确保 `.claude/commands/` 目录下的命令文件名和内容匹配

```
.claude/
├── commands/
│   ├── analyze-content.md    # /analyze-content 命令入口
│   └── script-content.md     # /script-content 命令入口
└── skills/
    ├── analyze-content/
    │   └── SKILL.md          # 分析详细指令
    └── script-content/
        └── SKILL.md          # 口播稿详细指令
```

**常见错误**: 命令文件内容写反了
- `analyze-content.md` 应该描述分析流程
- `script-content.md` 应该描述口播稿生成流程

---

## 六、完整部署清单

### 启动前检查

```bash
# 1. 检查代理是否运行
netstat -ano | findstr ":7890"

# 2. 检查 .env 配置
cat .env
# 确保包含:
# SUPADATA_API_KEY=your_key
# HTTP_PROXY=http://127.0.0.1:7890
# HTTPS_PROXY=http://127.0.0.1:7890

# 3. 检查频道配置
cat config/channels.json

# 4. 安装依赖
npm install

# 5. 启动后端（终端 1）
npm run server

# 6. 启动前端（终端 2）
npm run dev
```

### 验证服务

```bash
# 检查后端健康
curl http://localhost:3001/health

# 检查前端
curl http://localhost:5173

# 检查 API
curl http://localhost:3001/api/videos
curl http://localhost:3001/api/analyze/videos
```

---

## 七、使用流程

### 分析新视频

1. **在 Claude Code 中执行**:
```
/analyze-content
```

2. **流程**:
   - 读取 `config/channels.json`
   - 通过 YouTube RSS 获取最新视频（需要代理）
   - 调用 Supadata API 获取字幕（需要代理 + API Key）
   - AI 分析内容，生成 7 个模块
   - 保存到 `data/analyses/{videoId}.json`

3. **查看结果**: 访问 Dashboard → 选择视频查看详情

### 生成口播稿

1. **在 Claude Code 中执行**:
```
/script-content
```

2. **流程**:
   - 扫描 `data/analyses/` 目录
   - 选择没有口播稿的视频
   - 深度分析内容，设计叙事框架
   - 生成标题选项、完整口播稿
   - 保存到原 JSON 文件的 `scriptStructure` 字段

---

## 八、常见问题排查

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| RSS 请求超时 | 未配置代理 | 检查 `.env` 中的 `HTTP_PROXY` |
| Supadata 返回空 | 参数格式错误 | 使用 `url` 参数而非 `video_id` |
| 模块导入错误 | 版本不兼容 | 使用 `https-proxy-agent@5` |
| 端口被占用 | 服务重复启动 | `netstat` 查找并 `taskkill` |
| Skill 找不到命令 | 文件名错误 | 检查 `.claude/commands/` 目录 |
| 视频详情 404 | API 端口不一致 | 统一使用 3001 端口 |

---

## 九、Git 推送命令

```bash
# 初始化 Git（如未初始化）
git init

# 添加所有文件
git add .

# 创建提交
git commit -m "Initial commit: YouTube Insight Dashboard

功能:
- 后端 API 服务（Express + TypeScript）
- 前端 Dashboard（React + Vite + Tailwind）
- Claude Code Skill 集成
- YouTube 字幕获取（Supadata API）
- AI 内容分析和口播稿生成

配置:
- 代理支持（HTTP_PROXY/HTTPS_PROXY）
- 频道配置（config/channels.json）
- 环境变量（.env.example）

经验教训:
- 需要代理访问 YouTube 和 Supadata
- https-proxy-agent 版本兼容性
- 统一的 API 端口配置"

# 关联远程仓库
gh repo create <仓库名> --public --source=. --remote=origin

# 推送
git push -u origin main
```

---

## 十、关键文件清单

```
youtube-insight/
├── .env                          # 环境变量（需自行配置）
├── .env.example                  # 环境变量模板
├── .gitignore                    # Git 忽略文件
├── package.json                  # 项目配置
├── tsconfig.json                 # TypeScript 配置
├── vite.config.ts                # Vite 配置
├── tailwind.config.js            # Tailwind 配置
├── index.html                    # 前端入口
├── config/channels.json          # 频道配置
├── data/analyses/                # 分析结果存储
├── server/
│   ├── index.ts                  # 服务器入口
│   ├── routes/
│   │   ├── videos.ts             # 视频 API
│   │   ├── analyze.ts            # 分析 API
│   │   └── script.ts             # 口播稿 API
│   └── services/
│       └── analyzer.ts           # 分析服务（含代理配置）
├── src/
│   ├── App.tsx                   # 应用主组件
│   ├── main.tsx                  # React 入口
│   ├── types/index.ts            # 类型定义
│   ├── styles/globals.css        # 全局样式
│   └── components/               # React 组件
└── .claude/
    ├── commands/                 # Skill 命令入口
    └── skills/                   # Skill 详细指令
```

---

**最后更新**: 2026-03-22
**项目状态**: 基础功能完成，待优化
