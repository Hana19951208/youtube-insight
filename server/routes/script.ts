/**
 * 口播稿生成 API 路由
 */
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 获取可选视频列表（用于生成口播稿）
router.get('/script/videos', (req, res) => {
  const analysesDir = path.join(process.cwd(), 'data', 'analyses');

  if (!fs.existsSync(analysesDir)) {
    return res.json({ videos: [] });
  }

  const files = fs.readdirSync(analysesDir).filter(f => f.endsWith('.json'));
  const videos: any[] = [];

  for (const file of files) {
    try {
      const videoId = file.replace('.json', '');
      const filePath = path.join(analysesDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // 只返回没有 scriptStructure 的视频
      if (!data.scriptStructure) {
        videos.push({
          videoId: data.meta.videoId,
          videoTitle: data.meta.videoTitle,
          channelName: data.meta.channelName,
          analyzedAt: data.meta.analyzedAt,
        });
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error);
    }
  }

  res.json({ videos });
});

// 保存口播稿结构
router.post('/script/save', (req, res) => {
  const { videoId, scriptStructure } = req.body;

  if (!videoId || !scriptStructure) {
    return res.status(400).json({ error: 'Missing videoId or scriptStructure' });
  }

  const filePath = path.join(process.cwd(), 'data', 'analyses', `${videoId}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video not found' });
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    data.scriptStructure = scriptStructure;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving script:', error);
    res.status(500).json({ error: 'Failed to save script' });
  }
});

export { router as scriptRouter };
