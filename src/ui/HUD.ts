import { Hotbar } from '../inventory/Hotbar';
import { createItemIcon } from './IconGenerator';
import { getItemById } from '../inventory/ItemRegistry';
import { AudioManager } from '../audio/AudioManager';
import { InputManager } from '../core/InputManager';

const SVG_ICONS = {
  location: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00ffcc" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  compass: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffcc00" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`,
  fps: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#81c784" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  sun: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffcc00" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
  moon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#81d4fa" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
  heartFull: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#ff3333" stroke="#990000" stroke-width="1.2" style="vertical-align: middle; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
  heartHalf: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff8833" stroke-width="1.2" style="vertical-align: middle; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="url(#halfGrad)"></path><defs><linearGradient id="halfGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="50%" stop-color="#ff3333"/><stop offset="50%" stop-color="rgba(0,0,0,0.3)"/></linearGradient></defs></svg>`,
  heartEmpty: `<svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(30,30,40,0.5)" stroke="rgba(255,255,255,0.2)" stroke-width="1.2" style="vertical-align: middle; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
  shieldFull: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#90a4ae" stroke="#37474f" stroke-width="1.2" style="vertical-align: middle; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
  shieldHalf: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#37474f" stroke-width="1.2" style="vertical-align: middle; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="url(#shieldHalfGrad)"></path><defs><linearGradient id="shieldHalfGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="50%" stop-color="#90a4ae"/><stop offset="50%" stop-color="rgba(0,0,0,0.3)"/></linearGradient></defs></svg>`,
  shieldEmpty: `<svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(30,30,40,0.4)" stroke="rgba(255,255,255,0.2)" stroke-width="1.2" style="vertical-align: middle; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
  bubbleFull: `<svg width="15" height="15" viewBox="0 0 24 24" fill="#00e5ff" stroke="#00838f" stroke-width="1.5" style="vertical-align: middle; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.8));"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="9" r="2.5" fill="#ffffff"/></svg>`,
  bubbleEmpty: `<svg width="15" height="15" viewBox="0 0 24 24" fill="rgba(0,50,80,0.3)" stroke="rgba(0,229,255,0.3)" stroke-width="1.5" style="vertical-align: middle; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.8));"><circle cx="12" cy="12" r="9"/></svg>`,
  hungerFull: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#d35400" stroke="#6e2c00" stroke-width="1.2" style="vertical-align: middle; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));"><path d="M18.5 3a3.5 3.5 0 0 0-3.5 3.5c0 .37.06.72.16 1.05L9.62 13.1a3.5 3.5 0 0 0-4.12.56 3.5 3.5 0 0 0 .56 4.12l-2.48 2.48a1.5 1.5 0 0 0 2.12 2.12l2.48-2.48a3.5 3.5 0 0 0 4.12.56 3.5 3.5 0 0 0 .56-4.12l5.55-5.55c.33.1.68.16 1.05.16a3.5 3.5 0 0 0 3.5-3.5 3.5 3.5 0 0 0-3.5-3.5z"></path></svg>`,
  hungerHalf: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6e2c00" stroke-width="1.2" style="vertical-align: middle; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));"><path d="M18.5 3a3.5 3.5 0 0 0-3.5 3.5c0 .37.06.72.16 1.05L9.62 13.1a3.5 3.5 0 0 0-4.12.56 3.5 3.5 0 0 0 .56 4.12l-2.48 2.48a1.5 1.5 0 0 0 2.12 2.12l2.48-2.48a3.5 3.5 0 0 0 4.12.56 3.5 3.5 0 0 0 .56-4.12l5.55-5.55c.33.1.68.16 1.05.16a3.5 3.5 0 0 0 3.5-3.5 3.5 3.5 0 0 0-3.5-3.5z" fill="url(#hungerHalfGrad)"></path><defs><linearGradient id="hungerHalfGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="50%" stop-color="#d35400"/><stop offset="50%" stop-color="rgba(0,0,0,0.3)"/></linearGradient></defs></svg>`,
  hungerEmpty: `<svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(30,30,40,0.5)" stroke="rgba(255,255,255,0.2)" stroke-width="1.2" style="vertical-align: middle; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));"><path d="M18.5 3a3.5 3.5 0 0 0-3.5 3.5c0 .37.06.72.16 1.05L9.62 13.1a3.5 3.5 0 0 0-4.12.56 3.5 3.5 0 0 0 .56 4.12l-2.48 2.48a1.5 1.5 0 0 0 2.12 2.12l2.48-2.48a3.5 3.5 0 0 0 4.12.56 3.5 3.5 0 0 0 .56-4.12l5.55-5.55c.33.1.68.16 1.05.16a3.5 3.5 0 0 0 3.5-3.5 3.5 3.5 0 0 0-3.5-3.5z"></path></svg>`,
};

