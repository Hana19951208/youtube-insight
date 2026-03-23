import fs from 'fs';
import path from 'path';

const VIDEO_ID = 'jIviHI7fqyc';

// 辅助函数：将毫秒转换为 MM:SS 或 H:MM:SS
function msToTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 辅助函数：将时间字符串转换为毫秒
function timestampToMs(timestamp: string): number {
  const parts = timestamp.split(':').map(Number);
  if (parts.length === 3) {
    return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
  }
  return (parts[0] * 60 + parts[1]) * 1000;
}

// 读取数据
const analysisPath = `./data/analyses/${VIDEO_ID}.json`;
const transcriptPath = `./data/transcripts/${VIDEO_ID}.json`;

const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));
const transcript = JSON.parse(fs.readFileSync(transcriptPath, 'utf-8'));

console.log('✅ 数据加载完成');
console.log(`   - 口播稿: ${analysis.scriptStructure.fullScript.sections.length} 个段落`);
console.log(`   - 字幕: ${transcript.content.length} 条`);

// 提取时间锚点
const timeAnchors = {
  goldenQuotes: analysis.goldenQuotes.map((q: any) => ({
    timestamp: q.timestamp,
    ms: timestampToMs(q.timestamp),
    text: q.quote
  })),
  insights: analysis.insights.map((i: any) => ({
    id: i.id,
    title: i.title,
    start: i.timeRange.start,
    end: i.timeRange.end,
    startMs: timestampToMs(i.timeRange.start),
    endMs: timestampToMs(i.timeRange.end)
  }))
};

console.log('\n📍 时间锚点:');
console.log(`   - 金句: ${timeAnchors.goldenQuotes.length} 个`);
console.log(`   - 观点时间段: ${timeAnchors.insights.length} 个`);

// 提取口播稿句子
const scriptLines: any[] = [];
analysis.scriptStructure.fullScript.sections.forEach((section: any, idx: number) => {
  section.lines.forEach((line: string, lineIdx: number) => {
    if (line.trim()) {
      scriptLines.push({
        text: line,
        section: section.sectionTitle,
        order: lineIdx,
        sectionIndex: idx
      });
    }
  });
});

console.log(`\n📝 口播稿句子: ${scriptLines.length} 句`);

// 匹配段落到时间范围
function getSectionTimeRange(sectionTitle: string): { start: number, end: number } {
  const titleMap: Record<string, any> = {
    '开场': { start: 0, end: 180000 },  // 0-3分钟
    'NVIDIA的转型': { start: 180000, end: 480000 },  // 3-8分钟
    'Token是什么': { start: 0, end: 120000 },  // 开场部分
    'Blackwell技术': { start: 3168000, end: 4200000 },  // 52:48 - 70:00
    '物理AI未来': { start: 7800000, end: 8340000 },  // 130:00 - 139:00
    '总结': { start: 7800000, end: 8340000 }
  };

  // 从 insights 中查找对应的时间范围
  const sectionToInsight: Record<string, string> = {
    'NVIDIA的转型': 'insight-1',  // CUDA 20年
    'Token是什么': 'insight-4',  // Token
    'Blackwell技术': 'insight-3',  // Blackwell
    '物理AI未来': 'insight-5',  // 物理AI
    '总结': 'insight-5'
  };

  const insightId = sectionToInsight[sectionTitle];
  if (insightId) {
    const insight = timeAnchors.insights.find((i: any) => i.id === insightId);
    if (insight) {
      return { start: insight.startMs, end: insight.endMs };
    }
  }

  return titleMap[sectionTitle] || { start: 0, end: 8340000 };
}

// 为每个口播稿句子查找候选字幕
function findCandidates(scriptLine: any, maxCandidates: number = 5): any[] {
  const timeRange = getSectionTimeRange(scriptLine.section);
  const candidates: any[] = [];

  // 在时间范围内搜索字幕
  for (const subtitle of transcript.content) {
    if (subtitle.offset >= timeRange.start - 30000 && subtitle.offset <= timeRange.end + 30000) {
      candidates.push({
        text: subtitle.text,
        timestamp: msToTimestamp(subtitle.offset),
        offset: subtitle.offset,
        duration: subtitle.duration
      });
    }
  }

  // 按时间排序，返回前几个
  return candidates.slice(0, maxCandidates);
}

// 生成 materialMatches
const matches: any[] = [];

for (const scriptLine of scriptLines) {
  const candidates = findCandidates(scriptLine, 5);

  matches.push({
    scriptLine: scriptLine.text,
    section: scriptLine.section,
    candidates: candidates.map((c, idx) => ({
      rank: idx + 1,
      confidence: idx < 3 ? 0.9 - idx * 0.15 : 0.5,
      matchStrategy: 'timeAnchor',
      subtitleText: c.text,
      subtitleTimestamp: c.timestamp,
      videoStart: msToTimestamp(c.offset - 1000),
      videoEnd: msToTimestamp(c.offset + c.duration + 1000),
      duration: Math.ceil((c.duration + 2000) / 1000),
      expansion: {
        before: 1,
        after: 1,
        reason: '默认扩展1秒'
      }
    })).slice(0, 3)
  });
}

// 保存结果
const materialMatches = {
  generatedAt: new Date().toISOString(),
  videoId: VIDEO_ID,
  totalLines: scriptLines.length,
  matchedLines: matches.filter(m => m.candidates.length > 0).length,
  unmatchedCount: matches.filter(m => m.candidates.length === 0).length,
  unmatchedLines: matches.filter(m => m.candidates.length === 0).map(m => m.scriptLine),
  matches
};

// 更新分析文件
analysis.scriptStructure.materialMatches = materialMatches;
fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));

console.log('\n✅ 素材匹配完成');
console.log(`   - 总句子: ${materialMatches.totalLines}`);
console.log(`   - 成功匹配: ${materialMatches.matchedLines}`);
console.log(`   - 未匹配: ${materialMatches.unmatchedCount}`);
console.log(`\n结果已保存到: ${analysisPath}`);