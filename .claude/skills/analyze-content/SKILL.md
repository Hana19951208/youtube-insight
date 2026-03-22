# Analyze Content Skill

同步分析关注频道的新YouTube视频，提炼结构化的核心观点。

## 抓取规则

1. **只抓新视频**：跳过已分析过的视频（`data/analyses/` 目录下已有对应 JSON 文件）
2. **限制数量**：每个频道最多只取 **最近2个** 未抓取的视频
3. **按时间排序**：RSS Feed 返回的视频已按发布时间倒序，直接取前2个未分析的即可

## 执行步骤

### Step 1: 读取频道配置
读取 `youtube-insight-dashboard/config/channels.json` 获取用户关注的频道列表。

### Step 2: 获取已分析视频列表
读取 `youtube-insight-dashboard/data/analyses/` 目录下所有 `.json` 文件名，提取 videoId 列表作为"已分析集合"。

### Step 3: 逐频道抓取新视频
对每个频道：
1. 通过 YouTube RSS Feed 获取最近视频：
   ```
   https://www.youtube.com/feeds/videos.xml?channel_id={channelId}
   ```
2. 解析 XML，提取视频列表（按发布时间倒序）
3. 过滤：跳过"已分析集合"中的视频
4. **限制**：只取过滤后的 **前2个视频**（即最近2个未分析视频）

### Step 4: 分析新视频
对每个待分析视频：

#### 4.1 获取视频信息
通过oEmbed API获取：
- 视频标题
- 缩略图
- 频道名称

#### 4.2 获取字幕
调用 Supadata API：
```
GET https://api.supadata.ai/v1/youtube/transcript?video_id={videoId}
Headers: x-api-key: {从.env读取SUPADATA_API_KEY}
```

#### 4.3 分析内容
分析字幕，输出7个模块：

##### 模块1: 内容速览 (overview)
- oneSentenceSummary: 一句话总结核心价值
- coreInsightsSummary: 3-5个核心观点一句话总结
- targetAudience: 适合谁看
- creationValue: { score: 1-5, reason: 评分理由 }

##### 模块2: 嘉宾背景 (guest)
- name: 嘉宾姓名
- title: 身份头衔
- uniqueness: 为什么值得听
- potentialBias: [可能的偏见]
- readingAdvice: 阅读建议

##### 模块3: 核心观点 (insights)
数组，每个观点包含：
- id: insight-1, insight-2...
- title: 观点标题
- timeRange: { start: "MM:SS", end: "MM:SS" } // 该观点在视频中的时间范围
- coreArgument: 核心论点
- evidences: [{ type: data|case|quote|analogy|logic, content: 内容 }]
- goldenQuote: { original: 原文, translation: 翻译, timestamp: "MM:SS" } // timestamp为金句出现的时间点
- plainExplanation: 大白话解释，初中生能懂
- conceptExplanations: [{ term: 术语, explanation: 解释 }]

##### 模块4: 概念词典 (glossary)
数组：
- term: 中文术语
- originalTerm: 英文原文
- context: 语境
- explanation: 大白话解释

##### 模块5: 观点关系 (insightRelations)
- causalChains: [{ from, relation, to }] 因果链
- parallels: [{ insights: [], description }] 并列
- dependencies: [{ insight, dependsOn }] 依赖
- narrativeSummary: 观点如何串联

##### 模块6: 金句收集 (goldenQuotes)
数组：
- quote: 金句内容
- timestamp: "MM:SS" // 金句在视频中出现的时间点
- context: 语境
- useCase: 适用场景

##### 模块7: 质量评估 (qualityAssessment)
- dimensions:
  - informationDensity: { score, note }
  - uniqueness: { score, note }
  - evidenceStrength: { score, note }
  - accessibilityScore: { score, note }
  - creationValue: { score, note }
- overallRecommendation: 总体建议
- topInsightsToExpand: [{ insightId, reason }]

#### 4.4 保存结果
组装完整JSON（包含meta信息），保存到：
```
youtube-insight-dashboard/data/analyses/{videoId}.json
```

### Step 5: 输出结果
告诉用户：
- 检查了多少个频道
- 每个频道发现多少个新视频（及跳过多少个超出限制的）
- 成功分析了多少个
- 跳过了多少个（已分析/无字幕/超出限制）

## 分析原则

1. 论据优先具体数据和真实案例
2. 大白话让初中生能懂
3. 提取所有专业术语
4. 标注观点因果、并列、依赖关系
5. 保留最有冲击力的金句
6. 评分客观，不一味高分
7. **时间戳定位**：
   - 根据字幕的 offset 字段（毫秒）计算时间点
   - 核心观点的 timeRange 应覆盖该观点讨论的起止时间
   - 金句的 timestamp 应精确到金句开始出现的时间
   - 时间格式统一为 "MM:SS"（超过1小时用 "H:MM:SS"）

## 完整输出格式

```json
{
  "meta": {
    "videoId": "",
    "videoTitle": "",
    "videoUrl": "",
    "channelId": "",
    "channelName": "",
    "channelSlug": "",
    "thumbnailUrl": "",
    "duration": "",
    "publishedAt": "",
    "analyzedAt": "",
    "outputLevel": "creator"
  },
  "overview": {},
  "guest": {},
  "insights": [],
  "glossary": [],
  "insightRelations": {},
  "goldenQuotes": [],
  "qualityAssessment": {}
}
```

## 完成后

提示用户启动前端查看

## 生成口播稿

如需为某个视频生成口播稿结构，执行 `/script-content`。
