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
      background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url('/textures/blocks/dirt.png');
      background-size: 64px 64px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-family: monospace; color: #fff; user-select: none;
    `;

    // Minecraft Title Box
    const titleBox = document.createElement('div');
    titleBox.style.cssText = 'position: relative; margin-bottom: 48px; text-align: center;';

    const title = document.createElement('h1');
    title.style.cssText = `
      font-size: 52px; font-weight: 900; color: #ffcc00; margin: 0;
      text-shadow: 4px 4px 0 #3f3100, -2px -2px 0 #fff;
      letter-spacing: 4px; text-transform: uppercase;
      font-family: 'Courier New', monospace;
    `;
    title.textContent = 'MINECRAFT LITE';

    // Yellow Splash Text (Minecraft Style)
    const splash = document.createElement('div');
    splash.style.cssText = `
      position: absolute; right: -40px; bottom: -22px; transform: rotate(-14deg);
      font-size: 16px; font-weight: bold; color: #ffff00; text-shadow: 2px 2px 0 #000;
      animation: splashPulse 1.2s infinite alternate ease-in-out;
    `;
    splash.textContent = '100% TS + Three.js Voxel Engine!';

    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes splashPulse {
        0% { transform: rotate(-14deg) scale(1); }
        100% { transform: rotate(-14deg) scale(1.1); }
      }
      .mc-button {
        width: 360px; padding: 14px 20px; font-family: monospace; font-size: 16px; font-weight: bold;
        color: #e0e0e0; background: #707070;
        border-top: 3px solid #9e9e9e; border-left: 3px solid #9e9e9e;
        border-bottom: 3px solid #3a3a3a; border-right: 3px solid #3a3a3a;
        cursor: pointer; text-shadow: 2px 2px 0 #000; text-align: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.6); transition: background 0.1s, border-color 0.1s;
      }
      .mc-button:hover {
        background: #808080; color: #ffffa0;
        border-top-color: #ffffa0; border-left-color: #ffffa0;
        border-bottom-color: #555500; border-right-color: #555500;
      }
      .mc-button:active {
        border-top-color: #3a3a3a; border-left-color: #3a3a3a;
        border-bottom-color: #9e9e9e; border-right-color: #9e9e9e;
        background: #555555;
      }
    `;
    document.head.appendChild(styleEl);

    titleBox.appendChild(title);
    titleBox.appendChild(splash);
    this.container.appendChild(titleBox);

    // Button Box
    const btnBox = document.createElement('div');
    btnBox.style.cssText = 'display: flex; flex-direction: column; gap: 16px; align-items: center;';

    const makeMcBtn = (label: string, onClick: () => void) => {
      const btn = document.createElement('button');
      btn.className = 'mc-button';
      btn.textContent = label;
      btn.addEventListener('mouseenter', () => {
        AudioManager.getInstance().playSFX('footstep');
      });
      btn.addEventListener('click', () => {
        AudioManager.getInstance().playSFX('place');
        onClick();
      });
      return btn;
    };

    const newGameBtn = makeMcBtn('Singleplayer (New World)', () => {
      this.hide();
      AudioManager.getInstance().startMusic();
      this.onStartGame?.(false);
    });

    const loadGameBtn = makeMcBtn('Load Saved World', () => {
      this.hide();
      AudioManager.getInstance().startMusic();
      this.onStartGame?.(true);
    });

    const settingsBtn = makeMcBtn('Options & Settings...', () => {
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
