import { SettingsMenu } from './SettingsMenu';
import { AudioManager } from '../audio/AudioManager';
import { toggleFullscreen } from '../utils/fullscreen';
import { survivalManager, DIFFICULTY_CONFIGS, type Difficulty } from '../survival/SurvivalManager';
import { statsTracker } from '../survival/StatsTracker';

export class MainMenu {
  private container: HTMLDivElement | null = null;
  private visible = true;
  private settingsMenu: SettingsMenu;
  private onStartGame: ((isLoad: boolean) => void) | null = null;
  private newGameBtn: HTMLButtonElement | null = null;
  private loadGameBtn: HTMLButtonElement | null = null;
  private settingsBtn: HTMLButtonElement | null = null;
  private btnBox: HTMLDivElement | null = null;
  private difficultyBox: HTMLDivElement | null = null;
  private introBox: HTMLDivElement | null = null;
  private installPromptCard: HTMLDivElement | null = null;

  constructor(settingsMenu: SettingsMenu, onStartGame: (isLoad: boolean) => void) {
    this.settingsMenu = settingsMenu;
    this.onStartGame = onStartGame;
  }

  create(): void {
    this.container = document.createElement('div');
    this.container.id = 'main-menu';
    this.container.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; height: 100dvh; z-index: 500;
      background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url('/textures/blocks/dirt.png');
      background-size: 64px 64px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-family: monospace; color: #fff; user-select: none;
      padding: 16px; box-sizing: border-box; overflow-y: auto;
    `;

    // Minecraft Title Box
    const titleBox = document.createElement('div');
    titleBox.className = 'mc-title-box';
    titleBox.style.cssText = 'position: relative; margin-bottom: 36px; text-align: center;';

    const title = document.createElement('h1');
    title.style.cssText = `
      font-size: 48px; font-weight: 900; color: #ffcc00; margin: 0;
      text-shadow: 4px 4px 0 #3f3100, -2px -2px 0 #fff;
      letter-spacing: 4px; text-transform: uppercase;
      font-family: 'Courier New', monospace;
    `;
    title.textContent = 'MINECRAFT LITE';

    // Yellow Splash Text (Minecraft Style)
    const splash = document.createElement('div');
    splash.style.cssText = `
      position: absolute; right: -30px; bottom: -20px; transform: rotate(-14deg);
      font-size: 15px; font-weight: bold; color: #ffff00; text-shadow: 2px 2px 0 #000;
      animation: splashPulse 1.2s infinite alternate ease-in-out;
    `;
    splash.textContent = '100% TS + Three.js Voxel Engine!';

    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes splashPulse {
        0% { transform: rotate(-14deg) scale(1); }
        100% { transform: rotate(-14deg) scale(1.1); }
      }
      .mc-button {
        width: 340px; max-width: 90vw; padding: 13px 18px; font-family: monospace; font-size: 15px; font-weight: bold;
        color: #e0e0e0; background: #707070;
        border-top: 3px solid #9e9e9e; border-left: 3px solid #9e9e9e;
        border-bottom: 3px solid #3a3a3a; border-right: 3px solid #3a3a3a;
        cursor: pointer; text-shadow: 2px 2px 0 #000; text-align: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.6); transition: background 0.1s, border-color 0.1s;
        touch-action: manipulation;
      }
      .mc-button:hover {
        background: #808080; color: #ffffa0;
        border-top-color: #ffffa0; border-left-color: #ffffa0;
        border-bottom-color: #555500; border-right-color: #555500;
      }
      .mc-button:active {
        border-top-color: #3a3a3a; border-left-color: #3a3a3a;
        border-bottom-color: #9e9e9e; border-right-color: #9e9e9e;
        background: #555555;
      }
      @media (max-height: 520px) {
        .mc-title-box { margin-bottom: 14px !important; }
        #main-menu h1 { font-size: 32px !important; }
      }
      @media (max-width: 600px) {
        #main-menu h1 { font-size: 34px !important; letter-spacing: 2px !important; }
      }
    `;
    document.head.appendChild(styleEl);

    titleBox.appendChild(title);
    titleBox.appendChild(splash);
    this.container.appendChild(titleBox);

    // Button Box
    this.btnBox = document.createElement('div');
    this.btnBox.style.cssText = 'display: flex; flex-direction: column; gap: 16px; align-items: center; width: 100%;';

    const makeMcBtn = (label: string, onClick: () => void) => {
      const btn = document.createElement('button');
      btn.className = 'mc-button';
      btn.textContent = label;
      btn.style.touchAction = 'manipulation';
      btn.style.maxWidth = '90vw';
      btn.style.width = '340px';

      let lastTrigger = 0;
      const trigger = (e?: Event) => {
        const now = Date.now();
        if (now - lastTrigger < 300) return;
        lastTrigger = now;
        if (e && e.cancelable) e.preventDefault();
        AudioManager.getInstance().playSFX('place');
        onClick();
      };

      btn.addEventListener('mouseenter', () => {
        AudioManager.getInstance().playSFX('footstep');
      });
      btn.addEventListener('touchend', (e) => trigger(e), { passive: false });
      btn.addEventListener('click', (e) => trigger(e));
      return btn;
    };

    this.newGameBtn = makeMcBtn('Singleplayer (New World)', () => {
      this.btnBox!.style.display = 'none';
      this.difficultyBox!.style.display = 'flex';
    });

    this.loadGameBtn = makeMcBtn('Load Saved World', () => {
      this.hide();
      toggleFullscreen();
      AudioManager.getInstance().startMusic();
      this.onStartGame?.(true);
    });

    this.settingsBtn = makeMcBtn('Options & Settings...', () => {
      this.settingsMenu.toggle();
    });

    this.btnBox.appendChild(this.newGameBtn);
    this.btnBox.appendChild(this.loadGameBtn);
    this.btnBox.appendChild(this.settingsBtn);
    this.container.appendChild(this.btnBox);

    // Difficulty Selection Box
    this.difficultyBox = document.createElement('div');
    this.difficultyBox.id = 'difficulty-selection-box';
    this.difficultyBox.className = 'wood-panel';
    this.difficultyBox.style.cssText = `
      display: none;
      flex-direction: column;
      gap: 12px;
      align-items: center;
      width: 460px;
      max-width: 92vw;
      background: var(--theme-panel-bg-translucent, rgba(35, 23, 16, 0.96));
      border: 3px solid var(--theme-border-highlight, #704b31);
      border-radius: 8px;
      padding: 18px 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.85);
      box-sizing: border-box;
      backdrop-filter: blur(8px);
    `;

    const diffTitle = document.createElement('div');
    diffTitle.style.cssText = 'font-size: 18px; font-weight: bold; color: var(--theme-accent-gold-text, #ffd56b); text-shadow: 2px 2px 0 #000; letter-spacing: 1px; text-align: center;';
    diffTitle.textContent = '⚔️ PILIH TINGKAT KESULITAN';

    const diffSubtitle = document.createElement('div');
    diffSubtitle.style.cssText = 'font-size: 12px; color: var(--theme-text-muted, #c4b097); text-align: center; margin-bottom: 4px; line-height: 1.4;';
    diffSubtitle.textContent = 'Misi: Bertahanlah hidup selama 15 hari di hutan sampai bala bantuan tiba.';

    this.difficultyBox.appendChild(diffTitle);
    this.difficultyBox.appendChild(diffSubtitle);

    const makeDiffCard = (diff: Difficulty) => {
      const config = DIFFICULTY_CONFIGS[diff];
      const card = document.createElement('div');
      card.className = 'mc-diff-card inv-slot-box';
      card.style.cssText = `
        width: 100%;
        padding: 10px 14px;
        box-sizing: border-box;
        background: var(--theme-slot-bg, #1a110a);
        border: 2px solid ${config.color};
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 4px;
        transition: transform 0.1s, background 0.1s, box-shadow 0.1s;
        touch-action: manipulation;
      `;

      const header = document.createElement('div');
      header.style.cssText = `font-size: 15px; font-weight: bold; color: ${config.color}; display: flex; justify-content: space-between; align-items: center; text-shadow: 1px 1px 0 #000;`;
      header.innerHTML = `<span>${config.badge}</span> <span style="font-size: 11px; opacity: 0.9; color: #fff; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); padding: 2px 6px; border-radius: 3px;">${diff === 'santai' ? 'Nyawa Bebas' : diff === 'normal' ? '3 Nyawa' : '1 Nyawa (Hardcore)'}</span>`;

      const desc = document.createElement('div');
      desc.style.cssText = 'font-size: 11px; color: var(--theme-text-light, #f7f1e3); line-height: 1.35;';
      desc.textContent = config.description;

      card.appendChild(header);
      card.appendChild(desc);

      const triggerSelect = (e?: Event) => {
        if (e && e.cancelable) e.preventDefault();
        AudioManager.getInstance().playSFX('place');
        survivalManager.setDifficulty(diff);
        this.difficultyBox!.style.display = 'none';
        this.showIntroScreen(diff);
      };

      card.addEventListener('mouseenter', () => {
        card.style.background = 'var(--theme-slot-hover, #3f291a)';
        card.style.transform = 'scale(1.02)';
        card.style.boxShadow = `0 4px 14px ${config.color}50`;
        AudioManager.getInstance().playSFX('footstep');
      });
      card.addEventListener('mouseleave', () => {
        card.style.background = 'var(--theme-slot-bg, #1a110a)';
        card.style.transform = 'scale(1)';
        card.style.boxShadow = 'none';
      });
      card.addEventListener('touchend', triggerSelect, { passive: false });
      card.addEventListener('click', triggerSelect);

      return card;
    };

    this.difficultyBox.appendChild(makeDiffCard('santai'));
    this.difficultyBox.appendChild(makeDiffCard('normal'));
    this.difficultyBox.appendChild(makeDiffCard('susah'));

    const backBtn = makeMcBtn('◀ Kembali', () => {
      this.difficultyBox!.style.display = 'none';
      this.btnBox!.style.display = 'flex';
    });
    backBtn.style.marginTop = '4px';
    backBtn.style.padding = '8px 14px';
    backBtn.style.fontSize = '13px';
    backBtn.style.width = '180px';
    this.difficultyBox.appendChild(backBtn);

    this.container.appendChild(this.difficultyBox);

    // Intro Story Box
    this.introBox = document.createElement('div');
    this.introBox.id = 'intro-story-box';
    this.introBox.className = 'wood-panel';
    this.introBox.style.cssText = `
      display: none;
      flex-direction: column;
      gap: 12px;
      align-items: center;
      width: 500px;
      max-width: 94vw;
      background: var(--theme-panel-bg-translucent, rgba(35, 23, 16, 0.96));
      border: 3px solid var(--theme-border-gold, #c8963e);
      border-radius: 10px;
      padding: 20px 24px;
      box-shadow: 0 12px 36px rgba(0,0,0,0.9), 0 0 24px rgba(200, 150, 62, 0.25);
      box-sizing: border-box;
      backdrop-filter: blur(10px);
      text-align: center;
    `;
    this.container.appendChild(this.introBox);

    this.updateMenuState();

    window.addEventListener('resize', () => {
      if (this.visible) this.updateMenuState();
    });

    document.body.appendChild(this.container);
  }

