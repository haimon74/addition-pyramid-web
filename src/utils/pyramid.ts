// Core logic for the pyramid math puzzle game

export type Pyramid = number[][];
export type CellPosition = [number, number];
export type Difficulty = 'easy' | 'medium' | 'hard';

// Generate a random single-digit bottom row
export function generateBottomRow(n: number): number[] {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10));
}

// Build the full pyramid from the bottom row
export function generatePyramid(n: number, bottomRow: number[]): Pyramid {
  const pyramid: Pyramid = Array.from({ length: n }, (_, row) => Array(n - row).fill(0));
  pyramid[0] = [...bottomRow];
  for (let row = 1; row < n; row++) {
    for (let col = 0; col < n - row; col++) {
      pyramid[row][col] = pyramid[row - 1][col] + pyramid[row - 1][col + 1];
    }
  }
  return pyramid;
}

// Get positions to hide based on difficulty
export function getHidePositions(n: number, difficulty: Difficulty): CellPosition[] {
  const positions: CellPosition[] = [];
  if (difficulty === 'easy') {
    // Hide all cells except the bottom row (row 0)
    for (let row = 1; row < n; row++) {
      for (let col = 0; col < n - row; col++) {
        positions.push([row, col]);
      }
    }
  } else if (difficulty === 'medium') {
    // Hide 2-3 cells in middle rows
    const middleRows = [1, 2].filter(r => r < n - 1);
    middleRows.forEach(row => {
      const count = Math.min(2 + Math.floor(Math.random() * 2), n - row);
      const cols = shuffle(Array.from({ length: n - row }, (_, i) => i)).slice(0, count);
      cols.forEach(col => positions.push([row, col]));
    });
    // Always hide the bottom row
    for (let col = 0; col < n; col++) {
      positions.push([0, col]);
    }
  } else if (difficulty === 'hard') {
    // Hide most cells except a few seeds
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n - row; col++) {
        positions.push([row, col]);
      }
    }
    // Reveal a few random seeds (3-5)
    const revealCount = Math.min(5, Math.floor(n / 2) + 2);
    const allPositions = positions.slice();
    const revealed = shuffle(allPositions).slice(0, revealCount);
    revealed.forEach(([row, col]) => {
      positions.splice(positions.findIndex(([r, c]) => r === row && c === col), 1);
    });
  }
  return positions;
}

// Shuffle helper
function shuffle<T>(arr: T[]): T[] {
  return arr
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

// Hide cells to create a puzzle
export function makePuzzle(solution: Pyramid, hidePositions: CellPosition[]): (number | null)[][] {
  return solution.map((row, r) => row.map((val, c) => hidePositions.some(([hr, hc]) => hr === r && hc === c) ? null : val));
}

// Generate multiple choice options for a cell
export function generateChoices(answer: number): number[] {
  const choices = new Set<number>([answer]);
  choices.add(answer + 1);
  choices.add(answer - 1);
  choices.add(answer + 2);
  choices.add(answer - 2);
  choices.add(answer + 3);
  choices.add(answer - 3);
  // Remove negatives and duplicates, limit to 4 distractors + 1 correct
  const filtered = Array.from(choices).filter(n => n >= 0 && n <= 99 && n !== answer);
  const distractors = shuffle(filtered).slice(0, 4);
  return shuffle([answer, ...distractors]).slice(0, 5);
}

// Check if a cell is correct
export function isCellCorrect(userValue: number | null, solutionValue: number): boolean {
  return userValue === solutionValue;
}

// Generate 4 choices for a cell with custom rules
export function getChoices(
  solution: number,
  row: number,
  col: number,
  solutionGrid: number[][],
  numberRange: number
): string[] {
  const choices = new Set([solution.toString()]);
  // Restrict options to [solution-10, solution+10] and >0
  let min = Math.max(1, solution - 10);
  let max = Math.min(numberRange, solution + 10);

  if (row > 0) {
    // Not bottom row: must be >= max(child1, child2)
    const child1 = solutionGrid[row - 1][col];
    const child2 = solutionGrid[row - 1][col + 1];
    min = Math.max(min, Math.max(child1, child2));
    // No upper bound
  } else if (solutionGrid.length > 1) {
    // Bottom row: must be <= parent (if any)
    if (solutionGrid.length > 1) {
      let parent = null;
      if (col < solutionGrid[1].length) parent = solutionGrid[1][col];
      if (col > 0 && solutionGrid[1][col - 1] !== undefined) {
        parent = parent !== null ? Math.min(parent, solutionGrid[1][col - 1]) : solutionGrid[1][col - 1];
      }
      if (parent !== null) max = Math.min(max, parent);
    }
  }

  const options = [];
  for (let n = min; n <= max; n++) {
    if (n !== solution) options.push(n);
  }

  // Pick up to 3 random distractors
  for (let i = 0; i < 3 && options.length > 0; i++) {
    const idx = Math.floor(Math.random() * options.length);
    choices.add(options[idx].toString());
    options.splice(idx, 1);
  }

  // Shuffle and return
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

// Helper: deep copy a pyramid
function deepCopyPyramid(pyramid: (number | null)[][]): (number | null)[][] {
  return pyramid.map(row => row.slice());
}

// Solver: counts the number of solutions for a masked pyramid
export function findSolutions(puzzle: (number | null)[][], maxSolutions = 2): number {
  const N = puzzle.length;
  // Copy to avoid mutating input
  const grid = deepCopyPyramid(puzzle);
  let count = 0;

  function solve(row: number, col: number): boolean {
    if (row === N) {
      count++;
      return count < maxSolutions;
    }
    if (col === N - row) {
      return solve(row + 1, 0);
    }
    if (grid[row][col] !== null) {
      return solve(row, col + 1);
    }
    // Try all possible values for this cell
    // For bottom row, allow 1-9; for others, must be sum of children
    if (row === 0) {
      for (let v = 1; v <= 9; v++) {
        grid[row][col] = v;
        if (solve(row, col + 1) === false) return false;
        grid[row][col] = null;
      }
    } else {
      // Must be sum of children
      const below = grid[row - 1];
      if (below[col] !== null && below[col + 1] !== null) {
        const v = (below[col]! + below[col + 1]!);
        grid[row][col] = v;
        if (solve(row, col + 1) === false) return false;
        grid[row][col] = null;
      }
    }
    return true;
  }
  solve(0, 0);
  return count;
}

// Smart masking: remove cells while ensuring unique solution
export function smartMaskPyramid(
  solution: number[][],
  maxBlanks: number,
  allowedRows: number[]
): (number | null)[][] {
  const N = solution.length;
  let puzzle: (number | null)[][] = solution.map(row => row.slice());
  let coords: [number, number][] = [];
  for (let row of allowedRows) {
    for (let col = 0; col < puzzle[row].length; ++col) {
      // Don't remove the top cell
      if (!(row === N - 1 && col === 0)) coords.push([row, col]);
    }
  }
  // Shuffle the coordinates
  for (let i = coords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [coords[i], coords[j]] = [coords[j], coords[i]];
  }
  let blanks = 0;
  for (const [row, col] of coords) {
    const backup = puzzle[row][col];
    puzzle[row][col] = null;
    if (findSolutions(puzzle, 2) === 1) {
      blanks++;
      if (blanks >= maxBlanks) break;
    } else {
      puzzle[row][col] = backup;
    }
  }
  return puzzle;
} 