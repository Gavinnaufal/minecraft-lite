import { inputManager, InputManager } from '../core/InputManager';

export class TouchControls {
  private static instance: TouchControls | null = null;

  private container: HTMLDivElement;
  private joystickZone: HTMLDivElement;
  private joystickBase: HTMLDivElement;
  private joystickKnob: HTMLDivElement;
  private jumpButton: HTMLDivElement;

  private isEnabled = false;
  private isVisible = false;
  private joystickTouchId: number | null = null;
  private lookTouchId: number | null = null;
  private jumpTouchId: number | null = null;

  private joystickCenterX = 0;
  private joystickCenterY = 0;
  private readonly maxDistance = 45; // Max knob displacement radius in pixels

  private lastLookX = 0;
  private lastLookY = 0;
  private readonly lookSensitivity = 1.65;

  // Active virtual keys
  private activeKeys = {
    w: false,
    a: false,
    s: false,
    d: false,
  };

  private constructor() {
    this.container = document.createElement('div');
    this.container.id = 'touch-controls';
    this.container.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 95;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
      display: none;
    `;

    // 1. Virtual Joystick Zone (Bottom-Left)
    this.joystickZone = document.createElement('div');
    this.joystickZone.id = 'joystick-zone';
    this.joystickZone.style.cssText = `
      position: absolute;
      left: 25px;
      bottom: 25px;
      width: 140px;
      height: 140px;
      pointer-events: auto;
      touch-action: none;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    this.joystickBase = document.createElement('div');
    this.joystickBase.style.cssText = `
      width: 130px;
      height: 130px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.06) 70%, rgba(255, 255, 255, 0.12) 100%);
      border: 2.5px solid rgba(255, 255, 255, 0.4);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35), inset 0 0 12px rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(4px);
      position: relative;
    `;

    this.joystickKnob = document.createElement('div');
    this.joystickKnob.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 56px;
      height: 56px;
      margin: -28px 0 0 -28px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.95), rgba(200, 200, 200, 0.65));
      border: 2px solid rgba(255, 255, 255, 0.85);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      pointer-events: none;
      transform: translate3d(0px, 0px, 0px);
      transition: transform 0.04s ease-out;
    `;

    this.joystickBase.appendChild(this.joystickKnob);
    this.joystickZone.appendChild(this.joystickBase);
    this.container.appendChild(this.joystickZone);

    // 2. Jump Button (Bottom-Right)
    this.jumpButton = document.createElement('div');
    this.jumpButton.id = 'touch-jump-btn';
    this.jumpButton.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    `;
    this.jumpButton.style.cssText = `
      position: absolute;
      right: 30px;
      bottom: 40px;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%);
      border: 2.5px solid rgba(255, 255, 255, 0.45);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
      touch-action: none;
      cursor: pointer;
      transition: transform 0.08s ease, background 0.08s ease;
    `;
    this.container.appendChild(this.jumpButton);

    document.body.appendChild(this.container);

    this.setupEventListeners();
  }

  static getInstance(): TouchControls {
    if (!TouchControls.instance) {
      TouchControls.instance = new TouchControls();
    }
    return TouchControls.instance;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    const shouldShow = enabled && InputManager.isTouchDevice();
    this.setVisible(shouldShow);
  }

  public checkDevice(): void {
    const shouldShow = this.isEnabled && InputManager.isTouchDevice();
    if (shouldShow !== this.isVisible) {
      this.setVisible(shouldShow);
    }
  }

  public setVisible(visible: boolean): void {
    this.isVisible = visible;
    this.container.style.display = visible ? 'block' : 'none';
    if (!visible) {
      this.resetJoystick();
      this.resetCameraLook();
      this.resetJump();
    }
  }

  private setupEventListeners(): void {
    // Window Resize / Orientation listener
    window.addEventListener('resize', () => {
      this.checkDevice();
    });

    // Global Touch Listeners on document for multi-touch precision
    document.addEventListener('touchstart', this.onTouchStart, { passive: false });
    document.addEventListener('touchmove', this.onTouchMove, { passive: false });
    document.addEventListener('touchend', this.onTouchEnd, { passive: false });
    document.addEventListener('touchcancel', this.onTouchCancel, { passive: false });
  }

  private isInteractiveUI(target: HTMLElement | null): boolean {
    if (!target) return false;
    const tag = target.tagName?.toLowerCase();
    if (tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea' || tag === 'a') return true;
    if (target.closest('button, input, select, textarea, a, .mc-button, [role="button"], #main-menu, #pause-menu, #settings-menu, #inventory-screen, #chest-screen, #furnace-screen, #trading-screen, #chat-box')) return true;
    return false;
  }

  private readonly onTouchStart = (e: TouchEvent): void => {
    if (!this.isVisible || !this.isEnabled) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const target = touch.target as HTMLElement | null;

      // Skip interactive UI elements to avoid blocking clicks on menus/HUD buttons
      if (this.isInteractiveUI(target)) {
        continue;
      }

      // 1. Jump Button
      if (this.jumpTouchId === null && (target === this.jumpButton || this.jumpButton.contains(target))) {
        this.jumpTouchId = touch.identifier;
        inputManager.setVirtualKey(' ', true);
        this.jumpButton.style.transform = 'scale(0.9)';
        this.jumpButton.style.background = 'rgba(255, 255, 255, 0.45)';
        if (e.cancelable) e.preventDefault();
        continue;
      }

      // 2. Joystick Zone (Left half, bottom region or inside joystickZone)
      const rect = this.joystickZone.getBoundingClientRect();
      const inJoystickArea =
        touch.clientX >= rect.left - 20 &&
        touch.clientX <= rect.right + 20 &&
        touch.clientY >= rect.top - 20 &&
        touch.clientY <= rect.bottom + 20;

      if (this.joystickTouchId === null && inJoystickArea) {
        this.joystickTouchId = touch.identifier;
        this.joystickCenterX = rect.left + rect.width / 2;
        this.joystickCenterY = rect.top + rect.height / 2;
        this.updateJoystickPosition(touch.clientX, touch.clientY);
        if (e.cancelable) e.preventDefault();
        continue;
      }

      // 3. Camera Look Area (Right side of screen or top-left, not inside joystick or jump button)
      if (this.lookTouchId === null && touch.clientX > window.innerWidth * 0.35) {
        this.lookTouchId = touch.identifier;
        this.lastLookX = touch.clientX;
        this.lastLookY = touch.clientY;
        if (e.cancelable) e.preventDefault();
        continue;
      }
    }
  };

  private readonly onTouchMove = (e: TouchEvent): void => {
    if (!this.isVisible) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      // Update Joystick
      if (touch.identifier === this.joystickTouchId) {
        this.updateJoystickPosition(touch.clientX, touch.clientY);
        e.preventDefault();
      }

      // Update Camera Look
      if (touch.identifier === this.lookTouchId) {
        const deltaX = touch.clientX - this.lastLookX;
        const deltaY = touch.clientY - this.lastLookY;

        inputManager.addTouchDelta(deltaX * this.lookSensitivity, deltaY * this.lookSensitivity);

        this.lastLookX = touch.clientX;
        this.lastLookY = touch.clientY;
        e.preventDefault();
      }
    }
  };

  private readonly onTouchEnd = (e: TouchEvent): void => {
    if (!this.isVisible) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      if (touch.identifier === this.joystickTouchId) {
        this.resetJoystick();
      }
      if (touch.identifier === this.lookTouchId) {
        this.resetCameraLook();
      }
      if (touch.identifier === this.jumpTouchId) {
        this.resetJump();
      }
    }
  };

  private readonly onTouchCancel = (e: TouchEvent): void => {
    this.onTouchEnd(e);
  };

  private updateJoystickPosition(touchX: number, touchY: number): void {
    const dx = touchX - this.joystickCenterX;
    const dy = touchY - this.joystickCenterY;
    const distance = Math.hypot(dx, dy);

    const clampedDist = Math.min(distance, this.maxDistance);
    const angle = Math.atan2(dy, dx);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    this.joystickKnob.style.transform = `translate3d(${knobX}px, ${knobY}px, 0px)`;

    // Deadzone check
    if (distance < 8) {
      this.clearMovementKeys();
      return;
    }

    const normX = dx / Math.max(distance, 1);
    const normY = dy / Math.max(distance, 1);

    // Calculate 8-way directional thresholds
    const forward = normY < -0.35;
    const backward = normY > 0.35;
    const left = normX < -0.35;
    const right = normX > 0.35;

    this.setKey('w', forward);
    this.setKey('s', backward);
    this.setKey('a', left);
    this.setKey('d', right);
  }

  private setKey(key: 'w' | 'a' | 's' | 'd', pressed: boolean): void {
    if (this.activeKeys[key] !== pressed) {
      this.activeKeys[key] = pressed;
      inputManager.setVirtualKey(key, pressed);
    }
  }

  private clearMovementKeys(): void {
    (['w', 'a', 's', 'd'] as const).forEach((key) => {
      if (this.activeKeys[key]) {
        this.activeKeys[key] = false;
        inputManager.setVirtualKey(key, false);
      }
    });
  }

  private resetJoystick(): void {
    this.joystickTouchId = null;
    this.joystickKnob.style.transform = 'translate3d(0px, 0px, 0px)';
    this.clearMovementKeys();
  }

  private resetCameraLook(): void {
    this.lookTouchId = null;
  }

  private resetJump(): void {
    this.jumpTouchId = null;
    inputManager.setVirtualKey(' ', false);
    this.jumpButton.style.transform = 'scale(1)';
    this.jumpButton.style.background = 'radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)';
  }
}
