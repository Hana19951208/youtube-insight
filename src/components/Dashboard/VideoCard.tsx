import { VideoListItem } from '../../types';

interface VideoCardProps {
  video: VideoListItem;
}

export default function VideoCard({ video }: VideoCardProps) {
  const formatDate = (dateString: string) => {
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
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="aspect-video relative">
        <img
          src={video.thumbnailUrl}
          alt={video.videoTitle}
          className="w-full h-full object-cover"
        />
        {video.hasScript && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
            已生成口播稿
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {video.videoTitle}
        </h3>

        <p className="text-sm text-gray-600 mb-2">
          {video.channelName} · {formatDate(video.publishedAt)}
        </p>

        <p className="text-sm text-gray-700 mb-3 line-clamp-3">
          {video.overviewSummary}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            {renderStars(video.creationValueScore)}
          </div>
          <span>{video.insightCount} 个观点</span>
        </div>
      </div>
    </a>
  );
}
