import { getItemById } from '../inventory/ItemRegistry';
import type { Inventory } from '../inventory/Inventory';
import type { Hotbar } from '../inventory/Hotbar';
import { FurnaceManager, type FurnaceData } from '../inventory/FurnaceManager';
import { AudioManager } from '../audio/AudioManager';

export class FurnaceScreen {
  private container: HTMLDivElement;
  private inventory: Inventory;
  private hotbar: Hotbar;
  private isOpen = false;
  private currentCoordKey: { x: number; y: number; z: number } | null = null;
  private currentFurnaceData: FurnaceData | null = null;
  private updateInterval: number | null = null;

  // Recipe lookup table: Input -> Output
  private static SMELT_RECIPES: Record<string, string> = {
    raw_iron: 'iron_ingot',
    raw_beef: 'cooked_beef',
    beef: 'cooked_beef',
    raw_porkchop: 'cooked_porkchop',
    raw_chicken: 'cooked_chicken',
    mutton: 'cooked_mutton',
  };

  // Fuel duration lookup table (in seconds)
  private static FUEL_VALUES: Record<string, number> = {
    coal: 80,
    wood_log: 15,
    plank: 10,
    stick: 5,
  };

  constructor(inventory: Inventory, hotbar: Hotbar) {
    this.inventory = inventory;
    this.hotbar = hotbar;

    this.container = document.createElement('div');
    this.container.id = 'furnace-screen';
    this.container.className = 'ui-modal hidden';
    this.container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 440px;
      background: rgba(30, 30, 35, 0.95);
      border: 3px solid #5d4037;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8);
      z-index: 1000;
      color: #fff;
      font-family: 'Segoe UI', Tahoma, sans-serif;
      display: none;
    `;
    document.body.appendChild(this.container);
  }

  /** Generate a small inline HTML string for an item icon (colored label) */
  private iconHTML(itemId: string): string {
    const item = getItemById(itemId);
    const name = item ? item.name : itemId;
    return `<span style="font-size: 11px; font-weight: bold; color: #fff; text-shadow: 1px 1px 2px #000; pointer-events: none;">${name}</span>`;
  }

  public open(x: number, y: number, z: number): void {
    this.currentCoordKey = { x, y, z };
    this.currentFurnaceData = FurnaceManager.getInstance().getFurnaceData(x, y, z);
    this.isOpen = true;
    this.container.style.display = 'block';

    this.render();
    this.startFurnaceLoop();

    // Request pointer lock exit to interact with UI
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  public close(): void {
    this.isOpen = false;
    this.container.style.display = 'none';
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.currentCoordKey = null;
    this.currentFurnaceData = null;
  }

  public getIsOpen(): boolean {
    return this.isOpen;
  }

  /** Returns the world coordinates of the currently open furnace, or null */
  public getCurrentCoord(): { x: number; y: number; z: number } | null {
    return this.currentCoordKey;
  }

  private startFurnaceLoop(): void {
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = window.setInterval(() => {
      if (!this.currentFurnaceData) return;
      this.processFurnaceTick(0.5);
      if (this.isOpen) {
        this.render();
      }
    }, 500);
  }

  private processFurnaceTick(deltaSec: number): void {
    const data = this.currentFurnaceData;
    if (!data) return;

    const inputItem = data.input.itemId;
    const outputRecipe = inputItem ? FurnaceScreen.SMELT_RECIPES[inputItem] : null;

    // 1. If currently burning fuel, reduce burn timer
    if (data.fuelTime > 0) {
      data.fuelTime -= deltaSec;
      if (data.fuelTime < 0) data.fuelTime = 0;
    }

    // 2. If valid input and not burning fuel, check if we can consume new fuel item
    if (outputRecipe && data.input.count > 0 && data.fuelTime <= 0) {
      const fuelItem = data.fuel.itemId;
      const fuelDuration = fuelItem ? FurnaceScreen.FUEL_VALUES[fuelItem] : null;

      if (fuelDuration && data.fuel.count > 0) {
        // Can output fit?
        const canOutputFit =
          data.output.count === 0 ||
          (data.output.itemId === outputRecipe && data.output.count < 64);

        if (canOutputFit) {
          data.fuelTime = fuelDuration;
          data.maxFuelTime = fuelDuration;
          data.fuel.count--;
          if (data.fuel.count <= 0) {
            data.fuel.itemId = null;
            data.fuel.count = 0;
          }
        }
      }
    }

    // 3. Process cooking / smelting progress if fuel is burning and recipe is valid
    if (data.fuelTime > 0 && outputRecipe && data.input.count > 0) {
      const canOutputFit =
        data.output.count === 0 ||
        (data.output.itemId === outputRecipe && data.output.count < 64);

      if (canOutputFit) {
        data.cookProgress += deltaSec * 20; // Takes ~5 seconds per smelt (100 / 20)
        if (data.cookProgress >= 100) {
          data.cookProgress = 0;
          data.input.count--;
          if (data.input.count <= 0) {
            data.input.itemId = null;
            data.input.count = 0;
          }

          if (data.output.count === 0) {
            data.output.itemId = outputRecipe;
            data.output.count = 1;
          } else {
            data.output.count++;
          }
          AudioManager.getInstance().playSFX('break');
        }
      } else {
        data.cookProgress = 0;
      }
    } else {
      // Cooldown progress if invalid
      if (data.cookProgress > 0) {
        data.cookProgress = Math.max(0, data.cookProgress - deltaSec * 30);
      }
    }
  }

  private render(): void {
    if (!this.currentFurnaceData) return;
    const data = this.currentFurnaceData;

    const inputItem = data.input.itemId ? getItemById(data.input.itemId) : null;
    const fuelItem = data.fuel.itemId ? getItemById(data.fuel.itemId) : null;
    const outputItem = data.output.itemId ? getItemById(data.output.itemId) : null;

    const fuelPct = data.maxFuelTime > 0 ? (data.fuelTime / data.maxFuelTime) * 100 : 0;
    const cookPct = data.cookProgress;

    this.container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="margin: 0; font-size: 20px; color: #ffcc80;">🔥 Furnace</h2>
        <button id="furnace-close-btn" style="background: none; border: none; color: #aaa; font-size: 22px; cursor: pointer;">&times;</button>
      </div>

      <!-- FURNACE WORKSPACE -->
      <div style="display: flex; align-items: center; justify-content: space-around; background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
        
        <!-- LEFT: INPUT & FUEL SLOTS -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
          <!-- INPUT SLOT -->
          <div id="furnace-slot-input" style="width: 52px; height: 52px; background: rgba(0,0,0,0.5); border: 2px solid ${inputItem ? '#81c784' : '#555'}; border-radius: 6px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer;">
            ${inputItem ? this.iconHTML(inputItem.id) : '<span style="color: #666; font-size: 11px;">Input</span>'}
            ${data.input.count > 1 ? `<span style="position: absolute; bottom: 2px; right: 4px; font-weight: bold; font-size: 12px; text-shadow: 1px 1px 2px #000;">${data.input.count}</span>` : ''}
          </div>

          <!-- FIRE / FUEL BURN INDICATOR -->
          <div style="width: 24px; height: 16px; background: #333; border-radius: 4px; overflow: hidden; position: relative;" title="Fuel Burn: ${Math.round(fuelPct)}%">
            <div style="width: 100%; height: ${fuelPct}%; background: linear-gradient(to top, #ff3d00, #ffea00); position: absolute; bottom: 0; transition: height 0.3s;"></div>
          </div>

          <!-- FUEL SLOT -->
          <div id="furnace-slot-fuel" style="width: 52px; height: 52px; background: rgba(0,0,0,0.5); border: 2px solid ${fuelItem ? '#ff7043' : '#555'}; border-radius: 6px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer;">
            ${fuelItem ? this.iconHTML(fuelItem.id) : '<span style="color: #666; font-size: 11px;">Fuel</span>'}
            ${data.fuel.count > 1 ? `<span style="position: absolute; bottom: 2px; right: 4px; font-weight: bold; font-size: 12px; text-shadow: 1px 1px 2px #000;">${data.fuel.count}</span>` : ''}
          </div>
        </div>

        <!-- MIDDLE: PROGRESS ARROW (CP-244) -->
        <div style="display: flex; flex-direction: column; align-items: center; width: 60px;">
          <div style="width: 50px; height: 14px; background: #333; border-radius: 7px; overflow: hidden; position: relative; border: 1px solid #444;">
            <div style="width: ${cookPct}%; height: 100%; background: linear-gradient(to right, #4caf50, #81c784); transition: width 0.3s;"></div>
          </div>
          <span style="font-size: 10px; color: #aaa; margin-top: 4px;">${Math.round(cookPct)}%</span>
        </div>

        <!-- RIGHT: OUTPUT SLOT -->
        <div id="furnace-slot-output" style="width: 64px; height: 64px; background: rgba(0,0,0,0.6); border: 3px solid ${outputItem ? '#ffd54f' : '#777'}; border-radius: 8px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer;">
          ${outputItem ? this.iconHTML(outputItem.id) : '<span style="color: #666; font-size: 12px;">Result</span>'}
          ${data.output.count > 0 ? `<span style="position: absolute; bottom: 2px; right: 6px; font-weight: bold; font-size: 14px; color: #fff; text-shadow: 1px 1px 2px #000;">${data.output.count}</span>` : ''}
        </div>
      </div>

      <div style="font-size: 12px; color: #888; text-align: center; margin-bottom: 8px;">Klik slot Furnace atau slot Inventory di bawah untuk memindahkan item</div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const closeBtn = this.container.querySelector('#furnace-close-btn');
    closeBtn?.addEventListener('click', () => this.close());

    const inputSlot = this.container.querySelector('#furnace-slot-input');
    inputSlot?.addEventListener('click', () => this.handleSlotClick('input'));

    const fuelSlot = this.container.querySelector('#furnace-slot-fuel');
    fuelSlot?.addEventListener('click', () => this.handleSlotClick('fuel'));

    const outputSlot = this.container.querySelector('#furnace-slot-output');
    outputSlot?.addEventListener('click', () => this.handleSlotClick('output'));
  }

  private handleSlotClick(slotType: 'input' | 'fuel' | 'output'): void {
    if (!this.currentFurnaceData) return;
    const data = this.currentFurnaceData;

    if (slotType === 'output') {
      // Collect output to player inventory/hotbar
      if (data.output.itemId && data.output.count > 0) {
        const itemToGive = data.output.itemId;
        const countToGive = data.output.count;

        const remainder = this.hotbar.addItem(itemToGive, countToGive);
        if (remainder === 0) {
          data.output.itemId = null;
          data.output.count = 0;
        } else {
          // Overflow to inventory
          const invRem = this.inventory.addItem(itemToGive, remainder as number);
          if (invRem === 0) {
            data.output.itemId = null;
            data.output.count = 0;
          } else {
            data.output.count = invRem as number;
          }
        }
        AudioManager.getInstance().playSFX('break');
        this.render();
      }
    } else if (slotType === 'input') {
      // If input slot is empty, take active item from hotbar if valid
      if (data.input.count === 0) {
        const activeItem = this.hotbar.getActiveItem();
        if (activeItem.itemId && FurnaceScreen.SMELT_RECIPES[activeItem.itemId]) {
          data.input.itemId = activeItem.itemId;
          data.input.count = activeItem.count;
          this.hotbar.removeItem(activeItem.itemId, activeItem.count);
          this.render();
        }
      } else {
        // Return input item to player
        const itemToGive = data.input.itemId!;
        const countToGive = data.input.count;
        if (this.hotbar.addItem(itemToGive, countToGive)) {
          data.input.itemId = null;
          data.input.count = 0;
          this.render();
        }
      }
    } else if (slotType === 'fuel') {
      // If fuel slot is empty, take active fuel item from hotbar
      if (data.fuel.count === 0) {
        const activeItem = this.hotbar.getActiveItem();
        if (activeItem.itemId && FurnaceScreen.FUEL_VALUES[activeItem.itemId]) {
          data.fuel.itemId = activeItem.itemId;
          data.fuel.count = activeItem.count;
          this.hotbar.removeItem(activeItem.itemId, activeItem.count);
          this.render();
        }
      } else {
        // Return fuel item to player
        const itemToGive = data.fuel.itemId!;
        const countToGive = data.fuel.count;
        if (this.hotbar.addItem(itemToGive, countToGive)) {
          data.fuel.itemId = null;
          data.fuel.count = 0;
          this.render();
        }
      }
    }
  }
}
