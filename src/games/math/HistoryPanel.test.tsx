import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HistoryPanel from './HistoryPanel';
import type { HistoryEntry } from '../../data/types';

const makeEntry = (overrides: Partial<HistoryEntry> = {}): HistoryEntry => ({
  question: '3 + 4',
  userAnswer: 7,
  correctAnswer: 7,
  correct: true,
  difficulty: 'easy',
  time: '10:30',
  ...overrides,
});

describe('HistoryPanel', () => {
  it('renders empty state message when history is empty', () => {
    render(<HistoryPanel history={[]} onClear={vi.fn()} />);
    expect(screen.getByText('עדיין אין שאלות. בהצלחה! 😊')).toBeInTheDocument();
  });

  it('does not render empty state when history has items', () => {
    render(<HistoryPanel history={[makeEntry()]} onClear={vi.fn()} />);
    expect(screen.queryByText('עדיין אין שאלות. בהצלחה! 😊')).not.toBeInTheDocument();
  });

  it('renders history items', () => {
    const entries = [
      makeEntry({ question: '2 + 2', correctAnswer: 4, userAnswer: 4, correct: true }),
      makeEntry({ question: '5 − 3', correctAnswer: 2, userAnswer: 1, correct: false }),
    ];
    render(<HistoryPanel history={entries} onClear={vi.fn()} />);
    expect(screen.getByText('2 + 2')).toBeInTheDocument();
    expect(screen.getByText('5 − 3')).toBeInTheDocument();
  });

  it('shows correct count', () => {
    const entries = [
      makeEntry({ correct: true }),
      makeEntry({ correct: true }),
      makeEntry({ correct: false }),
    ];
    render(<HistoryPanel history={entries} onClear={vi.fn()} />);
    expect(screen.getByText(/2 נכון/)).toBeInTheDocument();
  });

  it('shows wrong count', () => {
    const entries = [
      makeEntry({ correct: true }),
      makeEntry({ correct: false }),
      makeEntry({ correct: false }),
    ];
    render(<HistoryPanel history={entries} onClear={vi.fn()} />);
    expect(screen.getByText(/2 שגוי/)).toBeInTheDocument();
  });

  it('shows total count', () => {
    const entries = [makeEntry(), makeEntry(), makeEntry()];
    render(<HistoryPanel history={entries} onClear={vi.fn()} />);
    expect(screen.getByText(/סה"כ: 3/)).toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<HistoryPanel history={[]} onClear={onClear} />);
    await user.click(screen.getByText('נקה היסטוריה'));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('renders correct answer for correct entries', () => {
    const entries = [makeEntry({ question: '3 + 4', correctAnswer: 7, correct: true })];
    render(<HistoryPanel history={entries} onClear={vi.fn()} />);
    expect(screen.getByText(/= 7/)).toBeInTheDocument();
  });

  it('renders user and correct answer for wrong entries', () => {
    const entries = [makeEntry({ question: '3 + 4', correctAnswer: 7, userAnswer: 5, correct: false })];
    render(<HistoryPanel history={entries} onClear={vi.fn()} />);
    expect(screen.getByText(/ענית: 5 \(נכון: 7\)/)).toBeInTheDocument();
  });
});
