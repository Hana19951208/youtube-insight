/**
 * YouTube 内容分析服务
 */
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import HttpsProxyAgent from 'https-proxy-agent';

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const proxyAgent = proxyUrl ? HttpsProxyAgent(proxyUrl) : undefined;

const axiosInstance = axios.create({
  httpsAgent: proxyAgent,
  httpAgent: proxyAgent,
});

interface Channel {
  id: string;
  name: string;
  slug: string;
  url: string;
}

interface VideoInfo {
  videoId: string;
  title: string;
  url: string;
  publishedAt: string;
}

interface TranscriptEntry {
  text: string;
  offset: number;
  duration: number;
}

/**
 * 读取频道配置
 */
export function getChannels(): Channel[] {
  const configPath = path.join(process.cwd(), 'config', 'channels.json');
  if (!fs.existsSync(configPath)) {
    return [];
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  return config.channels || [];
}

/**
 * 获取已分析视频 ID 列表
 */
export function getAnalyzedVideoIds(): Set<string> {
  const analysesDir = path.join(process.cwd(), 'data', 'analyses');
  if (!fs.existsSync(analysesDir)) {
    return new Set();
  }
  const files = fs.readdirSync(analysesDir).filter(f => f.endsWith('.json'));
  return new Set(files.map(f => f.replace('.json', '')));
}

/**
 * 从 YouTube RSS 获取频道视频列表
 */
export async function fetchChannelVideos(channelId: string): Promise<VideoInfo[]> {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  try {
    const response = await axiosInstance.get(rssUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    const result = parser.parse(response.data);
    const entries = result.feed?.entry || [];

    if (!Array.isArray(entries)) {
      return [];
    }

    return entries.map((entry: any) => ({
      videoId: entry['yt:videoId'],
      title: entry.title,
      url: entry.link?.['@_href'] || `https://www.youtube.com/watch?v=${entry['yt:videoId']}`,
      publishedAt: entry.published,
    }));
  } catch (error) {
    console.error(`Failed to fetch videos for channel ${channelId}:`, error);
    return [];
  }
}

/**
 * 获取视频字幕
 */
export async function fetchTranscript(videoId: string): Promise<TranscriptEntry[]> {
  const apiKey = process.env.SUPADATA_API_KEY;
  if (!apiKey) {
    throw new Error('SUPADATA_API_KEY not configured');
  }

  try {
    const response = await axiosInstance.get('https://api.supadata.ai/v1/youtube/transcript', {
      params: { video_id: videoId },
      headers: {
        'x-api-key': apiKey,
      },
      timeout: 30000,
    });

    return response.data.transcript || [];
  } catch (error: any) {
    console.error(`Failed to fetch transcript for ${videoId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch transcript');
  }
}

/**
 * 获取视频元数据（通过 oEmbed）
 */
export async function fetchVideoMetadata(videoId: string): Promise<{
  title: string;
  channelName: string;
  thumbnailUrl: string;
  duration?: string;
} | null> {
  try {
    const response = await axiosInstance.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, {
      timeout: 10000,
    });

    return {
      title: response.data.title,
      channelName: response.data.author_name,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
  } catch (error) {
    console.error(`Failed to fetch metadata for ${videoId}:`, error);
    return null;
  }
}

/**
 * 保存分析结果
 */
export function saveAnalysis(videoId: string, data: any): string {
  const analysesDir = path.join(process.cwd(), 'data', 'analyses');
  if (!fs.existsSync(analysesDir)) {
    fs.mkdirSync(analysesDir, { recursive: true });
  }

  const filePath = path.join(analysesDir, `${videoId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return filePath;
}

/**
 * 格式化时间为 MM:SS 格式
 */
export function formatTime(offsetMs: number): string {
  const totalSeconds = Math.floor(offsetMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
