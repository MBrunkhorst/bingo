const surpriseSquare = 'Larren builds a surprise slide deck';
const meetingSquares = [
  'Someone struggles with screen sharing',
  "Larren is asked a technical question but wasn't paying attention",
  "Pal complains about a critical feature that Torus still doesn't have",
  'Flanders calls Mess out',
  'Louis tries to tell Flanders to wrap it up and Flanders ignores Louis',
  'Stan continues to be the most precious person on the planet',
  'Bug in sprint demo',
  "Mess doesn't pay attention when asked a question",
  'Jim complains about hating UI/UX designers',
  'Flanders rambles on',
  'Bavid responds to a question with a one word response',
  'Mess snoops on a meeting',
  'Mess or Jia have to turn off their camera from laughing',
  surpriseSquare,
  'Larren is late',
  'Someone accidentally talks while muted',
  'A dog or cat makes a surprise appearance',
  "Someone says, 'Let me share my screen real quick'",
  'The agenda gets rewritten during the meeting',
  'A discussion could have been an email',
  'Someone asks a question that was already answered',
  'Audio cuts out for a moment',
  "Someone says, 'I have a hard stop'",
  'A calendar invite changes at the last minute',
  'Someone forgets to unmute for several seconds'
];
const board = document.getElementById('board');
const celebration = document.getElementById('celebration');
const confetti = document.getElementById('confetti');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const lines = [
  ...Array.from({ length: 5 }, (_, row) => Array.from({ length: 5 }, (_, col) => row * 5 + col)),
  ...Array.from({ length: 5 }, (_, col) => Array.from({ length: 5 }, (_, row) => row * 5 + col)),
  [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
];
let completedLines = new Set();
let celebrationTimer;
let confettiTimer;
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function dismissCelebration() {
  clearTimeout(celebrationTimer);
  clearTimeout(confettiTimer);
  celebration.hidden = true;
  confetti.replaceChildren();
}
function celebrate(total) {
  dismissCelebration();
  document.getElementById('celebrationMessage').textContent = total === 1
    ? 'A meeting well spent.' : `${total} lines! You’re on a roll.`;
  celebration.hidden = false;
  if (!reducedMotion.matches) {
    const colors = ['#7053b3', '#c4ace7', '#d6b663', '#98ae8a', '#e6a8a1'];
    const pieces = document.createDocumentFragment();
    for (let i = 0; i < 65; i++) {
      const piece = document.createElement('i');
      piece.style.cssText = `--x:${Math.random() * 100}%;--size:${5 + Math.random() * 6}px;--color:${colors[i % colors.length]};--duration:${2 + Math.random() * 1.5}s;--delay:${Math.random() * .5}s;--drift:${Math.random() * 180 - 90}px;--rotation:${Math.random() * 1080 - 540}deg`;
      pieces.appendChild(piece);
    }
    confetti.appendChild(pieces);
    confettiTimer = setTimeout(() => confetti.replaceChildren(), 4200);
  }
  celebrationTimer = setTimeout(dismissCelebration, 5500);
}
function updateBoard(announce = false) {
  const tiles = [...board.children];
  const nextLines = new Set();
  lines.forEach((line, index) => {
    if (line.every(position => tiles[position].classList.contains('marked'))) nextLines.add(index);
  });
  const newLines = [...nextLines].filter(index => !completedLines.has(index));
  const winningTiles = new Set([...nextLines].flatMap(index => lines[index]));
  const newWinningTiles = new Set(newLines.flatMap(index => lines[index]));
  tiles.forEach((tile, index) => {
    tile.classList.toggle('winning', winningTiles.has(index));
    tile.classList.remove('win-pulse');
    if (newWinningTiles.has(index)) {
      void tile.offsetWidth;
      tile.classList.add('win-pulse');
    }
    tile.setAttribute('aria-pressed', String(tile.classList.contains('marked')));
  });
  completedLines = nextLines;
  const count = tiles.filter(tile => tile.classList.contains('marked')).length;
  if (newLines.length) celebrate(nextLines.size);
  else if (!nextLines.size) dismissCelebration();
  if (announce) document.getElementById('status').textContent = `${count} of 25 squares marked. ${nextLines.size} bingo lines.`;
}
function buildBoard() {
  dismissCelebration();
  completedLines = new Set();
  // Keep the new custom square on every card; vary the remaining 23 squares.
  const picked = shuffle([surpriseSquare, ...shuffle(meetingSquares.filter(text => text !== surpriseSquare)).slice(0, 23)]);
  picked.splice(12, 0, null);
  board.replaceChildren();
  picked.forEach((text, index) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = text === null ? 'tile free marked' : 'tile';
    if (text === null) {
      tile.innerHTML = '<span class="free-star" aria-hidden="true">✳</span><span class="free-title">Free space</span><span class="free-note">on the house</span>';
      tile.setAttribute('aria-label', 'Free space, always marked');
      tile.setAttribute('aria-disabled', 'true');
    } else {
      const label = document.createElement('span');
      label.textContent = text;
      tile.appendChild(label);
      tile.setAttribute('aria-label', `${'BINGO'[index % 5]}${Math.floor(index / 5) + 1}: ${text}`);
      tile.addEventListener('click', () => {
        tile.classList.toggle('marked');
        tile.classList.remove('pop');
        void tile.offsetWidth;
        tile.classList.add('pop');
        updateBoard(true);
      });
    }
    board.appendChild(tile);
  });
  updateBoard();
}
document.getElementById('reshuffleBtn').addEventListener('click', () => {
  buildBoard();
  document.getElementById('status').textContent = 'New card shuffled. Free space is marked. Let’s play!';
});
document.getElementById('clearBtn').addEventListener('click', () => {
  dismissCelebration();
  board.querySelectorAll('.tile:not(.free)').forEach(tile => tile.classList.remove('marked', 'pop'));
  updateBoard();
  document.getElementById('status').textContent = 'Marks cleared. Free space is still marked.';
});
document.getElementById('dismissCelebration').addEventListener('click', dismissCelebration);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') dismissCelebration();
});
buildBoard();
