import type { SaveManager } from '../save/SaveManager';
import type { SettingsMenu } from './SettingsMenu';
import { AudioManager } from '../audio/AudioManager';

export class PauseMenu {
  private container: HTMLDivElement | null = null;
  private statusText: HTMLDivElement | null = null;
  private visible = false;
  private readonly saveManager: SaveManager;
  private readonly settingsMenu: SettingsMenu;
  private readonly onResumeCallback?: () => void;
  public onSkipToNight?: () => void;

  constructor(saveManager: SaveManager, settingsMenu: SettingsMenu, onResume?: () => void) {
    this.saveManager = saveManager;
    this.settingsMenu = settingsMenu;
    this.onResumeCallback = onResume;
  }

  create(): void {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: var(--theme-panel-overlay, rgba(10, 7, 5, 0.75)); z-index: 250;
      justify-content: center; align-items: center; flex-direction: column;
      font-family: var(--theme-font, monospace); color: var(--theme-text-light, #f7f1e3); user-select: none;
      backdrop-filter: blur(8px);
    `;

    this.container.id = 'pause-menu';

    const title = document.createElement('h2');
    title.textContent = 'Game Menu';
    title.style.cssText = 'margin: 0 0 16px 0; font-size: 26px; color: var(--theme-accent-gold-text, #ffd56b); font-weight: bold; text-shadow: 2px 2px 0 #000; text-transform: uppercase; letter-spacing: 2px;';
    this.container.appendChild(title);

    this.statusText = document.createElement('div');
    this.statusText.style.cssText = 'height: 20px; font-size: 14px; color: var(--theme-accent-green-text, #8ee063); font-weight: bold; margin-bottom: 12px; text-shadow: 1px 1px 0 #000;';
    this.container.appendChild(this.statusText);

    const btnBox = document.createElement('div');
    btnBox.style.cssText = 'display: flex; flex-direction: column; gap: 12px; align-items: center; width: 320px; max-width: 90vw;';

    const makeMcBtn = (label: string, onClick: () => void) => {
      const btn = document.createElement('button');
      btn.className = 'mc-button';
      btn.style.cssText = `
        width: 100%; padding: 12px 16px; font-family: var(--theme-font, monospace); font-size: 15px; font-weight: bold;
        color: var(--theme-btn-text, #f5eedc); background: var(--theme-btn-bg, #4a3222);
        border-top: 3px solid var(--theme-btn-border-light, #7a543a); border-left: 3px solid var(--theme-btn-border-light, #7a543a);
        border-bottom: 3px solid var(--theme-btn-border-dark, #21160e); border-right: 3px solid var(--theme-btn-border-dark, #21160e);
        cursor: pointer; text-shadow: 2px 2px 0 #000; text-align: center; border-radius: 4px;
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
        btn.style.background = 'var(--theme-btn-hover, #63432e)';
        btn.style.color = '#ffffa0';
        AudioManager.getInstance().playSFX('footstep');
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'var(--theme-btn-bg, #4a3222)';
        btn.style.color = 'var(--theme-btn-text, #f5eedc)';
      });
      btn.addEventListener('touchend', (e) => trigger(e), { passive: false });
      btn.addEventListener('click', (e) => trigger(e));
      return btn;
    };

    // 1. Back to Game
    const btnResume = makeMcBtn('Back to Game', () => this.hide());

    // 2. Skip to Night (Ready to Defend)
    const btnSkipNight = makeMcBtn('🌙 Skip ke Malam (Siap Bertahan)', () => {
      this.hide();
      this.onSkipToNight?.();
    });

    // 3. Save Game
    const btnSave = makeMcBtn('Save World', async () => {
      try {
        await this.saveManager.save();
        this.setStatus('Dunia Berhasil Disimpan!');
      } catch (err) {
        this.setStatus('Gagal Menyimpan Dunia', true);
      }
    });

    // 4. Options / Settings
    const btnSettings = makeMcBtn('Options & Settings...', () => {
      this.settingsMenu.toggle();
    });

    btnBox.appendChild(btnResume);
    btnBox.appendChild(btnSkipNight);
    btnBox.appendChild(btnSave);
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
