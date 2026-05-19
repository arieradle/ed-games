import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useBeep } from '../../hooks/useBeep';
import { spawnConfetti } from '../../utils/games';
import WelcomeScreen from '../../components/WelcomeScreen';
import HistoryPanel from './HistoryPanel';
import type { HistoryEntry } from '../../data/types';

type Difficulty = 'easy' | 'medium' | 'hard';
const STORAGE_KEY = 'mathgame_v1';

interface PlayerData { [name: string]: HistoryEntry[] }

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generateQuestion(difficulty: Difficulty): { text: string; answer: number } {
  let q: { text: string; answer: number };
  do {
    if (difficulty === 'easy') {
      const a = rand(1, 10), b = rand(1, 10);
      if (Math.random() > 0.4) q = { text: `${a} + ${b} = ?`, answer: a + b };
      else { const big = Math.max(a, b), small = Math.min(a, b); q = { text: `${big} − ${small} = ?`, answer: big - small }; }
    } else if (difficulty === 'medium') {
      const a = rand(1, 9), b = rand(1, 9), c = rand(1, 9), t = rand(0, 2);
      if (t === 0) q = { text: `${a} + ${b} × ${c} = ?`, answer: a + b * c };
      else if (t === 1) q = { text: `${a} × ${b} + ${c} = ?`, answer: a * b + c };
      else q = { text: `${a} × ${b} − ${c} = ?`, answer: a * b - c };
    } else {
      const t = rand(0, 2);
      if (t === 0) { const a = rand(1, 9), b = rand(1, 9), c = rand(1, 9); q = { text: `(${a} + ${b}) × ${c} = ?`, answer: (a + b) * c }; }
      else if (t === 1) { const a = rand(2, 9), b = rand(1, 9), c = rand(1, 9), d = rand(1, 9); q = { text: `(${a} × ${b}) − (${c} + ${d}) = ?`, answer: a * b - (c + d) }; }
      else { const a = rand(1, 9), b = rand(1, 9), c = rand(1, 5), d = rand(1, 9); q = { text: `(${a} + ${b}) × ${c} − ${d} = ?`, answer: (a + b) * c - d }; }
    }
  } while (q!.answer < 0);
  return q!;
}

function getMedal(streak: number) {
  if (streak >= 10) return '🏆';
  if (streak >= 5) return '🥇';
  if (streak >= 3) return '⚡';
  return '';
}

