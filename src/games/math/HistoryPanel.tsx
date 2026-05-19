import type { HistoryEntry } from '../../data/types';

interface Props {
  history: HistoryEntry[];
  onClear: () => void;
}

export default function HistoryPanel({ history, onClear }: Props) {
  const correct = history.filter(h => h.correct).length;
  const wrong = history.length - correct;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 w-full animate-slide-up" style={{ animationDelay: '0.4s' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-bold" style={{ fontFamily: "'Fredoka One', cursive" }}>📋 היסטוריה</span>
        <button
          className="text-xs text-gray-400 border border-gray-200 rounded-full px-3 py-1 hover:text-red-500 hover:border-red-400 transition-colors"
          onClick={onClear}>
          נקה היסטוריה
        </button>
      </div>

      {history.length > 0 && (
        <div className="flex gap-3 mb-3 flex-wrap text-sm">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />{correct} נכון</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />{wrong} שגוי</span>
          <span className="text-gray-400">סה"כ: {history.length}</span>
        </div>
      )}

      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto lg:max-h-[420px]" id="historyList">
        {history.length === 0
          ? <p className="text-center text-gray-400 text-sm py-4">עדיין אין שאלות. בהצלחה! 😊</p>
          : history.map((h, i) => (
              <div key={i} className={`history-item flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm ${h.correct ? 'bg-green-50' : 'bg-red-50'}`} dir="ltr">
                <span>{h.correct ? '✅' : '❌'}</span>
                <span className="flex-1 font-bold" style={{ fontFamily: "'Fredoka One', cursive" }}>{h.question}</span>
                <span className="text-gray-500 text-xs whitespace-nowrap" dir="rtl">
                  {h.correct ? '= ' + h.correctAnswer : 'ענית: ' + h.userAnswer + ' (נכון: ' + h.correctAnswer + ')'}
                </span>
                <span className="text-gray-300 text-xs whitespace-nowrap">{h.time}</span>
              </div>
            ))}
      </div>
    </div>
  );
}
