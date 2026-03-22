import { AnalysisResult } from '../../types';

interface GuestInfoProps {
  guest: AnalysisResult['guest'];
}

export default function GuestInfo({ guest }: GuestInfoProps) {
  return (
    <section className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">嘉宾背景</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">
                {guest.name?.charAt(0) || 'G'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{guest.name}</h3>
              <p className="text-sm text-gray-500">{guest.title}</p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">为什么值得听</h4>
            <p className="text-sm text-gray-600">{guest.uniqueness}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">可能的偏见</h4>
          <ul className="space-y-1 mb-4">
            {guest.potentialBias.map((bias, i) => (
              <li key={i} className="text-sm text-gray-600 flex gap-2">
                <span className="text-yellow-500">⚠️</span>
                {bias}
              </li>
            ))}
          </ul>

          <h4 className="font-medium text-gray-700 mb-2">阅读建议</h4>
          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
            {guest.readingAdvice}
          </p>
        </div>
      </div>
    </section>
  );
}
