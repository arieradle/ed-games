export function getResultMsg(pct: number): string {
  if (pct >= 90) return 'מדהים! אלוף אמיתי 🎉';
  if (pct >= 70) return 'כל הכבוד! עבודה טובה 👏';
  if (pct >= 50) return 'יפה! תמשיך להתאמן 😊';
  return 'לא נורא! נסה שוב 💪';
}

export function getStars(pct: number): string {
  if (pct >= 90) return '⭐⭐⭐';
  if (pct >= 70) return '⭐⭐';
  return '⭐';
}

export function getEmoji(pct: number): string {
  if (pct >= 90) return '🏆';
  if (pct >= 70) return '🌟';
  if (pct >= 50) return '😊';
  return '💪';
}

export function spawnConfetti(container: HTMLElement) {
  container.innerHTML = '';
  const colors = ['#ff6b35', '#4ecdc4', '#ffe66d', '#a855f7', '#22c55e', '#f472b6'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.top = '-10px';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = (6 + Math.random() * 10) + 'px';
    piece.style.height = (6 + Math.random() * 10) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.animationDuration = (0.8 + Math.random() * 1.2) + 's';
    piece.style.animationDelay = (Math.random() * 0.4) + 's';
    container.appendChild(piece);
  }
  setTimeout(() => { container.innerHTML = ''; }, 2500);
}
