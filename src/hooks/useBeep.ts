import { useCallback, useRef } from 'react';

export function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, gain: number) => {
    try {
      const ac = getCtx();
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(gain, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
      osc.connect(g); g.connect(ac.destination);
      osc.start(); osc.stop(ac.currentTime + duration);
    } catch { /* ignore */ }
  }, [getCtx]);

  const beep = useCallback((ok: boolean) => {
    if (ok) {
      playTone(523, 'sine', 0.15, 0.4);
      setTimeout(() => playTone(659, 'sine', 0.15, 0.4), 120);
      setTimeout(() => playTone(784, 'sine', 0.25, 0.4), 240);
    } else {
      playTone(300, 'sawtooth', 0.15, 0.3);
      setTimeout(() => playTone(220, 'sawtooth', 0.25, 0.3), 120);
    }
  }, [playTone]);

  return beep;
}
