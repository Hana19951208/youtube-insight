# Match Material Skill

根据视频ID，自动将口播稿文案与原视频素材进行智能匹配，生成可用的视频素材时间点。

---

## 输入

用户提供的 `videoId`（需确保该视频已完成内容分析和口播稿生成）

---

## 执行步骤

### Step 1: 读取数据

1. 读取 `data/analyses/{videoId}.json` - 获取口播稿 (`scriptStructure.fullScript`)
2. 读取 `data/transcripts/{videoId}.json` - 获取原始字幕 (`content` 数组)

**验证数据完整性**：
- 检查口播稿是否存在 (`scriptStructure.fullScript`)
- 检查字幕是否存在
- 如果缺失，提示用户先运行 `/analyze-content` 和 `/script-content`

### Step 2: 构建时间锚点索引

从分析结果中提取时间信息，建立快速查找索引：

```typescript
// 时间锚点索引结构
interface TimeAnchorIndex {
  // 精确时间点（金句）
  exactPoints: Map<string, { text: string, timestamp: string }>

  // 时间范围（观点）
  ranges: Array<{
    insightId: string
    title: string
    start: string  // "MM:SS"
    end: string
  }>
}
```

提取来源：
- `goldenQuotes[].timestamp` → exactPoints
- `insights[].timeRange` → ranges

### Step 3: 解析口播稿结构

从 `scriptStructure.fullScript.sections` 提取所有口播文案：

```typescript
interface ScriptLine {
  text: string              // 口播稿原文
  section: string           // 所属段落标题
  order: number            // 在段落中的顺序
}
```

### Step 4: 智能匹配（核心逻辑）

对每句口播文案进行匹配：

#### 4.1 确定候选时间窗口

根据口播稿段落确定搜索范围：
- 段落有对应的 `insight.timeRange` → 使用该时间范围
- 段落没有对应 → 根据段落顺序估算（平均分布）
- 开场段落 → 从视频开头开始

#### 4.2 搜索候选字幕

在候选时间窗口内，提取所有字幕句子作为候选集：
- 将字幕的 `offset` (毫秒) 转换为 `MM:SS` 格式
- 过滤出在时间窗口内的字幕

#### 4.3 LLM 语义匹配

**提示词设计**：

```
你是一个视频剪辑专家。需要判断字幕句子是否能作为口播文案的视频素材。

口播文案：「{scriptLine}」
字幕句子：「{subtitleText}」

请判断两者是否语义匹配：
1. 如果字幕句子可以对口播文案起到画面配合作用，则匹配
2. 考虑同义改写、口语化表达等因素
3. 不要求完全一致，只要方向对即可

请输出JSON格式：
{
  "isMatch": true/false,
  "confidence": 0.0-1.0,
  "reason": "匹配/不匹配的理由"
}
```

#### 4.4 扩展秒数决策

对每个匹配成功的候选，让LLM决定前后扩展秒数：

```
口播文案：「{scriptLine}」
匹配字幕：「{subtitleText}」

根据内容重要性，决定前后扩展多少秒（1-2秒）：

输出JSON：
{
  "before": 1或2,
  "after": 1或2,
  "reason": "扩展理由，如：重要观点/金句需多扩展，过渡句可少扩展"
}
```

#### 4.5 生成候选列表

每个口播文案输出2-3个最佳候选，按置信度排序：

```typescript
interface MaterialCandidate {
  rank: number
  confidence: number
  matchStrategy: 'timeAnchor' | 'semantic'
  subtitleText: string
  subtitleTimestamp: string
  videoStart: string    // "MM:SS"
  videoEnd: string      // "MM:SS"
  duration: number      // 秒
  expansion: {
    before: number
    after: number
    reason: string
  }
}
```

### Step 5: 保存结果

更新原 JSON 文件，在 `scriptStructure` 下新增 `materialMatches`：

```json
{
  "scriptStructure": {
    ...existingFields,
    "materialMatches": {
      "generatedAt": "2026-03-23T...",
      "videoId": "xxx",
      "totalLines": 45,
      "matchedLines": 43,
      "unmatchedCount": 2,
      "unmatchedLines": ["无法匹配的句子..."],
      "matches": [
        {
          "scriptLine": "昨天，NVIDIA举办了GTC大会。",
          "section": "开场",
          "candidates": [ ... ]
        }
      ]
    }
  }
}
```

---

## 匹配策略说明

| 策略 | 说明 | 触发条件 |
|------|------|----------|
| `timeAnchor` | 时间锚点匹配 | 口播稿段落能找到对应的 insights.timeRange |
| `semantic` | 语义相似度匹配 | 使用 LLM 判断语义匹配度 |

---

## 输出展示

匹配完成后，向用户展示：

### 匹配统计

```
## 素材匹配完成

**视频**: {videoTitle}
**口播稿总句数**: {totalLines}
**成功匹配**: {matchedLines} 句
**未匹配**: {unmatchedCount} 句
**生成时间**: {timestamp}
```

### 匹配示例

```
### 【开场】

口播文案: 昨天，NVIDIA举办了GTC大会。

☑ 候选1 (置信度 0.95)
   字幕: "This is how intelligence is made..."
   时间: 00:08 → 00:13 (+扩展)
   扩展: 前1秒, 后2秒 (开场重要观点)

☑ 候选2 (置信度 0.82)
   字幕: "Generator of tokens..."
   时间: 00:15 → 00:20
   扩展: 前1秒, 后1秒
```

---

## 错误处理

| 错误 | 处理方式 |
|------|----------|
| 视频未分析 | 提示运行 `/analyze-content` |
| 视频无口播稿 | 提示运行 `/script-content` |
| 无字幕文件 | 提示无法匹配，返回空结果 |
| LLM匹配失败 | 记录错误，继续处理下一句 |

---

## 性能考虑

- 当前实现：全文加载字幕（适合2小时内视频）
- 2小时+视频可后续优化为分桶搜索

---

## 完成后

1. 告诉用户结果保存位置
2. 提示用户可以在前端查看匹配效果
3. 告知用户可以手动调整候选（修改 videoStart/videoEnd）