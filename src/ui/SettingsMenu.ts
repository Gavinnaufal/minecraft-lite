import { gameSettings } from '../core/GameSettings';
import { AudioManager } from '../audio/AudioManager';

export class SettingsMenu {
  private container: HTMLDivElement | null = null;
  private visible = false;
  private onChange: (() => void) | null = null;
  private onResetWorld: (() => void) | null = null;
  private onQuitToMainMenu: (() => void) | null = null;

  create(onChange?: () => void, onResetWorld?: () => void, onQuitToMainMenu?: () => void): void {
    this.onChange = onChange ?? null;
    this.onResetWorld = onResetWorld ?? null;
    this.onQuitToMainMenu = onQuitToMainMenu ?? null;

    this.container = document.createElement('div');
    this.container.style.cssText = `
      display: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 550;
      background: rgba(15, 20, 32, 0.95);
      backdrop-filter: blur(12px);
      color: #fff;
      font-family: monospace;
      font-size: 13px;
      padding: 24px;
      border: 2px solid rgba(255, 204, 0, 0.4);
      border-radius: 12px;
      min-width: 260px;
      box-shadow: 0 12px 36px rgba(0,0,0,0.85);
      user-select: none;
    `;

    const title = document.createElement('div');
    title.style.cssText = 'font-weight: bold; font-size: 16px; margin-bottom: 16px; color: #ffcc00; text-align: center; letter-spacing: 1px;';
    const gearIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="#ffcc00" style="vertical-align:middle;margin-right:6px;"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.04 7.04 0 00-1.62-.94l-.36-2.54A.48.48 0 0013.9 2h-3.8a.48.48 0 00-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.75 8.87a.48.48 0 00.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.49.37 1.03.7 1.62.94l.36 2.54c.05.24.26.41.47.41h3.8c.21 0 .42-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 00-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.6 3.6 0 0112 15.6z"/></svg>';
    title.innerHTML = gearIcon + 'SETTINGS & GAME OPTIONS';
    this.container.appendChild(title);

    // Render Distance
    const rdLabel = document.createElement('div');
    rdLabel.style.marginBottom = '4px';
    rdLabel.textContent = `Render Distance: ${gameSettings.renderDistance}`;

    const rdSlider = document.createElement('input');
    rdSlider.type = 'range';
    rdSlider.min = '2';
    rdSlider.max = '10';
    rdSlider.step = '1';
    rdSlider.value = String(gameSettings.renderDistance);
    rdSlider.style.cssText = 'width: 100%; margin-bottom: 12px;';

    rdSlider.addEventListener('input', () => {
      gameSettings.renderDistance = parseInt(rdSlider.value);
      rdLabel.textContent = `Render Distance: ${gameSettings.renderDistance}`;
      this.onChange?.();
    });

    this.container.appendChild(rdLabel);
    this.container.appendChild(rdSlider);

    // SFX Volume
    const audioMgr = AudioManager.getInstance();
    const sfxLabel = document.createElement('div');
    sfxLabel.style.marginBottom = '4px';
    sfxLabel.textContent = `SFX Volume: ${Math.round(audioMgr.sfxVolume * 100)}%`;

    const sfxSlider = document.createElement('input');
    sfxSlider.type = 'range';
    sfxSlider.min = '0';
    sfxSlider.max = '100';
    sfxSlider.step = '5';
    sfxSlider.value = String(Math.round(audioMgr.sfxVolume * 100));
    sfxSlider.style.cssText = 'width: 100%; margin-bottom: 12px;';

    sfxSlider.addEventListener('input', () => {
      const vol = parseInt(sfxSlider.value) / 100;
      audioMgr.setSFXVolume(vol);
      sfxLabel.textContent = `SFX Volume: ${Math.round(vol * 100)}%`;
    });

    this.container.appendChild(sfxLabel);
    this.container.appendChild(sfxSlider);

    // Music Volume
    const musicLabel = document.createElement('div');
    musicLabel.style.marginBottom = '4px';
    musicLabel.textContent = `Music Volume: ${Math.round(audioMgr.musicVolume * 100)}%`;

    const musicSlider = document.createElement('input');
    musicSlider.type = 'range';
    musicSlider.min = '0';
    musicSlider.max = '100';
    musicSlider.step = '5';
    musicSlider.value = String(Math.round(audioMgr.musicVolume * 100));
    musicSlider.style.cssText = 'width: 100%; margin-bottom: 16px;';

    musicSlider.addEventListener('input', () => {
      const vol = parseInt(musicSlider.value) / 100;
      audioMgr.setMusicVolume(vol);
      if (vol > 0) audioMgr.startMusic();
      else audioMgr.stopMusic();
      musicLabel.textContent = `Music Volume: ${Math.round(vol * 100)}%`;
    });

    this.container.appendChild(musicLabel);
    this.container.appendChild(musicSlider);

    // Divider
    const div = document.createElement('div');
    div.style.cssText = 'height: 1px; background: rgba(255,255,255,0.15); margin: 12px 0;';
    this.container.appendChild(div);

    // Reset World & Quit Buttons
    const btnBox = document.createElement('div');
    btnBox.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-top: 8px;';

    const resetBtn = document.createElement('button');
    resetBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="#fff" style="vertical-align:middle;margin-right:6px;"><path d="M17.65 6.35A7.96 7.96 0 0012 4a8 8 0 108 8h-2a6 6 0 11-1.76-4.24L14 10h7V3l-3.35 3.35z"/></svg>RESET WORLD (NEW SEED)';
    resetBtn.style.cssText = `
      padding: 10px; font-family: inherit; font-size: 12px; font-weight: bold;
      color: #fff; background: linear-gradient(135deg, #d32f2f, #b71c1c);
      border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; cursor: pointer;
      transition: filter 0.15s;
    `;
    resetBtn.addEventListener('mouseenter', () => { resetBtn.style.filter = 'brightness(1.2)'; });
    resetBtn.addEventListener('mouseleave', () => { resetBtn.style.filter = 'none'; });
    resetBtn.addEventListener('click', () => {
      if (confirm('Apakah kamu yakin ingin mereset dunia? Seluruh simpanan dunia akan dihapus!')) {
        this.onResetWorld?.();
      }
    });

    const quitBtn = document.createElement('button');
    quitBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="#fff" style="vertical-align:middle;margin-right:6px;"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5a2 2 0 00-2 2v4h2V5h14v14H5v-4H3v4a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"/></svg>EXIT TO MAIN MENU';
    quitBtn.style.cssText = `
      padding: 10px; font-family: inherit; font-size: 12px; font-weight: bold;
      color: #fff; background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; cursor: pointer;
      transition: filter 0.15s;
    `;
    quitBtn.addEventListener('mouseenter', () => { quitBtn.style.filter = 'brightness(1.2)'; });
    quitBtn.addEventListener('mouseleave', () => { quitBtn.style.filter = 'none'; });
    quitBtn.addEventListener('click', () => {
      this.toggle();
      this.onQuitToMainMenu?.();
    });

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="#aaa" style="vertical-align:middle;margin-right:4px;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>CLOSE SETTINGS';
    closeBtn.style.cssText = `
      padding: 8px; font-family: inherit; font-size: 11px; font-weight: bold;
      color: #aaa; background: transparent; border: 1px solid rgba(255,255,255,0.15);
      border-radius: 6px; cursor: pointer; margin-top: 4px;
    `;
    closeBtn.addEventListener('click', () => this.toggle());

    btnBox.appendChild(resetBtn);
    btnBox.appendChild(quitBtn);
    btnBox.appendChild(closeBtn);
    this.container.appendChild(btnBox);

    document.body.appendChild(this.container);
  }

  toggle(): void {
    if (!this.container) return;
    this.visible = !this.visible;
    this.container.style.display = this.visible ? 'block' : 'none';
  }

  remove(): void {
    this.container?.remove();
    this.container = null;
  }
}
