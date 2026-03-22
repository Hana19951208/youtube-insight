import { AnalysisResult } from '../../types';
import CopyButton from '../shared/CopyButton';

interface ScriptStructureProps {
  script: AnalysisResult['scriptStructure'];
}

export default function ScriptStructure({ script }: ScriptStructureProps) {
  if (!script) {
    return null;
  }

  return (
    <section className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">口播稿结构</h2>

      {/* 概览信息 */}
      {script.meta && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500 mb-1">叙事框架</p>
            <p className="text-sm font-medium text-gray-900">{script.meta.narrativeFramework}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500 mb-1">核心钩子</p>
            <p className="text-sm text-gray-700 line-clamp-2">{script.meta.coreHook}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500 mb-1">差异化角度</p>
            <p className="text-sm text-gray-700 line-clamp-2">{script.meta.uniqueAngle}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500 mb-1">预估时长</p>
            <p className="text-sm font-medium text-gray-900">{script.meta.targetDuration}</p>
          </div>
        </div>
      )}

      {/* 标题选项 */}
      {script.titles && (
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-3">推荐标题</h3>
          <div className="bg-green-50 border border-green-200 p-4 rounded mb-3">
            <p className="text-lg font-bold text-green-800">{script.titles.recommended}</p>
          </div>
          {script.titles.options && script.titles.options.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">备选标题</h4>
              <div className="space-y-2">
                {script.titles.options.map((opt, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{opt.title}</p>
                      <p className="text-xs text-gray-500">{opt.type}</p>
                    </div>
                    <CopyButton text={opt.title} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 开场钩子 */}
      {script.opening && (
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">开场钩子</h3>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded">
            <p className="text-gray-800">{script.opening.hook}</p>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span>类型：{script.opening.type}</span>
              <span>情绪目标：{script.opening.emotionGoal}</span>
              <span>时长：{script.opening.duration}</span>
            </div>
          </div>
        </div>
      )}

      {/* 结构分段 */}
      {script.structure && script.structure.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-3">内容结构</h3>
          <div className="space-y-4">
            {script.structure.map((section, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900">
                    {i + 1}. {section.section}
                  </h4>
                  <span className="text-xs text-gray-500">{section.duration}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{section.purpose}</p>
                <div className="mb-2">
                  <h5 className="text-xs font-medium text-gray-500 mb-1">核心要点</h5>
                  <ul className="space-y-1">
                    {section.keyPoints.map((point, j) => (
                      <li key={j} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-blue-500">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                {section.transition && (
                  <p className="text-sm text-gray-500 italic">
                    过渡：{section.transition}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 结尾升华 */}
      {script.closing && (
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">结尾升华</h3>
          <div className="bg-purple-50 border border-purple-200 p-4 rounded">
            <p className="text-gray-800 mb-2">{script.closing.elevation}</p>
            {script.closing.callToAction && (
              <p className="text-sm text-purple-700">
                <span className="font-medium">行动号召：</span>
                {script.closing.callToAction}
              </p>
            )}
            {script.closing.memorableEnd && (
              <p className="text-sm text-purple-600 italic mt-2">
                "{script.closing.memorableEnd}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* 完整稿 */}
      {script.fullScript && (
        <div>
          <h3 className="font-medium text-gray-700 mb-3">完整口播稿</h3>
          <div className="prose max-w-none">
            {script.fullScript.sections.map((section, i) => (
              <div key={i} className="mb-6">
                <h4 className="font-bold text-gray-900 mb-2">{section.sectionTitle}</h4>
                <div className="bg-gray-50 p-4 rounded font-mono text-sm leading-relaxed">
                  {section.lines.map((line, j) => (
                    <p key={j} className="min-h-[1.5rem]">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
