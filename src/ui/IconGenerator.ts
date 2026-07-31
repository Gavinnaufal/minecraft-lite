import { getItemById } from '../inventory/ItemRegistry';

const BLOCK_COLORS: Record<string, { top: string; left: string; right: string }> = {
  grass: { top: '#55aa33', left: '#795548', right: '#5c3d2e' },
  dirt: { top: '#795548', left: '#6d4c41', right: '#5c3d2e' },
  stone: { top: '#9e9e9e', left: '#757575', right: '#616161' },
  sand: { top: '#e4c875', left: '#d4b45d', right: '#c29f47' },
  wood_log: { top: '#bcaaa4', left: '#5d4037', right: '#4e342e' },
  leaves: { top: '#388e3c', left: '#2e7d32', right: '#1b5e20' },
  plank: { top: '#b18c5d', left: '#997343', right: '#825e31' },
  crafting_table: { top: '#8d6e63', left: '#6d4c41', right: '#4e342e' },
  chest: { top: '#b17036', left: '#8b5a2b', right: '#73471e' },
  farmland: { top: '#4e3629', left: '#3b281e', right: '#291b13' },
};

export function createItemIcon(itemId: string, size = 28): HTMLElement {
  const container = document.createElement('div');
  container.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  `;

  const item = getItemById(itemId);
  if (!item) return container;

  if (item.isBlock && BLOCK_COLORS[itemId]) {
    const colors = BLOCK_COLORS[itemId];
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.setAttribute('viewBox', '0 0 32 32');

    // Render 3D Isometric Voxel Cube
    svg.innerHTML = `
      <polygon points="16,3 28,9 16,15 4,9" fill="${colors.top}" stroke="rgba(0,0,0,0.2)" stroke-width="0.5"/>
      <polygon points="4,9 16,15 16,27 4,21" fill="${colors.left}" stroke="rgba(0,0,0,0.25)" stroke-width="0.5"/>
      <polygon points="16,15 28,9 28,21 16,27" fill="${colors.right}" stroke="rgba(0,0,0,0.3)" stroke-width="0.5"/>
    `;
    container.appendChild(svg);
    return container;
  }

  // Tools & Items
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', '0 0 32 32');

  if (itemId === 'stick') {
    svg.innerHTML = `<line x1="8" y1="24" x2="24" y2="8" stroke="#8d6e63" stroke-width="4" stroke-linecap="round"/>`;
  } else if (itemId.includes('pickaxe')) {
    const isStone = itemId.includes('stone');
    const headColor = isStone ? '#9e9e9e' : '#b18c5d';
    svg.innerHTML = `
      <line x1="8" y1="24" x2="22" y2="10" stroke="#6d4c41" stroke-width="3" stroke-linecap="round"/>
      <path d="M 14,6 Q 22,8 26,16 Q 20,20 18,12 Z" fill="${headColor}" stroke="#333" stroke-width="0.5"/>
    `;
  } else if (itemId.includes('sword')) {
    const isStone = itemId.includes('stone');
    const bladeColor = isStone ? '#9e9e9e' : '#b18c5d';
    svg.innerHTML = `
      <line x1="8" y1="24" x2="12" y2="20" stroke="#4e342e" stroke-width="3" stroke-linecap="round"/>
      <line x1="9" y1="19" x2="15" y2="25" stroke="#ffcc00" stroke-width="2"/>
      <polygon points="12,18 26,4 28,6 14,20" fill="${bladeColor}" stroke="#333" stroke-width="0.5"/>
    `;
  } else if (itemId.includes('shovel')) {
    const isStone = itemId.includes('stone');
    const headColor = isStone ? '#9e9e9e' : '#b18c5d';
    svg.innerHTML = `
      <line x1="8" y1="24" x2="20" y2="12" stroke="#6d4c41" stroke-width="3" stroke-linecap="round"/>
      <polygon points="18,10 26,6 28,8 22,14" fill="${headColor}" stroke="#333" stroke-width="0.5"/>
    `;
  } else if (itemId.includes('axe')) {
    const isStone = itemId.includes('stone');
    const headColor = isStone ? '#9e9e9e' : '#b18c5d';
    svg.innerHTML = `
      <line x1="8" y1="24" x2="22" y2="10" stroke="#6d4c41" stroke-width="3" stroke-linecap="round"/>
      <path d="M 18,6 L 26,8 L 24,18 L 18,12 Z" fill="${headColor}" stroke="#333" stroke-width="0.5"/>
    `;
  } else if (itemId === 'beef') {
    svg.innerHTML = `<path d="M 8,14 Q 16,6 24,14 Q 22,24 10,22 Z" fill="#b71c1c" stroke="#333" stroke-width="0.5"/><circle cx="14" cy="14" r="3" fill="#ef9a9a"/>`;
  } else if (itemId === 'rotten_flesh') {
    svg.innerHTML = `<path d="M 8,14 Q 16,6 24,14 Q 22,24 10,22 Z" fill="#33691e" stroke="#333" stroke-width="0.5"/><circle cx="14" cy="14" r="3" fill="#81c784"/>`;
  } else if (itemId.includes('hoe')) {
    const isStone = itemId.includes('stone');
    const headColor = isStone ? '#9e9e9e' : '#b18c5d';
    svg.innerHTML = `
      <line x1="8" y1="24" x2="22" y2="10" stroke="#6d4c41" stroke-width="3" stroke-linecap="round"/>
      <path d="M 18,6 L 28,6 L 24,12 L 18,10 Z" fill="${headColor}" stroke="#333" stroke-width="0.5"/>
    `;
  } else if (itemId === 'wheat_seeds') {
    svg.innerHTML = `
      <circle cx="12" cy="18" r="2.5" fill="#81c784"/>
      <circle cx="18" cy="14" r="2.5" fill="#a5d6a7"/>
      <circle cx="16" cy="20" r="2" fill="#66bb6a"/>
    `;
  } else if (itemId === 'wheat') {
    svg.innerHTML = `
      <path d="M 10,24 Q 16,14 22,6" stroke="#fbc02d" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="20" cy="8" r="2.5" fill="#ffee58"/>
      <circle cx="16" cy="12" r="2.5" fill="#fdd835"/>
      <circle cx="12" cy="16" r="2.5" fill="#fbc02d"/>
    `;
  } else if (itemId === 'bread') {
    svg.innerHTML = `
      <ellipse cx="16" cy="16" rx="10" ry="6" fill="#d7ccc8" stroke="#5d4037" stroke-width="1"/>
      <path d="M 8,14 Q 16,10 24,14" fill="#a1887f"/>
      <line x1="12" y1="13" x2="14" y2="17" stroke="#795548" stroke-width="1.5"/>
      <line x1="18" y1="13" x2="20" y2="17" stroke="#795548" stroke-width="1.5"/>
    `;
  } else if (itemId === 'torch') {
    svg.innerHTML = `
      <line x1="10" y1="26" x2="20" y2="12" stroke="#6d4c41" stroke-width="4" stroke-linecap="round"/>
      <circle cx="21" cy="10" r="4.5" fill="#ff9800"/>
      <circle cx="21" cy="10" r="2.5" fill="#ffeb3b"/>
    `;
  } else {
    svg.innerHTML = `<rect x="6" y="6" width="20" height="20" fill="#9e9e9e" rx="3"/>`;
  }

  container.appendChild(svg);
  return container;
}
