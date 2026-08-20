import { Inventory } from '../inventory/Inventory';
import { Hotbar } from '../inventory/Hotbar';
import { getItemById } from '../inventory/ItemRegistry';
import { createItemIcon } from './IconGenerator';
import { GENERIC_TRADE_RECIPES, type TradeRecipe } from '../economy/TradeTable';
import { VillagerTradingManager } from '../economy/VillagerTrading';
import type { Villager } from '../mobs/npc/Villager';
import { ToastSystem } from './ToastSystem';
import { AudioManager } from '../audio/AudioManager';
import { ParticleSystem } from '../world/ParticleSystem';
import * as THREE from 'three';

export class TradingScreen {
  private container: HTMLDivElement | null = null;
  private visible = false;
  private currentVillager: Villager | null = null;
  private readonly inventory: Inventory;
  private readonly hotbar: Hotbar;
  private particleSystem?: ParticleSystem;
  private animationFrameId: number | null = null;
  public onClose: (() => void) | null = null;

  constructor(inventory: Inventory, hotbar: Hotbar, particleSystem?: ParticleSystem) {
    this.inventory = inventory;
    this.hotbar = hotbar;
    this.particleSystem = particleSystem;
  }

  get isOpen(): boolean {
    return this.visible;
  }

  setParticleSystem(particleSystem: ParticleSystem): void {
    this.particleSystem = particleSystem;
  }

  open(villager: Villager): void {
    this.currentVillager = villager;
    this.visible = true;
    if (this.container) {
      this.container.style.display = 'flex';
    }
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    this.refresh();
    this.startUpdateLoop();
  }

  close(): void {
    this.visible = false;
    this.currentVillager = null;
    if (this.container) {
      this.container.style.display = 'none';
    }
    this.stopUpdateLoop();
    this.onClose?.();
  }

