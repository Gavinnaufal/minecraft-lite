import { inputManager, InputManager } from '../core/InputManager';
import { AudioManager } from '../audio/AudioManager';
import { gameSettings } from '../core/GameSettings';

export class TouchControls {
  private static instance: TouchControls | null = null;

  private container: HTMLDivElement;
  private joystickZone: HTMLDivElement;
  private joystickBase: HTMLDivElement;
  private joystickKnob: HTMLDivElement;
  private jumpButton: HTMLDivElement;
  private attackButton: HTMLDivElement;
  private placeButton: HTMLDivElement;
  private invButton: HTMLDivElement;

  public onToggleInventory: (() => void) | null = null;

  private isEnabled = false;
  private isVisible = false;
  private joystickTouchId: number | null = null;
  private lookTouchId: number | null = null;
  private jumpTouchId: number | null = null;
  private attackTouchId: number | null = null;
  private placeTouchId: number | null = null;

  private joystickCenterX = 0;
  private joystickCenterY = 0;
  private readonly maxDistance = 45; // Max knob displacement radius in pixels

  private lastLookX = 0;
  private lastLookY = 0;

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
    this.jumpButton.title = 'Jump';
    this.jumpButton.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    `;
    this.jumpButton.style.cssText = `
      position: absolute;
      right: 25px;
      bottom: 30px;
      width: 62px;
      height: 62px;
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

