const genericSquares = [
  'Someone accidentally talks while muted',
  'Someone says, “Can everyone see my screen?”',
  'Someone asks a question that was already answered',
  'Someone says, “I have a hard stop”',
  'A calendar invite changes at the last minute',
  'Someone says, “Let’s take this offline”',
  'Someone joins the wrong meeting',
  'Someone has to repeat themselves',
  'The meeting runs over time',
  'Someone says, “You’re on mute”'
];
const meetingTypes = {
  dev: {
    label: 'Dev meeting',
    squares: [
      'Larren rambles',
      'Flanders rambles',
      'Bavid responds to a question with one word',
      'Louis talks to herself because no one responds',
      'Dog or cat appearance',
      'Someone complains about UI/UX designers',
      'Bug in sprint demo',
      'Surprise slide deck',
      'Stan continues to be the most precious human on the planet',
      'Flanders calls Mess out',
      'Larren is asked a technical question but wasn’t paying attention',
      'Stan points a ticket different from everyone else',
      'Mess snoops on a meeting',
      'Bavid’s big sigh'
    ]
  },
  product: {
    label: 'Product meeting',
    squares: [
      'Someone says packet',
      'Boss man talks about AI',
      'Nimoy is mentioned',
      'Larren rambles',
      'Floss turns his camera off',
      'Jia and Mess don’t pay attention',
      'Norm is later than Darren',
      'Put it on the roadmap',
      'Mess or Jia turn cameras off from laughing',
      'Dog or cat appearance',
      'Laura publically shames us',
      'Surprise slide deck',
      'Someone complains about a critical feature that Torus STILL doesn’t have',
      'Product knowledge base',
      'Larren is asked a technical question but wasn’t paying attention',
      'Nimoy knows the product vision before the product team',
      'Make a skill for that',
      'someone says “quarterly”',
      'someone asks for the roadmap to be reviewed'
    ]
  }
};
let activeMeeting = 'dev';
const meetingStates = {};
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
const winMessages = [
  'It’s fine. Everything’s fine.',
  'This is fine. The meeting is still happening.',
  'Another day, another “quick sync.”',
  'I am once again asking for this meeting to end.',
  'Task failed successfully.',
  'Congratulations. Your reward is more meeting.',
  'There is no bingo. Only calendar invites.',
  'Guess I’ll just keep nodding.',
  'The horrors persist. So do the action items.',
  'We live in a society. With recurring meetings.'
];
let remainingWinMessages = [];
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
function celebrate() {
  dismissCelebration();
  if (!remainingWinMessages.length) remainingWinMessages = shuffle(winMessages);
  document.getElementById('celebrationMessage').textContent = remainingWinMessages.pop();
  celebration.hidden = false;
  if (!reducedMotion.matches) {
    const colors = [getComputedStyle(document.body).getPropertyValue('--accent').trim(), '#d6b663', '#98ae8a', '#e6a8a1'];
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
function updateBoard(announce = false, celebrateNew = true) {
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
  meetingStates[activeMeeting].marked = new Set(tiles.flatMap((tile, index) => tile.classList.contains('marked') ? [index] : []));
  if (newLines.length && celebrateNew) celebrate();
  else if (!nextLines.size) dismissCelebration();
  if (announce) document.getElementById('status').textContent = `${count} of 25 squares marked. ${nextLines.size} bingo lines.`;
}
function buildBoard() {
  const custom = meetingTypes[activeMeeting].squares;
  const picked = shuffle([...custom, ...shuffle(genericSquares).slice(0, 24 - custom.length)]);
  picked.splice(12, 0, null);
  meetingStates[activeMeeting] = { squares: picked, marked: new Set([12]) };
  renderBoard();
}
function renderBoard() {
  dismissCelebration();
  completedLines = new Set();
  const state = meetingStates[activeMeeting];
  const picked = state.squares;
  board.replaceChildren();
  picked.forEach((text, index) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'tile' + (text === null ? ' free' : '') + (state.marked.has(index) ? ' marked' : '');
    if (text === null) {
      tile.innerHTML = '<span class="free-star" aria-hidden="true">✳</span><span class="free-title">Free space</span><span class="free-note">you’ve suffered enough</span>';
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
  updateBoard(false, false);
}
function selectMeeting(type) {
  activeMeeting = type;
  document.body.dataset.meeting = type;
  document.getElementById('boardTitle').textContent = meetingTypes[type].label + ' bingo';
  document.getElementById('meetingPanel').setAttribute('aria-labelledby', type + 'Tab');
  document.querySelectorAll('[role="tab"]').forEach(tab => {
    const selected = tab.dataset.meeting === type;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  if (meetingStates[type]) renderBoard();
  else buildBoard();
  document.getElementById('status').textContent = meetingTypes[type].label + ' card selected.';
}
const meetingTabs = [...document.querySelectorAll('[role="tab"]')];
meetingTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectMeeting(tab.dataset.meeting));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % meetingTabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + meetingTabs.length) % meetingTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = meetingTabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      meetingTabs[next].focus();
      selectMeeting(meetingTabs[next].dataset.meeting);
    }
  });
});
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
selectMeeting('dev');
