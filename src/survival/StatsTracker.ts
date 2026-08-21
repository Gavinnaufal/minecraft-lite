import { survivalManager } from './SurvivalManager';

export interface StatsSummary {
  daysSurvived: number;
  difficulty: string;
  difficultyBadge: string;
  playTimeFormatted: string;
  playTimeSeconds: number;
  monstersKilled: number;
  blocksBroken: number;
  blocksPlaced: number;
  itemsCrafted: number;
  foodEaten: number;
  distanceTraveledBlocks: number;
}

export class StatsTracker {
  private static instance: StatsTracker;

  public monstersKilled = 0;
  public blocksBroken = 0;
  public blocksPlaced = 0;
  public itemsCrafted = 0;
  public foodEaten = 0;
  public distanceTraveled = 0;
  public playTimeSeconds = 0;

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): StatsTracker {
    if (!StatsTracker.instance) {
      StatsTracker.instance = new StatsTracker();
    }
    return StatsTracker.instance;
  }

  public recordMonsterKill(count = 1): void {
    this.monstersKilled += count;
    this.saveToStorage();
  }

  public recordBlockBroken(count = 1): void {
    this.blocksBroken += count;
    this.saveToStorage();
  }

  public recordBlockPlaced(count = 1): void {
    this.blocksPlaced += count;
    this.saveToStorage();
  }

  public recordItemCrafted(count = 1): void {
    this.itemsCrafted += count;
    this.saveToStorage();
  }

  public recordFoodEaten(count = 1): void {
    this.foodEaten += count;
    this.saveToStorage();
  }

  public recordDistance(meters: number): void {
    if (meters > 0 && meters < 50) { // filter teleport jumps
      this.distanceTraveled += meters;
    }
  }

  public updatePlayTime(deltaTime: number): void {
    if (deltaTime > 0 && deltaTime < 1.0) {
      this.playTimeSeconds += deltaTime;
    }
  }

  public reset(): void {
    this.monstersKilled = 0;
    this.blocksBroken = 0;
    this.blocksPlaced = 0;
    this.itemsCrafted = 0;
    this.foodEaten = 0;
    this.distanceTraveled = 0;
    this.playTimeSeconds = 0;
    this.saveToStorage();
    console.log('[StatsTracker] Statistik permainan telah di-reset.');
  }

  public getSummary(): StatsSummary {
    const config = survivalManager.getDifficultyConfig();
    const totalSecs = Math.floor(this.playTimeSeconds);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;

    let timeStr = `${mins}m ${secs}s`;
    if (hours > 0) {
      timeStr = `${hours}j ${remMins}m ${secs}s`;
    }

    return {
      daysSurvived: survivalManager.currentDay,
      difficulty: config.name,
      difficultyBadge: config.badge,
      playTimeFormatted: timeStr,
      playTimeSeconds: totalSecs,
      monstersKilled: this.monstersKilled,
      blocksBroken: this.blocksBroken,
      blocksPlaced: this.blocksPlaced,
      itemsCrafted: this.itemsCrafted,
      foodEaten: this.foodEaten,
      distanceTraveledBlocks: Math.round(this.distanceTraveled),
    };
  }

  public saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const data = {
        monstersKilled: this.monstersKilled,
        blocksBroken: this.blocksBroken,
        blocksPlaced: this.blocksPlaced,
        itemsCrafted: this.itemsCrafted,
        foodEaten: this.foodEaten,
        distanceTraveled: this.distanceTraveled,
        playTimeSeconds: this.playTimeSeconds,
      };
      localStorage.setItem('mc_survival_stats', JSON.stringify(data));
    } catch {}
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem('mc_survival_stats');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.monstersKilled === 'number') this.monstersKilled = data.monstersKilled;
      if (typeof data.blocksBroken === 'number') this.blocksBroken = data.blocksBroken;
      if (typeof data.blocksPlaced === 'number') this.blocksPlaced = data.blocksPlaced;
      if (typeof data.itemsCrafted === 'number') this.itemsCrafted = data.itemsCrafted;
      if (typeof data.foodEaten === 'number') this.foodEaten = data.foodEaten;
      if (typeof data.distanceTraveled === 'number') this.distanceTraveled = data.distanceTraveled;
      if (typeof data.playTimeSeconds === 'number') this.playTimeSeconds = data.playTimeSeconds;
    } catch {}
  }
}

export const statsTracker = StatsTracker.getInstance();
