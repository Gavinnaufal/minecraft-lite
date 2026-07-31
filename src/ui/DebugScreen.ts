export class DebugScreen {
  private container: HTMLDivElement;
  private visible = false;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'debug-screen';
    this.container.style.cssText = `
      position: fixed; top: 8px; left: 8px; right: 8px;
      display: none; justify-content: space-between; pointer-events: none; z-index: 9999;
      font-family: monospace; font-size: 13px; color: #ffffff; text-shadow: 1px 1px 0 #000;
      line-height: 1.4; user-select: none;
    `;

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
    this.container.style.display = this.visible ? 'flex' : 'none';
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

    const bgStyle = 'background: rgba(0, 0, 0, 0.5); padding: 4px 8px; border-radius: 2px;';

    this.container.innerHTML = `
      <div style="${bgStyle}">
        <div style="font-weight: bold; color: #ffffa0;">Minecraft Lite 1.0.0 (Three.js Voxel Engine)</div>
        <div>${stats.fps} fps T: 60</div>
        <div style="margin-top: 4px;">XYZ: ${stats.posX.toFixed(3)} / ${stats.posY.toFixed(5)} / ${stats.posZ.toFixed(3)}</div>
        <div>Block: ${Math.floor(stats.posX)} ${Math.floor(stats.posY)} ${Math.floor(stats.posZ)}</div>
        <div>Chunk: ${stats.chunkX} ${stats.chunkZ} in [0 0 0]</div>
        <div>Facing: ${stats.facing}</div>
        <div>Biome: ${stats.biome}</div>
        <div>Local Difficulty: 1.50 (Day 1)</div>
      </div>
      <div style="${bgStyle} text-align: right;">
        <div style="color: #aaaaaa;">Display: 1920x1080 (WebGL)</div>
        <div>Three.js (r160) + TS</div>
        <div>Entities: ${stats.mobsCount} active</div>
        <div style="margin-top: 4px; color: #55ff55;">Mem: 45% 240/512MB</div>
      </div>
    `;
  }
}
