export class DayNightCycle {
  timeOfDay = 0.5;
  readonly cycleDuration = 600;

  get isNight(): boolean {
    return this.timeOfDay < 0.25 || this.timeOfDay > 0.75;
  }

  update(deltaTime: number): void {
    this.timeOfDay += deltaTime / this.cycleDuration;
    if (this.timeOfDay > 1) this.timeOfDay -= 1;
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
