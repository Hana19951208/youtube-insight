import { useState, useEffect } from 'react';
import ChannelTabs from './ChannelTabs';
import VideoGrid from './VideoGrid';
import LoadingState from '../shared/LoadingState';
import { VideoListItem } from '../../types';

interface ApiResponse {
  videos: VideoListItem[];
  channels: Array<{
    slug: string;
    name: string;
    videoCount: number;
  }>;
}

export default function Dashboard() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<string>('all');

  const fetchVideos = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/videos');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  const filteredVideos = selectedChannel === 'all'
    ? data?.videos || []
    : data?.videos.filter(v => v.channelSlug === selectedChannel) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          YouTube Insight Dashboard
        </h1>
        <div className="flex gap-4">
          <button
            onClick={fetchVideos}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            同步最新视频
          </button>
          <button
            onClick={() => window.open('vscode://vscode-insiders/ClaudeCode-Claude-Code.show', '_blank')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            打开 Claude Code
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          提示：在 Claude Code 中输入 <code className="bg-gray-100 px-2 py-1 rounded">/analyze-content</code> 开始分析新视频
        </p>
      </div>

      <ChannelTabs
        channels={data?.channels || []}
        selectedChannel={selectedChannel}
        onChannelChange={setSelectedChannel}
      />

      <VideoGrid videos={filteredVideos} />
    </div>
  );
}
