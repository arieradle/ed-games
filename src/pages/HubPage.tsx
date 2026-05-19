import { Link } from 'react-router-dom';

const GAMES = [
  {
    id: 'math',
    emoji: '🧮',
    title: 'משחק חשבון',
    desc: 'כיתה ג׳ – תרגול מתמטיקה',
    btnLabel: 'שחק עכשיו ▶',
    gradient: 'linear-gradient(135deg,#ff6b35,#ff9a5c)',
    border: '#ff6b35',
    dir: 'rtl' as const,
  },
  {
    id: 'english',
    emoji: '🌟',
    title: 'English Adventure',
    desc: 'Vocabulary & reading games',
    btnLabel: 'Play Now ▶',
    gradient: 'linear-gradient(135deg,#667eea,#764ba2)',
    border: '#764ba2',
    dir: 'ltr' as const,
  },
];

export default function HubPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
         style={{ background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' }}>
      <h1 className="text-white text-4xl font-extrabold mb-2 text-center" style={{ fontFamily: "'Fredoka One', cursive", textShadow: '0 2px 8px rgba(0,0,0,.25)' }}>
        🎮 Learning Games
      </h1>
      <p className="text-white/70 text-base mb-10 text-center">Choose a game to start playing!</p>

      <div className="grid gap-6 w-full max-w-2xl" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {GAMES.map(g => (
          <Link
            key={g.id}
            className="game-card block rounded-3xl overflow-hidden bg-white shadow-2xl cursor-pointer transition-transform hover:scale-[1.03] hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-white/50"
            to={'/' + g.id}
            aria-label={g.title}>
            <div className="h-2" style={{ background: g.gradient }} />
            <div className="p-6 text-center" dir={g.dir}>
              <div className="text-6xl mb-3">{g.emoji}</div>
              <h2 className="text-2xl font-extrabold mb-1" style={{ color: g.border, fontFamily: "'Fredoka One', cursive" }}>{g.title}</h2>
              <p className="text-gray-500 text-sm mb-5">{g.desc}</p>
              <span
                className="inline-block px-6 py-2.5 rounded-full text-white font-bold text-sm transition-all"
                style={{ background: g.gradient, pointerEvents: 'none' }}>
                {g.btnLabel}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-white/50 text-xs mt-10">Made with ❤️ for grade 3 learners</p>
    </div>
  );
}
