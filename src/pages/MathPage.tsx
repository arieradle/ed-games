import { useNavigate } from 'react-router-dom';
import MathGame from '../games/math/MathGame';

export default function MathPage() {
  const navigate = useNavigate();
  return (
    <div>
      <button
        onClick={() => navigate('/')}
        className="fixed top-3 left-3 z-50 px-3 py-1.5 rounded-full bg-white/80 border border-gray-200 text-sm font-bold shadow hover:bg-white transition-all"
        aria-label="Back to hub">
        ← חזור / Back
      </button>
      <MathGame />
    </div>
  );
}
