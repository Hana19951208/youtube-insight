# Analyze Content

执行内容分析：同步分析关注频道的新 YouTube 视频，提取字幕并使用 AI 提炼结构化核心观点。

**执行步骤**：
1. 读取 `config/channels.json` 获取关注频道
2. 检查 `data/analyses/` 目录，跳过已分析视频
3. 通过 YouTube RSS 获取各频道最新视频（每频道最多 2 个）
4. 调用 Supadata API 获取字幕
5. 分析内容，提炼 7 个结构化模块
6. 将结果保存到 `data/analyses/{videoId}.json`

**详细指令**：请参考 `.claude/skills/analyze-content/SKILL.md`
