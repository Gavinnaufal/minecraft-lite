class InputManager {
  private readonly keysDown = new Set<string>();

  mouseDeltaX = 0;
  mouseDeltaY = 0;
  isPointerLocked = false;
  isLeftMouseDown = false;
  isRightMouseDown = false;

  private readonly canvas: HTMLCanvasElement | null;

  private constructor() {
    this.canvas = document.getElementById('game') as HTMLCanvasElement | null;

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
  }

  static readonly instance = new InputManager();

  isKeyPressed(key: string): boolean {
    return this.keysDown.has(key);
  }

  requestPointerLock(): void {
    this.canvas?.requestPointerLock();
  }

  resetMouseDelta(): void {
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    this.keysDown.add(event.key);
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    this.keysDown.delete(event.key);
  };

  private readonly onMouseMove = (event: MouseEvent): void => {
    if (!this.isPointerLocked) return;
    this.mouseDeltaX += event.movementX;
    this.mouseDeltaY += event.movementY;
  };

  private readonly onPointerLockChange = (): void => {
    this.isPointerLocked = document.pointerLockElement === this.canvas;
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
