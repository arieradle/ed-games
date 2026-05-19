import { useState } from 'react';
import { shuffle } from '../../data/topics';
import { SENTENCES } from '../../data/sentences';
import { useBeep } from '../../hooks/useBeep';
import { ScoreBar, ConfettiBar, Feedback, GameResult, useConfetti } from './shared';
import type { SentenceQuestion } from '../../data/types';

interface Q extends SentenceQuestion { pool: string[] }

function buildQuestions(): Q[] {
  return shuffle(SENTENCES).slice(0, 10).map(s => ({ ...s, pool: shuffle([...s.words]) }));
}

export default function Sentences() {
  const beep = useBeep();
  const confetti = useConfetti('sent-confetti');
  const [questions, setQuestions] = useState<Q[]>(() => buildQuestions());
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackOk, setFeedbackOk] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [usedTiles, setUsedTiles] = useState<boolean[]>([]);

  const q = questions[qIdx];

  function restart() {
    const qs = buildQuestions();
    setQuestions(qs); setQIdx(0); setScore(0);
    setAnswered(false); setFeedback(''); setFeedbackOk(null); setDone(false);
    setPicked([]); setUsedTiles(Array(qs[0].pool.length).fill(false));
  }

  function startQ(idx: number, qs = questions) {
    setPicked([]); setUsedTiles(Array(qs[idx].pool.length).fill(false));
    setAnswered(false); setFeedback(''); setFeedbackOk(null);
  }

  function pickWord(i: number) {
    if (answered || usedTiles[i]) return;
    const newPicked = [...picked, q.pool[i]];
    const newUsed = [...usedTiles]; newUsed[i] = true;
    setPicked(newPicked); setUsedTiles(newUsed);
  }

  function clearSent() {
    if (answered) return;
    setPicked([]); setUsedTiles(Array(q.pool.length).fill(false));
  }

  function checkSent() {
    if (answered || picked.length === 0) return;
    const correct = q.words.join(' ');
    const ok = picked.join(' ') === correct;
    setAnswered(true);
    if (ok) { setScore(s => s + 1); confetti(); }
    beep(ok);
    setFeedback(ok ? '✅ נכון! ' + correct : '❌ הסדר הנכון: ' + correct);
    setFeedbackOk(ok);
  }

  function next() {
    if (qIdx + 1 >= questions.length) { setDone(true); return; }
    const newIdx = qIdx + 1;
    setQIdx(newIdx); startQ(newIdx);
  }

  if (done) return <GameResult score={score} total={questions.length} onPlayAgain={restart} />;

  return (
    <div>
      <ScoreBar stars="📝" score={score} qIdx={qIdx} total={questions.length} scoreId="sent-score" qnumId="sent-qnum" />
      <ConfettiBar id="sent-confetti" />
      <div id="sent-game">
        <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 mb-3.5">
          <div className="text-xs text-gray-500 mb-2 text-center">📝 לחץ על המילים בסדר הנכון כדי לבנות משפט | Build the sentence</div>
          <div id="sent-emoji" className="text-5xl text-center mb-1.5">{q.emoji}</div>
          <div id="sent-hint" className="text-sm text-gray-400 text-center mb-2.5">{q.hint}</div>
          {/* Built sentence */}
          <div id="sent-built" className="bg-purple-50 border-2 border-dashed border-purple-400 rounded-xl p-3 mb-3 min-h-[54px] flex flex-wrap gap-1.5 items-center justify-center">
            {picked.length === 0
              ? <span className="text-gray-300 italic text-sm">לחץ על מילים לבנות משפט...</span>
              : picked.map((w, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white border-2 border-purple-500 rounded-full text-purple-700 font-bold text-base animate-pop">
                    {w}
                  </span>
                ))}
          </div>
          {/* Word pool */}
          <div id="sent-pool" className="flex flex-wrap gap-1.5 justify-center mb-2.5">
            {q.pool.map((w, i) => (
              <button key={i} id={`wt-${i}`} data-word={w}
                      className={`px-4 py-2 border-2 rounded-full font-bold text-base cursor-pointer transition-all
                                 ${usedTiles[i] ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-default'
                                   : 'bg-white border-pink-400 text-pink-600 hover:bg-pink-500 hover:text-white hover:scale-[1.04]'}`}
                      disabled={answered || usedTiles[i]} onClick={() => pickWord(i)}>{w}
              </button>
            ))}
          </div>
          <div className="flex gap-2 justify-center">
            <button className="px-5 py-2 bg-gray-500 text-white rounded-full text-sm font-bold cursor-pointer"
                    onClick={clearSent} disabled={answered}>🔄 נקה</button>
            <button id="sent-check" className="px-6 py-2 text-white rounded-full text-sm font-bold cursor-pointer"
                    style={{ background: '#9C27B0' }} onClick={checkSent} disabled={answered || picked.length === 0}>
              ✅ בדוק
            </button>
          </div>
        </div>
      </div>
      <Feedback text={feedback} ok={feedbackOk} id="sent-fb" />
      {answered && (
        <button id="sent-next" className="block mx-auto px-7 py-2.5 bg-blue-500 text-white rounded-full font-bold cursor-pointer hover:bg-blue-700" onClick={next}>
          Next ➡️
        </button>
      )}
    </div>
  );
}
