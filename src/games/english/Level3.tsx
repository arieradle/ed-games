import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { TOPICS, shuffle, pick } from '../../data/topics';
import { LETTERS } from '../../data/letters';
import { useBeep } from '../../hooks/useBeep';
import { ScoreBar, ConfettiBar, Feedback, GameResult, useConfetti, TopicBar } from './shared';
import type { Word } from '../../data/types';

type Q =
  | { type: 'spell'; word: string; emoji: string; hint: string }
  | { type: 'letter'; upper: string; lower: string; ex: string; showUpper: boolean; correct: string; opts: string[] }
  | { type: 'scramble'; word: string; emoji: string; hint: string; letters: string[] };

function buildQuestions(topic: string): Q[] {
  const src = shuffle((TOPICS[topic] ?? TOPICS.all).words);
  const wsrc = src.length >= 4 ? src : shuffle(TOPICS.all.words);
  const spells: Q[] = pick(wsrc, 4).map(q => ({ type: 'spell', ...q }));
  const lets: Q[] = pick(LETTERS, 3).map(lt => {
    const showUpper = Math.random() > 0.5;
    const correct = showUpper ? lt.lower : lt.upper;
    const dists = shuffle(LETTERS).filter(l => l.upper !== lt.upper).map(l => showUpper ? l.lower : l.upper).slice(0, 5);
    const opts = shuffle([correct, ...dists]).slice(0, 6);
    return { type: 'letter', ...lt, showUpper, correct, opts };
  });
  const scrs: Q[] = pick(wsrc.filter(w => w.word.length >= 3 && w.word.length <= 6), 3).map(q => ({
    type: 'scramble', ...q, letters: shuffle(q.word.split('')),
  }));
  return shuffle([...spells, ...lets, ...scrs]).slice(0, 10);
}

const topicList = Object.keys(TOPICS).map(k => ({ key: k, label: TOPICS[k].label }));

