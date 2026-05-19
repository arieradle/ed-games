import { getResultMsg, getStars, getEmoji, spawnConfetti } from './games';

describe('getResultMsg', () => {
  it('returns top message for 90% and above', () => {
    expect(getResultMsg(90)).toBe('מדהים! אלוף אמיתי 🎉');
    expect(getResultMsg(100)).toBe('מדהים! אלוף אמיתי 🎉');
    expect(getResultMsg(95)).toBe('מדהים! אלוף אמיתי 🎉');
  });

  it('returns good message for 70-89%', () => {
    expect(getResultMsg(70)).toBe('כל הכבוד! עבודה טובה 👏');
    expect(getResultMsg(80)).toBe('כל הכבוד! עבודה טובה 👏');
    expect(getResultMsg(89)).toBe('כל הכבוד! עבודה טובה 👏');
  });

  it('returns ok message for 50-69%', () => {
    expect(getResultMsg(50)).toBe('יפה! תמשיך להתאמן 😊');
    expect(getResultMsg(60)).toBe('יפה! תמשיך להתאמן 😊');
    expect(getResultMsg(69)).toBe('יפה! תמשיך להתאמן 😊');
  });

  it('returns try-again message for below 50%', () => {
    expect(getResultMsg(49)).toBe('לא נורא! נסה שוב 💪');
    expect(getResultMsg(0)).toBe('לא נורא! נסה שוב 💪');
    expect(getResultMsg(1)).toBe('לא נורא! נסה שוב 💪');
  });
});

describe('getStars', () => {
  it('returns 3 stars for 90% and above', () => {
    expect(getStars(90)).toBe('⭐⭐⭐');
    expect(getStars(100)).toBe('⭐⭐⭐');
  });

  it('returns 2 stars for 70-89%', () => {
    expect(getStars(70)).toBe('⭐⭐');
    expect(getStars(89)).toBe('⭐⭐');
  });

  it('returns 1 star for below 70%', () => {
    expect(getStars(69)).toBe('⭐');
    expect(getStars(0)).toBe('⭐');
    expect(getStars(50)).toBe('⭐');
  });
});

describe('getEmoji', () => {
  it('returns trophy for 90% and above', () => {
    expect(getEmoji(90)).toBe('🏆');
    expect(getEmoji(100)).toBe('🏆');
  });

  it('returns star for 70-89%', () => {
    expect(getEmoji(70)).toBe('🌟');
    expect(getEmoji(89)).toBe('🌟');
  });

  it('returns smile for 50-69%', () => {
    expect(getEmoji(50)).toBe('😊');
    expect(getEmoji(69)).toBe('😊');
  });

  it('returns muscle for below 50%', () => {
    expect(getEmoji(49)).toBe('💪');
    expect(getEmoji(0)).toBe('💪');
  });
});

describe('spawnConfetti', () => {
  it('creates 40 confetti pieces in the container', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    spawnConfetti(container);
    expect(container.children.length).toBe(40);
    document.body.removeChild(container);
  });

  it('each piece has the confetti-piece class', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    spawnConfetti(container);
    const pieces = Array.from(container.children);
    pieces.forEach(p => {
      expect(p.classList.contains('confetti-piece')).toBe(true);
    });
    document.body.removeChild(container);
  });

  it('clears previous contents before adding pieces', () => {
    const container = document.createElement('div');
    container.innerHTML = '<span>old</span>';
    document.body.appendChild(container);
    spawnConfetti(container);
    expect(container.querySelectorAll('span').length).toBe(0);
    expect(container.children.length).toBe(40);
    document.body.removeChild(container);
  });

  it('pieces have a background color set', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    spawnConfetti(container);
    const piece = container.children[0] as HTMLElement;
    expect(piece.style.background).toBeTruthy();
    document.body.removeChild(container);
  });
});
