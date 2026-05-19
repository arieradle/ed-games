import { useState } from 'react';
import { TOPICS, shuffle, pick } from '../../data/topics';
import { useBeep } from '../../hooks/useBeep';
import type { Word } from '../../data/types';

const topicList = Object.keys(TOPICS).map(k => ({ key: k, label: TOPICS[k].label }));

interface Cell { word: string; emoji: string; hint: string; isFree: boolean }

function checkWin(called: Set<string>, cells: Cell[]): number[] | null {
  const isCalled = (i: number) => cells[i]?.isFree || called.has(cells[i]?.word);
  const lines = [
    [0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15],
    [0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15],
    [0,5,10,15],[3,6,9,12],
  ];
  for (const line of lines) {
    if (line.every(i => isCalled(i))) return line;
  }
  return null;
}

export default function BingoGame() {
  const beep = useBeep();
  const [phase, setPhase] = useState<'setup' | 'game'>('setup');
  const [topic, setTopic] = useState('all');
  const [cells, setCells] = useState<Cell[]>([]);
  const [pool, setPool] = useState<Word[]>([]);
  const [called, setCalled] = useState<Set<string>>(new Set());
  const [calledCount, setCalledCount] = useState(0);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [markedCells, setMarkedCells] = useState<Set<number>>(new Set());
  const [winLine, setWinLine] = useState<number[] | null>(null);

  function startBingo() {
    const words = shuffle((TOPICS[topic] ?? TOPICS.all).words);
    const src = words.length >= 16 ? words : shuffle(TOPICS.all.words);
    const card = pick(src, 15);
    const newCells: Cell[] = [];
    let cardIdx = 0;
    for (let i = 0; i < 16; i++) {
      if (i === 5) newCells.push({ word: 'FREE', emoji: '⭐', hint: '', isFree: true });
      else newCells.push({ ...card[cardIdx++], isFree: false });
    }
    const newPool = shuffle([...card]);
    setCells(newCells); setPool(newPool);
    setCalled(new Set(['FREE'])); setCalledCount(0);
    setCurrentWord(null); setMarkedCells(new Set([5])); setWinLine(null);
    setPhase('game');
  }

  function callNext() {
    if (calledCount >= pool.length) return;
    const w = pool[calledCount];
    setCalled(prev => new Set([...prev, w.word]));
    setCalledCount(c => c + 1);
    setCurrentWord(w);
  }

  function markCell(idx: number) {
    if (winLine) return;
    const cell = cells[idx];
    if (!cell || cell.isFree || !called.has(cell.word) || markedCells.has(idx)) return;
    const newMarked = new Set([...markedCells, idx]);
    setMarkedCells(newMarked);
    beep(true);
    const line = checkWin(called, cells.map((c, i) => newMarked.has(i) ? c : { ...c, isFree: false }));
    if (line) setWinLine(line);
  }

  return (
    <div>
      {phase === 'setup' && (
        <div id="bingo-setup" className="text-center">
          <h3 className="text-base text-gray-500 mb-2.5" dir="rtl">🎯 בחר נושא לבינגו:</h3>
          <div className="flex flex-wrap gap-1.5 justify-center mb-2.5">
            {topicList.map(t => (
              <button key={t.key}
                      className={`px-4 py-1.5 border-2 rounded-2xl text-sm font-bold cursor-pointer transition-all
                                 ${topic === t.key ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-400'}`}
                      onClick={() => setTopic(t.key)}>{t.label}
              </button>
            ))}
          </div>
          <button className="mt-3 px-7 py-2.5 text-white rounded-full font-bold cursor-pointer text-base"
                  style={{ background: 'linear-gradient(135deg,#9C27B0,#6A1B9A)' }} onClick={startBingo}>
            🎯 שחק בינגו!
          </button>
        </div>
      )}

      {phase === 'game' && (
        <div id="bingo-game">
          <div className="flex justify-between items-center mb-2.5 font-bold text-sm">
            <span>📣 נקראו: <strong id="bingo-called-count">{calledCount}</strong></span>
            <button className="px-5 py-2.5 rounded-full text-white font-bold cursor-pointer"
                    style={{ background: '#9C27B0' }} id="bingo-next-word" onClick={callNext}>
              📣 מילה הבאה!
            </button>
          </div>

          {currentWord && (
            <div id="bingo-caller" className="rounded-2xl p-4 mb-3.5 text-center text-white"
                 style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
              <div className="text-5xl my-1">{currentWord.emoji}</div>
              <div id="bc-word" className="text-3xl font-bold my-1">{currentWord.word}</div>
              <div id="bc-hint" className="text-sm opacity-80">{currentWord.hint}</div>
            </div>
          )}

          <div id="bingo-grid" className="grid gap-1.5 mb-3" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
            {cells.map((c, i) => (
              <div key={i} id={`bc-${i}`}
                   className={`bingo-cell p-2.5 border-2 rounded-xl text-center cursor-pointer transition-all text-xs font-bold
                              flex flex-col items-center justify-center gap-0.5 min-h-[52px]
                              ${c.isFree ? 'text-white' : winLine?.includes(i) ? 'bg-green-200 border-green-600' : markedCells.has(i) ? 'bg-green-50 border-green-500 text-green-700' : called.has(c.word) ? 'bg-white border-blue-300 hover:bg-blue-50' : 'bg-white border-gray-200 text-gray-700'}`}
                   style={c.isFree ? { background: 'linear-gradient(135deg,#FFC107,#FF9800)', borderColor: '#FF9800' } : {}}
                   onClick={() => markCell(i)}>
                <span className="text-xl">{c.emoji}</span>
                <span className="text-[.78em]">{c.isFree ? 'FREE' : c.word}</span>
              </div>
            ))}
          </div>

          {winLine && (
            <div id="bingo-win" className="rounded-2xl p-5 text-center text-white text-3xl font-bold"
                 style={{ background: 'linear-gradient(135deg,#FFC107,#FF9800)' }}>
              🎉 BINGO! 🎉<br /><span className="text-base">כל הכבוד!</span>
            </div>
          )}

          <div className="text-center mt-2.5">
            <button className="px-5 py-2 bg-gray-500 text-white rounded-2xl text-sm font-bold cursor-pointer"
                    onClick={() => setPhase('setup')}>
              ← הגדרות
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
