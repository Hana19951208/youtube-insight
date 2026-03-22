import { AnalysisResult } from '../../types';
import CopyButton from '../shared/CopyButton';

interface GoldenQuotesProps {
  quotes: AnalysisResult['goldenQuotes'];
  videoId: string;
}

// 将 MM:SS 转换为秒数
const parseTimestamp = (timeStr: string): number => {
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  } else if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  }
  return 0;
};

export default function GoldenQuotes({ quotes, videoId }: GoldenQuotesProps) {
  if (!quotes || quotes.length === 0) {
    return null;
  }

  const youtubeBaseUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <section className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">金句收集</h2>
      <div className="space-y-4">
        {quotes.map((quote, i) => (
          <div
            key={i}
            className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-lg"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <blockquote className="text-gray-800 italic flex-1">
                "{quote.quote}"
              </blockquote>
              <CopyButton text={quote.quote} />
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {quote.timestamp && (
                <a
                  href={`${youtubeBaseUrl}&t=${parseTimestamp(quote.timestamp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                  title="跳转到 YouTube"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {quote.timestamp}
                </a>
              )}
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                {quote.useCase}
              </span>
            </div>
            {quote.context && (
              <p className="text-xs text-gray-500 mt-2">{quote.context}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}