export class HUD {
  private hotbar: Hotbar;
  private container: HTMLDivElement;
  private slots: HTMLDivElement[] = [];
  private crosshair: HTMLDivElement;
  private timeDisplayContainer: HTMLDivElement;
  private timeDisplay: HTMLSpanElement;
  private timeIcon: HTMLSpanElement;
  private healthContainer: HTMLDivElement;
  private heartEls: HTMLSpanElement[] = [];
  private hungerContainer: HTMLDivElement;
  private hungerEls: HTMLSpanElement[] = [];
  private oxygenContainer: HTMLDivElement;
  private bubbleEls: HTMLSpanElement[] = [];
  private armorContainer: HTMLDivElement;
  private shieldEls: HTMLSpanElement[] = [];
  private damageOverlay: HTMLDivElement;
  private deathOverlay: HTMLDivElement;
  private underwaterOverlay: HTMLDivElement;
  private coordsDisplay: HTMLDivElement;
  private controlsGuide: HTMLDivElement;
  private itemNameBanner: HTMLDivElement;
  private lowHpVignette: HTMLDivElement;
  private dimensionLabel: string = 'Overworld';
  private lastActiveSlot = -1;
  private bannerTimeout: number | null = null;

  constructor(hotbar: Hotbar) {
    this.hotbar = hotbar;

    // Underwater Blue Screen Overlay Tint
    this.underwaterOverlay = document.createElement('div');
    this.underwaterOverlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 80, 180, 0.35); backdrop-filter: blur(2px); pointer-events: none; z-index: 130;
      opacity: 0; transition: opacity 0.3s ease;
    `;
    document.body.appendChild(this.underwaterOverlay);

    // Damage Flash Overlay
    this.damageOverlay = document.createElement('div');
    this.damageOverlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(255, 0, 0, 0.35); pointer-events: none; z-index: 150;
      opacity: 0; transition: opacity 0.15s ease-out;
    `;
    document.body.appendChild(this.damageOverlay);

    // Low HP Red Warning Vignette Overlay
    this.lowHpVignette = document.createElement('div');
    this.lowHpVignette.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      box-shadow: inset 0 0 100px rgba(255, 0, 0, 0.65); pointer-events: none; z-index: 140;
      opacity: 0; transition: opacity 0.3s ease;
    `;
    document.body.appendChild(this.lowHpVignette);

    // Death Message Overlay
    this.deathOverlay = document.createElement('div');
    this.deathOverlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(80, 0, 0, 0.75); backdrop-filter: blur(8px); pointer-events: none; z-index: 250;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      color: #ff3333; font-family: monospace; font-size: 36px; font-weight: bold;
      text-shadow: 2px 2px 8px #000; opacity: 0; transition: opacity 0.3s ease;
    `;
    this.deathOverlay.innerHTML = '<div style="letter-spacing:2px;">KAMU MATI!</div><div style="font-size:16px; color:#fff; margin-top:12px; font-weight:normal;">Restarting...</div>';
    document.body.appendChild(this.deathOverlay);

