# YouTube Insight Dashboard

YouTube 内容分析工具 - 通过 Claude Code Skill 自动获取频道新视频、提取字幕、AI 分析内容、以 Dashboard 形式展示分析结果。

## 快速开始

### 1. 环境要求

- Node.js 18+
- Supadata API Key（用于获取 YouTube 字幕）

### 2. 配置

#### 配置 Supadata API Key

编辑 `.env` 文件：

```env
SUPADATA_API_KEY=your-api-key-here
PORT=3001
```

获取 API Key：访问 https://supadata.ai 注册并获取

#### 配置 YouTube 频道

编辑 `config/channels.json`：

```json
{
  "channels": [
    {
      "id": "UC2D2CMWXMOVWx7giW1n3LIg",
      "name": "Huberman Lab",
      "slug": "huberman-lab",
      "url": "https://www.youtube.com/@hubermanlab"
    }
  ],
  "settings": {
    "maxVideosPerChannel": 2
  }
}
```

### 3. 启动服务

```bash
# 安装依赖
npm install

# 启动后端（终端 1）
npm run server

# 启动前端（终端 2）
npm run dev
```

访问 http://localhost:5173 查看 Dashboard

### 4. 使用 Claude Code Skill

在 Claude Code（VS Code 插件）聊天窗口中：

#### 分析新视频

```
/analyze-content
```

- 自动读取频道配置
- 获取各频道最新视频（每频道最多 2 个）
- 调用 Supadata API 获取字幕
- AI 分析内容，提炼 7 个结构化模块
- 保存到 `data/analyses/{videoId}.json`

#### 生成口播稿

```
/script-content
```

- 扫描已分析视频
- 选择目标视频
- 生成专业级口播稿（结构 + 标题 + 完整文案）
- 保存到原 JSON 文件

## 项目结构

```
youtube-insight-dashboard/
├── .claude/
│   ├── commands/              # Skill 入口命令
│   │   ├── analyze-content.md
│   │   └── script-content.md
│   └── skills/                # Skill 详细指令
│       ├── analyze-content/SKILL.md
│       └── script-content/SKILL.md
├── config/
│   └── channels.json          # 频道配置
├── data/
│   └── analyses/              # 分析结果存储
├── server/
│   ├── index.ts               # Express 服务入口
│   ├── routes/
│   │   ├── videos.ts          # 视频列表 API
│   │   └── script.ts          # 口播稿生成 API
│   └── services/
│       └── transcript.ts      # 字幕获取服务
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── VideoDetail/
│   │   ├── Layout/
│   │   └── shared/
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── globals.css
├── .env                       # 环境变量（需自行配置）
├── package.json
└── vite.config.ts
```

## 分析输出模块

1. **内容速览** - 一句话总结、核心观点、目标受众、创作价值评分
2. **嘉宾背景** - 身份、独特性、潜在偏见
3. **核心观点** - 论点、论据、金句、大白话解释
4. **概念词典** - 专业术语中英对照
5. **观点关系** - 因果、并列、依赖关系
6. **金句收集** - 时间戳、语境、适用场景
7. **质量评估** - 多维度评分、推荐展开的观点

## 技术栈

- **前端**: React + TypeScript + Vite + Tailwind CSS
- **后端**: Node.js + Express
- **字幕 API**: Supadata
- **AI 分析**: Claude Code Skill

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| /api/videos | GET | 获取所有已分析视频 |
| /api/videos/:id | GET | 获取单个视频详情 |
| /api/script/videos | GET | 获取可选视频列表 |
| /api/script/save | POST | 保存口播稿结构 |

## 常见问题

### Q: Supadata API 调用失败
A: 检查 `.env` 文件中 `SUPADATA_API_KEY` 是否正确配置

### Q: 视频无字幕
A: 有些视频没有自动字幕，会被自动跳过

### Q: Skill 找不到命令
A: 确保在 Claude Code VS Code 插件的聊天窗口中输入命令

## License

MIT
