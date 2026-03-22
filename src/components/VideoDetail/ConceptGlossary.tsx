import { AnalysisResult } from '../../types';

interface ConceptGlossaryProps {
  glossary: AnalysisResult['glossary'];
}

export default function ConceptGlossary({ glossary }: ConceptGlossaryProps) {
  if (!glossary || glossary.length === 0) {
    return null;
  }

  return (
    <section className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">概念词典</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {glossary.map((item, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-gray-900">{item.term}</span>
              {item.originalTerm && (
                <span className="text-xs text-gray-500 italic">
                  {item.originalTerm}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{item.context}</p>
            <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
              {item.explanation}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