export default function Level3() {
  const beep = useBeep();
  const confetti = useConfetti('l3-confetti');
  const [topic, setTopic] = useState('all');
  const [questions, setQuestions] = useState<Q[]>(() => buildQuestions('all'));
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackOk, setFeedbackOk] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const [picked, setPicked] = useState<{ letter: string; tileIdx: number }[]>([]);
  const [usedTiles, setUsedTiles] = useState<boolean[]>([]);
  const spellRef = useRef<HTMLInputElement>(null);

  const q = questions[qIdx];

  useEffect(() => {
    if (q?.type === 'spell') setTimeout(() => spellRef.current?.focus(), 80);
  }, [qIdx, q?.type]);

  function restart(t = topic) {
    setQuestions(buildQuestions(t)); setQIdx(0); setScore(0);
    setAnswered(false); setFeedback(''); setFeedbackOk(null); setDone(false);
    setPicked([]); setUsedTiles([]);
  }

  function markAnswer(ok: boolean, word: string) {
    setAnswered(true);
    if (ok) { setScore(s => s + 1); confetti(); }
    beep(ok);
    setFeedback((ok ? '✅ נכון! ' : '❌ התשובה: ') + word);
    setFeedbackOk(ok);
  }

  function checkSpell() {
    if (answered || q.type !== 'spell') return;
    const ok = spellRef.current?.value.trim().toLowerCase() === q.word;
    markAnswer(ok!, q.word);
  }

  function handleKey(e: KeyboardEvent) { if (e.key === 'Enter') checkSpell(); }

  function checkOpt(chosen: string, correct: string) {
    if (answered) return;
    markAnswer(chosen === correct, correct);
  }

  function pickLetter(i: number) {
    if (answered || q.type !== 'scramble' || usedTiles[i]) return;
    const newPicked = [...picked, { letter: q.letters[i], tileIdx: i }];
    const newUsed = [...usedTiles]; newUsed[i] = true;
    setPicked(newPicked); setUsedTiles(newUsed);
    if (newPicked.length === q.word.length) {
      const typed = newPicked.map(p => p.letter).join('');
      markAnswer(typed === q.word, q.word);
    }
  }

  function clearScramble() {
    if (answered || q.type !== 'scramble') return;
    setPicked([]); setUsedTiles(Array(q.letters.length).fill(false));
  }

  function next() {
    if (qIdx + 1 >= questions.length) { setDone(true); return; }
    const nextQ = questions[qIdx + 1];
    if (nextQ?.type === 'scramble') {
      setPicked([]);
      setUsedTiles(Array((nextQ as Q & { letters: string[] }).letters.length).fill(false));
    }
    setQIdx(i => i + 1); setAnswered(false); setFeedback(''); setFeedbackOk(null);
  }

  if (done) return <GameResult score={score} total={questions.length} onPlayAgain={() => restart()} />;

  function renderQ() {
    if (q.type === 'spell') {
      return (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 mb-3.5 text-center">
          <div className="text-xs text-gray-500 mb-1.5">⌨️ ראה תמונה — כתוב מילה | Spell the word</div>
          <div className="text-5xl my-2">{q.emoji}</div>
          <div className="text-sm text-gray-400">{q.hint}</div>
          <input ref={spellRef} id="l3-inp" type="text" placeholder="type here…" autoComplete="off"
                 className={`block mx-auto w-4/5 max-w-[260px] text-2xl text-center border-3 rounded-xl py-2 px-3 mt-2.5 mb-2 outline-none tracking-widest transition-all
                            ${answered && feedbackOk ? 'border-green-500 bg-green-50' : answered ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`}
                 disabled={answered} onKeyDown={handleKey} />
          <button className="block mx-auto px-6 py-2.5 rounded-full text-white font-bold cursor-pointer"
                  style={{ background: '#9C27B0' }} onClick={checkSpell} disabled={answered}>
            ✅ בדוק
          </button>
        </div>
      );
    }
    if (q.type === 'letter') {
      return (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 mb-3.5 text-center">
          <div className="text-xs text-gray-500 mb-1.5">{q.showUpper ? '🔡 מצא את האות הקטנה | Find lowercase' : '🔠 מצא את האות הגדולה | Find uppercase'}</div>
          <div className="text-5xl font-bold my-2" style={{ color: '#9C27B0' }}>{q.showUpper ? q.upper : q.lower}</div>
          <div className="text-sm text-gray-400">{q.ex}</div>
          <div className="grid grid-cols-3 gap-2 mt-3" id="l3-opts">
            {q.opts.map(o => (
              <button key={o}
                      className={`opt-btn py-2.5 border-3 rounded-xl text-2xl font-bold cursor-pointer transition-all
                                 ${answered ? o === q.correct ? 'bg-green-50 border-green-500 text-green-600' : 'bg-white border-gray-200 text-gray-300'
                                   : 'bg-white border-gray-200 text-gray-800 hover:border-blue-400 hover:bg-blue-50'}`}
                      disabled={answered} onClick={() => checkOpt(o, q.correct)}>{o}
              </button>
            ))}
          </div>
        </div>
      );
    }
    // scramble
    return (
      <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 mb-3.5 text-center">
        <div className="text-xs text-gray-500 mb-1.5">🔀 סדר אותיות — בנה מילה | Unscramble</div>
        <div className="text-5xl my-2">{q.emoji}</div>
        <div className="text-sm text-gray-400">{q.hint}</div>
        <div className="flex gap-1.5 justify-center flex-wrap my-3">
          {q.word.split('').map((_, i) => (
            <span key={i} className={`w-10 h-12 border-b-4 text-2xl font-bold flex items-end justify-center pb-0.5
                                      ${answered && feedbackOk ? 'border-green-500 text-green-600'
                                        : answered ? 'border-red-500 text-red-600'
                                        : picked[i] ? 'border-purple-500 text-purple-600' : 'border-gray-400 text-transparent'}`}>
              {picked[i]?.letter ?? '_'}
            </span>
          ))}
        </div>
        <div className="flex gap-1.5 justify-center flex-wrap my-2">
          {q.letters.map((l, i) => (
            <button key={i}
                    className={`w-11 h-11 border-2 rounded-xl text-xl font-bold cursor-pointer transition-all
                               ${usedTiles[i] ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-default'
                                 : 'bg-white border-blue-400 text-blue-600 hover:bg-blue-500 hover:text-white hover:scale-[1.08]'}`}
                    disabled={answered || usedTiles[i]} onClick={() => pickLetter(i)}>{l}
            </button>
          ))}
        </div>
        <button className="px-5 py-2 bg-gray-500 text-white rounded-full text-sm font-bold cursor-pointer mt-1.5"
                onClick={clearScramble} disabled={answered}>
          🔄 נקה
        </button>
      </div>
    );
  }

  return (
    <div>
      <TopicBar topics={topicList} active={topic} onSelect={t => { setTopic(t); restart(t); }} />
      <ScoreBar stars="⭐⭐⭐" score={score} qIdx={qIdx} total={questions.length} scoreId="l3-score" qnumId="l3-qnum" />
      <ConfettiBar id="l3-confetti" />
      <div id="l3-game">{renderQ()}</div>
      <Feedback text={feedback} ok={feedbackOk} id="l3-fb" />
      {answered && (
        <button id="l3-next" className="block mx-auto px-7 py-2.5 bg-blue-500 text-white rounded-full font-bold cursor-pointer hover:bg-blue-700" onClick={next}>
          Next ➡️
        </button>
      )}
    </div>
  );
}
