import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AnalysisResult } from '../../types';
import LoadingState from '../shared/LoadingState';
import CoreInsights from './CoreInsights';
import GuestInfo from './GuestInfo';
import ConceptGlossary from './ConceptGlossary';
import InsightRelations from './InsightRelations';
import GoldenQuotes from './GoldenQuotes';
import QualityScore from './QualityScore';
import ScriptStructure from './ScriptStructure';

export default function DetailPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/videos/${videoId}`);
        if (!response.ok) {
          throw new Error('Video not found');
        }
        const data = await response.json();
        setAnalysis(data.analysis);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch video detail');
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchDetail();
    }
  }, [videoId]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !analysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">{error || 'Video not found'}</p>
          <Link to="/" className="text-blue-600 hover:underline">
            ← 返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 头部信息 */}
      <div className="mb-8">
        <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← 返回列表
        </Link>

        <div className="flex gap-6">
          <img
            src={analysis.meta.thumbnailUrl}
            alt={analysis.meta.videoTitle}
            className="w-80 aspect-video object-cover rounded-lg shadow"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {analysis.meta.videoTitle}
            </h1>
            <p className="text-gray-600 mb-4">{analysis.meta.channelName}</p>
            <div className="flex gap-3">
              <a
                href={analysis.meta.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                在 YouTube 上观看
              </a>
              {analysis.scriptStructure && (
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                  已生成口播稿
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 内容速览 */}
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">内容速览</h2>
        <p className="text-gray-700 mb-4">{analysis.overview.oneSentenceSummary}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">核心观点</h3>
            <ul className="space-y-1">
              {analysis.overview.coreInsightsSummary.map((insight, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-blue-500">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">目标受众</h3>
            <p className="text-sm text-gray-600">{analysis.overview.targetAudience}</p>
            <h3 className="font-medium text-gray-900 mt-4 mb-2">创作价值评分</h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-yellow-500">
                {analysis.overview.creationValue.score}/5
              </span>
              <span className="text-sm text-gray-500">
                {analysis.overview.creationValue.reason}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 嘉宾信息 */}
      <GuestInfo guest={analysis.guest} />

      {/* 核心观点 */}
      <CoreInsights insights={analysis.insights} />

      {/* 概念词典 */}
      <ConceptGlossary glossary={analysis.glossary} />

      {/* 观点关系 */}
      <InsightRelations relations={analysis.insightRelations} />

      {/* 金句收集 */}
      <GoldenQuotes quotes={analysis.goldenQuotes} />

      {/* 质量评估 */}
      <QualityScore quality={analysis.qualityAssessment} />

      {/* 口播稿结构 */}
      {analysis.scriptStructure && (
        <ScriptStructure script={analysis.scriptStructure} />
      )}
    </div>
  );
}
