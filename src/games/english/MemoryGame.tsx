import { useState, useEffect, useRef } from 'react';
import { TOPICS, shuffle, pick } from '../../data/topics';
import { useBeep } from '../../hooks/useBeep';
import { getEmoji, getStars, getResultMsg } from '../../utils/games';

type Diff = 8 | 12 | 16;

interface Card {
  id: number; pairId: number; type: 'word' | 'emoji';
  content: string; word: string; state: 'hidden' | 'flipped' | 'matched';
}

const topicList = Object.keys(TOPICS).map(k => ({ key: k, label: TOPICS[k].label }));

export default function MemoryGame() {
  const beep = useBeep();
  const [phase, setPhase] = useState<'setup' | 'game' | 'result'>('setup');
  const [topic, setTopic] = useState('all');
  const [diff, setDiff] = useState<Diff>(8);
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function startMemory() {
    if (timerRef.current) clearInterval(timerRef.current);
    const words = shuffle((TOPICS[topic] ?? TOPICS.all).words);
    const src = words.length >= diff ? words : shuffle(TOPICS.all.words);
    const chosen = pick(src, diff);
    const newCards: Card[] = [];
    chosen.forEach((item, idx) => {
      newCards.push({ id: idx * 2,     pairId: idx, type: 'word',  content: item.word,  word: item.word, state: 'hidden' });
      newCards.push({ id: idx * 2 + 1, pairId: idx, type: 'emoji', content: item.emoji, word: item.word, state: 'hidden' });
    });
    setCards(shuffle(newCards));
    setFlipped([]); setMatched(0); setMoves(0); setTimer(0); setLocked(false);
    setPhase('game');
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
  }

  function flipCard(id: number) {
    if (locked) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.state !== 'hidden') return;
    if (flipped.length === 1 && flipped[0] === id) return;

    const newFlipped = [...flipped, id];
    setCards(cs => cs.map(c => c.id === id ? { ...c, state: 'flipped' } : c));

    if (newFlipped.length === 2) {
      setLocked(true);
      setMoves(m => m + 1);
      setFlipped([]);
      const [aid, bid] = newFlipped;
      const a = cards.find(c => c.id === aid)!;
      const b = cards.find(c => c.id === bid)!;
      if (a.pairId === b.pairId) {
        setCards(cs => cs.map(c => c.id === aid || c.id === bid ? { ...c, state: 'matched' } : c));
        const newMatched = matched + 1;
        setMatched(newMatched);
        beep(true);
        setLocked(false);
        if (newMatched === diff) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => setPhase('result'), 500);
        }
      } else {
        beep(false);
        setTimeout(() => {
          setCards(cs => cs.map(c => c.id === aid || c.id === bid ? { ...c, state: 'hidden' } : c));
          setLocked(false);
        }, 900);
      }
    } else {
      setFlipped(newFlipped);
    }
  }

  const gridCols = diff <= 8 ? 4 : diff <= 12 ? 4 : 4;
  const min = Math.floor(timer / 60), sec = timer % 60;
  const pct = Math.max(0, Math.round((1 - moves / (diff * 3)) * 100));

  const formatTime = () => `${min}:${sec.toString().padStart(2, '0')}`;

  return (
    <div>
      {phase === 'setup' && (
        <div id="mem-setup" className="text-center">
          <h3 className="text-base text-gray-500 my-2.5" dir="rtl">📚 בחר נושא:</h3>
          <div className="flex flex-wrap gap-1.5 justify-center mb-2">
            {topicList.map(t => (
              <button key={t.key}
                      className={`mem-opt px-4 py-1.5 border-2 rounded-2xl text-sm font-bold cursor-pointer transition-all
                                 ${topic === t.key ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-500'}`}
                      onClick={() => setTopic(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          <h3 className="text-base text-gray-500 my-2" dir="rtl">🎮 בחר קושי:</h3>
          <div className="flex flex-wrap gap-1.5 justify-center mb-2">
            {([8, 12, 16] as Diff[]).map(n => (
              <button key={n} id={`mdiff-${n}`}
                      className={`mem-opt px-4 py-1.5 border-2 rounded-2xl text-sm font-bold cursor-pointer transition-all
                                 ${diff === n ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-400'}`}
                      onClick={() => setDiff(n)}>
                {n === 8 ? 'Easy (8)' : n === 12 ? 'Medium (12)' : 'Hard (16)'}
              </button>
            ))}
          </div>
          <button className="mem-start-btn mt-3 px-7 py-2.5 text-white rounded-full font-bold cursor-pointer text-base"
                  style={{ background: 'linear-gradient(135deg,#2196F3,#1565C0)' }} onClick={startMemory}>
            🃏 התחל!
          </button>
        </div>
      )}

      {phase === 'game' && (
        <div id="mem-game">
          <div className="flex justify-between items-center bg-blue-50 rounded-xl px-3.5 py-2 mb-3 font-bold text-sm">
            <span>🃏 <span className="text-purple-600 text-lg" id="mem-pairs">{matched}/{diff}</span></span>
            <span>🔢 <span className="text-purple-600 text-lg" id="mem-moves">{moves}</span></span>
            <span>⏱️ <span className="text-purple-600 text-lg" id="mem-timer">{formatTime()}</span></span>
          </div>
          <div id="mem-grid" className={`grid gap-1.5 mx-auto`}
               style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)`, maxWidth: 660 }}>
            {cards.map(c => (
              <div key={c.id} id={`mc${c.id}`}
                   className={`mem-card aspect-square rounded-xl cursor-pointer ${c.state !== 'hidden' ? 'flipped' : ''} ${c.state === 'matched' ? 'matched' : ''}`}
                   onClick={() => flipCard(c.id)}>
                <div className="mem-card-face mem-card-back w-full h-full rounded-xl flex items-center justify-center text-3xl text-white"
                     style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>🌟</div>
                <div className={`mem-card-face mem-card-front w-full h-full rounded-xl flex flex-col items-center justify-center gap-0.5 p-0.5 border-3
                                ${c.state === 'matched' ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200'}`}>
                  {c.type === 'emoji'
                    ? <span className="text-3xl">{c.content}</span>
                    : <span className="text-base font-bold text-gray-800 text-center">{c.content}</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-2.5">
            <button className="px-5 py-2 bg-gray-500 text-white rounded-2xl text-sm font-bold cursor-pointer"
                    onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setPhase('setup'); }}>
              ← הגדרות
            </button>
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div id="mem-results" className="text-center py-3.5">
          <div className="text-7xl my-2">{getEmoji(pct)}</div>
          <div className="text-2xl my-1">{getStars(pct)}</div>
          <div className="text-xl font-bold my-2" style={{ color: '#9C27B0' }}>
            {diff} זוגות | {moves} מהלכים | ⏱️ {formatTime()}
          </div>
          <div className="text-sm text-gray-500 my-2" dir="rtl">{getResultMsg(pct)}</div>
          <button className="mt-3.5 px-8 py-3 rounded-full text-white font-bold cursor-pointer"
                  style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }} onClick={startMemory}>
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
