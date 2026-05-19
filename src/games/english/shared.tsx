import { useState, useCallback } from 'react';
import { getResultMsg, getStars, getEmoji } from '../../utils/games';

export interface ScoreBarProps {
  stars: string;
  score: number;
  qIdx: number;
  total: number;
  scoreId?: string;
  qnumId?: string;
}

export function ScoreBar({ stars, score, qIdx, total, scoreId = 'score', qnumId = 'qnum' }: ScoreBarProps) {
  return (
    <div className="flex justify-between items-center bg-blue-50 rounded-xl px-3.5 py-2 mb-3.5 font-bold text-sm">
      <span>{stars} <span className="text-purple-600 text-lg font-bold" id={scoreId}>{score}</span></span>
      <div className="flex-1 mx-2.5 bg-gray-200 rounded-lg h-2.5">
        <div className="h-2.5 rounded-lg transition-[width] duration-500"
             style={{ width: `${(qIdx / total) * 100}%`, background: 'linear-gradient(90deg,#4CAF50,#8BC34A)' }} />
      </div>
      <span id={qnumId}>{qIdx + 1}/{total}</span>
    </div>
  );
}

export interface ConfettiBarProps { id?: string }
export function ConfettiBar({ id = 'confetti' }: ConfettiBarProps) {
  return <div className="text-center text-3xl min-h-[34px] mb-1" id={id} />;
}

export interface FeedbackProps { text: string; ok: boolean | null; id?: string }
export function Feedback({ text, ok, id = 'fb' }: FeedbackProps) {
  if (!text) return <div className="min-h-[36px]" id={id} />;
  return (
    <div id={id} className={`text-center text-lg font-bold min-h-[36px] my-1.5 rounded-xl px-2 py-1.5 transition-all ${ok ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
      {text}
    </div>
  );
}

export interface ResultPanelProps {
  score: number;
  total: number;
  onPlayAgain: () => void;
  onBack?: () => void;
  customMsg?: string;
}
export function GameResult({ score, total, onPlayAgain, onBack, customMsg }: ResultPanelProps) {
  const pct = Math.round((score / total) * 100);
  return (
    <div className="text-center py-3.5">
      <div className="text-7xl my-1.5">{getEmoji(pct)}</div>
      <div className="text-2xl my-1">{getStars(pct)}</div>
      <div className="text-3xl font-bold my-2" style={{ color: '#9C27B0' }}>{score}/{total} ({pct}%)</div>
      {customMsg && <div className="text-sm text-gray-500 my-2" dir="rtl">{customMsg}</div>}
      <div className="text-sm text-gray-500 my-2" dir="rtl">{getResultMsg(pct)}</div>
      <button onClick={onPlayAgain}
              className="mt-3.5 px-8 py-3 rounded-full text-white font-bold text-base cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
        🔄 שחק שוב!
      </button>
      {onBack && (
        <div>
          <button onClick={onBack} className="mt-2 px-5 py-2 bg-gray-500 text-white rounded-2xl text-sm font-bold cursor-pointer">
            ← הגדרות
          </button>
        </div>
      )}
    </div>
  );
}

export function useConfetti(id: string) {
  const trigger = useCallback(() => {
    const el = document.getElementById(id);
    if (!el) return;
    const emojis = ['🎉', '⭐', '🌟', '✨', '🎊', '🏆', '💫'];
    el.textContent = [...emojis].sort(() => Math.random() - .5).slice(0, 5).join(' ');
    setTimeout(() => { if (el) el.textContent = ''; }, 1500);
  }, [id]);
  return trigger;
}

export function TopicBar({ topics, active, onSelect }: {
  topics: { key: string; label: string }[];
  active: string;
  onSelect: (k: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center mb-3">
      {topics.map(t => (
        <button key={t.key}
                className={`px-3 py-1 border-2 rounded-2xl text-xs font-bold cursor-pointer transition-all
                           ${active === t.key ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-purple-500 hover:text-purple-600'}`}
                onClick={() => onSelect(t.key)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function useQuestionState<Q>(total: number) {
  const [score, setScore] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackOk, setFeedbackOk] = useState<boolean | null>(null);

  const init = useCallback((qs: Q[]) => {
    setScore(0); setQIdx(0); setAnswered(false); setQuestions(qs); setDone(false); setFeedback(''); setFeedbackOk(null);
  }, []);

  const answer = useCallback((ok: boolean, fb: string) => {
    setAnswered(true);
    if (ok) setScore(s => s + 1);
    setFeedback(fb);
    setFeedbackOk(ok);
  }, []);

  const next = useCallback((qs: Q[]) => {
    if (qIdx + 1 >= qs.length) {
      setDone(true);
    } else {
      setQIdx(i => i + 1);
      setAnswered(false);
      setFeedback('');
      setFeedbackOk(null);
    }
  }, [qIdx]);

  return { score, qIdx, answered, questions, done, feedback, feedbackOk, init, answer, next };
}
