import { useState, useEffect } from 'react';
import { TOPICS, shuffle, pick } from '../../data/topics';
import { useBeep } from '../../hooks/useBeep';
import { ScoreBar, ConfettiBar, Feedback, GameResult, useConfetti, TopicBar } from './shared';
import type { Word } from '../../data/types';

interface Q { word: string; emoji: string; hint: string; opts: string[] }

function buildQuestions(topic: string): Q[] {
  const pool = shuffle((TOPICS[topic] ?? TOPICS.all).words);
  const src = pool.length >= 4 ? pool : shuffle(TOPICS.all.words);
  return pick(src, 10).map(item => {
    const others = TOPICS.all.words.filter(w => w.word !== item.word);
    const opts = shuffle([item.word, ...pick(others, 3).map(w => w.word)]);
    return { ...item, opts };
  });
}

const topicList = Object.keys(TOPICS).map(k => ({ key: k, label: TOPICS[k].label }));

export default function Level1() {
  const beep = useBeep();
  const confetti = useConfetti('l1-confetti');
  const [topic, setTopic] = useState('all');
  const [questions, setQuestions] = useState<Q[]>(() => buildQuestions('all'));
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackOk, setFeedbackOk] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const [key, setKey] = useState(0);

  const q = questions[qIdx];

  function handleTopic(t: string) {
    setTopic(t);
    restart(t);
  }

  function restart(t = topic) {
    setQuestions(buildQuestions(t));
    setQIdx(0); setScore(0); setAnswered(false); setFeedback(''); setFeedbackOk(null); setDone(false);
    setKey(k => k + 1);
  }

  function choose(opt: string) {
    if (answered) return;
    const ok = opt === q.word;
    setAnswered(true);
    if (ok) { setScore(s => s + 1); confetti(); }
    beep(ok);
    setFeedback((ok ? '✅ נכון! ' : '❌ התשובה: ') + q.word);
    setFeedbackOk(ok);
  }

  function next() {
    if (qIdx + 1 >= questions.length) { setDone(true); return; }
    setQIdx(i => i + 1); setAnswered(false); setFeedback(''); setFeedbackOk(null);
  }

  if (done) return <GameResult score={score} total={questions.length} onPlayAgain={() => restart()} />;

  return (
    <div key={key}>
      <TopicBar topics={topicList} active={topic} onSelect={handleTopic} />
      <ScoreBar stars="⭐" score={score} qIdx={qIdx} total={questions.length} scoreId="l1-score" qnumId="l1-qnum" />
      <ConfettiBar id="l1-confetti" />
      <div id="l1-game">
        <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 mb-3.5 text-center">
          <div className="text-xs text-gray-500 mb-1.5">👁️ ראה תמונה — בחר מילה | Look and choose the word</div>
          <div className="text-5xl my-2">{q.emoji}</div>
          <div className="text-sm text-gray-400">{q.hint}</div>
          <div className="grid grid-cols-2 gap-2 mt-3" id="l1-opts">
            {q.opts.map(opt => (
              <button key={opt}
                      className={`opt-btn py-2.5 px-2 border-3 rounded-xl text-lg font-bold cursor-pointer transition-all
                                 ${answered
                                   ? opt === q.word ? 'bg-green-50 border-green-500 text-green-600' : 'bg-white border-gray-200 text-gray-400'
                                   : 'bg-white border-gray-200 text-gray-800 hover:border-blue-400 hover:bg-blue-50 hover:scale-[1.03]'}`}
                      onClick={() => choose(opt)}
                      disabled={answered}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Feedback text={feedback} ok={feedbackOk} id="l1-fb" />
      {answered && (
        <button id="l1-next" className="block mx-auto px-7 py-2.5 bg-blue-500 text-white rounded-full font-bold cursor-pointer hover:bg-blue-700" onClick={next}>
          Next ➡️
        </button>
      )}
    </div>
  );
}