    // Top-Left Status Badge (XYZ + Facing + FPS)
    this.coordsDisplay = document.createElement('div');
    this.coordsDisplay.id = 'hud-coords';
    this.coordsDisplay.style.cssText = `
      position: fixed; top: 12px; left: 16px; z-index: 100; pointer-events: none;
      font-family: var(--theme-font, monospace); font-size: 12px; color: var(--theme-text-light, #f7f1e3); line-height: 1.4;
      background: var(--theme-panel-bg-translucent, rgba(35, 23, 16, 0.94));
      border: 2px solid var(--theme-border-muted, #543926); border-radius: 4px;
      padding: 6px 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.7);
      display: flex; align-items: center; gap: 8px; text-shadow: 1px 1px 0 #000;
    `;
    this.coordsDisplay.innerHTML = `<span>${SVG_ICONS.location} XYZ: 0.0, 60.0, 0.0</span> <span style="color:rgba(255,255,255,0.3)">|</span> <span>${SVG_ICONS.compass} South</span> <span style="color:rgba(255,255,255,0.3)">|</span> <span>${SVG_ICONS.fps} 60 FPS</span>`;
    document.body.appendChild(this.coordsDisplay);

    // Top-Center Time Badge
    this.timeDisplayContainer = document.createElement('div');
    this.timeDisplayContainer.id = 'hud-time';
    this.timeDisplayContainer.style.cssText = `
      position: fixed; top: 12px; left: 50%; transform: translateX(-50%); z-index: 100;
      font-family: var(--theme-font, monospace); font-size: 13px; font-weight: bold;
      color: var(--theme-accent-gold-text, #ffd56b); pointer-events: none;
      background: var(--theme-panel-bg-translucent, rgba(35, 23, 16, 0.94));
      border: 2px solid var(--theme-border-gold, #c8963e); border-radius: 4px;
      padding: 5px 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.7), 0 0 10px rgba(200, 150, 62, 0.25);
      display: flex; align-items: center; gap: 6px; text-shadow: 1px 1px 2px #000;
    `;
    this.timeIcon = document.createElement('span');
    this.timeIcon.style.cssText = 'display: flex; align-items: center;';
    this.timeDisplay = document.createElement('span');
    this.timeDisplayContainer.appendChild(this.timeIcon);
    this.timeDisplayContainer.appendChild(this.timeDisplay);
    document.body.appendChild(this.timeDisplayContainer);

    // Top-Right Controls Guide Badge
    this.controlsGuide = document.createElement('div');
    this.controlsGuide.style.cssText = `
      position: fixed; top: 12px; right: 16px; z-index: 100; pointer-events: none;
      font-family: var(--theme-font, monospace); font-size: 11px; color: var(--theme-text-muted, #c4b097);
      background: var(--theme-panel-bg-translucent, rgba(35, 23, 16, 0.94));
      border: 2px solid var(--theme-border-muted, #543926); border-radius: 4px;
      padding: 6px 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.7);
      display: flex; gap: 12px; align-items: center;
    `;
    const kStyle = 'background:var(--theme-slot-bg, #1a110a); border:1px solid var(--theme-border-highlight, #704b31); border-radius:3px; padding:1px 5px; color:var(--theme-accent-gold-text, #ffd56b); font-weight:bold; font-size:10px;';
    this.controlsGuide.innerHTML = `
      <div><span style="${kStyle}">E</span> Inv</div>
      <div><span style="${kStyle}">Shift</span> Run</div>
      <div><span style="${kStyle}">1-9</span> Slot</div>
      <div><span style="${kStyle}">R-Click</span> Eat / Place</div>
    `;
    document.body.appendChild(this.controlsGuide);

    // Active Item Name Popup Banner (Above Hotbar - Minecraft Style Text)
    this.itemNameBanner = document.createElement('div');
    this.itemNameBanner.style.cssText = `
      position: fixed; bottom: 104px; left: 50%; transform: translateX(-50%);
      font-family: monospace; font-size: 16px; font-weight: bold; color: #ffffff;
      text-shadow: 2px 2px 0 #000; pointer-events: none; z-index: 100;
      opacity: 0; transition: opacity 0.2s ease; text-align: center;
    `;
    document.body.appendChild(this.itemNameBanner);

