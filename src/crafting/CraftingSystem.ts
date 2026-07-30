import { recipes } from './Recipes';
import type { Recipe } from './Recipes';

function gridToString(grid: (string | null)[][]): string[][] {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  let minR = rows, maxR = 0, minC = cols, maxC = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c]) {
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
    }
  }
  if (minR > maxR) return [['']];
  const result: string[][] = [];
  for (let r = minR; r <= maxR; r++) {
    const row: string[] = [];
    for (let c = minC; c <= maxC; c++) {
      row.push(grid[r][c] ?? '');
    }
    result.push(row);
  }
  return result;
}

function patternsMatch(a: string[][], b: (string | null)[][]): boolean {
  if (a.length !== b.length) return false;
  for (let r = 0; r < a.length; r++) {
    if (a[r].length !== b[r].length) return false;
    for (let c = 0; c < a[r].length; c++) {
      if (a[r][c] !== (b[r][c] ?? '')) return false;
    }
  }
  return true;
}

export function checkRecipe(grid: (string | null)[][]): Recipe | null {
  const normalized = gridToString(grid);
  for (const recipe of recipes) {
    if (patternsMatch(normalized, recipe.pattern)) {
      return recipe;
    }
  }
  return null;
}
