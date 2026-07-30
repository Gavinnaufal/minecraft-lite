import type { SaveManager } from '../save/SaveManager';
import type { SettingsMenu } from './SettingsMenu';

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
      background: rgba(0, 0, 0, 0.75); z-index: 250;
      justify-content: center; align-items: center; flex-direction: column;
      font-family: monospace; color: #fff;
    `;

    const menuBox = document.createElement('div');
    menuBox.style.cssText = `
      background: #333; border: 3px solid #555; padding: 24px 32px;
      border-radius: 8px; display: flex; flex-direction: column; gap: 12px;
      min-width: 220px; align-items: center; box-shadow: 0 8px 24px rgba(0,0,0,0.8);
    `;

    const title = document.createElement('h2');
    title.textContent = 'GAME PAUSED';
    title.style.cssText = 'margin: 0 0 12px 0; font-size: 20px; color: #ffcc00; letter-spacing: 1px;';
    menuBox.appendChild(title);

    this.statusText = document.createElement('div');
    this.statusText.style.cssText = 'height: 18px; font-size: 12px; color: #4caf50; font-weight: bold; margin-bottom: 4px;';
    menuBox.appendChild(this.statusText);

    const btnStyle = `
      width: 100%; padding: 10px; background: #555; border: 2px solid #777;
      color: #fff; font-family: monospace; font-size: 14px; font-weight: bold;
      cursor: pointer; border-radius: 4px; transition: background 0.15s;
    `;

    // 1. Resume Button
    const btnResume = document.createElement('button');
    btnResume.style.cssText = btnStyle;
    btnResume.textContent = 'Resume Game';
    btnResume.onclick = () => this.hide();

    // 2. Save Game Button
    const btnSave = document.createElement('button');
    btnSave.style.cssText = btnStyle;
    btnSave.textContent = 'Save Game';
    btnSave.onclick = async () => {
      try {
        await this.saveManager.save();
        this.setStatus('Game Saved Successfully!');
      } catch (err) {
        this.setStatus('Failed to Save Game', true);
      }
    };

    // 3. Load Game Button
    const btnLoad = document.createElement('button');
    btnLoad.style.cssText = btnStyle;
    btnLoad.textContent = 'Load Game';
    btnLoad.onclick = async () => {
      try {
        const seed = await this.saveManager.load();
        if (seed !== null) {
          this.setStatus('Game Loaded Successfully!');
        } else {
          this.setStatus('No Save File Found', true);
        }
      } catch (err) {
        this.setStatus('Failed to Load Game', true);
      }
    };

    // 4. Settings Button
    const btnSettings = document.createElement('button');
    btnSettings.style.cssText = btnStyle;
    btnSettings.textContent = 'Settings';
    btnSettings.onclick = () => {
      this.settingsMenu.toggle();
    };

    menuBox.appendChild(btnResume);
    menuBox.appendChild(btnSave);
    menuBox.appendChild(btnLoad);
    menuBox.appendChild(btnSettings);

    this.container.appendChild(menuBox);
    document.body.appendChild(this.container);
  }

  private setStatus(msg: string, isError = false): void {
    if (!this.statusText) return;
    this.statusText.style.color = isError ? '#ff5555' : '#4caf50';
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
