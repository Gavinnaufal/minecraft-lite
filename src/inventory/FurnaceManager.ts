export interface FurnaceSlot {
  itemId: string | null;
  count: number;
}

export interface FurnaceData {
  input: FurnaceSlot;
  fuel: FurnaceSlot;
  output: FurnaceSlot;
  cookProgress: number; // 0 to 100
  fuelTime: number; // remaining fuel burn time in seconds
  maxFuelTime: number; // max fuel duration for current item
}

export class FurnaceManager {
  private static instance: FurnaceManager;
  private furnaces = new Map<string, FurnaceData>();

  public static getInstance(): FurnaceManager {
    if (!FurnaceManager.instance) {
      FurnaceManager.instance = new FurnaceManager();
    }
    return FurnaceManager.instance;
  }

  private getKey(x: number, y: number, z: number): string {
    return `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
  }

  getFurnaceData(x: number, y: number, z: number): FurnaceData {
    const key = this.getKey(x, y, z);
    if (!this.furnaces.has(key)) {
      this.furnaces.set(key, {
        input: { itemId: null, count: 0 },
        fuel: { itemId: null, count: 0 },
        output: { itemId: null, count: 0 },
        cookProgress: 0,
        fuelTime: 0,
        maxFuelTime: 0,
      });
    }
    return this.furnaces.get(key)!;
  }

  getAllFurnaces(): Record<string, FurnaceData> {
    const obj: Record<string, FurnaceData> = {};
    for (const [key, val] of this.furnaces.entries()) {
      obj[key] = val;
    }
    return obj;
  }

  loadFurnaces(data?: Record<string, FurnaceData>): void {
    this.furnaces.clear();
    if (!data) return;
    for (const [key, val] of Object.entries(data)) {
      this.furnaces.set(key, val);
    }
  }

  removeFurnace(x: number, y: number, z: number): FurnaceData | null {
    const key = this.getKey(x, y, z);
    const data = this.furnaces.get(key) ?? null;
    this.furnaces.delete(key);
    return data;
  }

  clearAllFurnaces(): void {
    this.furnaces.clear();
  }
}
