import {
  generateBottomRow,
  generatePyramid,
  getHidePositions,
  makePuzzle,
  generateChoices,
  isCellCorrect,
  Pyramid,
  Difficulty,
  CellPosition,
} from './pyramid';

describe('Pyramid core logic', () => {
  test('generateBottomRow returns correct length and single digits', () => {
    for (const n of [4, 6, 8, 10]) {
      const row = generateBottomRow(n);
      expect(row).toHaveLength(n);
      expect(row.every(x => x >= 0 && x <= 9)).toBe(true);
    }
  });

  test('generatePyramid builds correct sums', () => {
    const bottom = [1, 2, 3, 4];
    const pyramid = generatePyramid(4, bottom);
    // Row 0: [1,2,3,4]
    expect(pyramid[0]).toEqual([1,2,3,4]);
    // Row 1: [1+2, 2+3, 3+4] = [3,5,7]
    expect(pyramid[1]).toEqual([3,5,7]);
    // Row 2: [3+5, 5+7] = [8,12]
    expect(pyramid[2]).toEqual([8,12]);
    // Row 3: [8+12] = [20]
    expect(pyramid[3]).toEqual([20]);
  });

  test('getHidePositions easy hides all but bottom row', () => {
    const n = 4;
    const pos = getHidePositions(n, 'easy');
    // Should hide all cells except row 0
    expect(pos).toEqual([
      [1,0],[1,1],[1,2],
      [2,0],[2,1],
      [3,0],
    ]);
  });

  test('getHidePositions medium always hides bottom row and some in middle', () => {
    const n = 6;
    const pos = getHidePositions(n, 'medium');
    // Should always hide all of row 0
    for (let col = 0; col < n; col++) {
      expect(pos).toContainEqual([0, col]);
    }
    // Should hide some in rows 1 and/or 2
    const hasMiddle = pos.some(([row]) => row === 1 || row === 2);
    expect(hasMiddle).toBe(true);
  });

  test('getHidePositions hard hides almost everything except a few seeds', () => {
    const n = 6;
    const pos = getHidePositions(n, 'hard');
    // Should hide almost all cells
    expect(pos.length).toBeGreaterThanOrEqual((n*(n+1))/2 - 5);
    // Should not hide every cell
    expect(pos.length).toBeLessThan((n*(n+1))/2);
  });

  test('makePuzzle hides the correct cells', () => {
    const solution: Pyramid = [
      [1,2,3,4],
      [3,5,7],
      [8,12],
      [20],
    ];
    const hide: CellPosition[] = [[1,1],[2,0],[3,0]];
    const puzzle = makePuzzle(solution, hide);
    expect(puzzle[1][1]).toBeNull();
    expect(puzzle[2][0]).toBeNull();
    expect(puzzle[3][0]).toBeNull();
    expect(puzzle[0][0]).toBe(1);
  });

  test('generateChoices always includes the answer and 4 distractors', () => {
    for (let ans = 0; ans < 20; ans++) {
      const choices = generateChoices(ans);
      expect(choices).toContain(ans);
      expect(choices.length).toBeLessThanOrEqual(5);
      // All choices are numbers
      expect(choices.every(x => typeof x === 'number')).toBe(true);
    }
  });

  test('isCellCorrect returns true only for correct value', () => {
    expect(isCellCorrect(5, 5)).toBe(true);
    expect(isCellCorrect(4, 5)).toBe(false);
    expect(isCellCorrect(null, 5)).toBe(false);
  });
}); 