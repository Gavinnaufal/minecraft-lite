import { DEFAULT_RENDER_DISTANCE } from '../utils/constants';

export class GameSettings {
  renderDistance: number;
  mouseSensitivity = 0.002;
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
    } else {
      this.renderDistance = DEFAULT_RENDER_DISTANCE;
      this.particleDetail = 'medium';
      this.itemGraphicsStyle = 'fancy';
      this.pixelRatio = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2);
      this.mobCap = 18;
    }
  }

  static readonly instance = new GameSettings();
}

export const gameSettings = GameSettings.instance;

