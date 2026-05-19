import { useNavigate, useParams } from 'react-router-dom';
import EnglishGame from '../games/english/EnglishGame';
import type { TabId } from '../games/english/TabNav';

const VALID_TABS = new Set(['level1','level2','level3','memory','bingo','speed','odd','ladder','sentences']);

export default function EnglishPage() {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();
  const initialTab = (tab && VALID_TABS.has(tab) ? tab : 'level1') as TabId;

  function handleTabChange(t: TabId) {
    navigate(`/english/${t}`, { replace: true });
  }

  return (
    <div>
      <button
        onClick={() => navigate('/')}
        className="fixed top-3 left-3 z-50 px-3 py-1.5 rounded-full bg-white/80 border border-gray-200 text-sm font-bold shadow hover:bg-white transition-all"
        aria-label="Back to hub">
        ← חזור / Back
      </button>
      <EnglishGame initialTab={initialTab} onTabChange={handleTabChange} />
    </div>
  );
}