  private updateMenuState(): void {
    if (!this.container || !this.newGameBtn || !this.loadGameBtn || !this.btnBox) return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isNarrow = window.innerWidth <= 1024;
    const isCoarse = !!window.matchMedia?.('(pointer: coarse)').matches;
    const isMobile = (isTouch || isCoarse) && isNarrow;

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    console.log(
      `%c[Main Menu Mode Check]%c isMobile=${isMobile}, isStandalone=${isStandalone}, isNarrow=${isNarrow}, isTouch=${isTouch}`,
      'color: #ffcc00; font-weight: bold;',
      'color: #00ffff;'
    );

    if (isMobile && !isStandalone) {
      // Mobile Browser (Non-Standalone): Sembunyikan tombol Play / Load
      this.newGameBtn.style.display = 'none';
      this.loadGameBtn.style.display = 'none';

      if (!this.installPromptCard) {
        this.installPromptCard = document.createElement('div');
        this.installPromptCard.id = 'pwa-install-required-card';
        this.installPromptCard.style.cssText = `
          width: 360px;
          max-width: 90vw;
          background: rgba(20, 20, 20, 0.95);
          border: 2px solid #ffcc00;
          box-shadow: 0 8px 26px rgba(0, 0, 0, 0.85);
          border-radius: 8px;
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
          font-family: monospace;
          color: #fff;
          box-sizing: border-box;
        `;

        const iconTitle = document.createElement('div');
        iconTitle.style.cssText = 'font-size: 15px; font-weight: bold; color: #ffcc00; display: flex; align-items: center; gap: 8px; text-shadow: 1px 1px 0 #000;';
        iconTitle.innerHTML = '📲 <span>Tambahkan ke Layar Utama</span>';

        const desc = document.createElement('div');
        desc.style.cssText = 'font-size: 13px; color: #e0e0e0; line-height: 1.5; text-align: left; background: rgba(0,0,0,0.3); padding: 10px 12px; border-radius: 4px; border-left: 3px solid #ffcc00;';
        desc.innerHTML = isIOS
          ? 'Game ini membutuhkan mode <b>Layar Utama</b> agar berjalan fullscreen tanpa address bar:<br><br>' +
            '1. Tekan tombol Share (<b>□↑</b>) di Safari<br>' +
            '2. Pilih <b>"Add to Home Screen"</b> (Tambah ke Layar Utama)<br>' +
            '3. Buka game dari ikon di Home Screen untuk mulai bermain!'
          : 'Game ini membutuhkan mode <b>Layar Utama</b> agar berjalan fullscreen tanpa address bar:<br><br>' +
            '1. Tekan menu titik tiga (<b>⋮</b>) di pojok browser<br>' +
            '2. Pilih <b>"Add to Home Screen"</b> / <b>"Install app"</b><br>' +
            '3. Buka game dari ikon di Home Screen untuk mulai bermain!';

        this.installPromptCard.appendChild(iconTitle);
        this.installPromptCard.appendChild(desc);

        // Insert prompt card before settingsBtn in btnBox
        this.btnBox.insertBefore(this.installPromptCard, this.btnBox.firstChild);
      } else {
        this.installPromptCard.style.display = 'flex';
      }
    } else {
      // Desktop/Laptop ATAU Mobile yang sudah Standalone: Tampilkan tombol Play & Load
      this.newGameBtn.style.display = 'block';
      this.loadGameBtn.style.display = 'block';
      if (this.installPromptCard) {
        this.installPromptCard.style.display = 'none';
      }
    }
  }

