export type UpdateCallback = (deltaTime: number) => void;

export class Engine {
  private isRunning = false;
  private lastTime = 0;
  private updateCallback: UpdateCallback | null = null;

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  stop(): void {
    this.isRunning = false;
  }

  setUpdateCallback(cb: UpdateCallback): void {
    this.updateCallback = cb;
  }

  private loop = (timestamp: number): void => {
    if (!this.isRunning) return;

    const rawDelta = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    const deltaTime = Math.min(rawDelta, 0.1);

    this.updateCallback?.(deltaTime);

    requestAnimationFrame(this.loop);
  };
}