    // 3. Attack / Break Button (Left of Jump Button)
    this.attackButton = document.createElement('div');
    this.attackButton.id = 'touch-attack-btn';
    this.attackButton.title = 'Attack / Break Block (Hold)';
    this.attackButton.innerHTML = `
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));">
        <path d="M14.5 17.5L3 6V3h3l11.5 11.5"/>
        <path d="M13 19l6-6"/>
        <path d="M16 16l4 4"/>
        <path d="M19 21l2-2"/>
      </svg>
    `;
    this.attackButton.style.cssText = `
      position: absolute;
      right: 98px;
      bottom: 30px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 80, 80, 0.35) 0%, rgba(255, 80, 80, 0.15) 100%);
      border: 2.5px solid rgba(255, 120, 120, 0.55);
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
    this.container.appendChild(this.attackButton);

    // 4. Place / Interact Button (Above Jump Button)
    this.placeButton = document.createElement('div');
    this.placeButton.id = 'touch-place-btn';
    this.placeButton.title = 'Place Block / Interact';
    this.placeButton.innerHTML = `
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    `;
    this.placeButton.style.cssText = `
      position: absolute;
      right: 25px;
      bottom: 102px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(80, 200, 255, 0.35) 0%, rgba(80, 200, 255, 0.15) 100%);
      border: 2.5px solid rgba(120, 220, 255, 0.55);
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
    this.container.appendChild(this.placeButton);

    // 5. Inventory Button (Top-Right)
    this.invButton = document.createElement('div');
    this.invButton.id = 'touch-inv-btn';
    this.invButton.title = 'Open Inventory (E)';
    this.invButton.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    `;
    this.invButton.style.cssText = `
      position: absolute;
      top: 14px;
      right: 14px;
      width: 44px;
      height: 44px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.55);
      border: 2px solid rgba(255, 255, 255, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
      touch-action: manipulation;
      cursor: pointer;
      z-index: 105;
      backdrop-filter: blur(4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      transition: transform 0.08s ease, background 0.08s ease;
    `;

    this.invButton.addEventListener(
      'touchend',
      (e) => {
        if (e.cancelable) e.preventDefault();
        AudioManager.getInstance().playSFX('click');
        this.onToggleInventory?.();
      },
      { passive: false }
    );
    this.invButton.addEventListener('click', () => {
      AudioManager.getInstance().playSFX('click');
      this.onToggleInventory?.();
    });

    this.container.appendChild(this.invButton);

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
      this.resetAttack();
      this.resetPlace();
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
    if (
      target.closest(
        'button, input, select, textarea, a, .mc-button, .hotbar-slot, #hud-hotbar, [role="button"], #main-menu, #pause-menu, #settings-menu, #inventory-screen, #chest-screen, #furnace-screen, #trading-screen, #chat-box, #touch-attack-btn, #touch-place-btn, #touch-inv-btn, #touch-jump-btn'
      )
    ) {
      return true;
    }
    return false;
  }

  private readonly onTouchStart = (e: TouchEvent): void => {
    if (!this.isVisible || !this.isEnabled) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const target = touch.target as HTMLElement | null;

      // 1. Attack / Break Button (Hold to break)
      if (this.attackTouchId === null && (target === this.attackButton || this.attackButton.contains(target))) {
        this.attackTouchId = touch.identifier;
        inputManager.isLeftMouseDown = true;
        this.attackButton.style.transform = 'scale(0.88)';
        this.attackButton.style.background = 'radial-gradient(circle, rgba(255, 80, 80, 0.6) 0%, rgba(255, 80, 80, 0.3) 100%)';
        if (e.cancelable) e.preventDefault();
        continue;
      }

      // 2. Place / Interact Button (Tap to place)
      if (this.placeTouchId === null && (target === this.placeButton || this.placeButton.contains(target))) {
        this.placeTouchId = touch.identifier;
        inputManager.isRightMouseDown = true;
        this.placeButton.style.transform = 'scale(0.88)';
        this.placeButton.style.background = 'radial-gradient(circle, rgba(80, 200, 255, 0.6) 0%, rgba(80, 200, 255, 0.3) 100%)';
        if (e.cancelable) e.preventDefault();
        continue;
      }

      // 3. Jump Button
      if (this.jumpTouchId === null && (target === this.jumpButton || this.jumpButton.contains(target))) {
        this.jumpTouchId = touch.identifier;
        inputManager.setVirtualKey(' ', true);
        this.jumpButton.style.transform = 'scale(0.88)';
        this.jumpButton.style.background = 'rgba(255, 255, 255, 0.45)';
        if (e.cancelable) e.preventDefault();
        continue;
      }

      // 4. Inventory Button
      if (target === this.invButton || this.invButton.contains(target)) {
        if (e.cancelable) e.preventDefault();
        continue;
      }

      // Skip interactive UI elements to avoid blocking clicks on menus/HUD buttons
      if (this.isInteractiveUI(target)) {
        continue;
      }

      // 5. Joystick Zone (Left half, bottom region or inside joystickZone)
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

      // 6. Camera Look Area (Right side of screen or top-left, not inside joystick or buttons)
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

        inputManager.addTouchDelta(
          deltaX * gameSettings.touchSensitivity,
          deltaY * gameSettings.touchSensitivity
        );

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

      if (touch.identifier === this.attackTouchId) {
        this.resetAttack();
      }
      if (touch.identifier === this.placeTouchId) {
        this.resetPlace();
      }
      if (touch.identifier === this.jumpTouchId) {
        this.resetJump();
      }
      if (touch.identifier === this.joystickTouchId) {
        this.resetJoystick();
      }
      if (touch.identifier === this.lookTouchId) {
        this.resetCameraLook();
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

  private resetAttack(): void {
    this.attackTouchId = null;
    inputManager.isLeftMouseDown = false;
    this.attackButton.style.transform = 'scale(1)';
    this.attackButton.style.background = 'radial-gradient(circle, rgba(255, 80, 80, 0.35) 0%, rgba(255, 80, 80, 0.15) 100%)';
  }

  private resetPlace(): void {
    this.placeTouchId = null;
    inputManager.isRightMouseDown = false;
    this.placeButton.style.transform = 'scale(1)';
    this.placeButton.style.background = 'radial-gradient(circle, rgba(80, 200, 255, 0.35) 0%, rgba(80, 200, 255, 0.15) 100%)';
  }
}
