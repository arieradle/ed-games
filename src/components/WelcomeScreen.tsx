import { useRef, useEffect, type KeyboardEvent } from 'react';

interface Props {
  emoji: string;
  title: string;
  subtitle: string;
  label: string;
  placeholder: string;
  btnText: string;
  players: string[];
  onStart: (name: string) => void;
  dir?: 'rtl' | 'ltr';
  inputId?: string;
}

export default function WelcomeScreen({
  emoji, title, subtitle, label, placeholder, btnText, players, onStart, dir = 'ltr', inputId = 'nameInput',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  function handleStart() {
    const val = inputRef.current?.value.trim() ?? '';
    if (!val) { inputRef.current?.focus(); return; }
    onStart(val);
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Enter') handleStart();
  }

  return (
    <div id="welcomeScreen" className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
         style={{ background: 'radial-gradient(circle at 15% 15%, rgba(255,107,53,.12) 0%, transparent 50%), radial-gradient(circle at 85% 80%, rgba(78,205,196,.12) 0%, transparent 50%), #fff9f0' }}
         dir={dir}>
      <div className="w-full max-w-[460px] flex flex-col items-center animate-slide-up">
        <div className="text-7xl mb-3">{emoji}</div>
        <h1 className="text-4xl font-bold mb-1" style={{ fontFamily: "'Fredoka One', cursive", color: '#ff6b35', textShadow: '4px 4px 0 rgba(255,107,53,.18)' }}>{title}</h1>
        <p className="text-gray-500 mb-8 text-center">{subtitle}</p>

        <div className="w-full bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl"
               style={{ background: 'linear-gradient(90deg,#ff6b35,#4ecdc4,#ffe66d)' }} />
          <label className="block text-sm font-bold text-gray-800 mb-2" htmlFor={inputId}>{label}</label>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            maxLength={20}
            placeholder={placeholder}
            className="w-full text-2xl text-center px-4 py-3 rounded-2xl border-3 border-gray-200 bg-gray-50 outline-none mb-5 transition-all focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100"
            style={{ fontFamily: "'Fredoka One', cursive", direction: dir }}
            onKeyDown={handleKey}
            autoComplete="off"
          />
          <button
            onClick={handleStart}
            className="w-full py-4 rounded-2xl text-white text-xl font-bold transition-all hover:-translate-y-0.5 active:translate-y-0.5"
            style={{ fontFamily: "'Fredoka One', cursive", background: '#ff6b35', boxShadow: '0 5px 0 rgba(180,60,0,.4)' }}>
            {btnText}
          </button>

          {players.length > 0 && (
            <div className="mt-5">
              <p className="text-xs text-gray-400 text-center mb-2" id="knownPlayers">או בחר/י שם מוכר:</p>
              <div className="flex flex-wrap gap-2 justify-center" id="playerChips">
                {players.map(p => (
                  <button key={p}
                    className="px-4 py-1.5 rounded-full border-2 border-gray-200 bg-gray-100 text-sm font-medium hover:bg-yellow-50 hover:border-yellow-400 transition-all"
                    onClick={() => { if (inputRef.current) inputRef.current.value = p; onStart(p); }}>
                    👤 {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