export default function MathGame() {
  const beep = useBeep();
  const confettiRef = useRef<HTMLDivElement>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useLocalStorage<PlayerData>(STORAGE_KEY, {});
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [question, setQuestion] = useState(() => generateQuestion('easy'));
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);
  const [correctMsg, setCorrectMsg] = useState('');
  const [inputClass, setInputClass] = useState('');
  const [streakPop, setStreakPop] = useState(false);
  const [cardGlow, setCardGlow] = useState(false);

  const players = Object.keys(data).sort();
  const history = playerName ? (data[playerName] ?? []) : [];
  const totalAnswered = history.length;

  function startGame(name: string) {
    setData(prev => {
      if (!prev[name]) return { ...prev, [name]: [] };
      return prev;
    });
    setPlayerName(name);
    setScore(0);
    setStreak(0);
    setDifficulty('easy');
    loadQuestion('easy');
  }

  const loadQuestion = useCallback((diff: Difficulty) => {
    const q = generateQuestion(diff);
    setQuestion(q);
    setAnswered(false);
    setFeedback(null);
    setCorrectMsg('');
    setInputClass('');
    if (questionRef.current) {
      questionRef.current.classList.remove('animate-bounce-pop');
      void questionRef.current.offsetWidth;
      questionRef.current.classList.add('animate-bounce-pop');
    }
    setTimeout(() => answerInputRef.current?.focus(), 50);
  }, []);

  function checkAnswer() {
    if (answered) { loadQuestion(difficulty); return; }
    const val = answerInputRef.current?.value.trim() ?? '';
    if (!val) { answerInputRef.current?.focus(); return; }
    const userAnswer = parseInt(val, 10);
    const correct = userAnswer === question.answer;
    setAnswered(true);
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const entry: HistoryEntry = {
      question: question.text.replace(' = ?', ''),
      userAnswer, correctAnswer: question.answer, correct, difficulty, time: timeStr,
    };
    setData(prev => {
      const arr = [entry, ...(prev[playerName] ?? [])].slice(0, 100);
      return { ...prev, [playerName]: arr };
    });
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setInputClass('correct');
      setFeedback({ text: '✅ נכון! כל הכבוד!', ok: true });
      setCorrectMsg('');
      beep(true);
      if (confettiRef.current) spawnConfetti(confettiRef.current);
      setCardGlow(true); setTimeout(() => setCardGlow(false), 1000);
      setStreakPop(true); setTimeout(() => setStreakPop(false), 400);
    } else {
      setStreak(0);
      setInputClass('wrong');
      setFeedback({ text: '❌ לא נכון', ok: false });
      setCorrectMsg('התשובה הנכונה היא: ' + question.answer);
      beep(false);
    }
  }

  function handleKey(e: KeyboardEvent) { if (e.key === 'Enter') checkAnswer(); }

  function changeDifficulty(d: Difficulty) {
    setDifficulty(d);
    setStreak(0);
    loadQuestion(d);
  }

  function clearHistory() {
    if (!confirm('למחוק את כל ההיסטוריה של ' + playerName + '?')) return;
    setData(prev => { const next = { ...prev }; delete next[playerName]; return next; });
  }

  // Focus input when question changes
  useEffect(() => {
    if (playerName) answerInputRef.current?.focus();
  }, [question, playerName]);

  if (!playerName) {
    return (
      <WelcomeScreen
        emoji="🧮" title="משחק חשבון" subtitle="כיתה ג׳ – תרגול מתמטיקה"
        label="מי משחק היום?" placeholder="כתוב/י את שמך..." btnText="בואו נתחיל! 🚀"
        players={players} onStart={startGame} dir="rtl" inputId="nameInput" />
    );
  }

  const diffBtns: { key: Difficulty; label: string; activeClass: string; baseClass: string }[] = [
    { key: 'easy',   label: '🟢 קל',     activeClass: 'bg-green-100 border-green-500',  baseClass: 'text-green-700 border-green-200' },
    { key: 'medium', label: '🟡 בינוני', activeClass: 'bg-yellow-100 border-yellow-500', baseClass: 'text-yellow-700 border-yellow-200' },
    { key: 'hard',   label: '🔴 קשה',   activeClass: 'bg-red-100 border-red-500',       baseClass: 'text-red-700 border-red-200' },
  ];

  const inputStyles: Record<string, string> = {
    '': 'border-gray-200 bg-gray-50 focus:border-teal-400 focus:ring-4 focus:ring-teal-100',
    correct: 'border-green-500 bg-green-50 ring-4 ring-green-100',
    wrong: 'border-red-500 bg-red-50 ring-4 ring-red-100 animate-shake',
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-5 md:px-8 md:py-8"
         style={{ background: 'radial-gradient(circle at 15% 15%, rgba(255,107,53,.12) 0%, transparent 50%), radial-gradient(circle at 85% 80%, rgba(78,205,196,.12) 0%, transparent 50%), #fff9f0' }}
         dir="rtl">
      <div id="gameScreen" className="w-full max-w-[480px] md:max-w-[960px] md:grid md:grid-cols-2 md:gap-7 md:items-start">

        {/* Header */}
        <header className="w-full mb-5 md:col-span-2 animate-slide-down">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-3xl font-bold" style={{ fontFamily: "'Fredoka One', cursive", color: '#ff6b35' }}>🧮 משחק חשבון</h1>
            <button className="text-sm px-3.5 py-1.5 rounded-full border-2 border-gray-200 bg-white text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all whitespace-nowrap"
                    onClick={() => setPlayerName('')}>
              החלף שחקן/ית 🔄
            </button>
          </div>
          <div className="text-gray-500 text-base">שלום, <strong id="playerName" className="text-teal-500" style={{ fontFamily: "'Fredoka One', cursive" }}>{playerName}</strong>! 👋</div>
        </header>

        {/* Stats */}
        <div className="flex gap-2.5 mb-5 flex-wrap justify-center md:col-span-2 animate-slide-down" style={{ animationDelay: '0.1s' }}>
          {[
            { emoji: '⭐', label: 'ניקוד:', val: score, id: 'score', color: '#ff6b35' },
            { emoji: '🔥', label: 'רצף:',   val: streak, id: 'streak', color: '#a855f7' },
            { emoji: '📝', label: 'שאלות:', val: totalAnswered, id: 'totalAnswered', color: '#4ecdc4' },
          ].map(s => (
            <div key={s.id} className="bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-md text-sm font-bold">
              <span className="text-xl">{s.emoji}</span>
              <span>{s.label}</span>
              <span id={s.id} className={`text-xl font-bold ${s.id === 'streak' && streakPop ? 'animate-bounce-pop' : ''}`}
                    style={{ fontFamily: "'Fredoka One', cursive", color: s.color }}>{s.val}</span>
            </div>
          ))}
        </div>

        {/* Difficulty */}
        <div className="flex gap-2.5 mb-6 md:col-span-2 animate-slide-down" style={{ animationDelay: '0.2s' }}>
          {diffBtns.map(d => (
            <button key={d.key}
                    className={`diff-btn ${d.key} px-5 py-2 rounded-full border-3 font-bold text-sm transition-all hover:-translate-y-0.5 ${difficulty === d.key ? d.activeClass : 'bg-white border-transparent ' + d.baseClass}`}
                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}
                    onClick={() => changeDifficulty(d.key)}>
              {d.label}
            </button>
          ))}
        </div>

        {/* Question Card */}
        <div id="card" ref={cardRef}
             className={`card bg-white rounded-3xl p-8 w-full shadow-xl text-center relative overflow-hidden mb-5 ${cardGlow ? 'animate-glow' : ''}`}>
          <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: 'linear-gradient(90deg,#ff6b35,#4ecdc4,#ffe66d)' }} />
          <div className="text-2xl mb-1 min-h-[30px]">{getMedal(streak)}</div>
          <div className="text-xs text-gray-400 tracking-wide mb-2">מה התשובה?</div>
          <div ref={questionRef} id="question" className="text-5xl font-bold mb-6 min-h-[76px] flex items-center justify-center"
               dir="ltr" style={{ fontFamily: "'Fredoka One', cursive" }}>
            {question.text}
          </div>
          <div className="flex gap-3 items-center justify-center mb-4">
            <input ref={answerInputRef} id="answerInput" type="number"
                   placeholder="?"
                   className={`w-[130px] text-3xl text-center py-3 px-4 rounded-2xl border-3 outline-none transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none ${inputStyles[inputClass]}`}
                   style={{ fontFamily: "'Fredoka One', cursive" }}
                   onKeyDown={handleKey} disabled={answered} />
            <button onClick={checkAnswer}
                    className="px-5 py-3 rounded-2xl text-white font-bold transition-all hover:-translate-y-0.5 active:translate-y-0.5 whitespace-nowrap"
                    style={{ fontFamily: "'Fredoka One', cursive", background: '#ff6b35', boxShadow: '0 4px 0 rgba(180,60,0,.4)' }}>
              בדוק ✔
            </button>
          </div>
          <div id="feedback" className={`text-xl font-bold min-h-[38px] ${feedback ? (feedback.ok ? 'text-green-500' : 'text-red-500') : ''}`}
               style={{ fontFamily: "'Fredoka One', cursive" }}>
            {feedback?.text}
          </div>
          <div id="correctAnswer" className="text-sm text-gray-400 min-h-[20px] mb-4 dir-rtl">{correctMsg}</div>
          <button onClick={() => loadQuestion(difficulty)}
                  className="px-8 py-3 rounded-full text-white font-bold transition-all hover:-translate-y-0.5 active:translate-y-0.5"
                  style={{ fontFamily: "'Fredoka One', cursive", background: '#4ecdc4', boxShadow: '0 4px 0 rgba(0,120,110,.35)' }}>
            שאלה חדשה ➜
          </button>
        </div>

        {/* History */}
        <HistoryPanel history={history} onClear={clearHistory} />
      </div>

      <div ref={confettiRef} className="fixed inset-0 pointer-events-none z-50" />
    </div>
  );
}
