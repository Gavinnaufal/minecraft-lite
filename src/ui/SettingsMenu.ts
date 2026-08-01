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
      display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      z-index: 550; background: #c6c6c6; border-top: 4px solid #ffffff; border-left: 4px solid #ffffff;
      border-bottom: 4px solid #555555; border-right: 4px solid #555555;
      color: #222; font-family: monospace; font-size: 14px; padding: 28px;
      border-radius: 4px; width: 440px; box-shadow: 0 16px 50px rgba(0,0,0,0.85); user-select: none;
    `;

    const title = document.createElement('div');
    title.style.cssText = 'font-weight: bold; font-size: 20px; margin-bottom: 20px; color: #222; text-align: center; text-shadow: 1px 1px 0 #fff;';
    title.textContent = 'Options & Game Settings';
    this.container.appendChild(title);

    // Render Distance
    const rdLabel = document.createElement('div');
    rdLabel.style.cssText = 'font-weight: bold; margin-bottom: 6px; color: #333;';
    rdLabel.textContent = `Render Distance: ${gameSettings.renderDistance} Chunks`;

    const rdSlider = document.createElement('input');
    rdSlider.type = 'range';
    rdSlider.min = '2';
    rdSlider.max = '10';
    rdSlider.step = '1';
    rdSlider.value = String(gameSettings.renderDistance);
    rdSlider.style.cssText = 'width: 100%; margin-bottom: 16px; cursor: pointer;';

    rdSlider.addEventListener('input', () => {
      gameSettings.renderDistance = parseInt(rdSlider.value);
      rdLabel.textContent = `Render Distance: ${gameSettings.renderDistance} Chunks`;
      this.onChange?.();
    });

    this.container.appendChild(rdLabel);
    this.container.appendChild(rdSlider);

    // SFX Volume
    const audioMgr = AudioManager.getInstance();
    const sfxLabel = document.createElement('div');
    sfxLabel.style.cssText = 'font-weight: bold; margin-bottom: 6px; color: #333;';
    sfxLabel.textContent = `SFX Volume: ${Math.round(audioMgr.sfxVolume * 100)}%`;

    const sfxSlider = document.createElement('input');
    sfxSlider.type = 'range';
    sfxSlider.min = '0';
    sfxSlider.max = '100';
    sfxSlider.step = '5';
    sfxSlider.value = String(Math.round(audioMgr.sfxVolume * 100));
    sfxSlider.style.cssText = 'width: 100%; margin-bottom: 16px; cursor: pointer;';

    sfxSlider.addEventListener('input', () => {
      const vol = parseInt(sfxSlider.value) / 100;
      audioMgr.setSFXVolume(vol);
      sfxLabel.textContent = `SFX Volume: ${Math.round(vol * 100)}%`;
    });

    this.container.appendChild(sfxLabel);
    this.container.appendChild(sfxSlider);

    // Music Volume
    const musicLabel = document.createElement('div');
    musicLabel.style.cssText = 'font-weight: bold; margin-bottom: 6px; color: #333;';
    musicLabel.textContent = `Music Volume: ${Math.round(audioMgr.musicVolume * 100)}%`;

    const musicSlider = document.createElement('input');
    musicSlider.type = 'range';
    musicSlider.min = '0';
    musicSlider.max = '100';
    musicSlider.step = '5';
    musicSlider.value = String(Math.round(audioMgr.musicVolume * 100));
    musicSlider.style.cssText = 'width: 100%; margin-bottom: 24px; cursor: pointer;';

    musicSlider.addEventListener('input', () => {
      const vol = parseInt(musicSlider.value) / 100;
      audioMgr.setMusicVolume(vol);
      musicLabel.textContent = `Music Volume: ${Math.round(vol * 100)}%`;
    });

    this.container.appendChild(musicLabel);
    this.container.appendChild(musicSlider);

    // Particle Detail
    const pdLabel = document.createElement('div');
    pdLabel.style.cssText = 'font-weight: bold; margin-bottom: 6px; color: #333;';
    pdLabel.textContent = `Particle Detail: ${gameSettings.particleDetail.charAt(0).toUpperCase() + gameSettings.particleDetail.slice(1)}`;

    const pdSelect = document.createElement('select');
    pdSelect.style.cssText = 'width: 100%; margin-bottom: 24px; cursor: pointer; font-family: monospace; font-size: 14px; padding: 6px;';
    for (const opt of ['low', 'medium', 'high']) {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
      if (opt === gameSettings.particleDetail) option.selected = true;
      pdSelect.appendChild(option);
    }
    pdSelect.addEventListener('change', () => {
      gameSettings.particleDetail = pdSelect.value as 'low' | 'medium' | 'high';
      pdLabel.textContent = `Particle Detail: ${pdSelect.value.charAt(0).toUpperCase() + pdSelect.value.slice(1)}`;
    });

    this.container.appendChild(pdLabel);
    this.container.appendChild(pdSelect);

    // Button Row
    const btnBox = document.createElement('div');
    btnBox.style.cssText = 'display: flex; flex-direction: column; gap: 10px; align-items: center;';

    const makeOptionBtn = (label: string, bgCol: string, onClick: () => void) => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        width: 100%; padding: 12px; font-family: monospace; font-size: 14px; font-weight: bold;
        color: #fff; background: ${bgCol};
        border-top: 3px solid rgba(255,255,255,0.4); border-left: 3px solid rgba(255,255,255,0.4);
        border-bottom: 3px solid rgba(0,0,0,0.4); border-right: 3px solid rgba(0,0,0,0.4);
        cursor: pointer; text-shadow: 1px 1px 0 #000; text-align: center; border-radius: 2px;
      `;
      btn.textContent = label;
      btn.addEventListener('click', () => {
        AudioManager.getInstance().playSFX('place');
        onClick();
      });
      return btn;
    };

    const doneBtn = makeOptionBtn('Done', '#707070', () => this.toggle());
    const resetBtn = makeOptionBtn('Reset World (New Seed)', '#c62828', () => {
      if (confirm('Apakah Anda yakin ingin menghapus dunia ini dan membuat baru?')) {
        this.onResetWorld?.();
      }
    });
    const quitBtn = makeOptionBtn('Save & Quit to Main Menu', '#455a64', () => {
      this.toggle();
      this.onQuitToMainMenu?.();
    });

    btnBox.appendChild(doneBtn);
    btnBox.appendChild(resetBtn);
    btnBox.appendChild(quitBtn);
    this.container.appendChild(btnBox);

    document.body.appendChild(this.container);
  }

  toggle(): void {
    this.visible = !this.visible;
    if (this.container) {
      this.container.style.display = this.visible ? 'block' : 'none';
    }
  }

  get isOpen(): boolean {
    return this.visible;
  }
}
