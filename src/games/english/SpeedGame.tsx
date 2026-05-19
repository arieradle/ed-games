import { useState, useEffect, useRef } from 'react';
import { TOPICS, shuffle, pick } from '../../data/topics';
import { useBeep } from '../../hooks/useBeep';
import { getEmoji, getStars, getResultMsg } from '../../utils/games';
import type { Word } from '../../data/types';

const topicList = Object.keys(TOPICS).map(k => ({ key: k, label: TOPICS[k].label }));

interface Q { correct: Word; opts: Word[] }

export default function SpeedGame() {
  const beep = useBeep();
  const [phase, setPhase] = useState<'setup' | 'game' | 'result'>('setup');
  const [topic, setTopic] = useState('all');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [q, setQ] = useState<Q | null>(null);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState('');
  const wordPoolRef = useRef<Word[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function nextQ() {
    const words = shuffle(wordPoolRef.current);
    const correct = words[0];
    const others = TOPICS.all.words.filter(w => w.word !== correct.word);
    setQ({ correct, opts: shuffle([correct, ...pick(others, 3)]) });
    setAnswered(false); setFeedback('');
  }

  function startSpeed() {
    if (timerRef.current) clearInterval(timerRef.current);
    const words = shuffle((TOPICS[topic] ?? TOPICS.all).words);
    wordPoolRef.current = words.length >= 4 ? words : shuffle(TOPICS.all.words);
    setScore(0); setWrong(0); setTimeLeft(60); setFeedback('');
    setPhase('game');
    nextQ();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setPhase('result');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function answer(chosen: Word) {
    if (answered || timeLeft <= 0 || !q) return;
    setAnswered(true);
    const ok = chosen.word === q.correct.word;
    if (ok) { setScore(s => s + 1); beep(true); setFeedback('✅'); }
    else { setWrong(w => w + 1); beep(false); setFeedback('❌'); }
    setTimeout(() => { if (timeLeft > 0) nextQ(); }, 500);
  }

  const total = score + wrong;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div>
      {phase === 'setup' && (
        <div id="speed-setup" className="text-center">
          <h3 className="text-base text-gray-500 mb-2" dir="rtl">⏱️ 60 שניות — כמה שיותר נכון!</h3>
          <p className="text-sm text-gray-400 mb-3.5" dir="rtl">ראה תמונה — בחר מילה מהר!</p>
          <div className="flex flex-wrap gap-1.5 justify-center mb-2.5">
            {topicList.map(t => (
              <button key={t.key}
                      className={`px-4 py-1.5 border-2 rounded-2xl text-sm font-bold cursor-pointer transition-all
                                 ${topic === t.key ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-orange-400'}`}
                      onClick={() => setTopic(t.key)}>{t.label}
              </button>
            ))}
          </div>
          <button className="mt-3 px-7 py-2.5 text-white rounded-full font-bold cursor-pointer"
                  style={{ background: 'linear-gradient(135deg,#FF5722,#BF360C)' }} onClick={startSpeed}>
            ⏱️ התחל!
          </button>
        </div>
      )}

      {phase === 'game' && q && (
        <div id="speed-game">
          <div id="speed-clock"
               className={`text-center text-5xl font-bold mb-2 ${timeLeft <= 10 ? 'text-red-600 animate-pulse-urgent' : 'text-purple-600'}`}
               style={{ fontFamily: "'Fredoka One', cursive" }}>
            {timeLeft}
          </div>
          <div className="text-center text-base font-bold text-gray-600 mb-2.5">
            ✅ <span id="speed-score">{score}</span> נכון &nbsp;|&nbsp; ❌ <span id="speed-wrong">{wrong}</span> טעות
          </div>
          <div id="speed-q">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 mb-2 text-center">
              <div className="text-5xl my-1">{q.correct.emoji}</div>
              <div className="text-sm text-gray-400">{q.correct.hint}</div>
              <div className="grid grid-cols-2 gap-2 mt-3" id="spd-opts">
                {q.opts.map(o => (
                  <button key={o.word}
                          className={`opt-btn py-2.5 border-3 rounded-xl text-lg font-bold cursor-pointer transition-all
                                     ${answered && o.word === q.correct.word ? 'bg-green-50 border-green-500 text-green-600'
                                       : answered && o.word !== q.correct.word ? 'bg-white border-gray-200 text-gray-300'
                                       : 'bg-white border-gray-200 text-gray-800 hover:border-blue-400 hover:bg-blue-50'}`}
                          disabled={answered} onClick={() => answer(o)}>{o.word}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div id="speed-fb" className={`text-center text-xl font-bold min-h-[36px] ${feedback === '✅' ? 'text-green-600' : feedback === '❌' ? 'text-red-600' : ''}`}>
            {feedback}
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div id="speed-results" className="text-center py-3.5">
          <div className="text-7xl my-2">{getEmoji(pct)}</div>
          <div className="text-2xl my-1">{getStars(pct)}</div>
          <div className="text-2xl font-bold my-2" style={{ color: '#9C27B0' }}>
            ✅ {score} נכון | ❌ {wrong} טעות
          </div>
          <div className="text-sm text-gray-500 my-2" dir="rtl">{getResultMsg(pct)}</div>
          <button className="mt-3.5 px-8 py-3 rounded-full text-white font-bold cursor-pointer"
                  style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }} onClick={startSpeed}>
            🔄 שחק שוב!
          </button>
          <div>
            <button className="mt-2 px-5 py-2 bg-gray-500 text-white rounded-2xl text-sm font-bold cursor-pointer"
                    onClick={() => setPhase('setup')}>
              ← הגדרות
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
