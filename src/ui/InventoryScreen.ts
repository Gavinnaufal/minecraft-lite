import { Inventory } from '../inventory/Inventory';
import { Hotbar } from '../inventory/Hotbar';
import { EquipmentSlots, type ArmorSlotType } from '../inventory/EquipmentSlots';
import { getItemById } from '../inventory/ItemRegistry';
import { checkRecipe } from '../crafting/CraftingSystem';
import { createItemIcon } from './IconGenerator';
import { AudioManager } from '../audio/AudioManager';

export interface CraftGridSlot {
  itemId: string;
  count: number;
}

export type SlotSourceType = 'inv' | 'hotbar' | 'craft' | 'armor';

export interface SelectedSlotInfo {
  type: SlotSourceType;
  index: number;
  r?: number;
  c?: number;
  armorSlot?: ArmorSlotType;
  count?: number;
  itemId?: string;
  durability?: number;
}

export class InventoryScreen {
  private container: HTMLDivElement | null = null;
  private panel: HTMLDivElement | null = null;
  private statusBanner: HTMLDivElement | null = null;
  private visible = false;
  private readonly inventory: Inventory;
  private readonly hotbar: Hotbar;
  private readonly equipmentSlots?: EquipmentSlots;
  public onClose: (() => void) | null = null;

  // Desktop drag-and-drop state (CP74 - mouse only)
  private dragItem: { itemId: string; count: number; durability?: number } | null = null;
  private dragEl: HTMLDivElement | null = null;
  private tooltipEl: HTMLDivElement | null = null;
  private isMouseDown = false;
  private isRightMouseDown = false;
  private lastEnteredSlot: HTMLElement | null = null;

  // Mobile Tap-to-Select & Tap-to-Move state (zero drag, pure tap)
  private selectedSlot: SelectedSlotInfo | null = null;
  private currentMobileTab: 'inv' | 'craft' | 'armor' = 'inv';

  // Mobile Long-Press Stack Splitter state
  private splitModal: HTMLDivElement | null = null;
  private splitTarget: SelectedSlotInfo | null = null;
  private splitTotalCount = 1;
  private splitSelectedCount = 1;
  private touchTimer: number | null = null;
  private touchStartPos = { x: 0, y: 0 };
  private isLongPressActive = false;

  // Section column references for tab switching
  private armorColumnEl: HTMLDivElement | null = null;
  private craftColumnEl: HTMLDivElement | null = null;
  private invColumnEl: HTMLDivElement | null = null;
  private tabButtons: HTMLButtonElement[] = [];

  private armorSlotEls: Record<ArmorSlotType, HTMLDivElement | null> = {
    helmet: null,
    chestplate: null,
    leggings: null,
    boots: null,
  };

  // Crafting 3x3 Grid with Stack Support
  private craftGrid: (CraftGridSlot | null)[][] = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
  private craftSlots: HTMLDivElement[] = [];
  private craftOutput: HTMLDivElement | null = null;

  constructor(inventory: Inventory, hotbar: Hotbar, equipmentSlots?: EquipmentSlots) {
    this.inventory = inventory;
    this.hotbar = hotbar;
    this.equipmentSlots = equipmentSlots;
  }

  get isOpen(): boolean {
    return this.visible;
  }

