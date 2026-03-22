/**
 * 内容分析 API 路由
 */
import express from 'express';
import {
  getChannels,
  getAnalyzedVideoIds,
  fetchChannelVideos,
  fetchTranscript,
  fetchVideoMetadata,
  saveAnalysis,
  formatTime,
} from '../services/analyzer.js';

const router = express.Router();

// 获取可选视频列表（未分析的视频）
router.get('/analyze/videos', async (req, res) => {
  try {
    const channels = getChannels();
    const analyzedIds = getAnalyzedVideoIds();
    const maxVideosPerChannel = 2;

    const newVideos: any[] = [];

    for (const channel of channels) {
      const videos = await fetchChannelVideos(channel.id);
      let newCount = 0;

      for (const video of videos) {
        if (analyzedIds.has(video.videoId)) {
          continue;
        }
        if (newCount >= maxVideosPerChannel) {
          break;
        }

        const metadata = await fetchVideoMetadata(video.videoId);
        newVideos.push({
          videoId: video.videoId,
          title: metadata?.title || video.title,
          channelName: metadata?.channelName || channel.name,
          channelSlug: channel.slug,
          thumbnailUrl: metadata?.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`,
          publishedAt: video.publishedAt,
          url: video.url,
        });
        newCount++;
      }
    }

    res.json({
      videos: newVideos,
      channels: channels.map(c => ({
        slug: c.slug,
        name: c.name,
      })),
    });
  } catch (error: any) {
    console.error('Failed to fetch new videos:', error);
    res.status(500).json({ error: error.message });
  }
});

// 分析指定视频
router.post('/analyze/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const analyzedIds = getAnalyzedVideoIds();

    if (analyzedIds.has(videoId)) {
      return res.status(400).json({ error: 'Video already analyzed' });
    }

    // 获取字幕
    let transcript: any[];
    try {
      transcript = await fetchTranscript(videoId);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }

    if (!transcript || transcript.length === 0) {
      return res.status(400).json({ error: 'No transcript available' });
    }

    // 获取元数据
    const metadata = await fetchVideoMetadata(videoId);
    if (!metadata) {
      return res.status(400).json({ error: 'Failed to fetch video metadata' });
    }

    // 获取频道信息
    const channels = getChannels();
    const channel = channels.find(c => metadata.channelName?.includes(c.name)) || channels[0];

    // 拼接字幕文本用于 AI 分析
    const transcriptText = transcript
      .map((t: any) => t.text)
      .join(' ');

    // 调用 AI 分析（这里需要 Claude API 或本地 AI）
    // 由于是 Skill 驱动，返回基础数据由 Skill 进行深度分析
    const analysis = {
      meta: {
        videoId,
        videoTitle: metadata.title,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        channelId: '',
        channelName: metadata.channelName,
        channelSlug: channel?.slug || 'unknown',
        thumbnailUrl: metadata.thumbnailUrl,
        duration: '',
        publishedAt: new Date().toISOString(),
        analyzedAt: new Date().toISOString(),
        outputLevel: 'creator',
      },
      transcript,
      transcriptText: transcriptText.substring(0, 50000), // 限制长度
      _needsAIAnalysis: true,
    };

    // 保存分析结果
    saveAnalysis(videoId, analysis);

    res.json({
      success: true,
      videoId,
      message: '视频分析已完成，请运行 /analyze-content skill 进行深度内容分析',
    });
  } catch (error: any) {
    console.error('Failed to analyze video:', error);
    res.status(500).json({ error: error.message });
  }
});

// 分析状态检查
router.get('/analyze/status', (req, res) => {
  const channels = getChannels();
  const analyzedIds = getAnalyzedVideoIds();

  res.json({
    configuredChannels: channels.length,
    analyzedVideos: analyzedIds.size,
    channels: channels.map(c => ({
      slug: c.slug,
      name: c.name,
      id: c.id,
    })),
  });
});

export { router as analyzeRouter };
