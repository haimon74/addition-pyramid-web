import React from 'react';

interface ControlsProps {
  size: number;
  setSize: (n: number) => void;
  difficulty: string;
  setDifficulty: (d: string) => void;
  onNewPuzzle: () => void;
  hintMode: boolean;
  toggleHintMode: () => void;
}

const sizeOptions = [4, 6, 8, 10];
const difficultyOptions = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export const Controls: React.FC<ControlsProps> = ({
  size,
  setSize,
  difficulty,
  setDifficulty,
  onNewPuzzle,
  hintMode,
  toggleHintMode,
}) => (
  <div className="controls" style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
    <label>
      Size:
      <select value={size} onChange={e => setSize(Number(e.target.value))}>
        {sizeOptions.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
    <label>
      Difficulty:
      <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
        {difficultyOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
    <button onClick={onNewPuzzle}>New Puzzle</button>
    <button onClick={toggleHintMode} title="Toggle Hint Mode" style={{ background: hintMode ? '#ffe066' : undefined }}>
      <span role="img" aria-label="hint">💡</span>
    </button>
  </div>
);

export default Controls; 