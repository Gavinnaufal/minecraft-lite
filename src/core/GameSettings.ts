import { DEFAULT_RENDER_DISTANCE } from '../utils/constants';

class GameSettings {
  renderDistance = DEFAULT_RENDER_DISTANCE;
  mouseSensitivity = 0.002;

  static readonly instance = new GameSettings();
}

export const gameSettings = GameSettings.instance;
