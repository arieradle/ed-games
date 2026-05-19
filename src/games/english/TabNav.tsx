export type TabId = 'level1' | 'level2' | 'level3' | 'memory' | 'bingo' | 'speed' | 'odd' | 'ladder' | 'sentences';

export const TABS: { id: TabId; label: string; small?: string; color: string; cls: string }[] = [
  { id: 'level1',    label: '⭐ Level 1',      small: 'קל',      color: '#4CAF50', cls: 'tb1' },
  { id: 'level2',    label: '⭐⭐ Level 2',    small: 'בינוני',  color: '#FF9800', cls: 'tb2' },
  { id: 'level3',    label: '⭐⭐⭐ Level 3',  small: 'מאתגר',   color: '#f44336', cls: 'tb3' },
  { id: 'memory',    label: '🃏 Memory',                         color: '#2196F3', cls: 'tbM' },
  { id: 'bingo',     label: '🎯 Bingo',                          color: '#9C27B0', cls: 'tbBingo' },
  { id: 'speed',     label: '⏱️ Speed',                          color: '#FF5722', cls: 'tbSpeed' },
  { id: 'odd',       label: '🤔 Odd One Out',                    color: '#009688', cls: 'tbOdd' },
  { id: 'ladder',    label: '🪜 Ladder',                         color: '#795548', cls: 'tbLadder' },
  { id: 'sentences', label: '📝 Sentences',                      color: '#E91E63', cls: 'tbSent' },
];

interface Props {
  active: TabId;
  onChange: (id: TabId) => void;
}

export default function TabNav({ active, onChange }: Props) {
  return (
    <nav className="eng-nav flex md:flex-col gap-1.5 flex-shrink-0 md:w-[148px] md:sticky md:top-3
                    w-full flex-row flex-nowrap overflow-x-auto pb-1 md:pb-0 md:overflow-visible"
         style={{ scrollbarWidth: 'none' }}>
      <div className="hidden md:block text-[.68em] font-black tracking-widest text-white/55 px-1 py-2">LEVELS</div>
      {TABS.map((t, i) => {
        const isActive = active === t.id;
        return (
          <button key={t.id}
                  className={`tab-btn ${t.cls} flex items-center gap-1.5 shrink-0 md:w-full text-left
                             px-3 py-2 rounded-xl border-none text-sm font-bold cursor-pointer transition-all text-white
                             shadow-[0_2px_6px_rgba(0,0,0,.2)] hover:brightness-110 hover:md:translate-x-0.5
                             ${isActive ? 'ring-[3px] ring-white' : ''}`}
                  style={{ background: t.color, whiteSpace: 'nowrap' }}
                  onClick={() => onChange(t.id)}>
            {t.label}
            {t.small && <small className="text-[.78em] opacity-75 md:ml-auto hidden md:inline">{t.small}</small>}
            {i === 3 && <div className="hidden md:block text-[.68em] font-black tracking-widest text-white/55 -mt-7 -mb-1 w-full" style={{ order: -1 }}></div>}
          </button>
        );
      })}
    </nav>
  );
}
