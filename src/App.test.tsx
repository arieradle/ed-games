import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HubPage from './pages/HubPage';
import MathPage from './pages/MathPage';
import EnglishPage from './pages/EnglishPage';

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

vi.mock('./hooks/useBeep', () => ({ useBeep: () => vi.fn() }));
vi.mock('./utils/games', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./utils/games')>();
  return { ...actual, spawnConfetti: vi.fn() };
});

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe('HubPage', () => {
  it('renders "Learning Games" heading', () => {
    render(
      <MemoryRouter>
        <HubPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Learning Games/)).toBeInTheDocument();
  });

  it('renders the math game card', () => {
    render(
      <MemoryRouter>
        <HubPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('משחק חשבון')).toBeInTheDocument();
  });

  it('renders the english game card', () => {
    render(
      <MemoryRouter>
        <HubPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('English Adventure')).toBeInTheDocument();
  });

  it('renders links to /math and /english', () => {
    render(
      <MemoryRouter>
        <HubPage />
      </MemoryRouter>,
    );
    const links = screen.getAllByRole('link');
    const hrefs = links.map(l => l.getAttribute('href'));
    expect(hrefs).toContain('/math');
    expect(hrefs).toContain('/english');
  });
});

describe('MathPage', () => {
  it('renders the math welcome screen', () => {
    render(
      <MemoryRouter>
        <MathPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('בואו נתחיל! 🚀')).toBeInTheDocument();
  });

  it('renders the back button', () => {
    render(
      <MemoryRouter>
        <MathPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('← חזור / Back')).toBeInTheDocument();
  });
});

describe('EnglishPage', () => {
  it('renders the english welcome overlay', () => {
    render(
      <MemoryRouter initialEntries={['/english']}>
        <EnglishPage />
      </MemoryRouter>,
    );
    // EnglishGame shows a welcome overlay before the player enters a name
    expect(screen.getByText('← חזור / Back')).toBeInTheDocument();
    expect(screen.getByText('English Adventure')).toBeInTheDocument();
  });

  it('renders the name input in the welcome overlay', () => {
    render(
      <MemoryRouter initialEntries={['/english']}>
        <EnglishPage />
      </MemoryRouter>,
    );
    expect(screen.getByPlaceholderText("Type your name...")).toBeInTheDocument();
  });

  it('renders the go button in the welcome overlay', () => {
    render(
      <MemoryRouter initialEntries={['/english']}>
        <EnglishPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Let's Go! 🚀")).toBeInTheDocument();
  });
});
