import { DEFAULT_RENDER_DISTANCE } from '../utils/constants';

export class GameSettings {
  renderDistance: number;
  mouseSensitivity = 0.002;
  touchSensitivity = 3.5; // Mobile touch camera look multiplier
  particleDetail: 'low' | 'medium' | 'high';
  itemGraphicsStyle: 'fancy' | 'voxel' | 'fast';
  pixelRatio: number;
  mobCap: number;
  isMobilePreset: boolean;

  constructor() {
    this.isMobilePreset = (
      typeof window !== 'undefined' &&
      ('ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia?.('(pointer: coarse)').matches ||
        window.innerWidth <= 1024)
    );

    if (this.isMobilePreset) {
      this.renderDistance = 4;
      this.particleDetail = 'low';
      this.itemGraphicsStyle = 'fast';
      this.pixelRatio = 1.0;
      this.mobCap = 10;
      this.touchSensitivity = 3.5;
    } else {
      this.renderDistance = DEFAULT_RENDER_DISTANCE;
      this.particleDetail = 'medium';
      this.itemGraphicsStyle = 'fancy';
      this.pixelRatio = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2);
      this.mobCap = 18;
      this.touchSensitivity = 3.5;
    }

    this.load();
  }

  save(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const data = {
        renderDistance: this.renderDistance,
        mouseSensitivity: this.mouseSensitivity,
        touchSensitivity: this.touchSensitivity,
        particleDetail: this.particleDetail,
        itemGraphicsStyle: this.itemGraphicsStyle,
        pixelRatio: this.pixelRatio,
      };
      localStorage.setItem('mc_game_settings', JSON.stringify(data));
    } catch {}
  }

  load(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem('mc_game_settings');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.renderDistance === 'number') this.renderDistance = data.renderDistance;
      if (typeof data.mouseSensitivity === 'number') this.mouseSensitivity = data.mouseSensitivity;
      if (typeof data.touchSensitivity === 'number') this.touchSensitivity = data.touchSensitivity;
      if (data.particleDetail) this.particleDetail = data.particleDetail;
      if (data.itemGraphicsStyle) this.itemGraphicsStyle = data.itemGraphicsStyle;
      if (typeof data.pixelRatio === 'number') this.pixelRatio = data.pixelRatio;
    } catch {}
  }

  static readonly instance = new GameSettings();
}

export const gameSettings = GameSettings.instance;
