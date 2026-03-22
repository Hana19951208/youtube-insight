/**
 * 字幕获取服务
 * 使用 Supadata API 获取 YouTube 视频字幕
 */

export interface TranscriptSegment {
  offset: number;
  duration: number;
  text: string;
}

export async function getTranscript(videoId: string): Promise<{ segments: TranscriptSegment[]; content: string } | null> {
  const apiKey = process.env.SUPADATA_API_KEY;

  if (!apiKey) {
    console.error('SUPADATA_API_KEY not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.supadata.ai/v1/youtube/transcript?video_id=${videoId}&language=en`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null; // 无字幕
      }
      const errorText = await response.text();
      console.error(`Supadata API error (${response.status}):`, errorText);
      throw new Error(`Supadata API error: ${response.status}`);
    }

    const data = await response.json();

    // Supadata 返回格式：{ transcripts: [{ text, offset, duration }] }
    if (data.transcripts && Array.isArray(data.transcripts)) {
      const segments: TranscriptSegment[] = data.transcripts.map((t: any) => ({
        offset: t.offset || 0,
        duration: t.duration || 0,
        text: t.text || '',
      }));

      const content = segments.map(s => s.text).join(' ');
      return { segments, content };
    }

    // 或者返回的是 { content: string }
    if (data.content) {
      return { segments: [], content: data.content };
    }

    return null;
  } catch (error) {
    console.error('Failed to get transcript:', error);
    return null;
  }
}

/**
 * 将毫秒转换为 MM:SS 格式
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
