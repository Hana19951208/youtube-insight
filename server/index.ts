/**
 * Express 服务器入口
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { videosRouter } from './routes/videos.js';
import { scriptRouter } from './routes/script.js';
import { analyzeRouter } from './routes/analyze.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API 路由
app.use('/api', videosRouter);
app.use('/api', scriptRouter);
app.use('/api', analyzeRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`API endpoints:`);
  console.log(`  GET  /api/videos - 获取所有已分析视频`);
  console.log(`  GET  /api/videos/:id - 获取单个视频详情`);
  console.log(`  GET  /api/script/videos - 获取可选视频列表`);
  console.log(`  POST /api/script/save - 保存口播稿结构`);
  console.log(`  GET  /api/analyze/videos - 获取待分析视频列表`);
  console.log(`  POST /api/analyze/:videoId - 分析指定视频`);
  console.log(`  GET  /api/analyze/status - 检查分析状态`);
});
