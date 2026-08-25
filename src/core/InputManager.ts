export class InputManager {
  private readonly keysDown = new Set<string>();

  mouseDeltaX = 0;
  mouseDeltaY = 0;
  isPointerLocked = false;
  isLeftMouseDown = false;
  isRightMouseDown = false;

  private static hasTouchDetected = false;
  private readonly canvas: HTMLCanvasElement | null;

  private constructor() {
    this.canvas = document.getElementById('game') as HTMLCanvasElement | null;

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', () => this.clearKeys());
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);

    // Dynamic Touch & Tablet Detection Listener
    const onTouchDetected = () => {
      if (!InputManager.hasTouchDetected) {
        InputManager.hasTouchDetected = true;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('touch-device-detected'));
        }
      }
    };
    window.addEventListener('touchstart', onTouchDetected, { passive: true });
    window.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        onTouchDetected();
      }
    }, { passive: true });
  }

  static readonly instance = new InputManager();

  isKeyPressed(key: string): boolean {
    if (this.keysDown.has(key)) return true;
    if (this.keysDown.has(key.toLowerCase())) return true;
    if (this.keysDown.has(key.toUpperCase())) return true;
    if (key.length === 1) {
      const code = 'Key' + key.toUpperCase();
      if (this.keysDown.has(code)) return true;
    }
    return false;
  }

  setVirtualKey(key: string, pressed: boolean): void {
    if (pressed) {
      this.keysDown.add(key.toLowerCase());
      this.keysDown.add(key);
      if (key.length === 1) {
        this.keysDown.add('Key' + key.toUpperCase());
      }
    } else {
      this.keysDown.delete(key.toLowerCase());
      this.keysDown.delete(key.toUpperCase());
      this.keysDown.delete(key);
      if (key.length === 1) {
        this.keysDown.delete('Key' + key.toUpperCase());
      }
    }
  }

  addTouchDelta(dx: number, dy: number): void {
    this.mouseDeltaX += dx;
    this.mouseDeltaY += dy;
  }

  static isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    if (InputManager.hasTouchDetected) return true;
    return (
      'ontouchstart' in window ||
      (typeof navigator !== 'undefined' && (navigator.maxTouchPoints > 0 || ((navigator as unknown as { msMaxTouchPoints?: number }).msMaxTouchPoints ?? 0) > 0)) ||
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(hover: none)').matches ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Tablet/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) || // iPadOS Safari
      window.innerWidth <= 1024
    );
  }

  requestPointerLock(): void {
    if (InputManager.isTouchDevice()) {
      return; // Do not lock pointer on touch devices / tablets
    }
    if (this.canvas?.requestPointerLock) {
      try {
        const p = this.canvas.requestPointerLock() as unknown;
        if (p && typeof (p as Promise<void>).catch === 'function') {
          (p as Promise<void>).catch(() => {});
        }
      } catch {
        // Pointer lock is not supported or rejected on mobile - fail safely
      }
    }
  }

  resetMouseDelta(): void {
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
  }

  clearKeys(): void {
    this.keysDown.clear();
    this.isLeftMouseDown = false;
    this.isRightMouseDown = false;
    this.resetMouseDelta();
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key) {
      this.keysDown.add(event.key.toLowerCase());
      this.keysDown.add(event.key);
    }
    if (event.code) {
      this.keysDown.add(event.code);
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    if (event.key) {
      this.keysDown.delete(event.key.toLowerCase());
      this.keysDown.delete(event.key.toUpperCase());
      this.keysDown.delete(event.key);
    }
    if (event.code) {
      this.keysDown.delete(event.code);
    }
  };

  private readonly onMouseMove = (event: MouseEvent): void => {
    if (!this.isPointerLocked) return;
    this.mouseDeltaX += event.movementX;
    this.mouseDeltaY += event.movementY;
  };

  private readonly onPointerLockChange = (): void => {
    const wasLocked = this.isPointerLocked;
    this.isPointerLocked = document.pointerLockElement === this.canvas;
    if (wasLocked && !this.isPointerLocked) {
      this.clearKeys();
    }
  };

  private readonly onMouseDown = (event: MouseEvent): void => {
    if (event.button === 0) this.isLeftMouseDown = true;
    if (event.button === 2) this.isRightMouseDown = true;
  };

  private readonly onMouseUp = (event: MouseEvent): void => {
    if (event.button === 0) this.isLeftMouseDown = false;
    if (event.button === 2) this.isRightMouseDown = false;
  };
}

export const inputManager = InputManager.instance;
