import React from 'react';
import { Pyramid, CellPosition } from '../utils/pyramid';

export interface PyramidGridProps {
  puzzle: (number | null)[][];
  userAnswers: (number | null)[][];
  solution: Pyramid;
  hintMode: boolean;
  highlighted: boolean[][];
  multipleChoiceCell: CellPosition | null;
  onCellClick: (row: number, col: number) => void;
}

interface PyramidCellProps {
  isHidden: boolean;
  userValue: number | null;
  cellValue: number | null;
  isHighlighted: boolean;
  isSelected: boolean;
  row: number;
  col: number;
  onCellClick: (row: number, col: number) => void;
}

const PyramidCell: React.FC<PyramidCellProps> = React.memo(({
  isHidden,
  userValue,
  cellValue,
  isHighlighted,
  isSelected,
  row,
  col,
  onCellClick,
}) => {
  const className = [
    'pyramid-cell',
    isHighlighted ? 'highlighted' : '',
    isSelected ? 'selected' : '',
  ].filter(Boolean).join(' ');
  return (
    <div
      className={className}
      onClick={() => {
        if (isHidden && !isSelected) {
          onCellClick(row, col);
        }
      }}
    >
      {isHidden ? (
        userValue !== null ? (
          <span className="cell-value">{userValue}</span>
        ) : (
          <span className="cell-value" style={{ color: '#bbb' }}>?</span>
        )
      ) : (
        <span className="cell-value">{cellValue}</span>
      )}
    </div>
  );
});

interface PyramidRowProps {
  row: (number | null)[];
  userRow: (number | null)[];
  highlightRow: boolean[];
  rowNum: number;
  multipleChoiceCell: CellPosition | null;
  onCellClick: (row: number, col: number) => void;
}

const PyramidRow: React.FC<PyramidRowProps> = React.memo(({
  row,
  userRow,
  highlightRow,
  rowNum,
  multipleChoiceCell,
  onCellClick,
}) => (
  <div className="pyramid-row">
    {row.map((cell, col) => (
      <PyramidCell
        key={col}
        isHidden={cell === null}
        userValue={userRow[col]}
        cellValue={cell}
        isHighlighted={highlightRow[col]}
        isSelected={!!(multipleChoiceCell && multipleChoiceCell[0] === rowNum && multipleChoiceCell[1] === col)}
        row={rowNum}
        col={col}
        onCellClick={onCellClick}
      />
    ))}
  </div>
));

export const PyramidGrid: React.FC<PyramidGridProps> = React.memo(({
  puzzle,
  userAnswers,
  highlighted,
  multipleChoiceCell,
  onCellClick,
}) => {
  if (
    !puzzle.length ||
    !userAnswers.length ||
    !highlighted.length ||
    puzzle.length !== userAnswers.length ||
    puzzle.length !== highlighted.length
  ) {
    return null;
  }
  const n = puzzle.length;
  return (
    <div className="pyramid-grid">
      {puzzle.slice().reverse().map((row, rIdx) => {
        const rowNum = n - 1 - rIdx;
        return (
          <PyramidRow
            key={rowNum}
            row={row}
            userRow={userAnswers[rowNum]}
            highlightRow={highlighted[rowNum]}
            rowNum={rowNum}
            multipleChoiceCell={multipleChoiceCell}
            onCellClick={onCellClick}
          />
        );
      })}
    </div>
  );
});

export default PyramidGrid; 