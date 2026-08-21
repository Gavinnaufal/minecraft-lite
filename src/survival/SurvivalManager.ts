export type Difficulty = 'santai' | 'normal' | 'susah';
export type SurvivalGameState = 'playing' | 'game_over' | 'game_won';

export interface DifficultyConfig {
  id: Difficulty;
  name: string;
  badge: string;
  color: string;
  icon: string;
  description: string;
  initialLives: number;
  hungerRate: number;
  mobDifficultyFactor: number;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  santai: {
    id: 'santai',
    name: 'Santai',
    badge: '🟢 Santai',
    color: '#4caf50',
    icon: '🟢',
    description: 'Nyawa tidak terbatas. Saat mati hanya menjatuhkan sebagian isi tas. Lapar berkurang lambat.',
    initialLives: 999,
    hungerRate: 0.5,
    mobDifficultyFactor: 0.7,
  },
  normal: {
    id: 'normal',
    name: 'Normal',
    badge: '🟡 Normal',
    color: '#ffc107',
    icon: '🟡',
    description: 'Diberikan 3 nyawa. Jika mati 3 kali, petualangan berakhir. Tantangan dan lapar seimbang.',
    initialLives: 3,
    hungerRate: 1.0,
    mobDifficultyFactor: 1.0,
  },
  susah: {
    id: 'susah',
    name: 'Susah',
    badge: '🔴 Susah',
    color: '#f44336',
    icon: '🔴',
    description: 'Hanya 1 nyawa (Hardcore) — sekali mati langsung GAME OVER! Lapar cepat habis, monster paling agresif.',
    initialLives: 1,
    hungerRate: 1.5,
    mobDifficultyFactor: 1.4,
  },
};

export class SurvivalManager {
  private static instance: SurvivalManager;

  public difficulty: Difficulty = 'normal';
  public currentDay = 1;
  public lives = 3;
  public gameState: SurvivalGameState = 'playing';
  public targetDays = 15;

  public onDayChange?: (newDay: number) => void;
  public onLivesChange?: (remainingLives: number, maxLives: number) => void;
  public onGameOver?: (reason: string) => void;
  public onGameWon?: () => void;

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): SurvivalManager {
    if (!SurvivalManager.instance) {
      SurvivalManager.instance = new SurvivalManager();
    }
    return SurvivalManager.instance;
  }

  public setDifficulty(diff: Difficulty): void {
    this.difficulty = diff;
    const config = DIFFICULTY_CONFIGS[diff] ?? DIFFICULTY_CONFIGS.normal;
    this.lives = config.initialLives;
    this.saveToStorage();
    this.onLivesChange?.(this.lives, config.initialLives);
    console.log(`[Survival] Kesulitan diatur: ${config.name} (${config.badge}) — Nyawa awal: ${this.lives}`);
  }

  public getDifficultyConfig(): DifficultyConfig {
    return DIFFICULTY_CONFIGS[this.difficulty] ?? DIFFICULTY_CONFIGS.normal;
  }

  public setDay(day: number): void {
    this.currentDay = Math.max(1, day);
    this.saveToStorage();
    this.onDayChange?.(this.currentDay);
    this.checkWinCondition();
  }

  public advanceDay(): void {
    if (this.gameState !== 'playing') return;
    this.currentDay += 1;
    this.saveToStorage();
    console.log(`%c[Survival] Pergantian Hari! Sekarang: Hari ke-${this.currentDay} / ${this.targetDays}`, 'color: #ffcc00; font-weight: bold;');
    this.onDayChange?.(this.currentDay);
    this.checkWinCondition();
  }

  public checkWinCondition(): void {
    if (this.gameState === 'playing' && this.currentDay >= this.targetDays) {
      this.triggerGameWon();
    }
  }

  /**
   * Dipanggil saat health player mencapai 0 atau jatuh ke void.
   * Mengembalikan status penalti dan apakah game over.
   */
  public handlePlayerDeath(): { isGameOver: boolean; dropPartialItems: boolean; remainingLives: number } {
    if (this.gameState !== 'playing') {
      return { isGameOver: this.gameState === 'game_over', dropPartialItems: false, remainingLives: this.lives };
    }

    if (this.difficulty === 'santai') {
      console.log(`[Survival] Player mati di mode Santai. Tidak ada pengurangan nyawa, item berkurang sebagian.`);
      return { isGameOver: false, dropPartialItems: true, remainingLives: this.lives };
    }

    if (this.difficulty === 'susah') {
      this.lives = 0;
      this.triggerGameOver('Mati di mode Susah (Hardcore)');
      return { isGameOver: true, dropPartialItems: false, remainingLives: 0 };
    }

    // Normal Mode
    this.lives = Math.max(0, this.lives - 1);
    const maxLives = DIFFICULTY_CONFIGS.normal.initialLives;
    this.onLivesChange?.(this.lives, maxLives);
    console.log(`[Survival] Player mati di mode Normal! Sisa nyawa: ${this.lives}/${maxLives}`);

    if (this.lives <= 0) {
      this.triggerGameOver('Seluruh 3 nyawa telah habis');
      return { isGameOver: true, dropPartialItems: false, remainingLives: 0 };
    }

    return { isGameOver: false, dropPartialItems: false, remainingLives: this.lives };
  }

  public triggerGameOver(reason: string): void {
    if (this.gameState === 'game_over') return;
    this.gameState = 'game_over';
    console.warn(`%c[Survival] GAME OVER — ${reason} pada Hari ke-${this.currentDay}`, 'color: #ff4444; font-size: 16px; font-weight: bold;');
    this.onGameOver?.(reason);
  }

  public triggerGameWon(): void {
    if (this.gameState === 'game_won') return;
    this.gameState = 'game_won';
    console.log(`%c[Survival] 🎉 GAME WON! Berhasil bertahan hidup sampai Hari ${this.targetDays} di mode ${this.difficulty.toUpperCase()}!`, 'color: #00ff88; font-size: 18px; font-weight: bold;');
    this.onGameWon?.();
  }

  public resetState(): void {
    const config = this.getDifficultyConfig();
    this.currentDay = 1;
    this.lives = config.initialLives;
    this.gameState = 'playing';
    this.saveToStorage();
    this.onDayChange?.(this.currentDay);
    this.onLivesChange?.(this.lives, config.initialLives);
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('mc_survival_difficulty', this.difficulty);
      localStorage.setItem('mc_survival_day', this.currentDay.toString());
      localStorage.setItem('mc_survival_lives', this.lives.toString());
    } catch {}
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const savedDiff = localStorage.getItem('mc_survival_difficulty') as Difficulty | null;
      if (savedDiff && (savedDiff === 'santai' || savedDiff === 'normal' || savedDiff === 'susah')) {
        this.difficulty = savedDiff;
      }
      const savedDay = localStorage.getItem('mc_survival_day');
      if (savedDay) {
        const parsed = parseInt(savedDay, 10);
        if (!isNaN(parsed) && parsed >= 1) this.currentDay = parsed;
      }
      const savedLives = localStorage.getItem('mc_survival_lives');
      if (savedLives) {
        const parsed = parseInt(savedLives, 10);
        if (!isNaN(parsed)) this.lives = parsed;
      }
    } catch {}
  }
}

export const survivalManager = SurvivalManager.getInstance();
