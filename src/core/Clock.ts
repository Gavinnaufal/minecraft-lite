export class Clock {
  private readonly frameTimes: number[] = [];
  private displayEl: HTMLDivElement | null = null;

  private static readonly SAMPLE_COUNT = 30;

  createDisplay(): void {
    // Integrated into HUD status badge to prevent text collision
  }

  update(deltaTime: number): void {
    this.frameTimes.push(deltaTime);

    if (this.frameTimes.length > Clock.SAMPLE_COUNT) {
      this.frameTimes.shift();
    }

    if (this.displayEl) {
      const fps = this.getFPS();
      this.displayEl.textContent = `FPS: ${fps}`;
    }
  }

  getFPS(): number {
    if (this.frameTimes.length === 0) return 0;

    const total = this.frameTimes.reduce((sum, t) => sum + t, 0);
    const avg = total / this.frameTimes.length;

    return Math.round(1 / avg);
  }

  removeDisplay(): void {
    this.displayEl?.remove();
    this.displayEl = null;
  }
}
