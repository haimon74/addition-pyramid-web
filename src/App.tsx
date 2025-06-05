import React, { useState, useEffect } from 'react';
import './App.css';
import { generateBottomRow, generatePyramid, getHidePositions, makePuzzle, generateChoices, isCellCorrect, Pyramid, CellPosition, Difficulty, getChoices, smartMaskPyramid } from './utils/pyramid';
import PyramidGrid from './components/PyramidGrid';
import Controls from './components/Controls';

const defaultSize = 4;
const defaultDifficulty: Difficulty = 'easy';

function createEmptyAnswers(puzzle: (number | null)[][]) {
  return puzzle.map(row => row.map(cell => (cell === null ? null : cell)));
}

function createEmptyHighlights(puzzle: (number | null)[][]) {
  return puzzle.map(row => row.map(() => false));
}

function getInitialState(size: number, difficulty: Difficulty) {
  const bottom = generateBottomRow(size);
  const solution = generatePyramid(size, bottom);
  let puzzle: (number | null)[][];
  let hidePositions: [number, number][] = [];
  if (difficulty === 'easy') {
    // Only mask in the last two rows
    const allowedRows = [0, 1].filter(r => r < size);
    const maxBlanks = Math.max(3, Math.floor(size * 0.8));
    puzzle = smartMaskPyramid(solution, maxBlanks, allowedRows);
    // Derive hidePositions from puzzle
    hidePositions = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size - row; col++) {
        if (puzzle[row][col] === null) hidePositions.push([row, col]);
      }
    }
  } else if (difficulty === 'medium') {
    // Mask from the bottom half of the rows
    const half = Math.floor(size / 2);
    const allowedRows = Array.from({ length: half + 1 }, (_, i) => i);
    const maxBlanks = Math.max(6, Math.floor(size * 1.5));
    puzzle = smartMaskPyramid(solution, maxBlanks, allowedRows);
    hidePositions = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size - row; col++) {
        if (puzzle[row][col] === null) hidePositions.push([row, col]);
      }
    }
  } else {
    // Hard: mask from all rows except the top cell
    const allowedRows = Array.from({ length: size - 1 }, (_, i) => i);
    const maxBlanks = Math.max(10, Math.floor(size * 2.5));
    puzzle = smartMaskPyramid(solution, maxBlanks, allowedRows);
    hidePositions = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size - row; col++) {
        if (puzzle[row][col] === null) hidePositions.push([row, col]);
      }
    }
  }
  const userAnswers = createEmptyAnswers(puzzle);
  return { bottom, solution, hidePositions, puzzle, userAnswers };
}

function getCellKey(row: number, col: number) {
  return `${row}-${col}`;
}

const App: React.FC = () => {
  const [size, setSize] = useState(defaultSize);
  const [difficulty, setDifficulty] = useState<Difficulty>(defaultDifficulty);
  const [solution, setSolution] = useState<Pyramid>([]);
  const [puzzle, setPuzzle] = useState<(number | null)[][]>([]);
  const [userAnswers, setUserAnswers] = useState<(number | null)[][]>([]);
  const [hintMode, setHintMode] = useState(false);
  const [highlighted, setHighlighted] = useState<boolean[][]>([]);
  const [multipleChoiceCell, setMultipleChoiceCell] = useState<CellPosition | null>(null);
  const [multipleChoices, setMultipleChoices] = useState<string[]>([]);
  const [cellChoices, setCellChoices] = useState<Record<string, string[]>>({});

  // Generate a new puzzle
  const newPuzzle = React.useCallback(() => {
    const { solution, puzzle, userAnswers, hidePositions } = getInitialState(size, difficulty);
    setSolution(solution);
    setPuzzle(puzzle);
    setUserAnswers(userAnswers);
    setHintMode(false);
    setHighlighted(createEmptyHighlights(puzzle));
    setMultipleChoiceCell(null);
    setMultipleChoices([]);
    // Memoize choices for all hidden cells
    const numberRange = Math.max(99, ...solution.flat());
    const choicesMap: Record<string, string[]> = {};
    hidePositions.forEach(([row, col]) => {
      choicesMap[getCellKey(row, col)] = getChoices(
        solution[row][col],
        row,
        col,
        solution,
        numberRange
      );
    });
    setCellChoices(choicesMap);
  }, [size, difficulty]);

  useEffect(() => {
    newPuzzle();
  }, [size, difficulty, newPuzzle]);

  // Input handler (not used anymore)

  // Hint mode: highlight wrong answers
  useEffect(() => {
    if (hintMode) {
      setHighlighted(userAnswers.map((row, r) =>
        row.map((val, c) => {
          if (puzzle[r][c] !== null) return false;
          if (val === null) return false;
          return !isCellCorrect(val, solution[r][c]);
        })
      ));
    } else {
      setHighlighted(createEmptyHighlights(puzzle));
      setMultipleChoiceCell(null);
      setMultipleChoices([]);
    }
  }, [hintMode, userAnswers, puzzle, solution]);

  // Cell click: show multiple choice popover
  const handleCellClick = React.useCallback((row: number, col: number) => {
    const key = getCellKey(row, col);
    const choices = cellChoices[key] || [];
    setMultipleChoiceCell([row, col]);
    setMultipleChoices(choices);
  }, [cellChoices]);

  // Multiple choice selection
  const handleChoiceSelect = React.useCallback((row: number, col: number, value: number) => {
    setUserAnswers(prev => prev.map((r, ri) => r.map((c, ci) => (ri === row && ci === col ? value : c))));
    setMultipleChoiceCell(null);
    setMultipleChoices([]);
  }, []);

  // Controls handlers
  const handleSetSize = (n: number) => setSize(n);
  const handleSetDifficulty = (d: string) => setDifficulty(d as Difficulty);
  const handleNewPuzzle = () => newPuzzle();
  const handleToggleHintMode = () => setHintMode(h => !h);

  // Check if solved
  const isSolved = userAnswers.every((row, r) => row.every((val, c) => (puzzle[r][c] === null ? val === solution[r][c] : true)));

  return (
    <div className="App">
      <h1>Pyramid Math Puzzle</h1>
      <Controls
        size={size}
        setSize={handleSetSize}
        difficulty={difficulty}
        setDifficulty={handleSetDifficulty}
        onNewPuzzle={handleNewPuzzle}
        hintMode={hintMode}
        toggleHintMode={handleToggleHintMode}
      />
      <PyramidGrid
        puzzle={puzzle}
        userAnswers={userAnswers}
        solution={solution}
        hintMode={hintMode}
        highlighted={highlighted}
        multipleChoiceCell={multipleChoiceCell}
        onCellClick={handleCellClick}
      />
      {multipleChoiceCell && multipleChoices.length > 0 && (
        <div className="multiple-choice-bar">
          {multipleChoices.map(choice => (
            <button
              key={choice}
              className="choice-btn"
              onClick={() => handleChoiceSelect(multipleChoiceCell[0], multipleChoiceCell[1], Number(choice))}
            >
              {choice}
            </button>
          ))}
        </div>
      )}
      {isSolved && <div className="solved-message">🎉 Puzzle Solved!</div>}
    </div>
  );
};

export default App;
