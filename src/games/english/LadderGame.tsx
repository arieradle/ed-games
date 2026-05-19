import { useState } from 'react';
import { TOPICS, shuffle, pick } from '../../data/topics';
import { useBeep } from '../../hooks/useBeep';
import { Feedback, GameResult, useConfetti, TopicBar } from './shared';
import { getEmoji, getStars, getResultMsg } from '../../utils/games';
import type { Word } from '../../data/types';

interface Q { word: string; emoji: string; hint: string; opts: Word[] }

function buildQuestions(topic: string): Q[] {
  const src = shuffle((TOPICS[topic] ?? TOPICS.all).words);
  const pool = src.length >= 4 ? src : shuffle(TOPICS.all.words);
  return shuffle(pool).slice(0, 10).map(item => ({
    ...item,
    opts: shuffle([item, ...pick(TOPICS.all.words.filter(w => w.word !== item.word), 3)]),
  }));
}

const topicList = Object.keys(TOPICS).map(k => ({ key: k, label: TOPICS[k].label }));
const TOTAL = 10;

export default function LadderGame() {
  const beep = useBeep();
  const [topic, setTopic] = useState('all');
  const [questions, setQuestions] = useState<Q[]>(() => buildQuestions('all'));
  const [qIdx, setQIdx] = useState(0);
  const [pos, setPos] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackOk, setFeedbackOk] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);

  const q = questions[qIdx];

  function restart(t = topic) {
    setQuestions(buildQuestions(t)); setQIdx(0); setPos(0); setScore(0);
    setAnswered(false); setFeedback(''); setFeedbackOk(null); setDone(false);
  }

  function choose(chosen: string, correct: string) {
    if (answered) return;
    const ok = chosen === correct;
    setAnswered(true);
    const newPos = ok ? Math.min(TOTAL, pos + 1) : Math.max(0, pos - 1);
    setPos(newPos);
    if (ok) setScore(s => s + 1);
    beep(ok);
    setFeedback(ok ? '✅ כל הכבוד! עולים מדרגה! 🎉' : '❌ אוי! יורדים מדרגה 😅');
    setFeedbackOk(ok);
    if (newPos === TOTAL) { setTimeout(() => setDone(true), 800); }
  }

  function next() {
    if (qIdx + 1 >= questions.length) { setDone(true); return; }
    setQIdx(i => i + 1); setAnswered(false); setFeedback(''); setFeedbackOk(null);
  }

  if (done) {
    const pct = Math.round((pos / TOTAL) * 100);
    return (
      <div className="text-center py-3.5">
        <div className="text-7xl my-2">{pos === TOTAL ? '🏆' : getEmoji(pct)}</div>
        <div className="text-2xl my-1">{getStars(pct)}</div>
        <div className="text-xl font-bold my-2" style={{ color: '#9C27B0' }}>הגעת למדרגה {pos} מתוך {TOTAL}</div>
        <div className="text-sm text-gray-500 my-2" dir="rtl">{pos === TOTAL ? '!הגעת לפסגה — מדהים 🏆' : getResultMsg(pct)}</div>
        <button className="mt-3.5 px-8 py-3 rounded-full text-white font-bold cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }} onClick={() => restart()}>
          🔄 שחק שוב!
        </button>
      </div>
    );
  }

  return (
    <div>
      <TopicBar topics={topicList} active={topic} onSelect={t => { setTopic(t); restart(t); }} />
      <div id="ladder-game">
        <div className="flex gap-4 items-start mb-3.5">
          {/* Ladder visual */}
          <div className="shrink-0 w-[70px] relative" id="ladder-visual">
            <div className="text-2xl text-center mb-0.5">🏆</div>
            {Array.from({ length: TOTAL + 1 }, (_, i) => TOTAL - i).map(rung => (
              <div key={rung} className="flex items-center h-8 relative">
                <div className="w-full h-0.5" style={{ background: '#8D6E63' }} />
                <span className="absolute -right-4 text-xs text-gray-400 font-bold">{rung}</span>
                {rung === pos && (
                  <span className="absolute left-1/2 -translate-x-1/2 text-2xl -mt-4">🧒</span>
                )}
              </div>
            ))}
          </div>
          {/* Game area */}
          <div className="flex-1" id="ladder-info">
            <div className="text-center text-base font-bold mb-2" style={{ color: '#795548' }}>
              מדרגה <span id="ladder-pos">{pos}</span> / {TOTAL} 🏆
            </div>
            <div className="h-3.5 bg-gray-200 rounded-lg mb-3 overflow-hidden">
              <div className="h-full rounded-lg transition-[width] duration-500"
                   style={{ width: `${(pos / TOTAL) * 100}%`, background: 'linear-gradient(90deg,#8D6E63,#795548)' }}
                   id="ladder-fill" />
            </div>
            <div id="ladder-q">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-3 mb-2">
                <div className="text-xs text-gray-500 mb-1.5">👁️ בחר תמונה נכונה למילה | Choose the right picture</div>
                <div className="text-2xl font-bold text-gray-800 text-center mb-2">{q.word}</div>
                <div className="grid grid-cols-2 gap-2" id="ldr-opts">
                  {q.opts.map(o => (
                    <button key={o.word}
                            className={`opt-btn py-2.5 border-3 rounded-xl text-3xl cursor-pointer transition-all
                                       ${answered && o.word === q.word ? 'bg-green-50 border-green-500'
                                         : answered && o.word !== q.word ? 'bg-white border-gray-200 opacity-40'
                                         : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50'}`}
                            disabled={answered} onClick={() => choose(o.word, q.word)}>
                      {o.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Feedback text={feedback} ok={feedbackOk} id="ladder-fb" />
            {answered && pos < TOTAL && (
              <button id="ladder-next" className="block mx-auto mt-2 px-7 py-2.5 bg-blue-500 text-white rounded-full font-bold cursor-pointer hover:bg-blue-700" onClick={next}>
                Next ➡️
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