    // Authentic Minecraft Crosshair (+)
    this.crosshair = document.createElement('div');
    this.crosshair.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 16px; height: 16px; z-index: 100; pointer-events: none;
    `;
    this.crosshair.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M7 0h2v16H7zM0 7h16v2H0z" fill="#ffffff"/>
        <path d="M6 0h1v16H6zM9 0h1v16H9zM0 6h16v1H0zM0 9h16v1H0z" fill="#000000" opacity="0.4"/>
      </svg>
    `;
    document.body.appendChild(this.crosshair);

    // Authentic Forest Survival Wood Hotbar Container
    this.container = document.createElement('div');
    this.container.id = 'hud-hotbar';
    this.container.style.cssText = `
      position: fixed; bottom: 8px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 2px; z-index: 100; pointer-events: auto;
      background: var(--theme-panel-bg-translucent, rgba(35, 23, 16, 0.94));
      border-top: 3px solid var(--theme-border-highlight, #704b31);
      border-left: 3px solid var(--theme-border-highlight, #704b31);
      border-bottom: 3px solid var(--theme-border-outer, #150d08);
      border-right: 3px solid var(--theme-border-outer, #150d08);
      padding: 3px; border-radius: 4px; box-shadow: 0 8px 24px rgba(0,0,0,0.85);
      touch-action: manipulation;
    `;
    document.body.appendChild(this.container);

    const hudStyle = document.createElement('style');
    hudStyle.textContent = `
      @media (max-width: 1400px), (hover: none), (pointer: coarse) {
        #hud-coords {
          left: 68px !important;
          font-size: 11px !important;
          padding: 4px 10px !important;
          gap: 6px !important;
          white-space: nowrap !important;
        }
        #hud-coords .hud-item-dim,
        #hud-coords .hud-dim-divider {
          display: none !important;
        }
        #hud-time {
          padding: 4px 10px !important;
          font-size: 12px !important;
        }
        #hud-health {
          bottom: 74px !important;
          right: calc(50% + 4px) !important;
          transform: scale(0.92) !important;
          transform-origin: bottom right !important;
        }
        #hud-hunger {
          bottom: 74px !important;
          left: calc(50% + 4px) !important;
          transform: scale(0.92) !important;
          transform-origin: bottom left !important;
        }
        #hud-oxygen {
          bottom: 96px !important;
          left: calc(50% + 4px) !important;
          transform: scale(0.92) !important;
          transform-origin: bottom left !important;
        }
        #hud-armor {
          bottom: 96px !important;
          right: calc(50% + 4px) !important;
          transform: scale(0.92) !important;
          transform-origin: bottom right !important;
        }
      }
      @media (max-width: 600px) {
        #hud-coords .hud-item-fps {
          display: none !important;
        }
        #hud-coords {
          padding: 3px 6px !important;
          gap: 4px !important;
        }
        #hud-hotbar {
          transform: translateX(-50%) scale(0.85) !important;
          transform-origin: bottom center !important;
          bottom: 4px !important;
        }
        #hud-health {
          bottom: 68px !important;
          right: calc(50% + 2px) !important;
          transform: scale(0.82) !important;
          transform-origin: bottom right !important;
        }
        #hud-hunger {
          bottom: 68px !important;
          left: calc(50% + 2px) !important;
          transform: scale(0.82) !important;
          transform-origin: bottom left !important;
        }
        #hud-oxygen {
          bottom: 88px !important;
          left: calc(50% + 2px) !important;
          transform: scale(0.82) !important;
          transform-origin: bottom left !important;
        }
        #hud-armor {
          bottom: 88px !important;
          right: calc(50% + 2px) !important;
          transform: scale(0.82) !important;
          transform-origin: bottom right !important;
        }
      }
    `;
    document.head.appendChild(hudStyle);

