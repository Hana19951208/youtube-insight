import { AnalysisResult } from '../../types';

interface QualityScoreProps {
  quality: AnalysisResult['qualityAssessment'];
}

export default function QualityScore({ quality }: QualityScoreProps) {
  const renderScore = (score: number, maxScore: number = 5) => {
    const percentage = (score / maxScore) * 100;
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              percentage >= 80
                ? 'bg-green-500'
                : percentage >= 60
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-sm font-medium text-gray-700 w-8">
          {score}/{maxScore}
        </span>
      </div>
    );
  };

  return (
    <section className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">质量评估</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-medium text-gray-700 mb-3">维度评分</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">信息密度</span>
                <span className="text-xs text-gray-500">{quality.dimensions.informationDensity.note}</span>
              </div>
              {renderScore(quality.dimensions.informationDensity.score)}
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">独特性</span>
                <span className="text-xs text-gray-500">{quality.dimensions.uniqueness.note}</span>
              </div>
              {renderScore(quality.dimensions.uniqueness.score)}
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">论据强度</span>
                <span className="text-xs text-gray-500">{quality.dimensions.evidenceStrength.note}</span>
              </div>
              {renderScore(quality.dimensions.evidenceStrength.score)}
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">易懂性</span>
                <span className="text-xs text-gray-500">{quality.dimensions.accessibilityScore.note}</span>
              </div>
              {renderScore(quality.dimensions.accessibilityScore.score)}
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">创作价值</span>
                <span className="text-xs text-gray-500">{quality.dimensions.creationValue.note}</span>
              </div>
              {renderScore(quality.dimensions.creationValue.score)}
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-700 mb-3">总体建议</h3>
          <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded mb-4">
            {quality.overallRecommendation}
          </p>

          {quality.topInsightsToExpand && quality.topInsightsToExpand.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">推荐展开的观点</h3>
              <ul className="space-y-2">
                {quality.topInsightsToExpand.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                    <span className="font-medium">{item.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