  private showIntroScreen(diff: Difficulty): void {
    if (!this.introBox) return;
    const config = DIFFICULTY_CONFIGS[diff];
    this.introBox.innerHTML = '';
    this.introBox.style.display = 'flex';

    const introHeader = document.createElement('div');
    introHeader.style.cssText = 'font-size: 18px; font-weight: bold; color: #ffcc00; text-shadow: 2px 2px 0 #000; letter-spacing: 1px;';
    introHeader.textContent = '📖 SURVIVAL: 15 HARI DI HUTAN';

    const diffBadge = document.createElement('div');
    diffBadge.style.cssText = `font-size: 12px; font-weight: bold; color: ${config.color}; background: rgba(0,0,0,0.5); border: 1px solid ${config.color}; padding: 3px 10px; border-radius: 4px; display: inline-block;`;
    diffBadge.textContent = `Tingkat Kesulitan: ${config.badge}`;

    const storyText = document.createElement('div');
    storyText.className = 'parchment-box';
    storyText.style.cssText = `
      background: var(--theme-parchment-bg-dark, #261b12);
      border-left: 4px solid var(--theme-accent-gold, #c8963e);
      padding: 14px 16px;
      border-radius: 4px;
      font-size: 13px;
      line-height: 1.6;
      color: var(--theme-text-light, #f7f1e3);
      text-align: justify;
      font-style: italic;
      margin: 4px 0;
      box-sizing: border-box;
      width: 100%;
      box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
    `;
    storyText.innerHTML = `
      "Dalam perjalanan pulang, semuanya berubah begitu cepat. Saat kau tersadar, yang tersisa hanya hutan lebat dan keheningan.<br><br>
      Tidak ada tanda arah, tidak ada seorang pun. Yang kau tahu, kau harus bertahan — mencari makanan, membuat alat, membangun benteng, dan menghadapi monster malam — 
      <b>sampai bala bantuan tiba pada Hari ke-15.</b>"
    `;

    const missionBadge = document.createElement('div');
    missionBadge.style.cssText = 'font-size: 13px; font-weight: bold; color: var(--theme-accent-gold-text, #ffd56b); text-shadow: 1px 1px 0 #000; background: rgba(200,150,62,0.15); border: 1px dashed var(--theme-accent-gold, #c8963e); padding: 8px 12px; border-radius: 4px; width: 100%; box-sizing: border-box;';
    missionBadge.textContent = '🎯 TARGET: Bertahanlah hidup selama 15 Hari!';

    const startBtn = document.createElement('button');
    startBtn.className = 'mc-button mc-button-green';
    startBtn.style.cssText = `
      width: 100%;
      padding: 13px 18px;
      font-family: var(--theme-font, monospace);
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      text-shadow: 2px 2px 0 #000;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      transition: background 0.1s, transform 0.08s;
      touch-action: manipulation;
    `;
    startBtn.textContent = '⚔️ Mulai Bertahan Hidup (Hari 1)';

    const triggerStart = (e?: Event) => {
      if (e && e.cancelable) e.preventDefault();
      AudioManager.getInstance().playSFX('place');
      survivalManager.resetState();
      statsTracker.reset();
      this.hide();
      toggleFullscreen();
      AudioManager.getInstance().startMusic();
      this.onStartGame?.(false);
    };

    startBtn.addEventListener('mouseenter', () => {
      startBtn.style.background = '#4a822f';
      AudioManager.getInstance().playSFX('footstep');
    });
    startBtn.addEventListener('mouseleave', () => {
      startBtn.style.background = '#3e6b27';
    });
    startBtn.addEventListener('touchend', triggerStart, { passive: false });
    startBtn.addEventListener('click', triggerStart);

    const backBtn = document.createElement('button');
    backBtn.className = 'mc-button';
    backBtn.style.cssText = `
      width: 180px;
      padding: 8px 12px;
      font-family: monospace;
      font-size: 13px;
      font-weight: bold;
      color: #ddd;
      background: #555;
      border-top: 2px solid #888;
      border-left: 2px solid #888;
      border-bottom: 2px solid #222;
      border-right: 2px solid #222;
      cursor: pointer;
      text-shadow: 1px 1px 0 #000;
      border-radius: 4px;
      touch-action: manipulation;
    `;
    backBtn.textContent = '◀ Ganti Kesulitan';
    backBtn.addEventListener('click', () => {
      this.introBox!.style.display = 'none';
      this.difficultyBox!.style.display = 'flex';
      AudioManager.getInstance().playSFX('click');
    });

    this.introBox.appendChild(introHeader);
    this.introBox.appendChild(diffBadge);
    this.introBox.appendChild(storyText);
    this.introBox.appendChild(missionBadge);
    this.introBox.appendChild(startBtn);
    this.introBox.appendChild(backBtn);
  }

  show(): void {
    this.visible = true;
    if (this.container) {
      this.container.style.display = 'flex';
      if (this.introBox) this.introBox.style.display = 'none';
      if (this.difficultyBox) this.difficultyBox.style.display = 'none';
      if (this.btnBox) this.btnBox.style.display = 'flex';
      this.updateMenuState();
    }
  }

  hide(): void {
    this.visible = false;
    if (this.container) this.container.style.display = 'none';
  }

  get isOpen(): boolean {
    return this.visible;
  }
}
