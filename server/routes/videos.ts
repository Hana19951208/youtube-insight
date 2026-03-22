/**
 * 视频列表 API 路由
 */
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

interface VideoAnalysis {
  meta: {
    videoId: string;
    videoTitle: string;
    channelName: string;
    channelSlug: string;
    thumbnailUrl: string;
    publishedAt: string;
    analyzedAt: string;
  };
  overview: {
    oneSentenceSummary: string;
  };
  insights: any[];
  qualityAssessment?: {
    dimensions: {
      creationValue: { score: number };
    };
  };
  scriptStructure?: any;
}

// 获取所有已分析视频
router.get('/videos', (req, res) => {
  const analysesDir = path.join(process.cwd(), 'data', 'analyses');

  if (!fs.existsSync(analysesDir)) {
    return res.json({ videos: [], channels: [] });
  }

  const files = fs.readdirSync(analysesDir).filter(f => f.endsWith('.json'));
  const videos: any[] = [];
  const channelMap = new Map();

  for (const file of files) {
    try {
      const videoId = file.replace('.json', '');
      const filePath = path.join(analysesDir, file);
      const data: VideoAnalysis = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      videos.push({
        videoId: data.meta.videoId,
        videoTitle: data.meta.videoTitle,
        videoUrl: `https://www.youtube.com/watch?v=${data.meta.videoId}`,
        channelName: data.meta.channelName,
        channelSlug: data.meta.channelSlug,
        thumbnailUrl: data.meta.thumbnailUrl,
        publishedAt: data.meta.publishedAt,
        analyzedAt: data.meta.analyzedAt,
        overviewSummary: data.overview?.oneSentenceSummary || '',
        creationValueScore: data.qualityAssessment?.dimensions?.creationValue?.score || 0,
        insightCount: data.insights?.length || 0,
        hasScript: !!data.scriptStructure,
      });

      // 统计频道信息
      if (!channelMap.has(data.meta.channelSlug)) {
        channelMap.set(data.meta.channelSlug, {
          slug: data.meta.channelSlug,
          name: data.meta.channelName,
          videoCount: 0,
        });
      }
      channelMap.get(data.meta.channelSlug).videoCount++;
    } catch (error) {
      console.error(`Error reading ${file}:`, error);
    }
  }

  res.json({
    videos: videos.sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime()),
    channels: Array.from(channelMap.values()),
  });
});

// 获取单个视频详情
router.get('/videos/:videoId', (req, res) => {
  const { videoId } = req.params;
  const filePath = path.join(process.cwd(), 'data', 'analyses', `${videoId}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video not found' });
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json({ analysis: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read analysis' });
  }
});

export { router as videosRouter };
