import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MathGame from './MathGame';

vi.mock('../../hooks/useBeep', () => ({ useBeep: () => vi.fn() }));
vi.mock('../../utils/games', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/games')>();
  return { ...actual, spawnConfetti: vi.fn() };
});

// Mock window.confirm to avoid JSDOM issues
Object.defineProperty(window, 'confirm', { value: vi.fn(() => true), writable: true });

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe('MathGame', () => {
  it('shows welcome screen on mount', () => {
    render(<MathGame />);
    expect(screen.getByText('משחק חשבון')).toBeInTheDocument();
    expect(screen.getByText('בואו נתחיל! 🚀')).toBeInTheDocument();
  });

  it('does not start when name is empty', async () => {
    const user = userEvent.setup();
    render(<MathGame />);
    await user.click(screen.getByText('בואו נתחיל! 🚀'));
    // Still on welcome screen
    expect(screen.getByText('בואו נתחיל! 🚀')).toBeInTheDocument();
  });

  it('starts game after entering name', async () => {
    const user = userEvent.setup();
    render(<MathGame />);
    const input = screen.getByPlaceholderText('כתוב/י את שמך...');
    await user.type(input, 'Alice');
    await user.click(screen.getByText('בואו נתחיל! 🚀'));
    await waitFor(() => {
      expect(screen.getByText(/Alice/)).toBeInTheDocument();
    });
  });

  it('displays player name after start', async () => {
    const user = userEvent.setup();
    render(<MathGame />);
    const input = screen.getByPlaceholderText('כתוב/י את שמך...');
    await user.type(input, 'TestPlayer');
    await user.click(screen.getByText('בואו נתחיל! 🚀'));
    await waitFor(() => {
      expect(screen.getByText('TestPlayer')).toBeInTheDocument();
    });
  });

  it('shows a question with "?"', async () => {
    const user = userEvent.setup();
    render(<MathGame />);
    const input = screen.getByPlaceholderText('כתוב/י את שמך...');
    await user.type(input, 'Alice');
    await user.click(screen.getByText('בואו נתחיל! 🚀'));
    await waitFor(() => {
      const questionEl = document.getElementById('question');
      expect(questionEl?.textContent).toMatch(/\?/);
    });
  });

  it('score starts at 0', async () => {
    const user = userEvent.setup();
    render(<MathGame />);
    const input = screen.getByPlaceholderText('כתוב/י את שמך...');
    await user.type(input, 'Alice');
    await user.click(screen.getByText('בואו נתחיל! 🚀'));
    await waitFor(() => {
      expect(screen.getByText('ניקוד:')).toBeInTheDocument();
    });
    const scoreEl = document.getElementById('score');
    expect(scoreEl?.textContent).toBe('0');
  });

  it('difficulty buttons are present after game starts', async () => {
    const user = userEvent.setup();
    render(<MathGame />);
    const input = screen.getByPlaceholderText('כתוב/י את שמך...');
    await user.type(input, 'Alice');
    await user.click(screen.getByText('בואו נתחיל! 🚀'));
    await waitFor(() => {
      expect(document.querySelector('.diff-btn.easy')).toBeTruthy();
    });
  });

  it('switch player button returns to welcome screen', async () => {
    const user = userEvent.setup();
    render(<MathGame />);
    const input = screen.getByPlaceholderText('כתוב/י את שמך...');
    await user.type(input, 'Alice');
    await user.click(screen.getByText('בואו נתחיל! 🚀'));
    await waitFor(() => {
      expect(screen.getByText('החלף שחקן/ית 🔄')).toBeInTheDocument();
    });
    await user.click(screen.getByText('החלף שחקן/ית 🔄'));
    expect(screen.getByText('בואו נתחיל! 🚀')).toBeInTheDocument();
  });

  it('wrong answer shows error feedback', async () => {
    const user = userEvent.setup();
    render(<MathGame />);
    const nameInput = screen.getByPlaceholderText('כתוב/י את שמך...');
    await user.type(nameInput, 'Alice');
    await user.click(screen.getByText('בואו נתחיל! 🚀'));

    await waitFor(() => {
      expect(document.getElementById('answerInput')).toBeInTheDocument();
    });

    const answerInput = document.getElementById('answerInput') as HTMLInputElement;
    // Type an answer that's almost certainly wrong: 9999
    await user.type(answerInput, '9999');
    await user.click(screen.getByText('בדוק ✔'));

    await waitFor(() => {
      expect(screen.getByText('❌ לא נכון')).toBeInTheDocument();
    });
  });

  it('correct answer hint shown after wrong answer', async () => {
    const user = userEvent.setup();
    render(<MathGame />);
    const nameInput = screen.getByPlaceholderText('כתוב/י את שמך...');
    await user.type(nameInput, 'Alice');
    await user.click(screen.getByText('בואו נתחיל! 🚀'));

    await waitFor(() => {
      expect(document.getElementById('answerInput')).toBeInTheDocument();
    });

    const answerInput = document.getElementById('answerInput') as HTMLInputElement;
    await user.type(answerInput, '9999');
    await user.click(screen.getByText('בדוק ✔'));

    await waitFor(() => {
      expect(screen.getByText(/התשובה הנכונה היא:/)).toBeInTheDocument();
    });
  });
});
