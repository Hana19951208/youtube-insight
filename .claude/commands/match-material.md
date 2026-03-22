# Match Material

将口播稿文案与原视频素材进行智能匹配，生成可用于剪辑的素材时间点。

**输入**：用户指定 videoId（需确保该视频已完成口播稿生成）

**执行步骤**：
1. 读取口播稿数据 (`data/analyses/{videoId}.json`)
2. 读取原始字幕 (`data/transcripts/{videoId}.json`)
3. 建立时间锚点索引（goldenQuotes + insights.timeRange）
4. 对每句口播文案进行智能匹配：
   - 时间锚点定位候选区间
   - LLM 语义相似度匹配
   - 输出 2-3 个候选素材片段（含前后扩展秒数）
5. 保存匹配结果到原 JSON 的 `scriptStructure.materialMatches`

**详细指令**：请参考 `.claude/skills/match-material/SKILL.md`