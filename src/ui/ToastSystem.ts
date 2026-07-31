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

  public show(message: string, type: 'info' | 'success' | 'warning' = 'info'): void {
    const toast = document.createElement('div');
    toast.style.padding = '10px 16px';
    toast.style.borderRadius = '8px';
    toast.style.background = 'rgba(15, 23, 42, 0.85)';
    toast.style.backdropFilter = 'blur(10px)';
    toast.style.borderLeft = `4px solid ${
      type === 'success' ? '#4caf50' : type === 'warning' ? '#ff9800' : '#2196f3'
    }`;
    toast.style.color = '#ffffff';
    toast.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    toast.style.fontSize = '13px';
    toast.style.fontWeight = '500';
    toast.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.5)';
    toast.style.transform = 'translateX(120%)';
    toast.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
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
