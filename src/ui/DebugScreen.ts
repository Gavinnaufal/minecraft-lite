export class DebugScreen {
  private container: HTMLDivElement;
  private visible = false;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'debug-screen';
    this.container.style.position = 'fixed';
    this.container.style.top = '16px';
    this.container.style.left = '16px';
    this.container.style.padding = '12px 16px';
    this.container.style.background = 'rgba(10, 15, 30, 0.75)';
    this.container.style.backdropFilter = 'blur(8px)';
    this.container.style.border = '1px solid rgba(255, 255, 255, 0.15)';
    this.container.style.borderRadius = '8px';
    this.container.style.color = '#e0e6ed';
    this.container.style.fontFamily = 'monospace';
    this.container.style.fontSize = '12px';
    this.container.style.lineHeight = '1.6';
    this.container.style.pointerEvents = 'none';
    this.container.style.zIndex = '99999';
    this.container.style.display = 'none';
    this.container.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';

    document.body.appendChild(this.container);

    window.addEventListener('keydown', (e) => {
      if (e.code === 'F3') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  public toggle(): void {
    this.visible = !this.visible;
    this.container.style.display = this.visible ? 'block' : 'none';
  }

  public update(stats: {
    fps: number;
    posX: number;
    posY: number;
    posZ: number;
    chunkX: number;
    chunkZ: number;
    facing: string;
    biome: string;
    mobsCount: number;
  }): void {
    if (!this.visible) return;

    this.container.innerHTML = `
      <div style="font-weight: bold; color: #4da6ff; margin-bottom: 4px;">MINI MINECRAFT v1.0 (DEBUG F3)</div>
      <div><strong>FPS:</strong> <span style="color: ${stats.fps >= 50 ? '#59c738' : '#ffaa00'}">${stats.fps}</span></div>
      <div><strong>XYZ:</strong> ${stats.posX.toFixed(2)} / ${stats.posY.toFixed(2)} / ${stats.posZ.toFixed(2)}</div>
      <div><strong>Chunk:</strong> [${stats.chunkX}, ${stats.chunkZ}]</div>
      <div><strong>Facing:</strong> ${stats.facing}</div>
      <div><strong>Biome:</strong> <span style="color: #64b5f6">${stats.biome}</span></div>
      <div><strong>Entities:</strong> ${stats.mobsCount} mobs active</div>
    `;
  }
}
