import { getEmoji, getStars, getResultMsg } from '../utils/games';

interface Props {
  score: number;
  total: number;
  extraMsg?: string;
  onPlayAgain: () => void;
  onBack?: () => void;
}

export default function ResultPanel({ score, total, extraMsg, onPlayAgain, onBack }: Props) {
  const pct = Math.round((score / total) * 100);

  return (
    <div className="text-center py-4">
      <div className="text-7xl my-2">{getEmoji(pct)}</div>
      <div className="text-2xl my-1">{getStars(pct)}</div>
      <div className="text-3xl font-bold my-2" style={{ color: '#9C27B0' }}>
        {score}/{total} ({pct}%)
      </div>
      {extraMsg && <div className="text-base text-gray-500 my-2" dir="rtl">{extraMsg}</div>}
      <div className="text-base text-gray-500 my-2" dir="rtl">{getResultMsg(pct)}</div>
      <button
        onClick={onPlayAgain}
        className="mt-4 px-8 py-3 rounded-full text-white font-bold text-lg cursor-pointer"
        style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
        🔄 שחק שוב!
      </button>
      {onBack && (
        <div>
          <button
            onClick={onBack}
            className="mt-2 px-5 py-2 bg-gray-500 text-white rounded-2xl text-sm font-bold cursor-pointer">
            ← הגדרות
          </button>
        </div>
      )}
    </div>
  );
}
