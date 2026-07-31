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
    title.textContent = '⚙️ SETTINGS & GAME OPTIONS';
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
    resetBtn.textContent = '🔄  RESET WORLD (NEW SEED)';
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
    quitBtn.textContent = '🚪  EXIT TO MAIN MENU';
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
    closeBtn.textContent = '✕ CLOSE SETTINGS';
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
