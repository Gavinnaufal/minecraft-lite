import type { SaveManager } from '../save/SaveManager';
import type { SettingsMenu } from './SettingsMenu';
import { AudioManager } from '../audio/AudioManager';
import { toggleFullscreen } from '../utils/fullscreen';

export class PauseMenu {
  private container: HTMLDivElement | null = null;
  private statusText: HTMLDivElement | null = null;
  private visible = false;
  private readonly saveManager: SaveManager;
  private readonly settingsMenu: SettingsMenu;
  private readonly onResumeCallback?: () => void;

  constructor(saveManager: SaveManager, settingsMenu: SettingsMenu, onResume?: () => void) {
    this.saveManager = saveManager;
    this.settingsMenu = settingsMenu;
    this.onResumeCallback = onResume;
  }

  create(): void {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.65); z-index: 250;
      justify-content: center; align-items: center; flex-direction: column;
      font-family: monospace; color: #fff; user-select: none;
    `;

    this.container.id = 'pause-menu';

    const title = document.createElement('h2');
    title.textContent = 'Game Menu';
    title.style.cssText = 'margin: 0 0 16px 0; font-size: 26px; color: #ffcc00; font-weight: bold; text-shadow: 2px 2px 0 #000; text-transform: uppercase; letter-spacing: 2px;';
    this.container.appendChild(title);

    this.statusText = document.createElement('div');
    this.statusText.style.cssText = 'height: 20px; font-size: 14px; color: #4caf50; font-weight: bold; margin-bottom: 12px; text-shadow: 1px 1px 0 #000;';
    this.container.appendChild(this.statusText);

    const btnBox = document.createElement('div');
    btnBox.style.cssText = 'display: flex; flex-direction: column; gap: 12px; align-items: center; width: 320px; max-width: 90vw;';

    const makeMcBtn = (label: string, onClick: () => void) => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        width: 100%; padding: 12px 16px; font-family: monospace; font-size: 15px; font-weight: bold;
        color: #e0e0e0; background: #707070;
        border-top: 3px solid #9e9e9e; border-left: 3px solid #9e9e9e;
        border-bottom: 3px solid #3a3a3a; border-right: 3px solid #3a3a3a;
        cursor: pointer; text-shadow: 2px 2px 0 #000; text-align: center; border-radius: 2px;
        transition: background 0.1s, border-color 0.1s, color 0.1s;
        touch-action: manipulation;
      `;
      btn.textContent = label;

      let lastTrigger = 0;
      const trigger = (e?: Event) => {
        const now = Date.now();
        if (now - lastTrigger < 300) return;
        lastTrigger = now;
        if (e && e.cancelable) e.preventDefault();
        AudioManager.getInstance().playSFX('place');
        onClick();
      };

      btn.addEventListener('mouseenter', () => {
        btn.style.background = '#808080';
        btn.style.color = '#ffffa0';
        btn.style.borderTopColor = '#ffffa0';
        btn.style.borderLeftColor = '#ffffa0';
        btn.style.borderBottomColor = '#555500';
        btn.style.borderRightColor = '#555500';
        AudioManager.getInstance().playSFX('footstep');
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = '#707070';
        btn.style.color = '#e0e0e0';
        btn.style.borderTopColor = '#9e9e9e';
        btn.style.borderLeftColor = '#9e9e9e';
        btn.style.borderBottomColor = '#3a3a3a';
        btn.style.borderRightColor = '#3a3a3a';
      });
      btn.addEventListener('touchend', (e) => trigger(e), { passive: false });
      btn.addEventListener('click', (e) => trigger(e));
      return btn;
    };

    // 1. Back to Game
    const btnResume = makeMcBtn('Back to Game', () => this.hide());

    // 2. Save Game
    const btnSave = makeMcBtn('Save World', async () => {
      try {
        await this.saveManager.save();
        this.setStatus('Dunia Berhasil Disimpan!');
      } catch (err) {
        this.setStatus('Gagal Menyimpan Dunia', true);
      }
    });

    // 3. Fullscreen Toggle
    const btnFullscreen = makeMcBtn('⛶ Toggle Fullscreen (Layar Penuh)', () => {
      toggleFullscreen();
    });

    // 4. Options / Settings
    const btnSettings = makeMcBtn('Options & Settings...', () => {
      this.settingsMenu.toggle();
    });

    btnBox.appendChild(btnResume);
    btnBox.appendChild(btnSave);
    btnBox.appendChild(btnFullscreen);
    btnBox.appendChild(btnSettings);

    this.container.appendChild(btnBox);
    document.body.appendChild(this.container);
  }

  private setStatus(msg: string, isError = false): void {
    if (!this.statusText) return;
    this.statusText.style.color = isError ? '#ff5555' : '#55ff55';
    this.statusText.textContent = msg;
    setTimeout(() => {
      if (this.statusText && this.statusText.textContent === msg) {
        this.statusText.textContent = '';
      }
    }, 3000);
  }

  show(): void {
    if (!this.container) this.create();
    this.visible = true;
    if (this.container) this.container.style.display = 'flex';
    if (document.pointerLockElement) document.exitPointerLock();
  }

  hide(): void {
    this.visible = false;
    if (this.container) this.container.style.display = 'none';
    if (this.statusText) this.statusText.textContent = '';
    this.onResumeCallback?.();
  }

  toggle(): void {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  get isOpen(): boolean {
    return this.visible;
  }
}
