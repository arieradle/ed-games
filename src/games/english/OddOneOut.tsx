import { useState } from 'react';
import { TOPICS, shuffle } from '../../data/topics';
import { useBeep } from '../../hooks/useBeep';
import { ScoreBar, ConfettiBar, Feedback, GameResult, useConfetti, TopicBar } from './shared';
import type { Word } from '../../data/types';

interface Q {
  group: Word[];
  oddWord: Word;
  mainTopic: string;
  oddTopic: string;
}

function buildQuestions(): Q[] {
  const topicKeys = Object.keys(TOPICS).filter(k => k !== 'all');
  const qs: Q[] = [];
  let attempts = 0;
  while (qs.length < 10 && attempts < 50) {
    attempts++;
    const mainTopic = topicKeys[Math.floor(Math.random() * topicKeys.length)];
    const otherTopics = topicKeys.filter(k => k !== mainTopic);
    const mainWords = shuffle(TOPICS[mainTopic].words);
    if (mainWords.length < 3) continue;
    const oddTopic = otherTopics[Math.floor(Math.random() * otherTopics.length)];
    const oddWord = shuffle(TOPICS[oddTopic].words)[0];
    qs.push({ group: shuffle([...mainWords.slice(0, 3), oddWord]), oddWord, mainTopic, oddTopic });
  }
  return qs;
}

const topicList = Object.keys(TOPICS).map(k => ({ key: k, label: TOPICS[k].label }));

export default function OddOneOut() {
  const beep = useBeep();
  const confetti = useConfetti('odd-confetti');
  const [questions, setQuestions] = useState<Q[]>(() => buildQuestions());
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackOk, setFeedbackOk] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);

  const q = questions[qIdx];

  function restart() {
    setQuestions(buildQuestions()); setQIdx(0); setScore(0);
    setAnswered(false); setFeedback(''); setFeedbackOk(null); setDone(false);
  }

  function choose(word: string) {
    if (answered) return;
    const ok = word === q.oddWord.word;
    setAnswered(true);
    if (ok) { setScore(s => s + 1); confetti(); }
    beep(ok);
    const topicLabel = TOPICS[q.mainTopic].label;
    setFeedback(ok ? `✅ נכון! "${q.oddWord.word}" לא ${topicLabel}` : `❌ "${q.oddWord.word}" לא שייך ל-${topicLabel}`);
    setFeedbackOk(ok);
  }

  function next() {
    if (qIdx + 1 >= questions.length) { setDone(true); return; }
    setQIdx(i => i + 1); setAnswered(false); setFeedback(''); setFeedbackOk(null);
  }

  if (done) return <GameResult score={score} total={questions.length} onPlayAgain={restart} />;

  return (
    <div>
      <ScoreBar stars="🤔" score={score} qIdx={qIdx} total={questions.length} scoreId="odd-score" qnumId="odd-qnum" />
      <ConfettiBar id="odd-confetti" />
      <div id="odd-card" className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 mb-3.5">
        <div className="text-xs text-gray-500 text-center mb-2">🤔 מה לא שייך? | Which one does NOT belong?</div>
        <div id="odd-opts" className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {q.group.map(w => (
            <div key={w.word}
                 className={`odd-opt p-3.5 border-3 rounded-xl cursor-pointer text-center transition-all
                            ${answered && w.word === q.oddWord.word ? 'bg-yellow-50 border-yellow-400'
                              : answered && w.word !== q.oddWord.word ? 'bg-white border-gray-200 opacity-60'
                              : 'bg-white border-gray-200 hover:border-teal-400 hover:bg-teal-50'}`}
                 style={{ pointerEvents: answered ? 'none' : 'auto' }}
                 onClick={() => choose(w.word)}>
              <div className="text-4xl">{w.emoji}</div>
              <div className="text-base font-bold mt-1 text-gray-800">{w.word}</div>
              <div className="text-xs text-gray-500">{w.hint}</div>
            </div>
          ))}
        </div>
      </div>
      <Feedback text={feedback} ok={feedbackOk} id="odd-fb" />
      {answered && (
        <button id="odd-next" className="block mx-auto px-7 py-2.5 bg-blue-500 text-white rounded-full font-bold cursor-pointer hover:bg-blue-700" onClick={next}>
          Next ➡️
        </button>
      )}
    </div>
  );
}
