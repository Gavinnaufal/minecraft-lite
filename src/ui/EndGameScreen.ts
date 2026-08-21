import { statsTracker, type StatsSummary } from '../survival/StatsTracker';
import { AudioManager } from '../audio/AudioManager';

export class EndGameScreen {
  private container: HTMLDivElement | null = null;
  private isVisible = false;
  private onReturnToMenu: (() => void) | null = null;

  constructor(onReturnToMenu?: () => void) {
    this.onReturnToMenu = onReturnToMenu ?? null;
    this.create();
  }

  private create(): void {
    this.container = document.createElement('div');
    this.container.id = 'end-game-screen';
    this.container.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      z-index: 600;
      background: radial-gradient(circle at center, rgba(15, 15, 25, 0.96) 0%, rgba(5, 5, 10, 0.98) 100%);
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: monospace;
      color: #fff;
      user-select: none;
      padding: 16px;
      box-sizing: border-box;
      overflow-y: auto;
      backdrop-filter: blur(12px);
    `;

    document.body.appendChild(this.container);
  }

  public show(type: 'win' | 'lose', reason?: string): void {
    if (!this.container) return;
    this.isVisible = true;
    this.container.style.display = 'flex';
    this.container.innerHTML = '';

    const isWin = type === 'win';
    const summary: StatsSummary = statsTracker.getSummary();

    if (isWin) {
      AudioManager.getInstance().playSFX('portal_hum');
    } else {
      AudioManager.getInstance().playSFX('break');
    }

    const card = document.createElement('div');
    card.className = 'wood-panel';
    card.style.cssText = `
      width: 540px;
      max-width: 94vw;
      background: var(--theme-panel-bg-translucent, rgba(35, 23, 16, 0.96));
      border: 3px solid ${isWin ? 'var(--theme-accent-gold-border, #ffcc55)' : 'var(--theme-accent-red-border, #bf553b)'};
      border-radius: 12px;
      padding: 24px 28px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.9), 0 0 30px ${isWin ? 'rgba(255, 204, 85, 0.25)' : 'rgba(191, 85, 59, 0.25)'};
      display: flex;
      flex-direction: column;
      align-items: center;
      box-sizing: border-box;
      gap: 16px;
      animation: endGameCardPop 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
    `;

    const animStyle = document.createElement('style');
    animStyle.textContent = `
      @keyframes endGameCardPop {
        0% { transform: scale(0.85); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      .stat-grid-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--theme-slot-bg, #1a110a);
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid var(--theme-border-muted, #543926);
        font-size: 13px;
        font-family: var(--theme-font, monospace);
      }
    `;
    this.container.appendChild(animStyle);

    // Title / Badge
    const title = document.createElement('h1');
    title.style.cssText = `
      font-size: 24px;
      font-weight: 900;
      margin: 0;
      color: ${isWin ? 'var(--theme-accent-gold-text, #ffd56b)' : 'var(--theme-accent-red-text, #ff785a)'};
      text-shadow: 3px 3px 0 #000;
      letter-spacing: 2px;
      text-transform: uppercase;
      text-align: center;
      font-family: var(--theme-font, monospace);
    `;
    title.textContent = isWin ? '🏆 MISI SELESAI — KAMU BERHASIL!' : '☠️ PERJALANANMU BERAKHIR';
    card.appendChild(title);

    // Story Text Box (GDD Section 6.2 / 6.3)
    const storyBox = document.createElement('div');
    storyBox.className = 'parchment-box';
    storyBox.style.cssText = `
      background: var(--theme-parchment-bg-dark, #261b12);
      border-left: 4px solid ${isWin ? 'var(--theme-accent-gold, #c8963e)' : 'var(--theme-accent-red, #7c2d1b)'};
      padding: 14px 18px;
      border-radius: 4px;
      font-size: 13px;
      line-height: 1.6;
      color: var(--theme-text-light, #f7f1e3);
      font-style: italic;
      text-align: justify;
      width: 100%;
      box-sizing: border-box;
      box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
    `;

    if (isWin) {
      storyBox.innerHTML = `
        "<b>Hari ke-15.</b> Di kejauhan, kau melihat cahaya terang — bukan dari api unggunmu sendiri.<br><br>
        Suara langkah dan panggilan familiar memanggil namamu. Setelah seluruh malam yang dingin, monster yang kau hadapi, dan benteng yang kau bangun dengan susah payah... 
        <b>bala bantuan akhirnya tiba. Kau selamat dan pulang!</b>"
      `;
    } else {
      storyBox.innerHTML = `
        "Kegelapan menelanmu di <b>Hari ke-${summary.daysSurvived}</b>.<br><br>
        Hutan lebat ini menang kali ini — ${reason ? `<i>(${reason})</i>. ` : ''}Tapi jangan berkecil hati, pengalaman dari petualangan ini akan membuatmu bertahan lebih kuat berikutnya!"
      `;
    }
    card.appendChild(storyBox);

    // Statistics Section
    const statsTitle = document.createElement('div');
    statsTitle.style.cssText = 'font-size: 14px; font-weight: bold; color: var(--theme-accent-gold-text, #ffd56b); width: 100%; text-shadow: 1px 1px 0 #000; margin-top: 4px; font-family: var(--theme-font, monospace);';
    statsTitle.textContent = '📊 RINGKASAN STATISTIK PERMAINAN:';
    card.appendChild(statsTitle);

    const statsGrid = document.createElement('div');
    statsGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      width: 100%;
      box-sizing: border-box;
    `;

    const addStat = (icon: string, label: string, val: string | number, highlightColor = '#f7f1e3') => {
      const item = document.createElement('div');
      item.className = 'stat-grid-item';
      item.innerHTML = `
        <span style="color: var(--theme-text-muted, #c4b097); display: flex; align-items: center; gap: 6px;">
          <span>${icon}</span> <span>${label}</span>
        </span>
        <strong style="color: ${highlightColor}; font-size: 13px;">${val}</strong>
      `;
      statsGrid.appendChild(item);
    };

    addStat('📅', 'Hari Bertahan', `${summary.daysSurvived} / 15 Hari`, isWin ? 'var(--theme-accent-green-text, #8ee063)' : 'var(--theme-accent-gold-text, #ffd56b)');
    addStat('🛡️', 'Tingkat Kesulitan', summary.difficultyBadge, '#ffffff');
    addStat('⏱️', 'Waktu Bermain', summary.playTimeFormatted, 'var(--theme-accent-info-text, #6ce0d8)');
    addStat('⚔️', 'Monster Kalah', `${summary.monstersKilled} ekor`, 'var(--theme-accent-red-text, #ff785a)');
    addStat('⛏️', 'Blok Dihancurkan', `${summary.blocksBroken} blok`, '#ffd54f');
    addStat('🧱', 'Blok Dipasang', `${summary.blocksPlaced} blok`, 'var(--theme-accent-green-text, #8ee063)');
    addStat('🛠️', 'Item Dibuat', `${summary.itemsCrafted} item`, '#64b5f6');
    addStat('🍖', 'Makanan Dimakan', `${summary.foodEaten} porsi`, 'var(--theme-accent-gold-text, #ffd56b)');
    addStat('🏃', 'Jarak Ditempuh', `${summary.distanceTraveledBlocks} meter`, '#d1c4e9');

    card.appendChild(statsGrid);

    // Return to Main Menu Button
    const returnBtn = document.createElement('button');
    returnBtn.className = 'mc-button';
    returnBtn.style.cssText = `
      margin-top: 10px;
      width: 100%;
      padding: 12px 16px;
      font-family: var(--theme-font, monospace);
      font-size: 15px;
      font-weight: bold;
      cursor: pointer;
      text-shadow: 2px 2px 0 #000;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      transition: background 0.1s, transform 0.08s;
      touch-action: manipulation;
    `;
    returnBtn.textContent = '🔄 Kembali ke Menu Utama (Reset Progres)';

    const triggerReturn = (e?: Event) => {
      if (e && e.cancelable) e.preventDefault();
      AudioManager.getInstance().playSFX('click');
      this.hide();
      this.onReturnToMenu?.();
    };

    returnBtn.addEventListener('mouseenter', () => {
      returnBtn.style.background = '#666666';
      returnBtn.style.color = '#ffffa0';
      AudioManager.getInstance().playSFX('footstep');
    });
    returnBtn.addEventListener('mouseleave', () => {
      returnBtn.style.background = '#555555';
      returnBtn.style.color = '#fff';
    });
    returnBtn.addEventListener('touchend', triggerReturn, { passive: false });
    returnBtn.addEventListener('click', triggerReturn);

    card.appendChild(returnBtn);
    this.container.appendChild(card);
  }

  public hide(): void {
    this.isVisible = false;
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  public get isOpen(): boolean {
    return this.isVisible;
  }
}
