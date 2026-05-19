import { useState } from 'react';
import { TOPICS, shuffle, pick } from '../../data/topics';
import { VOWEL_QS } from '../../data/vowels';
import { RHYMES } from '../../data/rhymes';
import { useBeep } from '../../hooks/useBeep';
import { ScoreBar, ConfettiBar, Feedback, GameResult, useConfetti, TopicBar } from './shared';
import type { Word } from '../../data/types';

type Q =
  | { type: 'vowel'; display: string; ans: string; full: string; emoji: string; hint: string }
  | { type: 'rhyme'; anchor: string; correct: string; opts: string[] }
  | { type: 'read2pic'; word: string; hint: string; opts: Word[] };

function buildQuestions(topic: string): Q[] {
  const src = shuffle((TOPICS[topic] ?? TOPICS.all).words);
  const wsrc = src.length >= 4 ? src : shuffle(TOPICS.all.words);
  const vqs: Q[] = shuffle(VOWEL_QS).slice(0, 3).map(q => ({ type: 'vowel', ...q }));
  const rqs: Q[] = shuffle(RHYMES).slice(0, 3).map(g => ({
    type: 'rhyme', anchor: g.anchor, correct: g.correct,
    opts: shuffle([g.correct, ...g.distractors.slice(0, 3)]),
  }));
  const pqs: Q[] = pick(wsrc, 4).map(item => ({
    type: 'read2pic', word: item.word, hint: item.hint,
    opts: shuffle([item, ...pick(TOPICS.all.words.filter(w => w.word !== item.word), 2)]),
  }));
  return shuffle([...vqs, ...rqs, ...pqs]).slice(0, 10);
}

const topicList = Object.keys(TOPICS).map(k => ({ key: k, label: TOPICS[k].label }));

export default function Level2() {
  const beep = useBeep();
  const confetti = useConfetti('l2-confetti');
  const [topic, setTopic] = useState('all');
  const [questions, setQuestions] = useState<Q[]>(() => buildQuestions('all'));
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackOk, setFeedbackOk] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const [vowelAns, setVowelAns] = useState('_');

  const q = questions[qIdx];

  function restart(t = topic) {
    setQuestions(buildQuestions(t)); setQIdx(0); setScore(0);
    setAnswered(false); setFeedback(''); setFeedbackOk(null); setDone(false); setVowelAns('_');
  }

  function handleOpt(chosen: string, correct: string) {
    if (answered) return;
    const ok = chosen === correct;
    setAnswered(true);
    if (ok) { setScore(s => s + 1); confetti(); }
    beep(ok);
    setFeedback((ok ? '✅ נכון! ' : '❌ התשובה: ') + correct);
    setFeedbackOk(ok);
  }

  function handleVowel(v: string, correct: string, full: string) {
    if (answered) return;
    const ok = v === correct;
    setAnswered(true);
    setVowelAns(correct);
    if (ok) { setScore(s => s + 1); confetti(); }
    beep(ok);
    setFeedback((ok ? '✅ נכון! ' : '❌ התשובה: ') + full);
    setFeedbackOk(ok);
  }

  function next() {
    if (qIdx + 1 >= questions.length) { setDone(true); return; }
    setQIdx(i => i + 1); setAnswered(false); setFeedback(''); setFeedbackOk(null); setVowelAns('_');
  }

  if (done) return <GameResult score={score} total={questions.length} onPlayAgain={() => restart()} />;

  function renderQ() {
    if (q.type === 'vowel') {
      const [pre, post] = q.display.split('_');
      return (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 mb-3.5 text-center">
          <div className="text-xs text-gray-500 mb-1.5">✏️ השלם תנועה | Fill in the vowel</div>
          <div className="text-5xl my-2">{q.emoji}</div>
          <div className="text-3xl font-bold my-2 tracking-widest">
            {pre}<span id="v-blank" className="inline-block min-w-[30px] border-b-4 border-purple-500 text-purple-600"
                       style={{ color: answered && feedbackOk ? '#4CAF50' : answered ? '#f44336' : '#9C27B0' }}>
              {vowelAns}
            </span>{post}
          </div>
          <div className="text-sm text-gray-400">{q.hint}</div>
          <div className="flex gap-2.5 justify-center flex-wrap mt-2">
            {['a', 'e', 'i', 'o', 'u'].map(v => (
              <button key={v}
                      className={`w-12 h-12 border-3 rounded-full text-xl font-bold cursor-pointer transition-all text-purple-600
                                 ${answered && v === q.ans ? 'bg-green-50 border-green-500 text-green-600'
                                   : answered && v !== q.ans ? 'bg-gray-50 border-gray-200 text-gray-300'
                                   : 'bg-white border-gray-200 hover:border-purple-500 hover:bg-purple-50 hover:scale-110'}`}
                      disabled={answered}
                      onClick={() => handleVowel(v, q.ans, q.full)}>
                {v}
              </button>
            ))}
          </div>
        </div>
      );
    }
    if (q.type === 'rhyme') {
      return (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 mb-3.5 text-center">
          <div className="text-xs text-gray-500 mb-1.5">🎵 מה מתחרז עם | Which word rhymes with:</div>
          <div className="text-3xl font-bold text-gray-800 my-2 tracking-widest">{q.anchor}</div>
          <div className="grid grid-cols-2 gap-2 mt-3" id="l2-opts">
            {q.opts.map(o => (
              <button key={o}
                      className={`opt-btn py-2.5 px-2 border-3 rounded-xl text-lg font-bold cursor-pointer transition-all
                                 ${answered ? o === q.correct ? 'bg-green-50 border-green-500 text-green-600' : 'bg-white border-gray-200 text-gray-400'
                                   : 'bg-white border-gray-200 text-gray-800 hover:border-blue-400 hover:bg-blue-50'}`}
                      disabled={answered} onClick={() => handleOpt(o, q.correct)}>{o}
              </button>
            ))}
          </div>
        </div>
      );
    }
    // read2pic
    return (
      <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 mb-3.5 text-center">
        <div className="text-xs text-gray-500 mb-1.5">👀 קרא מילה — בחר תמונה | Read and choose the picture</div>
        <div className="text-3xl font-bold text-gray-800 my-2 tracking-widest">{q.word}</div>
        <div className="text-sm text-gray-400">{q.hint}</div>
        <div className="grid grid-cols-3 gap-2 mt-3" id="l2-opts">
          {q.opts.map((o: Word) => (
            <button key={o.word}
                    className={`opt-btn py-2.5 px-2 border-3 rounded-xl text-4xl cursor-pointer transition-all
                               ${answered ? o.word === q.word ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200 opacity-40'
                                 : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:scale-[1.03]'}`}
                    disabled={answered} onClick={() => handleOpt(o.word, q.word)}>
              {o.emoji}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopicBar topics={topicList} active={topic} onSelect={t => { setTopic(t); restart(t); }} />
      <ScoreBar stars="⭐⭐" score={score} qIdx={qIdx} total={questions.length} scoreId="l2-score" qnumId="l2-qnum" />
      <ConfettiBar id="l2-confetti" />
      <div id="l2-game">{renderQ()}</div>
      <Feedback text={feedback} ok={feedbackOk} id="l2-fb" />
      {answered && (
        <button id="l2-next" className="block mx-auto px-7 py-2.5 bg-blue-500 text-white rounded-full font-bold cursor-pointer hover:bg-blue-700" onClick={next}>
          Next ➡️
        </button>
      )}
    </div>
  );
}
