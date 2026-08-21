export class ToastSystem {
  private static instance: ToastSystem;
  private container: HTMLDivElement;

  private constructor() {
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.style.position = 'fixed';
    this.container.style.bottom = '90px';
    this.container.style.right = '24px';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column-reverse';
    this.container.style.gap = '8px';
    this.container.style.zIndex = '999999';
    this.container.style.pointerEvents = 'none';

    document.body.appendChild(this.container);
  }

  static getInstance(): ToastSystem {
    if (!ToastSystem.instance) ToastSystem.instance = new ToastSystem();
    return ToastSystem.instance;
  }

  public show(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const toast = document.createElement('div');
    toast.className = 'mc-toast';
    toast.style.padding = '10px 16px';
    toast.style.borderRadius = '6px';
    toast.style.background = 'var(--theme-panel-bg-translucent, rgba(35, 23, 16, 0.94))';
    toast.style.backdropFilter = 'blur(8px)';
    toast.style.border = '1px solid var(--theme-border-muted, #543926)';
    toast.style.borderLeft = `5px solid ${
      type === 'success'
        ? 'var(--theme-accent-green-border, #6fa854)'
        : type === 'warning'
        ? 'var(--theme-accent-gold-border, #ffcc55)'
        : type === 'error'
        ? 'var(--theme-accent-red-border, #bf553b)'
        : 'var(--theme-accent-info-border, #4aa8a3)'
    }`;
    toast.style.color = 'var(--theme-text-light, #f7f1e3)';
    toast.style.fontFamily = 'var(--theme-font, monospace)';
    toast.style.fontSize = '13px';
    toast.style.fontWeight = 'bold';
    toast.style.textShadow = '1px 1px 0 #000';
    toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.8), inset 0 0 10px rgba(0,0,0,0.4)';
    toast.style.transform = 'translateX(120%)';
    toast.style.transition = 'all 0.32s cubic-bezier(0.16, 1, 0.3, 1)';
    toast.style.opacity = '0';
    toast.innerText = message;

    this.container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 400);
    }, 2500);
  }
}
