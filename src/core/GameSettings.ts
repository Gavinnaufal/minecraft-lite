import { DEFAULT_RENDER_DISTANCE } from '../utils/constants';

class GameSettings {
  renderDistance = DEFAULT_RENDER_DISTANCE;
  mouseSensitivity = 0.002;
  particleDetail: 'low' | 'medium' | 'high' = 'medium';
  itemGraphicsStyle: 'fancy' | 'voxel' | 'fast' = 'fancy';

  static readonly instance = new GameSettings();
}

export const gameSettings = GameSettings.instance;
