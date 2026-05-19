import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

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
});

describe('useLocalStorage', () => {
  it('returns the initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 42));
    expect(result.current[0]).toBe(42);
  });

  it('reads an existing value from localStorage', () => {
    localStorageMock.setItem('testKey', JSON.stringify('hello'));
    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));
    expect(result.current[0]).toBe('hello');
  });

  it('updates the state when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 0));
    act(() => {
      result.current[1](99);
    });
    expect(result.current[0]).toBe(99);
  });

  it('persists the new value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 0));
    act(() => {
      result.current[1](99);
    });
    expect(localStorageMock.getItem('testKey')).toBe('99');
  });

  it('supports functional updater', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 5));
    act(() => {
      result.current[1](prev => prev + 1);
    });
    expect(result.current[0]).toBe(6);
  });

  it('works with object values', () => {
    const { result } = renderHook(() => useLocalStorage<Record<string, number>>('obj', {}));
    act(() => {
      result.current[1]({ a: 1 });
    });
    expect(result.current[0]).toEqual({ a: 1 });
    expect(JSON.parse(localStorageMock.getItem('obj') ?? '{}')).toEqual({ a: 1 });
  });

  it('returns default when localStorage has invalid JSON', () => {
    localStorageMock.setItem('badKey', 'not-valid-json{{{');
    const { result } = renderHook(() => useLocalStorage('badKey', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('uses initial value when key not in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('newKey', [1, 2, 3]));
    expect(result.current[0]).toEqual([1, 2, 3]);
  });
});