  create(): void {
    this.container = document.createElement('div');
    this.container.id = 'inventory-screen';
    this.container.style.cssText = `
      display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 200;
      justify-content: center; align-items: center; flex-direction: column;
    `;

    // Inject Responsive, Tabbed & Dimmed CSS Styles
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      #inventory-panel {
        position: relative;
        background: #c6c6c6;
        border-top: 4px solid #ffffff;
        border-left: 4px solid #ffffff;
        border-bottom: 4px solid #555555;
        border-right: 4px solid #555555;
        padding: 16px 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        border-radius: 4px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.8);
        box-sizing: border-box;
        max-width: 96vw;
        max-height: 94vh;
        user-select: none;
      }

      .inv-body-columns {
        display: flex;
        gap: 16px;
        align-items: flex-start;
      }

      .inv-tab-bar {
        display: none;
        gap: 8px;
        width: 100%;
        justify-content: center;
      }

      .inv-tab-btn {
        flex: 1;
        max-width: 160px;
        padding: 8px 10px;
        font-family: monospace;
        font-size: 13px;
        font-weight: bold;
        color: #fff;
        background: #555555;
        border-top: 2px solid #888;
        border-left: 2px solid #888;
        border-bottom: 2px solid #222;
        border-right: 2px solid #222;
        border-radius: 4px;
        cursor: pointer;
        touch-action: manipulation;
        text-shadow: 1px 1px 0 #000;
        transition: background 0.12s ease;
      }

      .inv-tab-btn.active {
        background: #2e7d32 !important;
        border-top: 2px solid #81c784 !important;
        border-left: 2px solid #81c784 !important;
        border-bottom: 2px solid #1b5e20 !important;
        border-right: 2px solid #1b5e20 !important;
        box-shadow: 0 0 8px rgba(76, 175, 80, 0.7);
      }

      /* Slot Styles */
      .inv-slot-box {
        transition: opacity 0.15s ease, filter 0.15s ease, transform 0.12s ease, box-shadow 0.15s ease;
        box-sizing: border-box;
      }

      /* Dimming effect when 1 slot is selected */
      .inv-has-selection .inv-slot-box:not(.inv-slot-selected) {
        opacity: 0.5;
        filter: grayscale(0.2) brightness(0.75);
      }

      .inv-has-selection .inv-slot-box:not(.inv-slot-selected):hover,
      .inv-has-selection .inv-slot-box:not(.inv-slot-selected):active {
        opacity: 0.95;
        filter: brightness(1.1);
      }

      /* Glowing Yellow Border for Selected Slot */
      .inv-slot-selected {
        opacity: 1 !important;
        filter: none !important;
        border-top: 3px solid #ffeb3b !important;
        border-left: 3px solid #ffeb3b !important;
        border-bottom: 3px solid #ffeb3b !important;
        border-right: 3px solid #ffeb3b !important;
        box-shadow: 0 0 16px #ffeb3b, inset 0 0 10px #ffeb3b !important;
        transform: scale(1.08) !important;
        z-index: 20 !important;
      }

      @keyframes slotPop {
        0% { transform: scale(1.16); }
        50% { transform: scale(0.92); }
        100% { transform: scale(1.0); }
      }

      .inv-slot-pop {
        animation: slotPop 0.22s ease-out;
      }

      @media (max-width: 840px), (max-height: 520px) {
        #inventory-panel {
          padding: 12px 14px;
          max-width: 96vw;
          max-height: 94vh;
          overflow-y: auto;
          align-items: center;
        }

        .inv-tab-bar {
          display: flex;
        }

        .inv-body-columns {
          flex-direction: column;
          width: 100%;
          align-items: center;
        }

        .inv-section-col {
          display: none !important;
          width: 100%;
          align-items: center;
          justify-content: center;
        }

        .inv-section-col.active-tab {
          display: flex !important;
        }

        .inv-slot-box {
          width: 48px !important;
          height: 48px !important;
        }

        .inv-grid-9 {
          grid-template-columns: repeat(9, 48px) !important;
        }
      }

      @media (max-width: 500px) {
        .inv-slot-box {
          width: 38px !important;
          height: 38px !important;
        }

        .inv-grid-9 {
          grid-template-columns: repeat(9, 38px) !important;
          gap: 2px !important;
        }
      }
    `;
    document.head.appendChild(styleEl);

    // Desktop mouse interaction handlers
    this.container.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      this.isMouseDown = true;
      if (e.button === 2) this.isRightMouseDown = true;
    });
    this.container.addEventListener('mouseup', (e) => {
      e.stopPropagation();
      this.isMouseDown = false;
      if (e.button === 2) this.isRightMouseDown = false;
      this.lastEnteredSlot = null;
    });
    this.container.addEventListener('click', (e) => {
      e.stopPropagation();
      // Click on background of container cancels selection
      if (e.target === this.container && this.selectedSlot !== null) {
        this.selectedSlot = null;
        this.refresh();
        AudioManager.getInstance().playSFX('click');
      }
    });
    this.container.addEventListener('contextmenu', (e) => e.preventDefault());
    document.body.appendChild(this.container);

    // Main panel - Minecraft Classic Gray GUI Box
    this.panel = document.createElement('div');
    this.panel.id = 'inventory-panel';

    // Touch tap on panel background cancels selection
    this.panel.addEventListener(
      'touchstart',
      (e) => {
        const target = e.target as HTMLElement;
        if (target === this.panel || target.classList.contains('inv-body-columns') || target.classList.contains('inv-section-col')) {
          if (this.selectedSlot !== null) {
            this.selectedSlot = null;
            this.refresh();
            AudioManager.getInstance().playSFX('click');
          }
        }
      },
      { passive: true }
    );

    // Big touch-friendly Close button for mobile & desktop
    const closeBtn = document.createElement('button');
    closeBtn.id = 'inventory-close-btn';
    closeBtn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    closeBtn.title = 'Tutup Inventory (E / Esc)';
    closeBtn.style.cssText = `
      position: absolute; top: -14px; right: -14px; width: 44px; height: 44px;
      border-radius: 50%; background: #c62828; border: 3px solid #ffffff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
      cursor: pointer; z-index: 50; touch-action: manipulation;
    `;
    const triggerClose = (e?: Event) => {
      if (e && e.cancelable) e.preventDefault();
      this.close();
    };
    closeBtn.addEventListener('touchend', triggerClose, { passive: false });
    closeBtn.addEventListener('click', triggerClose);
    this.panel.appendChild(closeBtn);

    // Tab Navigation Bar for Mobile Mode
    const tabBar = document.createElement('div');
    tabBar.className = 'inv-tab-bar';

    const createTabBtn = (tabId: 'inv' | 'craft' | 'armor', label: string, icon: string, active: boolean) => {
      const btn = document.createElement('button');
      btn.className = `inv-tab-btn ${active ? 'active' : ''}`;
      btn.dataset.tab = tabId;
      btn.innerHTML = `${icon} ${label}`;
      const onSelect = (e?: Event) => {
        if (e && e.cancelable) e.preventDefault();
        this.switchMobileTab(tabId);
        AudioManager.getInstance().playSFX('click');
      };
      btn.addEventListener('touchend', onSelect, { passive: false });
      btn.addEventListener('click', onSelect);
      this.tabButtons.push(btn);
      return btn;
    };

    tabBar.appendChild(createTabBtn('inv', 'Tas & Hotbar', '🎒', true));
    tabBar.appendChild(createTabBtn('craft', 'Crafting', '🔨', false));
    tabBar.appendChild(createTabBtn('armor', 'Armor', '🛡️', false));
    this.panel.appendChild(tabBar);

    // Interactive Status / Action Banner (Clear Guidance for Touch Users)
    this.statusBanner = document.createElement('div');
    this.statusBanner.id = 'inv-status-banner';
    this.statusBanner.style.cssText = `
      width: 100%; box-sizing: border-box; padding: 6px 12px; border-radius: 4px;
      font-family: monospace; font-size: 12px; text-align: center;
      background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(255, 255, 255, 0.15);
      color: #e0e0e0; display: flex; align-items: center; justify-content: center; gap: 8px;
    `;
    this.statusBanner.innerHTML = '<span>💡 Ketuk sebuah item untuk memilih & memindahkannya</span>';
    this.panel.appendChild(this.statusBanner);

    // Body Columns Container (Side-by-Side on Desktop, Tabbed on Mobile)
    const bodyColumns = document.createElement('div');
    bodyColumns.className = 'inv-body-columns';

    // 1. Equipment / Armor Column (Far Left)
    this.armorColumnEl = document.createElement('div');
    this.armorColumnEl.className = 'inv-section-col';
    this.armorColumnEl.style.cssText = 'display: flex; flex-direction: column; gap: 8px; background: #8b8b8b; padding: 14px; border: 3px solid #373737; border-radius: 4px; box-sizing: border-box; align-items: center;';

    const armorTitle = document.createElement('div');
    armorTitle.style.cssText = 'font-family: monospace; font-size: 14px; color: #222; font-weight: bold; text-shadow: 1px 1px 0 #fff; margin-bottom: 4px; text-align: center;';
    armorTitle.textContent = '🛡️ Armor & Equipment';
    this.armorColumnEl.appendChild(armorTitle);

    const slotTypes: ArmorSlotType[] = ['helmet', 'chestplate', 'leggings', 'boots'];
    for (const slotType of slotTypes) {
      const slotEl = document.createElement('div');
      slotEl.className = 'inv-slot-box';
      slotEl.dataset.slotType = 'armor';
      slotEl.dataset.armorSlot = slotType;
      slotEl.style.cssText = `
        width: 56px; height: 56px; background: #8b8b8b;
        border-top: 3px solid #373737; border-left: 3px solid #373737;
        border-bottom: 3px solid #ffffff; border-right: 3px solid #ffffff;
        display: flex; align-items: center; justify-content: center;
        font-family: monospace; font-size: 12px; color: #fff; cursor: pointer;
        position: relative; border-radius: 2px; touch-action: manipulation;
      `;
      slotEl.addEventListener('mousedown', (e) => this.onArmorSlotClick(e, slotType));
      this.attachTouchListeners(slotEl, { type: 'armor', index: 0, armorSlot: slotType });
      slotEl.addEventListener('contextmenu', (e) => e.preventDefault());
      this.armorColumnEl.appendChild(slotEl);
      this.armorSlotEls[slotType] = slotEl;
    }
    bodyColumns.appendChild(this.armorColumnEl);

    // 2. Crafting Area (Middle Column)
    this.craftColumnEl = document.createElement('div');
    this.craftColumnEl.className = 'inv-section-col';
    this.craftColumnEl.style.cssText = 'display: flex; flex-direction: column; gap: 8px; align-items: center; background: #8b8b8b; padding: 14px; border: 3px solid #373737; border-radius: 4px; box-sizing: border-box;';

    const craftTitle = document.createElement('div');
    craftTitle.style.cssText = 'font-family: monospace; font-size: 14px; color: #222; font-weight: bold; text-shadow: 1px 1px 0 #fff; margin-bottom: 4px; text-align: center;';
    craftTitle.textContent = '🔨 Crafting Table (3x3)';
    this.craftColumnEl.appendChild(craftTitle);

    const craftContent = document.createElement('div');
    craftContent.style.cssText = 'display: flex; gap: 12px; align-items: center; justify-content: center;';

    const craftGridDiv = document.createElement('div');
    craftGridDiv.style.cssText = 'display: grid; grid-template-columns: repeat(3, 56px); gap: 4px; position: relative;';

    for (let i = 0; i < 9; i++) {
      const el = document.createElement('div');
      el.className = 'inv-slot-box';
      el.dataset.slotType = 'craft';
      el.style.cssText = `
        width: 56px; height: 56px; background: #8b8b8b;
        border-top: 3px solid #373737; border-left: 3px solid #373737;
        border-bottom: 3px solid #ffffff; border-right: 3px solid #ffffff;
        display: flex; align-items: center; justify-content: center;
        font-family: monospace; font-size: 12px; color: #fff; cursor: pointer;
        position: relative; border-radius: 2px; touch-action: manipulation;
      `;
      const r = Math.floor(i / 3), c = i % 3;
      el.addEventListener('mousedown', (e) => this.onCraftSlotClick(e, r, c));
      el.addEventListener('mouseenter', () => this.onSlotMouseEnterCraft(r, c, el));
      this.attachTouchListeners(el, { type: 'craft', index: i, r, c });
      el.addEventListener('contextmenu', (e) => e.preventDefault());
      craftGridDiv.appendChild(el);
      this.craftSlots.push(el);
    }
    craftContent.appendChild(craftGridDiv);

    const arrow = document.createElement('div');
    arrow.textContent = '➔';
    arrow.style.cssText = 'color: #373737; font-size: 32px; font-weight: bold; margin: 0 6px; text-shadow: 1px 1px 0 #fff;';
    craftContent.appendChild(arrow);

    this.craftOutput = document.createElement('div');
    this.craftOutput.className = 'inv-slot-box';
    this.craftOutput.dataset.slotType = 'output';
    this.craftOutput.style.cssText = `
      width: 64px; height: 64px; background: #8b8b8b;
      border-top: 3px solid #373737; border-left: 3px solid #373737;
      border-bottom: 3px solid #ffffff; border-right: 3px solid #ffffff;
      display: flex; align-items: center; justify-content: center;
      font-family: monospace; font-size: 12px; color: #fff; cursor: pointer; position: relative;
      border-radius: 4px; box-shadow: 0 0 10px rgba(255,204,0,0.6); touch-action: manipulation;
    `;
    this.craftOutput.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.takeOutput(e.shiftKey);
    });
    this.craftOutput.addEventListener(
      'touchend',
      (e) => {
        if (e.cancelable) e.preventDefault();
        this.takeOutput(false);
        AudioManager.getInstance().playSFX('break');
      },
      { passive: false }
    );
    this.craftOutput.addEventListener('contextmenu', (e) => e.preventDefault());
    craftContent.appendChild(this.craftOutput);
    this.craftColumnEl.appendChild(craftContent);
    bodyColumns.appendChild(this.craftColumnEl);

    // 3. Right side: Inventory Grid (27 slots) + Hotbar (9 slots)
    this.invColumnEl = document.createElement('div');
    this.invColumnEl.className = 'inv-section-col active-tab';
    this.invColumnEl.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

    const invTitle = document.createElement('div');
    invTitle.style.cssText = 'font-family: monospace; font-size: 14px; color: #222; font-weight: bold; text-shadow: 1px 1px 0 #fff;';
    invTitle.textContent = '🎒 Tas Karakter (27 Slot)';
    this.invColumnEl.appendChild(invTitle);

    const invGrid = document.createElement('div');
    invGrid.className = 'inv-grid-9';
    invGrid.style.cssText = 'display: grid; grid-template-columns: repeat(9, 56px); gap: 4px;';
    for (let i = 0; i < 27; i++) {
      invGrid.appendChild(this.makeSlot(i, false));
    }
    this.invColumnEl.appendChild(invGrid);

    const hotbarTitle = document.createElement('div');
    hotbarTitle.style.cssText = 'font-family: monospace; font-size: 14px; color: #222; font-weight: bold; margin-top: 4px; text-shadow: 1px 1px 0 #fff;';
    hotbarTitle.textContent = '⚡ Hotbar Aktif (9 Slot)';
    this.invColumnEl.appendChild(hotbarTitle);

    const hotbarRow = document.createElement('div');
    hotbarRow.className = 'inv-grid-9';
    hotbarRow.style.cssText = 'display: grid; grid-template-columns: repeat(9, 56px); gap: 4px;';
    for (let i = 0; i < 9; i++) {
      hotbarRow.appendChild(this.makeSlot(i, true));
    }
    this.invColumnEl.appendChild(hotbarRow);
    bodyColumns.appendChild(this.invColumnEl);

    this.panel.appendChild(bodyColumns);

    // Desktop Cursor Drag element (Mouse only)
    this.dragEl = document.createElement('div');
    this.dragEl.style.cssText = `
      position: fixed; pointer-events: none; z-index: 300; display: none;
      width: 56px; height: 56px; background: rgba(255,255,255,0.3);
      border: 2px solid #fff; font-family: monospace; font-size: 12px; color: #fff;
      align-items: center; justify-content: center; border-radius: 4px;
    `;
    document.body.appendChild(this.dragEl);

    // Tooltip
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.style.cssText = `
      position: fixed; pointer-events: none; z-index: 400; display: none;
      background: rgba(16, 0, 32, 0.95); border: 2px solid #5000ff; border-radius: 4px;
      padding: 8px 12px; font-family: monospace; font-size: 14px; color: #fff;
      box-shadow: 3px 3px 10px rgba(0,0,0,0.8); white-space: nowrap;
    `;
    document.body.appendChild(this.tooltipEl);

    // Stack Splitter Modal for Mobile
    this.createSplitModal();

    this.container.appendChild(this.panel);
    document.addEventListener('mousemove', this.onMouseMove);
  }

  private switchMobileTab(tab: 'inv' | 'craft' | 'armor'): void {
    this.currentMobileTab = tab;
    this.tabButtons.forEach((btn) => {
      if (btn.dataset.tab === tab) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    if (this.armorColumnEl) {
      if (tab === 'armor') this.armorColumnEl.classList.add('active-tab');
      else this.armorColumnEl.classList.remove('active-tab');
    }
    if (this.craftColumnEl) {
      if (tab === 'craft') this.craftColumnEl.classList.add('active-tab');
      else this.craftColumnEl.classList.remove('active-tab');
    }
    if (this.invColumnEl) {
      if (tab === 'inv') this.invColumnEl.classList.add('active-tab');
      else this.invColumnEl.classList.remove('active-tab');
    }
  }

  private makeSlot(slotIdx: number, isHotbar: boolean): HTMLDivElement {
    const el = document.createElement('div');
    el.className = 'inv-slot-box';
    el.dataset.slotType = 'slot';
    el.dataset.slotIdx = String(slotIdx);
    el.dataset.isHotbar = isHotbar ? 'true' : 'false';
    el.style.cssText = `
      width: 56px; height: 56px; background: #8b8b8b;
      border-top: 3px solid #373737; border-left: 3px solid #373737;
      border-bottom: 3px solid #ffffff; border-right: 3px solid #ffffff;
      display: flex; align-items: center; justify-content: center;
      font-family: monospace; font-size: 13px; color: #fff; cursor: pointer;
      position: relative; border-radius: 2px; touch-action: manipulation;
    `;
    el.addEventListener('mousedown', (e) => this.onSlotClick(e, slotIdx, isHotbar));
    el.addEventListener('mouseenter', () => this.onSlotMouseEnterInv(slotIdx, isHotbar, el));
    this.attachTouchListeners(el, { type: isHotbar ? 'hotbar' : 'inv', index: slotIdx });
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    return el;
  }

  /**
   * Pure Tap-to-Select and Long-Press Split listeners.
   * Completely excludes touchmove item dragging to prevent items getting stuck on mobile.
   */
  private attachTouchListeners(el: HTMLElement, slotInfo: SelectedSlotInfo): void {
    el.addEventListener(
      'touchstart',
      (e) => {
        this.isLongPressActive = false;
        if (e.touches.length === 1) {
          const t = e.touches[0];
          this.touchStartPos = { x: t.clientX, y: t.clientY };

          const itemData = this.getSlotItemData(slotInfo);
          if (itemData && itemData.count > 1) {
            this.touchTimer = window.setTimeout(() => {
              this.isLongPressActive = true;
              AudioManager.getInstance().playSFX('click');
              this.openSplitModal(slotInfo, itemData);
            }, 380);
          }
        }
      },
      { passive: true }
    );

    el.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches.length === 1) {
          const t = e.touches[0];
          const dist = Math.hypot(t.clientX - this.touchStartPos.x, t.clientY - this.touchStartPos.y);
          if (dist > 12 && this.touchTimer !== null) {
            clearTimeout(this.touchTimer);
            this.touchTimer = null;
          }
        }
      },
      { passive: true }
    );

    el.addEventListener(
      'touchend',
      (e) => {
        if (this.touchTimer !== null) {
          clearTimeout(this.touchTimer);
          this.touchTimer = null;
        }
        if (!this.isLongPressActive) {
          if (e.cancelable) e.preventDefault();
          this.handleSlotTouch(slotInfo, el);
        }
      },
      { passive: false }
    );
  }

  private getSlotItemData(slotInfo: SelectedSlotInfo): { itemId: string; count: number; durability?: number } | null {
    if (slotInfo.type === 'inv') {
      const s = this.inventory.slots[slotInfo.index];
      return s.itemId ? { itemId: s.itemId, count: s.count, durability: s.durability } : null;
    } else if (slotInfo.type === 'hotbar') {
      const s = this.hotbar.slots[slotInfo.index];
      return s.itemId ? { itemId: s.itemId, count: s.count, durability: s.durability } : null;
    } else if (slotInfo.type === 'craft' && slotInfo.r !== undefined && slotInfo.c !== undefined) {
      const s = this.craftGrid[slotInfo.r][slotInfo.c];
      return s ? { itemId: s.itemId, count: s.count } : null;
    } else if (slotInfo.type === 'armor' && slotInfo.armorSlot && this.equipmentSlots) {
      const s = this.equipmentSlots.getItem(slotInfo.armorSlot);
      return s.itemId ? { itemId: s.itemId, count: 1 } : null;
    }
    return null;
  }

  /** Touch Tap handler for selecting or transferring items */
  private handleSlotTouch(slotInfo: SelectedSlotInfo, el?: HTMLElement): void {
    const slotItem = this.getSlotItemData(slotInfo);

    if (this.selectedSlot === null) {
      // 1. No item currently selected -> select this slot if it contains an item
      if (slotItem) {
        this.selectedSlot = {
          ...slotInfo,
          count: slotItem.count,
          itemId: slotItem.itemId,
          durability: slotItem.durability,
        };
        AudioManager.getInstance().playSFX('click');
        this.refresh();
      }
    } else {
      // 2. A slot is already selected
      const isSameSlot =
        this.selectedSlot.type === slotInfo.type &&
        this.selectedSlot.index === slotInfo.index &&
        this.selectedSlot.r === slotInfo.r &&
        this.selectedSlot.c === slotInfo.c &&
        this.selectedSlot.armorSlot === slotInfo.armorSlot;

      if (isSameSlot) {
        // Tapped same slot -> deselect
        this.selectedSlot = null;
        AudioManager.getInstance().playSFX('click');
        this.refresh();
      } else {
        // Tapped a different slot -> execute transfer
        this.executeTouchTransfer(this.selectedSlot, slotInfo);
        if (el) {
          el.classList.add('inv-slot-pop');
          setTimeout(() => el.classList.remove('inv-slot-pop'), 220);
        }
        this.selectedSlot = null;
        this.refresh();
        AudioManager.getInstance().playSFX('place');
      }
    }
  }

  private executeTouchTransfer(src: SelectedSlotInfo, dest: SelectedSlotInfo): void {
    const srcData = this.getSlotItemData(src);
    if (!srcData) return;

    const transferAmount = src.count !== undefined && src.count > 0 ? Math.min(src.count, srcData.count) : srcData.count;
    const destData = this.getSlotItemData(dest);

    // Armor destination check
    if (dest.type === 'armor' && dest.armorSlot) {
      const itemDef = getItemById(srcData.itemId);
      if (itemDef?.armorSlot !== dest.armorSlot || !this.equipmentSlots) {
        return; // Incompatible armor slot
      }
      const oldArmor = this.equipmentSlots.equip(dest.armorSlot, srcData.itemId);
      this.deductFromSlot(src, 1);
      if (oldArmor && oldArmor.itemId) {
        this.addToSlot(src, oldArmor.itemId, 1);
      }
      return;
    }

    // Armor source check
    if (src.type === 'armor' && src.armorSlot && this.equipmentSlots) {
      if (destData && destData.itemId) {
        const destDef = getItemById(destData.itemId);
        if (destDef?.armorSlot === src.armorSlot) {
          // Swap armor
          this.equipmentSlots.equip(src.armorSlot, destData.itemId);
          this.setSlotItem(dest, srcData.itemId, 1);
        }
      } else {
        // Unequip to destination
        this.equipmentSlots.unequip(src.armorSlot);
        this.setSlotItem(dest, srcData.itemId, 1);
      }
      return;
    }

    // Standard Inventory / Hotbar / Crafting grid transfer
    if (!destData) {
      // Destination empty: move transferAmount
      this.setSlotItem(dest, srcData.itemId, transferAmount, srcData.durability);
      this.deductFromSlot(src, transferAmount);
    } else if (destData.itemId === srcData.itemId) {
      // Same item: combine stacks
      const maxStack = getItemById(srcData.itemId)?.maxStack ?? 64;
      const space = maxStack - destData.count;
      if (space > 0) {
        const added = Math.min(space, transferAmount);
        this.setSlotCount(dest, destData.count + added);
        this.deductFromSlot(src, added);
      }
    } else {
      // Different item: swap if moving entire stack
      if (transferAmount === srcData.count && src.type !== 'craft') {
        this.setSlotItem(dest, srcData.itemId, srcData.count, srcData.durability);
        this.setSlotItem(src, destData.itemId, destData.count, destData.durability);
      }
    }
  }

  private deductFromSlot(slotInfo: SelectedSlotInfo, amount: number): void {
    if (slotInfo.type === 'inv') {
      const s = this.inventory.slots[slotInfo.index];
      s.count -= amount;
      if (s.count <= 0) {
        s.itemId = null;
        s.count = 0;
        s.durability = undefined;
      }
    } else if (slotInfo.type === 'hotbar') {
      const s = this.hotbar.slots[slotInfo.index];
      s.count -= amount;
      if (s.count <= 0) {
        s.itemId = null;
        s.count = 0;
        s.durability = undefined;
      }
    } else if (slotInfo.type === 'craft' && slotInfo.r !== undefined && slotInfo.c !== undefined) {
      const s = this.craftGrid[slotInfo.r][slotInfo.c];
      if (s) {
        s.count -= amount;
        if (s.count <= 0) this.craftGrid[slotInfo.r][slotInfo.c] = null;
      }
    }
  }

  private addToSlot(slotInfo: SelectedSlotInfo, itemId: string, count: number, durability?: number): void {
    if (slotInfo.type === 'inv') {
      this.inventory.addItem(itemId, count, durability);
    } else if (slotInfo.type === 'hotbar') {
      this.hotbar.addItem(itemId, count, durability);
    }
  }

  private setSlotItem(slotInfo: SelectedSlotInfo, itemId: string, count: number, durability?: number): void {
    if (slotInfo.type === 'inv') {
      const s = this.inventory.slots[slotInfo.index];
      s.itemId = itemId;
      s.count = count;
      s.durability = durability;
    } else if (slotInfo.type === 'hotbar') {
      const s = this.hotbar.slots[slotInfo.index];
      s.itemId = itemId;
      s.count = count;
      s.durability = durability;
    } else if (slotInfo.type === 'craft' && slotInfo.r !== undefined && slotInfo.c !== undefined) {
      this.craftGrid[slotInfo.r][slotInfo.c] = { itemId, count };
    }
  }

  private setSlotCount(slotInfo: SelectedSlotInfo, count: number): void {
    if (slotInfo.type === 'inv') {
      this.inventory.slots[slotInfo.index].count = count;
    } else if (slotInfo.type === 'hotbar') {
      this.hotbar.slots[slotInfo.index].count = count;
    } else if (slotInfo.type === 'craft' && slotInfo.r !== undefined && slotInfo.c !== undefined) {
      const s = this.craftGrid[slotInfo.r][slotInfo.c];
      if (s) s.count = count;
    }
  }

  // ===================== STACK SPLITTER POPUP =====================
  private createSplitModal(): void {
    this.splitModal = document.createElement('div');
    this.splitModal.id = 'stack-split-modal';
    this.splitModal.style.cssText = `
      display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      z-index: 500; background: #22222e; border: 3px solid #ffcc00; border-radius: 8px;
      padding: 16px; color: #fff; width: 290px; max-width: 90vw; box-shadow: 0 12px 36px rgba(0,0,0,0.9);
      flex-direction: column; gap: 10px; font-family: monospace; user-select: none;
    `;

    this.splitModal.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #444; padding-bottom: 8px;">
        <div id="split-item-icon" style="width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;"></div>
        <div>
          <div id="split-item-name" style="font-weight: bold; font-size: 13px; color: #ffcc00;"></div>
          <div id="split-item-total" style="font-size: 11px; color: #aaa;"></div>
        </div>
      </div>
      
      <div style="text-align: center; margin: 4px 0;">
        <div style="font-size: 11px; color: #aaa; margin-bottom: 2px;">Jumlah yang Dipindah:</div>
        <div id="split-count-display" style="font-size: 22px; font-weight: bold; color: #00ffcc; text-shadow: 0 0 8px rgba(0,255,204,0.5);">1</div>
      </div>

      <input type="range" id="split-slider" min="1" max="64" value="1" style="width: 100%; cursor: pointer; accent-color: #00ffcc;">

      <div style="display: flex; gap: 6px; justify-content: center;">
        <button id="split-btn-1" style="flex: 1; padding: 6px 2px; font-size: 11px; font-weight: bold; background: #37474f; color: #fff; border: 1px solid #78909c; border-radius: 3px; cursor: pointer; touch-action: manipulation;">1 Saja</button>
        <button id="split-btn-half" style="flex: 1; padding: 6px 2px; font-size: 11px; font-weight: bold; background: #37474f; color: #fff; border: 1px solid #78909c; border-radius: 3px; cursor: pointer; touch-action: manipulation;">Setengah</button>
        <button id="split-btn-all" style="flex: 1; padding: 6px 2px; font-size: 11px; font-weight: bold; background: #37474f; color: #fff; border: 1px solid #78909c; border-radius: 3px; cursor: pointer; touch-action: manipulation;">Semua</button>
      </div>

      <div style="display: flex; gap: 8px; justify-content: center;">
        <button id="split-btn-dec" style="flex: 1; padding: 6px; font-size: 14px; font-weight: bold; background: #424242; color: #fff; border: 1px solid #616161; border-radius: 3px; cursor: pointer; touch-action: manipulation;">- 1</button>
        <button id="split-btn-inc" style="flex: 1; padding: 6px; font-size: 14px; font-weight: bold; background: #424242; color: #fff; border: 1px solid #616161; border-radius: 3px; cursor: pointer; touch-action: manipulation;">+ 1</button>
      </div>

      <div style="display: flex; gap: 8px; margin-top: 6px;">
        <button id="split-btn-confirm" style="flex: 1; background: #2e7d32; padding: 9px; font-size: 13px; font-weight: bold; border: 2px solid #81c784; border-radius: 4px; color: #fff; cursor: pointer; touch-action: manipulation;">✓ Pilih</button>
        <button id="split-btn-cancel" style="flex: 1; background: #c62828; padding: 9px; font-size: 13px; font-weight: bold; border: 2px solid #ef5350; border-radius: 4px; color: #fff; cursor: pointer; touch-action: manipulation;">✕ Batal</button>
      </div>
    `;

    document.body.appendChild(this.splitModal);
    this.wireSplitModalEvents();
  }

  private openSplitModal(slotInfo: SelectedSlotInfo, itemData: { itemId: string; count: number; durability?: number }): void {
    if (!this.splitModal) return;
    this.splitTarget = slotInfo;
    this.splitTotalCount = itemData.count;
    this.splitSelectedCount = Math.ceil(itemData.count / 2);

    const nameEl = this.splitModal.querySelector<HTMLDivElement>('#split-item-name');
    const totalEl = this.splitModal.querySelector<HTMLDivElement>('#split-item-total');
    const iconEl = this.splitModal.querySelector<HTMLDivElement>('#split-item-icon');
    const slider = this.splitModal.querySelector<HTMLInputElement>('#split-slider');

    const itemDef = getItemById(itemData.itemId);
    if (nameEl) nameEl.textContent = itemDef?.name ?? itemData.itemId;
    if (totalEl) totalEl.textContent = `Total di slot: ${itemData.count}`;
    if (iconEl) {
      iconEl.innerHTML = '';
      iconEl.appendChild(createItemIcon(itemData.itemId, 34));
    }
    if (slider) {
      slider.min = '1';
      slider.max = String(itemData.count);
      slider.value = String(this.splitSelectedCount);
    }

    this.updateSplitDisplay();
    this.splitModal.style.display = 'flex';
  }

  private updateSplitDisplay(): void {
    if (!this.splitModal) return;
    const countDisplay = this.splitModal.querySelector<HTMLDivElement>('#split-count-display');
    const slider = this.splitModal.querySelector<HTMLInputElement>('#split-slider');
    if (countDisplay) countDisplay.textContent = `${this.splitSelectedCount} / ${this.splitTotalCount}`;
    if (slider) slider.value = String(this.splitSelectedCount);
  }

  private wireSplitModalEvents(): void {
    if (!this.splitModal) return;

    const slider = this.splitModal.querySelector<HTMLInputElement>('#split-slider');
    slider?.addEventListener('input', () => {
      this.splitSelectedCount = parseInt(slider.value, 10);
      this.updateSplitDisplay();
    });

    const setQty = (qty: number) => {
      this.splitSelectedCount = Math.max(1, Math.min(this.splitTotalCount, qty));
      this.updateSplitDisplay();
      AudioManager.getInstance().playSFX('click');
    };

    this.splitModal.querySelector('#split-btn-1')?.addEventListener('click', () => setQty(1));
    this.splitModal.querySelector('#split-btn-half')?.addEventListener('click', () => setQty(Math.ceil(this.splitTotalCount / 2)));
    this.splitModal.querySelector('#split-btn-all')?.addEventListener('click', () => setQty(this.splitTotalCount));
    this.splitModal.querySelector('#split-btn-dec')?.addEventListener('click', () => setQty(this.splitSelectedCount - 1));
    this.splitModal.querySelector('#split-btn-inc')?.addEventListener('click', () => setQty(this.splitSelectedCount + 1));

    const confirmBtn = this.splitModal.querySelector('#split-btn-confirm');
    const onConfirm = (e?: Event) => {
      if (e && e.cancelable) e.preventDefault();
      if (this.splitTarget) {
        this.selectedSlot = {
          ...this.splitTarget,
          count: this.splitSelectedCount,
        };
      }
      this.closeSplitModal();
      this.refresh();
      AudioManager.getInstance().playSFX('click');
    };
    confirmBtn?.addEventListener('touchend', onConfirm, { passive: false });
    confirmBtn?.addEventListener('click', onConfirm);

    const cancelBtn = this.splitModal.querySelector('#split-btn-cancel');
    const onCancel = (e?: Event) => {
      if (e && e.cancelable) e.preventDefault();
      this.closeSplitModal();
    };
    cancelBtn?.addEventListener('touchend', onCancel, { passive: false });
    cancelBtn?.addEventListener('click', onCancel);
  }

  private closeSplitModal(): void {
    if (this.splitModal) this.splitModal.style.display = 'none';
    this.splitTarget = null;
  }

  // ===================== DESKTOP MOUSE INTERACTION (CP74) =====================
  private onArmorSlotClick(e: MouseEvent, slotType: ArmorSlotType): void {
    e.preventDefault();
    if (!this.equipmentSlots) return;

    const currentArmor = this.equipmentSlots.getItem(slotType);

    if (this.dragItem) {
      const itemMeta = getItemById(this.dragItem.itemId);
      if (itemMeta?.armorSlot === slotType) {
        const oldArmor = this.equipmentSlots.equip(slotType, this.dragItem.itemId);
        if (oldArmor && oldArmor.itemId) {
          this.dragItem = { itemId: oldArmor.itemId, count: 1 };
        } else {
          this.dragItem = null;
        }
      }
    } else if (currentArmor.itemId) {
      const unequipped = this.equipmentSlots.unequip(slotType);
      if (unequipped && unequipped.itemId) {
        this.dragItem = { itemId: unequipped.itemId, count: 1 };
      }
    }
    this.refresh();
  }

  private onSlotMouseEnterInv(slotIdx: number, isHotbar: boolean, el: HTMLElement): void {
    if (!this.dragItem || !this.isMouseDown || this.lastEnteredSlot === el) return;
    this.lastEnteredSlot = el;

    const slot = isHotbar ? this.hotbar.slots[slotIdx] : this.inventory.slots[slotIdx];
    if (this.isRightMouseDown) {
      if (slot.itemId === null) {
        slot.itemId = this.dragItem.itemId;
        slot.count = 1;
        slot.durability = this.dragItem.durability;
        this.dragItem.count--;
        if (this.dragItem.count <= 0) this.dragItem = null;
      } else if (slot.itemId === this.dragItem.itemId) {
        const max = getItemById(slot.itemId)?.maxStack ?? 64;
        if (slot.count < max) {
          slot.count++;
          this.dragItem.count--;
          if (this.dragItem.count <= 0) this.dragItem = null;
        }
      }
      this.refresh();
    }
  }

  private onSlotMouseEnterCraft(r: number, c: number, el: HTMLElement): void {
    if (!this.dragItem || !this.isMouseDown || this.lastEnteredSlot === el) return;
    this.lastEnteredSlot = el;

    const current = this.craftGrid[r][c];
    if (this.isRightMouseDown) {
      if (!current) {
        this.craftGrid[r][c] = { itemId: this.dragItem.itemId, count: 1 };
        this.dragItem.count--;
        if (this.dragItem.count <= 0) this.dragItem = null;
      } else if (current.itemId === this.dragItem.itemId) {
        const max = getItemById(current.itemId)?.maxStack ?? 64;
        if (current.count < max) {
          slotCountPlus(current);
          this.dragItem.count--;
          if (this.dragItem.count <= 0) this.dragItem = null;
        }
      }
      this.refresh();
    }
  }

  private onSlotClick(e: MouseEvent, slotIdx: number, isHotbar: boolean): void {
    e.preventDefault();
    const slot = isHotbar ? this.hotbar.slots[slotIdx] : this.inventory.slots[slotIdx];

    if (e.shiftKey && slot.itemId) {
      const itemMeta = getItemById(slot.itemId);
      if (itemMeta?.armorSlot && this.equipmentSlots) {
        const equipped = this.equipmentSlots.equip(itemMeta.armorSlot, slot.itemId);
        if (equipped && equipped.itemId) {
          slot.itemId = equipped.itemId;
          slot.count = 1;
        } else {
          slot.itemId = null;
          slot.count = 0;
        }
        this.refresh();
        return;
      }
      if (isHotbar) {
        const rem = this.inventory.addItem(slot.itemId, slot.count, slot.durability);
        slot.count = rem;
        if (rem <= 0) slot.itemId = null;
      } else {
        const rem = this.hotbar.addItem(slot.itemId, slot.count, slot.durability);
        slot.count = rem;
        if (rem <= 0) slot.itemId = null;
      }
      this.refresh();
      return;
    }

    const isRightClick = e.button === 2;

    if (this.dragItem) {
      if (isRightClick) {
        if (slot.itemId === null) {
          slot.itemId = this.dragItem.itemId;
          slot.count = 1;
          slot.durability = this.dragItem.durability;
          this.dragItem.count--;
          if (this.dragItem.count <= 0) this.dragItem = null;
        } else if (slot.itemId === this.dragItem.itemId) {
          const max = getItemById(slot.itemId)?.maxStack ?? 64;
          if (slot.count < max) {
            slot.count++;
            this.dragItem.count--;
            if (this.dragItem.count <= 0) this.dragItem = null;
          }
        }
      } else {
        if (slot.itemId === null) {
          slot.itemId = this.dragItem.itemId;
          slot.count = this.dragItem.count;
          slot.durability = this.dragItem.durability;
          this.dragItem = null;
        } else if (slot.itemId === this.dragItem.itemId) {
          const max = getItemById(slot.itemId)?.maxStack ?? 64;
          const space = max - slot.count;
          if (space > 0) {
            const add = Math.min(space, this.dragItem.count);
            slot.count += add;
            this.dragItem.count -= add;
            if (this.dragItem.count <= 0) this.dragItem = null;
          }
        } else {
          const tmp = { itemId: slot.itemId, count: slot.count, durability: slot.durability };
          slot.itemId = this.dragItem.itemId;
          slot.count = this.dragItem.count;
          slot.durability = this.dragItem.durability;
          this.dragItem = tmp;
        }
      }
    } else if (slot.itemId) {
      if (isRightClick && slot.count > 1) {
        const half = Math.ceil(slot.count / 2);
        this.dragItem = { itemId: slot.itemId, count: half, durability: slot.durability };
        slot.count -= half;
      } else {
        this.dragItem = { itemId: slot.itemId, count: slot.count, durability: slot.durability };
        slot.itemId = null;
        slot.count = 0;
      }
    }
    this.refresh();
  }

  private onCraftSlotClick(e: MouseEvent, r: number, c: number): void {
    e.preventDefault();
    const current = this.craftGrid[r][c];
    const isRightClick = e.button === 2;

    if (this.dragItem) {
      if (!current) {
        if (isRightClick) {
          this.craftGrid[r][c] = { itemId: this.dragItem.itemId, count: 1 };
          this.dragItem.count--;
          if (this.dragItem.count <= 0) this.dragItem = null;
        } else {
          this.craftGrid[r][c] = { itemId: this.dragItem.itemId, count: this.dragItem.count };
          this.dragItem = null;
        }
      } else if (current.itemId === this.dragItem.itemId) {
        const max = getItemById(current.itemId)?.maxStack ?? 64;
        if (isRightClick) {
          if (current.count < max) {
            current.count++;
            this.dragItem.count--;
            if (this.dragItem.count <= 0) this.dragItem = null;
          }
        } else {
          const space = max - current.count;
          const add = Math.min(space, this.dragItem.count);
          current.count += add;
          this.dragItem.count -= add;
          if (this.dragItem.count <= 0) this.dragItem = null;
        }
      } else {
        const tmp = current;
        this.craftGrid[r][c] = { itemId: this.dragItem.itemId, count: this.dragItem.count };
        this.dragItem = { itemId: tmp.itemId, count: tmp.count };
      }
    } else if (current) {
      if (isRightClick && current.count > 1) {
        const half = Math.ceil(current.count / 2);
        this.dragItem = { itemId: current.itemId, count: half };
        current.count -= half;
      } else {
        this.dragItem = { itemId: current.itemId, count: current.count };
        this.craftGrid[r][c] = null;
      }
    }
    this.refresh();
  }

  private getSimpleCraftGridIds(): (string | null)[][] {
    return this.craftGrid.map((row) => row.map((cell) => (cell ? cell.itemId : null)));
  }

  private takeOutput(isShiftKey = false): void {
    const simpleGrid = this.getSimpleCraftGridIds();
    const recipe = checkRecipe(simpleGrid);
    if (!recipe) return;

    let maxBatches = 64;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (this.craftGrid[r][c]) {
          maxBatches = Math.min(maxBatches, this.craftGrid[r][c]!.count);
        }
      }
    }

    const maxStack = getItemById(recipe.result.itemId)?.maxStack ?? 64;

    if (isShiftKey || maxBatches > 1) {
      const maxPossibleBatches = Math.min(maxBatches, Math.floor(maxStack / recipe.result.count));
      const totalYield = maxPossibleBatches * recipe.result.count;

      if (totalYield > 0) {
        let rem = this.inventory.addItem(recipe.result.itemId, totalYield);
        if (rem > 0) {
          rem = this.hotbar.addItem(recipe.result.itemId, rem);
        }
        if (rem > 0) {
          if (this.dragItem && this.dragItem.itemId === recipe.result.itemId) {
            this.dragItem.count += rem;
          } else if (!this.dragItem) {
            this.dragItem = { itemId: recipe.result.itemId, count: rem };
          }
        }
        this.consumeCraftGrid(maxPossibleBatches);
      }
    } else {
      if (this.dragItem) {
        if (this.dragItem.itemId === recipe.result.itemId) {
          if (this.dragItem.count + recipe.result.count <= maxStack) {
            this.dragItem.count += recipe.result.count;
            this.consumeCraftGrid(1);
          }
        }
      } else {
        let rem = this.inventory.addItem(recipe.result.itemId, recipe.result.count);
        if (rem > 0) rem = this.hotbar.addItem(recipe.result.itemId, rem);
        if (rem > 0) this.dragItem = { itemId: recipe.result.itemId, count: rem };
        this.consumeCraftGrid(1);
      }
    }
    this.refresh();
  }

  private consumeCraftGrid(amount = 1): void {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const slot = this.craftGrid[r][c];
        if (slot) {
          slot.count -= amount;
          if (slot.count <= 0) {
            this.craftGrid[r][c] = null;
          }
        }
      }
    }
  }

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.visible) {
      if (this.dragEl) this.dragEl.style.display = 'none';
      if (this.tooltipEl) this.tooltipEl.style.display = 'none';
      return;
    }

    if (this.dragItem) {
      if (this.tooltipEl) this.tooltipEl.style.display = 'none';
      if (this.dragEl) {
        this.dragEl.style.display = 'flex';
        this.dragEl.style.left = `${e.clientX - 28}px`;
        this.dragEl.style.top = `${e.clientY - 28}px`;
        this.dragEl.textContent = '';
        if (this.dragItem.itemId) {
          const icon = createItemIcon(this.dragItem.itemId, 38);
          this.dragEl.appendChild(icon);
          if (this.dragItem.count > 1) {
            const c = document.createElement('span');
            c.style.cssText = 'position:absolute;bottom:2px;right:4px;font-size:13px;font-weight:bold;color:#fff;text-shadow:2px 2px 0 #000;';
            c.textContent = String(this.dragItem.count);
            this.dragEl.appendChild(c);
          }
        }
      }
    } else {
      if (this.dragEl) this.dragEl.style.display = 'none';
    }
  };

  show(): void {
    this.visible = true;
    if (this.container) this.container.style.display = 'flex';
    this.selectedSlot = null;
    this.switchMobileTab(this.currentMobileTab);
    this.refresh();
  }

  open(): void {
    this.show();
  }

  hide(): void {
    this.visible = false;
    if (this.container) this.container.style.display = 'none';
    if (this.dragEl) this.dragEl.style.display = 'none';
    if (this.tooltipEl) this.tooltipEl.style.display = 'none';
    this.closeSplitModal();
    this.selectedSlot = null;
    this.returnCraftGridToInventory();
    this.onClose?.();
  }

  close(): void {
    this.hide();
  }

  toggle(): void {
    if (this.visible) this.hide();
    else this.show();
  }

  private returnCraftGridToInventory(): void {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const slot = this.craftGrid[r][c];
        if (slot) {
          let rem = this.inventory.addItem(slot.itemId, slot.count);
          if (rem > 0) this.hotbar.addItem(slot.itemId, rem);
          this.craftGrid[r][c] = null;
        }
      }
    }
    if (this.dragItem) {
      let rem = this.inventory.addItem(this.dragItem.itemId, this.dragItem.count, this.dragItem.durability);
      if (rem > 0) this.hotbar.addItem(this.dragItem.itemId, rem, this.dragItem.durability);
      this.dragItem = null;
    }
  }

  refresh(): void {
    if (!this.container || !this.panel) return;

    // Toggle .inv-has-selection class on panel for dimming non-selected slots
    if (this.selectedSlot !== null) {
      this.panel.classList.add('inv-has-selection');
    } else {
      this.panel.classList.remove('inv-has-selection');
    }

    // Update Status Banner
    if (this.statusBanner) {
      if (this.selectedSlot !== null) {
        const itemDef = this.selectedSlot.itemId ? getItemById(this.selectedSlot.itemId) : null;
        const name = itemDef?.name ?? this.selectedSlot.itemId ?? 'Item';
        const count = this.selectedSlot.count ?? 1;
        this.statusBanner.style.background = 'rgba(46, 125, 50, 0.4)';
        this.statusBanner.style.borderColor = '#81c784';
        this.statusBanner.style.color = '#e8f5e9';
        this.statusBanner.innerHTML = `
          <span>👉 Memilih: <b style="color:#ffeb3b;">${count}x ${name}</b>. Ketuk slot tujuan untuk memindahkan.</span>
          <button id="banner-cancel-btn" style="background:#c62828; color:#fff; border:1px solid #ffcdd2; border-radius:3px; padding:2px 8px; font-size:11px; cursor:pointer; touch-action:manipulation;">✕ Batal</button>
        `;
        const cancelBtn = this.statusBanner.querySelector('#banner-cancel-btn');
        const onCancel = (e?: Event) => {
          if (e && e.cancelable) e.preventDefault();
          this.selectedSlot = null;
          this.refresh();
          AudioManager.getInstance().playSFX('click');
        };
        cancelBtn?.addEventListener('touchend', onCancel, { passive: false });
        cancelBtn?.addEventListener('click', onCancel);
      } else {
        this.statusBanner.style.background = 'rgba(0, 0, 0, 0.35)';
        this.statusBanner.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        this.statusBanner.style.color = '#e0e0e0';
        this.statusBanner.innerHTML = '<span>💡 Ketuk sebuah item untuk memilih & memindahkannya</span>';
      }
    }

    // Refresh Armor slots
    if (this.equipmentSlots) {
      const slotTypes: ArmorSlotType[] = ['helmet', 'chestplate', 'leggings', 'boots'];
      for (const slotType of slotTypes) {
        const slotEl = this.armorSlotEls[slotType];
        if (!slotEl) continue;
        slotEl.innerHTML = '';
        const isSelected = this.selectedSlot?.type === 'armor' && this.selectedSlot.armorSlot === slotType;
        if (isSelected) slotEl.classList.add('inv-slot-selected');
        else slotEl.classList.remove('inv-slot-selected');

        const item = this.equipmentSlots.getItem(slotType);
        if (item && item.itemId) {
          slotEl.appendChild(createItemIcon(item.itemId, 38));
        } else {
          slotEl.textContent = slotType.substring(0, 3).toUpperCase();
        }
      }
    }

    // Refresh Crafting 3x3 Grid
    for (let i = 0; i < 9; i++) {
      const r = Math.floor(i / 3), c = i % 3;
      const el = this.craftSlots[i];
      if (!el) continue;
      el.innerHTML = '';

      const isSelected = this.selectedSlot?.type === 'craft' && this.selectedSlot.r === r && this.selectedSlot.c === c;
      if (isSelected) el.classList.add('inv-slot-selected');
      else el.classList.remove('inv-slot-selected');

      const item = this.craftGrid[r][c];
      if (item) {
        el.appendChild(createItemIcon(item.itemId, 38));
        if (item.count > 1) {
          const countSpan = document.createElement('span');
          countSpan.style.cssText = 'position:absolute;bottom:2px;right:4px;font-size:12px;font-weight:bold;color:#fff;text-shadow:1px 1px 0 #000;';
          countSpan.textContent = isSelected && this.selectedSlot?.count ? `${this.selectedSlot.count}/${item.count}` : String(item.count);
          el.appendChild(countSpan);
        }
      }
    }

    // Refresh Output Slot
    if (this.craftOutput) {
      this.craftOutput.innerHTML = '';
      const simpleGrid = this.getSimpleCraftGridIds();
      const recipe = checkRecipe(simpleGrid);
      if (recipe) {
        let maxBatches = 64;
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            if (this.craftGrid[r][c]) {
              maxBatches = Math.min(maxBatches, this.craftGrid[r][c]!.count);
            }
          }
        }
        const yieldCount = recipe.result.count * (maxBatches > 1 ? maxBatches : 1);

        this.craftOutput.appendChild(createItemIcon(recipe.result.itemId, 44));
        const countSpan = document.createElement('span');
        countSpan.style.cssText = 'position:absolute;bottom:2px;right:4px;font-size:13px;font-weight:bold;color:#ffcc00;text-shadow:1px 1px 0 #000;';
        countSpan.textContent = String(yieldCount);
        this.craftOutput.appendChild(countSpan);
      }
    }

    // Refresh Inventory and Hotbar slots
    const invSlots = this.container.querySelectorAll<HTMLDivElement>('[data-slot-type="slot"]');
    invSlots.forEach((el, idx) => {
      const isHotbar = el.dataset.isHotbar === 'true';
      const slotIdx = parseInt(el.dataset.slotIdx ?? String(idx), 10);
      const slot = isHotbar ? this.hotbar.slots[slotIdx] : this.inventory.slots[slotIdx];
      el.innerHTML = '';

      const isSelected = this.selectedSlot && (isHotbar ? this.selectedSlot.type === 'hotbar' : this.selectedSlot.type === 'inv') && this.selectedSlot.index === slotIdx;
      if (isSelected) el.classList.add('inv-slot-selected');
      else el.classList.remove('inv-slot-selected');

      if (slot.itemId) {
        el.appendChild(createItemIcon(slot.itemId, 38));
        if (slot.count > 1) {
          const c = document.createElement('span');
          c.style.cssText = 'position:absolute;bottom:2px;right:4px;font-size:12px;font-weight:bold;color:#fff;text-shadow:1px 1px 0 #000;';
          c.textContent = isSelected && this.selectedSlot?.count ? `${this.selectedSlot.count}/${slot.count}` : String(slot.count);
          el.appendChild(c);
        }

        // Durability bar if tool/armor
        const itemDef = getItemById(slot.itemId);
        if (itemDef?.maxDurability && slot.durability !== undefined) {
          const ratio = Math.max(0, Math.min(1, slot.durability / itemDef.maxDurability));
          const color = ratio > 0.5 ? '#4caf50' : ratio > 0.2 ? '#ffeb3b' : '#f44336';
          const durBar = document.createElement('div');
          durBar.style.cssText = `
            position: absolute; bottom: 2px; left: 4px; width: 44px; height: 3px;
            background: rgba(0,0,0,0.7); border-radius: 1px; overflow: hidden;
          `;
          const fill = document.createElement('div');
          fill.style.cssText = `height: 100%; width: ${ratio * 100}%; background: ${color};`;
          durBar.appendChild(fill);
          el.appendChild(durBar);
        }
      }
    });
  }
}

function slotCountPlus(slot: CraftGridSlot): void {
  slot.count++;
}