    for (let i = 0; i < 9; i++) {
      const slot = document.createElement('div');
      slot.className = 'hotbar-slot inv-slot-box';
      slot.style.cssText = `
        width: 54px; height: 54px;
        background: var(--theme-slot-bg, #1a110a);
        border-top: 2px solid var(--theme-slot-border-dark, #0f0a06);
        border-left: 2px solid var(--theme-slot-border-dark, #0f0a06);
        border-bottom: 2px solid var(--theme-slot-border-light, #4d3320);
        border-right: 2px solid var(--theme-slot-border-light, #4d3320);
        display: flex; align-items: center; justify-content: center; position: relative;
        font-family: var(--theme-font, monospace); font-size: 13px; color: var(--theme-text-light, #f7f1e3);
        margin: 1px; transition: all 0.1s ease; box-sizing: border-box;
        cursor: pointer; pointer-events: auto; touch-action: manipulation;
        border-radius: 3px;
      `;

      const selectSlot = (e?: Event) => {
        if (e && e.cancelable) e.preventDefault();
        this.hotbar.activeSlotIndex = i;
        AudioManager.getInstance().playSFX('click');
      };

      slot.addEventListener('touchend', selectSlot, { passive: false });
      slot.addEventListener('click', selectSlot);

      this.container.appendChild(slot);
      this.slots.push(slot);
    }

    // Health bar visual (10 heart SVG icons = 20 HP, on left of center)
    this.healthContainer = document.createElement('div');
    this.healthContainer.id = 'hud-health';
    this.healthContainer.style.cssText = `
      position: fixed; bottom: 82px; right: calc(50% + 6px);
      display: flex; gap: 3px; z-index: 100; pointer-events: none;
    `;
    for (let i = 0; i < 10; i++) {
      const heart = document.createElement('span');
      heart.style.cssText = 'display: flex; align-items: center; justify-content: center;';
      heart.innerHTML = SVG_ICONS.heartFull;
      this.healthContainer.appendChild(heart);
      this.heartEls.push(heart);
    }
    document.body.appendChild(this.healthContainer);

    // Hunger bar visual (10 drumstick SVG icons = 20 Hunger, on right of center)
    this.hungerContainer = document.createElement('div');
    this.hungerContainer.id = 'hud-hunger';
    this.hungerContainer.style.cssText = `
      position: fixed; bottom: 82px; left: calc(50% + 6px);
      display: flex; gap: 3px; z-index: 100; pointer-events: none;
    `;
    for (let i = 0; i < 10; i++) {
      const drumstick = document.createElement('span');
      drumstick.style.cssText = 'display: flex; align-items: center; justify-content: center;';
      drumstick.innerHTML = SVG_ICONS.hungerFull;
      this.hungerContainer.appendChild(drumstick);
      this.hungerEls.push(drumstick);
    }
    document.body.appendChild(this.hungerContainer);

    // Oxygen bubbles bar (10 bubble SVG icons = 20 Oxygen, on right above hunger)
    this.oxygenContainer = document.createElement('div');
    this.oxygenContainer.id = 'hud-oxygen';
    this.oxygenContainer.style.cssText = `
      position: fixed; bottom: 104px; left: calc(50% + 6px);
      display: flex; gap: 3px; z-index: 100; pointer-events: none;
      opacity: 0; transition: opacity 0.3s ease;
    `;
    for (let i = 0; i < 10; i++) {
      const bubble = document.createElement('span');
      bubble.style.cssText = 'display: flex; align-items: center; justify-content: center;';
      bubble.innerHTML = SVG_ICONS.bubbleFull;
      this.oxygenContainer.appendChild(bubble);
      this.bubbleEls.push(bubble);
    }
    document.body.appendChild(this.oxygenContainer);

