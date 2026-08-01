export class DimensionTransitionOverlay {
  private overlayDiv: HTMLDivElement;
  private progressFill: HTMLDivElement;
  private titleText: HTMLHeadingElement;
  private active = false;

  constructor() {
    this.overlayDiv = document.createElement('div');
    this.overlayDiv.style.position = 'fixed';
    this.overlayDiv.style.top = '0';
    this.overlayDiv.style.left = '0';
    this.overlayDiv.style.width = '100vw';
    this.overlayDiv.style.height = '100vh';
    this.overlayDiv.style.pointerEvents = 'none';
    this.overlayDiv.style.display = 'none';
    this.overlayDiv.style.zIndex = '9999';
    this.overlayDiv.style.background = 'radial-gradient(circle, rgba(142,36,170,0.4) 0%, rgba(38,12,48,0.85) 100%)';
    this.overlayDiv.style.transition = 'opacity 0.3s ease';
    this.overlayDiv.style.flexDirection = 'column';
    this.overlayDiv.style.alignItems = 'center';
    this.overlayDiv.style.justifyContent = 'center';

    this.titleText = document.createElement('h2');
    this.titleText.style.color = '#e1bee7';
    this.titleText.style.fontFamily = 'monospace';
    this.titleText.style.fontSize = '28px';
    this.titleText.style.textShadow = '0 0 12px #ab47bc';
    this.titleText.style.marginBottom = '20px';
    this.titleText.innerText = 'Entering the Nether...';

    const barOuter = document.createElement('div');
    barOuter.style.width = '300px';
    barOuter.style.height = '14px';
    barOuter.style.background = 'rgba(0,0,0,0.6)';
    barOuter.style.border = '2px solid #ab47bc';
    barOuter.style.borderRadius = '7px';
    barOuter.style.overflow = 'hidden';

    this.progressFill = document.createElement('div');
    this.progressFill.style.width = '0%';
    this.progressFill.style.height = '100%';
    this.progressFill.style.background = 'linear-gradient(90deg, #8e24aa, #ba68c8)';
    this.progressFill.style.transition = 'width 0.1s linear';

    barOuter.appendChild(this.progressFill);
    this.overlayDiv.appendChild(this.titleText);
    this.overlayDiv.appendChild(barOuter);
    document.body.appendChild(this.overlayDiv);
  }

  show(targetDimensionName: string, progress: number): void {
    this.active = true;
    this.overlayDiv.style.display = 'flex';
    this.overlayDiv.style.opacity = '1';
    this.titleText.innerText = `Entering ${targetDimensionName}...`;
    this.progressFill.style.width = `${Math.min(100, progress * 100)}%`;
  }

  hide(): void {
    this.active = false;
    this.overlayDiv.style.opacity = '0';
    setTimeout(() => {
      if (!this.active) {
        this.overlayDiv.style.display = 'none';
      }
    }, 300);
  }
}
