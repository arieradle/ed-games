import { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import TabNav, { type TabId } from './TabNav';
import Level1 from './Level1';
import Level2 from './Level2';
import Level3 from './Level3';
import MemoryGame from './MemoryGame';
import BingoGame from './BingoGame';
import SpeedGame from './SpeedGame';
import OddOneOut from './OddOneOut';
import LadderGame from './LadderGame';
import Sentences from './Sentences';

const ENG_KEY = 'enggame_players';

interface Props {
  initialTab?: TabId;
  onTabChange?: (tab: TabId) => void;
}

export default function EnglishGame({ initialTab = 'level1', onTabChange }: Props) {
  const [players, setPlayers] = useLocalStorage<string[]>(ENG_KEY, []);
  const [playerName, setPlayerName] = useState(() => players[0] ?? '');
  const [nameInput, setNameInput] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [showWelcome, setShowWelcome] = useState(players.length === 0);

  function startGame(name: string) {
    if (!name.trim()) return;
    const n = name.trim();
    setPlayers(prev => {
      const arr = prev.filter(p => p !== n);
      return [n, ...arr].slice(0, 8);
    });
    setPlayerName(n);
    setShowWelcome(false);
  }

  function handleTab(tab: TabId) {
    setActiveTab(tab);
    onTabChange?.(tab);
  }

  function switchPlayer() {
    setShowWelcome(true);
    setPlayerName('');
    setNameInput('');
    setActiveTab(initialTab);
  }

  // Welcome overlay
  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5"
           style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}
           id="welcomeOverlay">
        <div className="bg-white rounded-3xl p-9 w-full max-w-sm text-center shadow-2xl">
          <div className="text-6xl mb-2.5">🌟</div>
          <h2 className="text-3xl font-extrabold mb-1" style={{ color: '#764ba2' }}>English Adventure</h2>
          <p className="text-gray-400 text-sm mb-5">What's your name? | מה שמך?</p>
          <input id="engNameInput" type="text" maxLength={20} placeholder="Type your name..."
                 value={nameInput} onChange={e => setNameInput(e.target.value)}
                 className="w-full text-2xl text-center border-3 border-gray-200 rounded-2xl py-3 px-3 mb-3.5 outline-none transition-all focus:border-purple-500 font-[inherit]"
                 onKeyDown={e => { if (e.key === 'Enter') startGame(nameInput); }}
                 autoFocus />
          <button className="go-btn w-full py-3.5 rounded-2xl text-white font-bold text-lg cursor-pointer transition-all hover:brightness-110"
                  style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}
                  onClick={() => startGame(nameInput)}>
            Let's Go! 🚀
          </button>
          {players.length > 0 && (
            <div id="engKnownPlayers" className="mt-4">
              <p className="text-xs text-gray-400 mb-2">or pick a name / או בחר שם:</p>
              <div id="engChips" className="flex flex-wrap gap-1.5 justify-center">
                {players.map(p => (
                  <button key={p}
                          className="chip px-3.5 py-1.5 border-2 border-gray-200 rounded-full text-sm font-semibold text-gray-600 cursor-pointer hover:border-purple-500 hover:text-purple-600 transition-all"
                          onClick={() => startGame(p)}>
                    👤 {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="engGame" className="min-h-screen flex flex-col p-2.5 md:p-4"
         style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/20 rounded-2xl mb-2.5 gap-2.5 flex-wrap">
        <div className="text-white text-xl font-extrabold whitespace-nowrap">🌟 English Adventure</div>
        <div id="playerBadge" className="flex items-center gap-2 text-white/90 text-sm">
          Hello, <strong id="engPlayerName" className="text-white">{playerName}</strong>! 👋
          <button className="bg-white/20 border-none text-white rounded-xl px-2.5 py-1 text-sm cursor-pointer hover:bg-white/30"
                  onClick={switchPlayer}>Switch</button>
        </div>
      </div>

      {/* Body */}
      <div className="flex gap-3 flex-col md:flex-row items-start flex-1">
        <TabNav active={activeTab} onChange={handleTab} />
        <div className="flex-1 min-w-0">
          {(['level1','level2','level3','memory','bingo','speed','odd','ladder','sentences'] as TabId[]).map(tab => (
            <div key={tab} id={tab}
                 className={`panel bg-white rounded-3xl p-5 w-full shadow-2xl ${activeTab === tab ? 'active block' : 'hidden'}`}>
              {tab === 'level1'    && <Level1 />}
              {tab === 'level2'    && <Level2 />}
              {tab === 'level3'    && <Level3 />}
              {tab === 'memory'    && <MemoryGame />}
              {tab === 'bingo'     && <BingoGame />}
              {tab === 'speed'     && <SpeedGame />}
              {tab === 'odd'       && <OddOneOut />}
              {tab === 'ladder'    && <LadderGame />}
              {tab === 'sentences' && <Sentences />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
