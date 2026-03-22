import { AnalysisResult } from '../../types';

interface CoreInsightsProps {
  insights: AnalysisResult['insights'];
}

export default function CoreInsights({ insights }: CoreInsightsProps) {
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
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {insight.timeRange.start} - {insight.timeRange.end}
                </span>
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
                  <span className="text-yellow-600 text-xs">
                    @ {insight.goldenQuote.timestamp}
                  </span>
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