    // Armor Bar Container (10 shield SVG icons = 20 Armor Points, on left above health)
    this.armorContainer = document.createElement('div');
    this.armorContainer.id = 'hud-armor';
    this.armorContainer.style.cssText = `
      position: fixed; bottom: 104px; right: calc(50% + 6px);
      display: flex; gap: 3px; z-index: 100; pointer-events: none;
      opacity: 0; transition: opacity 0.3s ease;
    `;
    for (let i = 0; i < 10; i++) {
      const shield = document.createElement('span');
      shield.style.cssText = 'display: flex; align-items: center; justify-content: center;';
      shield.innerHTML = SVG_ICONS.shieldEmpty;
      this.armorContainer.appendChild(shield);
      this.shieldEls.push(shield);
    }
    document.body.appendChild(this.armorContainer);

    this.checkDevice();
    window.addEventListener('resize', () => this.checkDevice());
    window.addEventListener('orientationchange', () => setTimeout(() => this.checkDevice(), 150));
    window.addEventListener('touchstart', () => this.checkDevice(), { passive: true, once: true });
    window.addEventListener('touch-device-detected', () => this.checkDevice());
  }

  private isVisible = true;

  setVisible(visible: boolean): void {
    this.isVisible = visible;
    if (this.coordsDisplay) this.coordsDisplay.style.display = visible ? 'flex' : 'none';
    if (this.timeDisplayContainer) this.timeDisplayContainer.style.display = visible ? 'flex' : 'none';
    if (this.controlsGuide) {
      this.controlsGuide.style.display = visible && !InputManager.isTouchDevice() ? 'flex' : 'none';
    }
    if (this.crosshair) this.crosshair.style.display = visible ? 'block' : 'none';
    if (this.container) this.container.style.display = visible ? 'flex' : 'none';
    if (this.healthContainer) this.healthContainer.style.display = visible ? 'flex' : 'none';
    if (this.hungerContainer) this.hungerContainer.style.display = visible ? 'flex' : 'none';
    if (this.oxygenContainer) this.oxygenContainer.style.display = visible ? 'flex' : 'none';
    if (this.armorContainer) this.armorContainer.style.display = visible ? 'flex' : 'none';
    if (this.itemNameBanner) this.itemNameBanner.style.display = visible ? 'block' : 'none';
  }

  getVisible(): boolean {
    return this.isVisible;
  }

  checkDevice(): void {
    const isTouch = InputManager.isTouchDevice();
    if (this.controlsGuide) {
      this.controlsGuide.style.display = this.isVisible && !isTouch ? 'flex' : 'none';
    }
    if (this.coordsDisplay) {
      if (isTouch) {
        this.coordsDisplay.style.left = '68px';
      }
    }
  }

  updateArmor(totalDefense: number): void {
    if (totalDefense > 0) {
      this.armorContainer.style.opacity = '1';
      const fullShields = Math.floor(totalDefense / 2);
      const hasHalf = totalDefense % 2 === 1;
      for (let i = 0; i < 10; i++) {
        if (i < fullShields) {
          this.shieldEls[i].innerHTML = SVG_ICONS.shieldFull;
        } else if (i === fullShields && hasHalf) {
          this.shieldEls[i].innerHTML = SVG_ICONS.shieldHalf;
        } else {
          this.shieldEls[i].innerHTML = SVG_ICONS.shieldEmpty;
        }
      }
    } else {
      this.armorContainer.style.opacity = '0';
    }
  }

  setSubmergedState(isSubmerged: boolean, oxygen = 20.0): void {
    if (isSubmerged) {
      this.underwaterOverlay.style.opacity = '1';
      this.oxygenContainer.style.opacity = '1';
      const count = Math.ceil(Math.max(0, Math.min(20, oxygen)) / 2);
      for (let i = 0; i < 10; i++) {
        this.bubbleEls[i].innerHTML = i < count ? SVG_ICONS.bubbleFull : SVG_ICONS.bubbleEmpty;
      }
    } else {
      this.underwaterOverlay.style.opacity = '0';
      this.oxygenContainer.style.opacity = '0';
    }
  }

  updatePlayerPos(x: number, y: number, z: number, rotationY = 0, fps = 60): void {
    const deg = (Math.round((rotationY * 180) / Math.PI) % 360 + 360) % 360;
    let dir = 'South';
    if (deg >= 45 && deg < 135) dir = 'West';
    else if (deg >= 135 && deg < 225) dir = 'North';
    else if (deg >= 225 && deg < 315) dir = 'East';

    this.coordsDisplay.innerHTML = `
      <span class="hud-item-xyz">${SVG_ICONS.location} <span style="color:#00ffcc;">XYZ: ${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}</span></span>
      <span class="hud-divider">|</span>
      <span class="hud-item-dir">${SVG_ICONS.compass} <span style="color:#ffcc00;">${dir}</span></span>
      <span class="hud-divider">|</span>
      <span class="hud-item-fps">${SVG_ICONS.fps} <span style="color:#81c784;">${fps} FPS</span></span>
      <span class="hud-divider hud-dim-divider">|</span>
      <span class="hud-item-dim" style="color:${this.dimensionLabel === 'Nether' ? '#ff6633' : '#55ff55'};">${this.dimensionLabel}</span>
    `;
  }

  setDimension(dimension: string): void {
    this.dimensionLabel = dimension === 'nether' ? 'Nether' : 'Overworld';
  }

  triggerDamageFlash(): void {
    this.damageOverlay.style.opacity = '1';
    setTimeout(() => {
      this.damageOverlay.style.opacity = '0';
    }, 200);
  }

  showDeathMessage(): void {
    this.deathOverlay.style.opacity = '1';
    setTimeout(() => {
      this.deathOverlay.style.opacity = '0';
    }, 1800);
  }

  setTime(timeOfDay: number, currentDay: number = 1): void {
    this.timeIcon.innerHTML = timeOfDay > 0.25 && timeOfDay < 0.75 ? SVG_ICONS.sun : SVG_ICONS.moon;

    const hour = Math.floor(timeOfDay * 24);
    const min = Math.floor((timeOfDay * 24 - hour) * 60);
    const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    this.timeDisplay.innerHTML = `<span style="color:#ffcc00; font-weight:bold;">Hari ${currentDay}</span><span style="color:rgba(255,255,255,0.4); margin:0 5px;">•</span><span>${timeStr}</span>`;
  }

  setCrosshairState(state: 'none' | 'block' | 'mob'): void {
    if (state === 'mob') {
      this.crosshair.style.transform = 'translate(-50%, -50%) scale(1.3)';
    } else if (state === 'block') {
      this.crosshair.style.transform = 'translate(-50%, -50%) scale(1.15)';
    } else {
      this.crosshair.style.transform = 'translate(-50%, -50%) scale(1.0)';
    }
  }

  updateHealth(health: number): void {
    const clampedHp = Math.max(0, Math.min(20, health));

    if (clampedHp > 0 && clampedHp <= 4) {
      this.lowHpVignette.style.opacity = '1';
    } else {
      this.lowHpVignette.style.opacity = '0';
    }

    for (let i = 0; i < 10; i++) {
      const el = this.heartEls[i];
      const fullThreshold = (i + 1) * 2;
      const halfThreshold = fullThreshold - 1;

      if (clampedHp >= fullThreshold) {
        el.innerHTML = SVG_ICONS.heartFull;
      } else if (clampedHp === halfThreshold) {
        el.innerHTML = SVG_ICONS.heartHalf;
      } else {
        el.innerHTML = SVG_ICONS.heartEmpty;
      }
    }
  }

  updateHunger(hunger: number): void {
    const clampedHunger = Math.max(0, Math.min(20, hunger));

    for (let i = 0; i < 10; i++) {
      const el = this.hungerEls[i];
      const fullThreshold = (i + 1) * 2;
      const halfThreshold = fullThreshold - 1;

      if (clampedHunger >= fullThreshold) {
        el.innerHTML = SVG_ICONS.hungerFull;
      } else if (clampedHunger === halfThreshold) {
        el.innerHTML = SVG_ICONS.hungerHalf;
      } else {
        el.innerHTML = SVG_ICONS.hungerEmpty;
      }
    }
  }

  update(playerHealth?: number, playerHunger?: number): void {
    if (playerHealth !== undefined) {
      this.updateHealth(playerHealth);
    }
    if (playerHunger !== undefined) {
      this.updateHunger(playerHunger);
    }

    if (this.hotbar.activeSlotIndex !== this.lastActiveSlot) {
      if (this.lastActiveSlot !== -1) {
        AudioManager.getInstance().playSFX('click');
      }
      this.lastActiveSlot = this.hotbar.activeSlotIndex;
      const activeSlot = this.hotbar.getActiveItem();
      if (activeSlot.itemId) {
        const itemDef = getItemById(activeSlot.itemId);
        if (itemDef) {
          this.itemNameBanner.textContent = itemDef.name;
          this.itemNameBanner.style.opacity = '1';
          if (this.bannerTimeout !== null) clearTimeout(this.bannerTimeout);
          this.bannerTimeout = window.setTimeout(() => {
            this.itemNameBanner.style.opacity = '0';
          }, 1600);
        }
      } else {
        this.itemNameBanner.style.opacity = '0';
      }
    }

    for (let i = 0; i < 9; i++) {
      const slot = this.slots[i];
      const item = this.hotbar.slots[i];
      const isActive = i === this.hotbar.activeSlotIndex;

      if (isActive) {
        slot.style.borderTopColor = 'var(--theme-accent-gold-border, #ffcc55)';
        slot.style.borderLeftColor = 'var(--theme-accent-gold-border, #ffcc55)';
        slot.style.borderBottomColor = 'var(--theme-accent-gold-border, #ffcc55)';
        slot.style.borderRightColor = 'var(--theme-accent-gold-border, #ffcc55)';
        slot.style.boxShadow = '0 0 14px rgba(255,204,85,0.85), inset 0 0 8px rgba(255,204,85,0.4)';
        slot.style.transform = 'scale(1.08)';
        slot.style.zIndex = '10';
      } else {
        slot.style.borderTopColor = 'var(--theme-slot-border-dark, #0f0a06)';
        slot.style.borderLeftColor = 'var(--theme-slot-border-dark, #0f0a06)';
        slot.style.borderBottomColor = 'var(--theme-slot-border-light, #4d3320)';
        slot.style.borderRightColor = 'var(--theme-slot-border-light, #4d3320)';
        slot.style.boxShadow = 'none';
        slot.style.transform = 'scale(1.0)';
        slot.style.zIndex = '1';
      }

      if (item.itemId) {
        slot.textContent = '';
        const icon = createItemIcon(item.itemId, 38);
        slot.appendChild(icon);

        if (item.count > 1) {
          const countEl = document.createElement('span');
          countEl.style.cssText = 'position:absolute;bottom:2px;right:4px;font-size:13px;font-weight:bold;color:#fff;text-shadow:2px 2px 0 #000;';
          countEl.textContent = String(item.count);
          slot.appendChild(countEl);
        }

        // Durability Bar on Hotbar HUD
        const itemDef = getItemById(item.itemId);
        if (itemDef?.maxDurability && item.durability !== undefined) {
          const ratio = Math.max(0, Math.min(1, item.durability / itemDef.maxDurability));
          const color = ratio > 0.5 ? '#4caf50' : ratio > 0.2 ? '#ffeb3b' : '#f44336';
          const durBar = document.createElement('div');
          durBar.style.cssText = `
            position: absolute; bottom: 3px; left: 4px; width: 48px; height: 4px;
            background: rgba(0,0,0,0.7); border-radius: 1px; overflow: hidden;
          `;
          const fill = document.createElement('div');
          fill.style.cssText = `height: 100%; width: ${ratio * 100}%; background: ${color};`;
          durBar.appendChild(fill);
          slot.appendChild(durBar);
        }
      } else {
        slot.textContent = '';
      }
    }
  }
}
