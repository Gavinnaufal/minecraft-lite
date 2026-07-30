import { gameSettings } from '../core/GameSettings';
import { AudioManager } from '../audio/AudioManager';

export class SettingsMenu {
  private container: HTMLDivElement | null = null;
  private visible = false;
  private onChange: (() => void) | null = null;

  create(onChange?: () => void): void {
    this.onChange = onChange ?? null;

    this.container = document.createElement('div');
    this.container.style.cssText = `
      display: none;
      position: fixed;
      top: 8px;
      right: 8px;
      z-index: 310;
      background: rgba(0,0,0,0.85);
      color: #fff;
      font-family: monospace;
      font-size: 13px;
      padding: 16px;
      border: 2px solid #555;
      border-radius: 6px;
      min-width: 220px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.8);
    `;

    const title = document.createElement('div');
    title.style.cssText = 'font-weight: bold; font-size: 14px; margin-bottom: 12px; color: #ffcc00; text-align: center;';
    title.textContent = 'SETTINGS';
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
    musicSlider.style.cssText = 'width: 100%; margin-bottom: 8px;';

    musicSlider.addEventListener('input', () => {
      const vol = parseInt(musicSlider.value) / 100;
      audioMgr.setMusicVolume(vol);
      if (vol > 0) audioMgr.startMusic();
      else audioMgr.stopMusic();
      musicLabel.textContent = `Music Volume: ${Math.round(vol * 100)}%`;
    });

    this.container.appendChild(musicLabel);
    this.container.appendChild(musicSlider);

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
