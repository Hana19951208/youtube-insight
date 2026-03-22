import { VideoListItem } from '../../types';

interface VideoCardProps {
  video: VideoListItem;
}

export default function VideoCard({ video }: VideoCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '未知日期';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const renderStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < Math.round(score) ? 'text-yellow-400' : 'text-gray-300'}
      >
        ★
      </span>
    ));
  };

  return (
    <a
      href={`/video/${video.videoId}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
          alt={video.videoTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {video.hasScript && (
          <span className="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow">
            已生成口播稿
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-5">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {video.videoTitle}
        </h3>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{video.channelName}</span>
          <span>•</span>
          <span>{formatDate(video.publishedAt)}</span>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {video.overviewSummary}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            {renderStars(video.creationValueScore)}
            <span className="text-xs text-gray-400 ml-1">({video.creationValueScore}/5)</span>
          </div>
          <span className="text-xs text-blue-600 font-medium">{video.insightCount} 个核心观点</span>
        </div>
      </div>
    </a>
  );
}