  create(): void {
    this.container = document.createElement('div');
    this.container.id = 'trading-screen';
    this.container.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(8px);
      display: none; align-items: center; justify-content: center;
      z-index: 320; font-family: monospace; user-select: none;
    `;

    const tradingStyle = document.createElement('style');
    tradingStyle.textContent = `
      #trading-panel {
        max-width: 96vw;
        max-height: 94vh;
        overflow-y: auto;
        box-sizing: border-box;
        transition: transform 0.15s ease;
      }
      @media (max-width: 600px), (max-height: 550px) {
        #trading-panel {
          transform: scale(0.82);
          transform-origin: center center;
        }
      }
      @media (max-width: 480px), (max-height: 440px) {
        #trading-panel {
          transform: scale(0.70);
          transform-origin: center center;
        }
      }
    `;
    document.head.appendChild(tradingStyle);

    this.container.addEventListener('mousedown', (e) => e.stopPropagation());
    this.container.addEventListener('mouseup', (e) => e.stopPropagation());
    this.container.addEventListener('click', (e) => e.stopPropagation());
    this.container.addEventListener('contextmenu', (e) => e.preventDefault());

    const panel = document.createElement('div');
    panel.id = 'trading-panel';
    panel.style.cssText = `
      background: rgba(20, 20, 32, 0.95); border: 2px solid rgba(76, 175, 80, 0.5);
      border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8); color: #fff; min-width: 320px; width: 520px; position: relative;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';
    header.innerHTML = `
      <span style="font-size: 16px; font-weight: bold; color: #4caf50; display: flex; align-items: center; gap: 8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#4caf50"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        Perdagangan Villager (Villager Trade)
      </span>
    `;

    const closeBtn = document.createElement('button');
    closeBtn.id = 'trading-close-btn';
    closeBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    closeBtn.title = 'Tutup Perdagangan (Esc / E)';
    closeBtn.style.cssText = `
      width: 44px; height: 44px; background: #c62828; border: 2px solid #ffffff;
      border-radius: 6px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; touch-action: manipulation; box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    `;
    const triggerClose = (e?: Event) => {
      if (e && e.cancelable) e.preventDefault();
      this.close();
    };
    closeBtn.addEventListener('touchend', triggerClose, { passive: false });
    closeBtn.addEventListener('click', triggerClose);
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Cooldown Banner
    const cooldownBanner = document.createElement('div');
    cooldownBanner.id = 'trade-cooldown-banner';
    cooldownBanner.style.cssText = `
      display: none; padding: 8px 12px; background: rgba(244, 67, 54, 0.2);
      border: 1px solid rgba(244, 67, 54, 0.5); border-radius: 6px; color: #ff8a80;
      font-size: 12px; font-weight: bold; text-align: center;
    `;
    panel.appendChild(cooldownBanner);

    // Trade List Section
    const tradeList = document.createElement('div');
    tradeList.id = 'trade-list-container';
    tradeList.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
    panel.appendChild(tradeList);

    this.container.appendChild(panel);
    document.body.appendChild(this.container);

    document.addEventListener('keydown', (e) => {
      if (this.visible && e.key === 'Escape') {
        this.close();
      }
    });
  }

  private startUpdateLoop(): void {
    this.stopUpdateLoop();
    const loop = () => {
      if (this.visible) {
        this.refreshCooldownState();
        this.animationFrameId = requestAnimationFrame(loop);
      }
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private stopUpdateLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private refreshCooldownState(): void {
    if (!this.container || !this.currentVillager) return;

    const manager = VillagerTradingManager.getInstance();
    const cd = manager.getRemainingCooldown(this.currentVillager);
    const banner = this.container.querySelector<HTMLDivElement>('#trade-cooldown-banner');

    if (banner) {
      if (cd > 0) {
        banner.style.display = 'block';
        banner.textContent = `⏳ Villager sedang beristirahat (Cooldown: ${cd.toFixed(1)}s)`;
      } else {
        banner.style.display = 'none';
      }
    }

    const tradeBtns = this.container.querySelectorAll<HTMLButtonElement>('.trade-action-btn');
    tradeBtns.forEach((btn) => {
      const isAffordable = btn.dataset.affordable === 'true';
      if (cd > 0) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      } else if (!isAffordable) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      } else {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      }
    });
  }

  refresh(): void {
    if (!this.container || !this.currentVillager) return;

    const listContainer = this.container.querySelector<HTMLDivElement>('#trade-list-container');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    const manager = VillagerTradingManager.getInstance();
    const cd = manager.getRemainingCooldown(this.currentVillager);

    for (const recipe of GENERIC_TRADE_RECIPES) {
      const row = document.createElement('div');
      const canAfford = manager.canAffordTrade(recipe, this.inventory, this.hotbar);

      row.style.cssText = `
        background: rgba(30, 30, 45, 0.85); border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px; padding: 10px 14px; display: flex; align-items: center;
        justify-content: space-between; gap: 12px;
      `;

      // Left: Input Items
      const inputsDiv = document.createElement('div');
      inputsDiv.style.cssText = 'display: flex; align-items: center; gap: 6px;';
      for (const input of recipe.inputs) {
        const itemDef = getItemById(input.itemId);
        const iconBox = document.createElement('div');
        iconBox.style.cssText = `
          width: 40px; height: 40px; background: rgba(15,15,25,0.8);
          border: 1px solid ${canAfford ? 'rgba(76,175,80,0.4)' : 'rgba(244,67,54,0.4)'};
          border-radius: 6px; display: flex; align-items: center; justify-content: center;
          position: relative;
        `;
        iconBox.appendChild(createItemIcon(input.itemId, 32));
        const countSpan = document.createElement('span');
        countSpan.style.cssText = 'position:absolute;bottom:2px;right:4px;font-size:11px;font-weight:bold;color:#fff;text-shadow:1px 1px 0 #000;';
        countSpan.textContent = String(input.count);
        iconBox.appendChild(countSpan);
        iconBox.title = `${itemDef?.name ?? input.itemId} (x${input.count})`;
        inputsDiv.appendChild(iconBox);
      }

      // Center: Arrow
      const arrowDiv = document.createElement('div');
      arrowDiv.style.cssText = 'color: #4caf50; font-size: 18px; font-weight: bold; padding: 0 4px;';
      arrowDiv.textContent = '➔';

      // Right: Output Items
      const outputsDiv = document.createElement('div');
      outputsDiv.style.cssText = 'display: flex; align-items: center; gap: 6px;';
      for (const output of recipe.outputs) {
        const itemDef = getItemById(output.itemId);
        const iconBox = document.createElement('div');
        iconBox.style.cssText = `
          width: 40px; height: 40px; background: rgba(15,15,25,0.8);
          border: 1px solid rgba(255,204,0,0.4); border-radius: 6px;
          display: flex; align-items: center; justify-content: center; position: relative;
        `;
        iconBox.appendChild(createItemIcon(output.itemId, 32));
        const countSpan = document.createElement('span');
        countSpan.style.cssText = 'position:absolute;bottom:2px;right:4px;font-size:11px;font-weight:bold;color:#ffcc00;text-shadow:1px 1px 0 #000;';
        countSpan.textContent = String(output.count);
        iconBox.appendChild(countSpan);
        iconBox.title = `${itemDef?.name ?? output.itemId} (x${output.count})`;
        outputsDiv.appendChild(iconBox);
      }

      // Action Button
      const btn = document.createElement('button');
      btn.className = 'trade-action-btn';
      btn.dataset.affordable = String(canAfford);
      btn.textContent = canAfford ? 'Tukar' : 'Bahan Kurang';
      btn.style.cssText = `
        background: ${canAfford ? 'linear-gradient(135deg, #388e3c, #2e7d32)' : 'rgba(255,255,255,0.1)'};
        border: 1px solid ${canAfford ? '#4caf50' : 'rgba(255,255,255,0.2)'};
        color: #fff; font-family: monospace; font-size: 12px; font-weight: bold;
        padding: 8px 14px; border-radius: 6px; cursor: pointer; transition: all 0.15s;
      `;

      if (!canAfford || cd > 0) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      }

      btn.addEventListener('click', () => this.onExecuteTrade(recipe));

      row.appendChild(inputsDiv);
      row.appendChild(arrowDiv);
      row.appendChild(outputsDiv);
      row.appendChild(btn);
      listContainer.appendChild(row);
    }
  }

  private onExecuteTrade(recipe: TradeRecipe): void {
    if (!this.currentVillager) return;

    const manager = VillagerTradingManager.getInstance();

    // CP-254 Check: Cooldown verification
    if (manager.isCooldownActive(this.currentVillager)) {
      const remaining = manager.getRemainingCooldown(this.currentVillager);
      ToastSystem.getInstance().show(`⏳ Villager sedang cooldown (${remaining.toFixed(1)}s)!`, 'warning');
      AudioManager.getInstance().playSFX('villager_hmm');
      return;
    }

    // CP-253 Execution: Try executing trade transaction
    const success = manager.executeTrade(recipe, this.inventory, this.hotbar);

    if (success) {
      // CP-254: Set 4-second cooldown per Villager
      manager.setCooldown(this.currentVillager, 4);

      // CP-255 Visual & Audio Feedback: Synthesized SFX, Toast Notification, and Emerald Green Particle Burst
      AudioManager.getInstance().playSFX('pop');
      ToastSystem.getInstance().show(`✅ Perdagangan Sukses! (+${recipe.outputs.map((o) => `${o.count}x ${o.itemId}`).join(', ')})`, 'info');

      if (this.particleSystem && this.currentVillager) {
        const vPos = this.currentVillager.position.clone().add(new THREE.Vector3(0, 1.5, 0));
        this.particleSystem.spawnBlockBreakParticles(vPos, 0x4caf50); // Emerald green burst particles
      }

      this.refresh();
    } else {
      ToastSystem.getInstance().show('❌ Perdagangan Gagal: Bahan di inventory/hotbar tidak cukup!', 'warning');
      AudioManager.getInstance().playSFX('villager_hmm');
    }
  }
}
