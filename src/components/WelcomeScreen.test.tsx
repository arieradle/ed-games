import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WelcomeScreen from './WelcomeScreen';

const defaultProps = {
  emoji: '🧮',
  title: 'Test Game',
  subtitle: 'A subtitle',
  label: 'Name label',
  placeholder: 'Enter name',
  btnText: 'Start!',
  players: [],
  onStart: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('WelcomeScreen', () => {
  it('renders title, subtitle, and button', () => {
    render(<WelcomeScreen {...defaultProps} />);
    expect(screen.getByText('Test Game')).toBeInTheDocument();
    expect(screen.getByText('A subtitle')).toBeInTheDocument();
    expect(screen.getByText('Start!')).toBeInTheDocument();
  });

  it('renders the label', () => {
    render(<WelcomeScreen {...defaultProps} />);
    expect(screen.getByText('Name label')).toBeInTheDocument();
  });

  it('does not call onStart when name is empty and button is clicked', async () => {
    const user = userEvent.setup();
    render(<WelcomeScreen {...defaultProps} />);
    const btn = screen.getByText('Start!');
    await user.click(btn);
    expect(defaultProps.onStart).not.toHaveBeenCalled();
  });

  it('calls onStart with trimmed name when button is clicked', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<WelcomeScreen {...defaultProps} onStart={onStart} />);
    const input = screen.getByRole('textbox');
    await user.type(input, '  Alice  ');
    await user.click(screen.getByText('Start!'));
    expect(onStart).toHaveBeenCalledWith('Alice');
  });

  it('calls onStart when Enter key is pressed', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<WelcomeScreen {...defaultProps} onStart={onStart} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'Bob');
    await user.keyboard('{Enter}');
    expect(onStart).toHaveBeenCalledWith('Bob');
  });

  it('does not render player chips when players array is empty', () => {
    render(<WelcomeScreen {...defaultProps} players={[]} />);
    expect(screen.queryByText('או בחר/י שם מוכר:')).not.toBeInTheDocument();
  });

  it('shows player chips when players array is non-empty', () => {
    render(<WelcomeScreen {...defaultProps} players={['Alice', 'Bob']} />);
    expect(screen.getByText('👤 Alice')).toBeInTheDocument();
    expect(screen.getByText('👤 Bob')).toBeInTheDocument();
  });

  it('calls onStart with the player name when a chip is clicked', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<WelcomeScreen {...defaultProps} players={['Charlie']} onStart={onStart} />);
    await user.click(screen.getByText('👤 Charlie'));
    expect(onStart).toHaveBeenCalledWith('Charlie');
  });

  it('renders with rtl direction', () => {
    render(<WelcomeScreen {...defaultProps} dir="rtl" />);
    const container = document.getElementById('welcomeScreen');
    expect(container).toHaveAttribute('dir', 'rtl');
  });
});
