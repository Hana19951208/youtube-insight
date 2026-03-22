import { AnalysisResult } from '../../types';

interface CoreInsightsProps {
  insights: AnalysisResult['insights'];
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

export default function CoreInsights({ insights, videoId }: CoreInsightsProps) {
  const youtubeBaseUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <section className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">核心观点</h2>
      <div className="space-y-6">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="border-l-4 border-blue-500 pl-4 py-2"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900">{insight.title}</h3>
              {insight.timeRange && (
                <a
                  href={`${youtubeBaseUrl}&t=${parseTimestamp(insight.timeRange.start)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                  title="跳转到 YouTube"
                >
                  {insight.timeRange.start} - {insight.timeRange.end}
                </a>
              )}
            </div>
            <p className="text-gray-700 mb-3">{insight.coreArgument}</p>

            {insight.evidences && insight.evidences.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-600 mb-2">论据支撑</h4>
                <div className="space-y-1">
                  {insight.evidences.map((evidence, i) => (
                    <p key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-blue-500">
                        {evidence.type === 'data' && '📊'}
                        {evidence.type === 'case' && '📋'}
                        {evidence.type === 'quote' && '💬'}
                        {evidence.type === 'analogy' && '🔄'}
                        {evidence.type === 'logic' && '🧠'}
                      </span>
                      {evidence.content}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {insight.goldenQuote && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                <p className="text-yellow-800 italic">"{insight.goldenQuote.original}"</p>
                {insight.goldenQuote.translation && (
                  <p className="text-yellow-700 text-sm mt-1">
                    {insight.goldenQuote.translation}
                  </p>
                )}
                {insight.goldenQuote.timestamp && (
                  <a
                    href={`${youtubeBaseUrl}&t=${parseTimestamp(insight.goldenQuote.timestamp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-600 text-xs hover:underline"
                    title="跳转到 YouTube"
                  >
                    @ {insight.goldenQuote.timestamp}
                  </a>
                )}
              </div>
            )}

            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <span className="font-medium">大白话解释：</span>
              {insight.plainExplanation}
            </p>

            {insight.conceptExplanations && insight.conceptExplanations.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-600 mb-2">相关概念</h4>
                <div className="flex flex-wrap gap-2">
                  {insight.conceptExplanations.map((concept, i) => (
                    <span
                      key={i}
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                      title={concept.explanation}
                    >
                      {concept.term}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}