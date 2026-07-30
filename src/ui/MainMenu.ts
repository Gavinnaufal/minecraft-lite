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
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 500;
      background: radial-gradient(circle at center, rgba(30, 40, 60, 0.95), rgba(10, 10, 18, 0.98));
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'Courier New', Courier, monospace;
      color: #fff;
    `;

    // Title logo
    const title = document.createElement('h1');
    title.style.cssText = `
      font-size: 48px;
      font-weight: bold;
      color: #ffcc00;
      text-shadow: 4px 4px 0 #000, -2px -2px 0 #886600;
      margin-bottom: 32px;
      letter-spacing: 2px;
    `;
    title.textContent = 'MINECRAFT LITE';
    this.container.appendChild(title);

    // Button container
    const btnBox = document.createElement('div');
    btnBox.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 240px;';

    const makeBtn = (text: string, bgColor: string, onClick: () => void) => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        padding: 12px;
        font-family: inherit;
        font-size: 15px;
        font-weight: bold;
        color: #fff;
        background: ${bgColor};
        border: 2px solid #fff;
        border-radius: 4px;
        cursor: pointer;
        transition: transform 0.1s, filter 0.1s;
        box-shadow: 2px 2px 6px rgba(0,0,0,0.5);
      `;
      btn.textContent = text;
      btn.addEventListener('mouseenter', () => { btn.style.filter = 'brightness(1.2)'; });
      btn.addEventListener('mouseleave', () => { btn.style.filter = 'none'; });
      btn.addEventListener('click', onClick);
      return btn;
    };

    const newGameBtn = makeBtn('Singleplayer (New)', '#2e7d32', () => {
      this.hide();
      AudioManager.getInstance().playSFX('place');
      AudioManager.getInstance().startMusic();
      this.onStartGame?.(false);
    });

    const loadGameBtn = makeBtn('Load Saved Game', '#1565c0', () => {
      this.hide();
      AudioManager.getInstance().playSFX('place');
      AudioManager.getInstance().startMusic();
      this.onStartGame?.(true);
    });

    const settingsBtn = makeBtn('Settings', '#424242', () => {
      this.settingsMenu.toggle();
    });

    btnBox.appendChild(newGameBtn);
    btnBox.appendChild(loadGameBtn);
    btnBox.appendChild(settingsBtn);

    this.container.appendChild(btnBox);
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
