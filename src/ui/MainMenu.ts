import { SettingsMenu } from './SettingsMenu';
import { AudioManager } from '../audio/AudioManager';

export class MainMenu {
  private container: HTMLDivElement | null = null;
  private visible = true;
  private settingsMenu: SettingsMenu;
  private onStartGame: ((isLoad: boolean) => void) | null = null;

  constructor(settingsMenu: SettingsMenu, onStartGame: (isLoad: boolean) => void) {
    this.settingsMenu = settingsMenu;
    this.onStartGame = onStartGame;
  }

  create(): void {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 500;
      background: radial-gradient(circle at center, rgba(20, 28, 45, 0.85), rgba(8, 10, 18, 0.95));
      backdrop-filter: blur(10px);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-family: monospace; color: #fff; user-select: none;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
      background: rgba(15, 20, 32, 0.85); backdrop-filter: blur(16px);
      border: 2px solid rgba(255, 204, 0, 0.35); border-radius: 20px;
      padding: 40px 48px; display: flex; flex-direction: column; align-items: center;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), inset 0 0 15px rgba(255, 204, 0, 0.1);
      width: 320px;
    `;

    // Title Logo & Subtitle Badge
    const title = document.createElement('h1');
    title.style.cssText = `
      font-size: 38px; font-weight: 900; color: #ffcc00; margin: 0;
      text-shadow: 3px 3px 0 #000, 0 0 25px rgba(255, 204, 0, 0.6);
      letter-spacing: 3px; text-align: center;
    `;
    title.textContent = 'MINECRAFT LITE';

    const subBadge = document.createElement('div');
    subBadge.style.cssText = `
      margin-top: 8px; margin-bottom: 32px; font-size: 10px; font-weight: bold;
      color: #00ffcc; background: rgba(0, 255, 204, 0.12);
      border: 1px solid rgba(0, 255, 204, 0.35); padding: 3px 12px; border-radius: 12px;
      letter-spacing: 2px; text-transform: uppercase;
    `;
    subBadge.textContent = 'VOXEL SANDBOX 3D';

    card.appendChild(title);
    card.appendChild(subBadge);

    // Button Box
    const btnBox = document.createElement('div');
    btnBox.style.cssText = 'display: flex; flex-direction: column; gap: 14px; width: 100%;';

    const makeBtn = (text: string, bgGradient: string, hoverBorder: string, onClick: () => void) => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        padding: 13px 18px; font-family: inherit; font-size: 14px; font-weight: bold;
        color: #fff; background: ${bgGradient}; border: 1px solid rgba(255,255,255,0.2);
        border-radius: 8px; cursor: pointer; transition: all 0.2s ease;
        box-shadow: 0 4px 14px rgba(0,0,0,0.4); text-align: center; letter-spacing: 1px;
      `;
      btn.textContent = text;
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-2px) scale(1.02)';
        btn.style.borderColor = hoverBorder;
        btn.style.boxShadow = `0 6px 20px ${hoverBorder}66`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0) scale(1)';
        btn.style.borderColor = 'rgba(255,255,255,0.2)';
        btn.style.boxShadow = '0 4px 14px rgba(0,0,0,0.4)';
      });
      btn.addEventListener('click', onClick);
      return btn;
    };

    const newGameBtn = makeBtn('▶  SINGLEPLAYER (NEW)', 'linear-gradient(135deg, #2e7d32, #1b5e20)', '#4caf50', () => {
      this.hide();
      AudioManager.getInstance().playSFX('place');
      AudioManager.getInstance().startMusic();
      this.onStartGame?.(false);
    });

    const loadGameBtn = makeBtn('💾  LOAD SAVED WORLD', 'linear-gradient(135deg, #1565c0, #0d47a1)', '#42a5f5', () => {
      this.hide();
      AudioManager.getInstance().playSFX('place');
      AudioManager.getInstance().startMusic();
      this.onStartGame?.(true);
    });

    const settingsBtn = makeBtn('⚙️  SETTINGS', 'rgba(255, 255, 255, 0.08)', '#ffcc00', () => {
      this.settingsMenu.toggle();
    });

    btnBox.appendChild(newGameBtn);
    btnBox.appendChild(loadGameBtn);
    btnBox.appendChild(settingsBtn);
    card.appendChild(btnBox);

    const footer = document.createElement('div');
    footer.style.cssText = 'margin-top: 28px; font-size: 10px; color: rgba(255,255,255,0.35); text-align: center;';
    footer.textContent = 'Three.js • TypeScript • Vite Engine v1.0';
    card.appendChild(footer);

    this.container.appendChild(card);
    document.body.appendChild(this.container);
  }

  show(): void {
    this.visible = true;
    if (this.container) this.container.style.display = 'flex';
  }

  hide(): void {
    this.visible = false;
    if (this.container) this.container.style.display = 'none';
  }

  get isOpen(): boolean {
    return this.visible;
  }
}
