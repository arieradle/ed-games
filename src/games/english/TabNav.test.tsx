import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TabNav, { TABS } from './TabNav';
import type { TabId } from './TabNav';

describe('TabNav', () => {
  it('renders all 9 tabs', () => {
    render(<TabNav active="level1" onChange={vi.fn()} />);
    expect(TABS.length).toBe(9);
    TABS.forEach(tab => {
      expect(screen.getByText(tab.label)).toBeInTheDocument();
    });
  });

  it('calls onChange with correct tab id when a tab is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TabNav active="level1" onChange={onChange} />);
    await user.click(screen.getByText('🃏 Memory'));
    expect(onChange).toHaveBeenCalledWith('memory');
  });

  it('calls onChange with level1 when level1 tab is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TabNav active="memory" onChange={onChange} />);
    await user.click(screen.getByText('⭐ Level 1'));
    expect(onChange).toHaveBeenCalledWith('level1');
  });

  it('calls onChange with sentences when sentences tab is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TabNav active="level1" onChange={onChange} />);
    await user.click(screen.getByText('📝 Sentences'));
    expect(onChange).toHaveBeenCalledWith('sentences');
  });

  it('active tab has the ring-[3px] ring-white class', () => {
    render(<TabNav active="bingo" onChange={vi.fn()} />);
    const bingoBtn = screen.getByText('🎯 Bingo').closest('button');
    expect(bingoBtn).toHaveClass('ring-[3px]');
    expect(bingoBtn).toHaveClass('ring-white');
  });

  it('inactive tabs do not have the ring class', () => {
    render(<TabNav active="level1" onChange={vi.fn()} />);
    const memoryBtn = screen.getByText('🃏 Memory').closest('button');
    expect(memoryBtn).not.toHaveClass('ring-[3px]');
  });

  it('each tab button has correct tab id class', () => {
    render(<TabNav active="level1" onChange={vi.fn()} />);
    TABS.forEach(tab => {
      const btn = screen.getByText(tab.label).closest('button');
      expect(btn).toHaveClass(tab.cls);
    });
  });
});
