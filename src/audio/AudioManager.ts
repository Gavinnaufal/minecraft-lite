export class AudioManager {
  private static instance: AudioManager;

  static getInstance(): AudioManager {
    if (!AudioManager.instance) AudioManager.instance = new AudioManager();
    return AudioManager.instance;
  }

  playSFX(_name: string): void {}
  playMusic(_name: string, _loop = true): void {}
  setSFXVolume(_v: number): void {}
  setMusicVolume(_v: number): void {}
}
