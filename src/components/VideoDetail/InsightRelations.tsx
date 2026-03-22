import { AnalysisResult } from '../../types';

interface InsightRelationsProps {
  relations: AnalysisResult['insightRelations'];
}

export default function InsightRelations({ relations }: InsightRelationsProps) {
  return (
    <section className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">观点关系</h2>

      <div className="space-y-6">
        {/* 因果关系 */}
        {relations.causalChains && relations.causalChains.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              <span>🔗</span> 因果链
            </h3>
            <div className="space-y-2">
              {relations.causalChains.map((chain, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {chain.from}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-600">{chain.relation}</span>
                  <span className="text-gray-400">→</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                    {chain.to}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 并列关系 */}
        {relations.parallels && relations.parallels.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              <span>⇄</span> 并列关系
            </h3>
            <div className="space-y-2">
              {relations.parallels.map((parallel, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded">
                  <div className="flex gap-2 mb-2">
                    {parallel.insights.map((insight, j) => (
                      <span
                        key={j}
                        className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                      >
                        {insight}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{parallel.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 依赖关系 */}
        {relations.dependencies && relations.dependencies.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              <span>⬇️</span> 依赖关系
            </h3>
            <div className="space-y-2">
              {relations.dependencies.map((dep, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {dep.insight}
                  </span>
                  <span className="text-gray-400">依赖于</span>
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    {dep.dependsOn}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 叙事总结 */}
        {relations.narrativeSummary && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">内容叙事总结</h3>
            <p className="text-gray-700">{relations.narrativeSummary}</p>
          </div>
        )}
      </div>
    </section>
  );
}
