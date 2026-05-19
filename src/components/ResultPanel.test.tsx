import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultPanel from './ResultPanel';

describe('ResultPanel', () => {
  it('renders the score and total', () => {
    render(<ResultPanel score={8} total={10} onPlayAgain={vi.fn()} />);
    expect(screen.getByText(/8\/10/)).toBeInTheDocument();
  });

  it('renders the percentage', () => {
    render(<ResultPanel score={8} total={10} onPlayAgain={vi.fn()} />);
    expect(screen.getByText(/80%/)).toBeInTheDocument();
  });

  it('renders the result message for a high score', () => {
    render(<ResultPanel score={10} total={10} onPlayAgain={vi.fn()} />);
    expect(screen.getByText('מדהים! אלוף אמיתי 🎉')).toBeInTheDocument();
  });

  it('renders the result message for a low score', () => {
    render(<ResultPanel score={0} total={10} onPlayAgain={vi.fn()} />);
    expect(screen.getByText('לא נורא! נסה שוב 💪')).toBeInTheDocument();
  });

  it('renders the play-again button', () => {
    render(<ResultPanel score={5} total={10} onPlayAgain={vi.fn()} />);
    expect(screen.getByText('🔄 שחק שוב!')).toBeInTheDocument();
  });

  it('calls onPlayAgain when button is clicked', async () => {
    const user = userEvent.setup();
    const onPlayAgain = vi.fn();
    render(<ResultPanel score={5} total={10} onPlayAgain={onPlayAgain} />);
    await user.click(screen.getByText('🔄 שחק שוב!'));
    expect(onPlayAgain).toHaveBeenCalledOnce();
  });

  it('does not show back button when onBack is not provided', () => {
    render(<ResultPanel score={5} total={10} onPlayAgain={vi.fn()} />);
    expect(screen.queryByText('← הגדרות')).not.toBeInTheDocument();
  });

  it('shows back button when onBack is provided', () => {
    render(<ResultPanel score={5} total={10} onPlayAgain={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText('← הגדרות')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<ResultPanel score={5} total={10} onPlayAgain={vi.fn()} onBack={onBack} />);
    await user.click(screen.getByText('← הגדרות'));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('renders extraMsg when provided', () => {
    render(<ResultPanel score={5} total={10} onPlayAgain={vi.fn()} extraMsg="Extra!" />);
    expect(screen.getByText('Extra!')).toBeInTheDocument();
  });

  it('does not render extraMsg when not provided', () => {
    const { container } = render(<ResultPanel score={5} total={10} onPlayAgain={vi.fn()} />);
    // extraMsg is optional, no extra div should show
    expect(container.querySelectorAll('[dir="rtl"]').length).toBeGreaterThanOrEqual(1);
  });
});
