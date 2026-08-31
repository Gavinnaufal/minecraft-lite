import { survivalManager } from '../survival/SurvivalManager';

export class DayNightCycle {
  static readonly DEFAULT_TIME = 0.25; // Mulai di pagi hari (06:00) pada Hari 1
  timeOfDay = DayNightCycle.DEFAULT_TIME;
  readonly cycleDuration = 600; // 10 menit (600 detik) per siklus 1 hari penuh
  public timeMultiplier = 1.0; // Pengali kecepatan waktu untuk debug/testing

  constructor() {
    survivalManager.onReset = () => {
      this.resetTime();
    };
  }

  resetTime(): void {
    this.timeOfDay = DayNightCycle.DEFAULT_TIME;
  }

  get currentDay(): number {
    return survivalManager.currentDay;
  }

  set currentDay(value: number) {
    survivalManager.setDay(value);
  }

  get isNight(): boolean {
    return this.timeOfDay < 0.25 || this.timeOfDay > 0.75;
  }

  skipToNight(): boolean {
    if (!this.isNight) {
      this.timeOfDay = 0.76;
      return true;
    }
    return false;
  }

  update(deltaTime: number): void {
    const timeDelta = (deltaTime * this.timeMultiplier) / this.cycleDuration;
    this.timeOfDay += timeDelta;

    if (this.timeOfDay >= 1.0) {
      this.timeOfDay -= 1.0;
      survivalManager.advanceDay();
    }
  }

  get lightIntensity(): number {
    return Math.max(0.15, Math.sin(this.timeOfDay * Math.PI));
  }

  get skyColor(): { top: string; bottom: string } {
    if (this.timeOfDay < 0.25 || this.timeOfDay > 0.75) {
      return { top: '#0a0a2e', bottom: '#1a1a3e' };
    }
    if (this.timeOfDay < 0.3 || this.timeOfDay > 0.7) {
      return { top: '#ff7b42', bottom: '#87ceeb' };
    }
    return { top: '#4da6ff', bottom: '#87ceeb' };
  }
}

