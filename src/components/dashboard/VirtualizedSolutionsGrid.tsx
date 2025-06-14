
import React, { memo, useMemo, useCallback } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Solution } from '@/lib/supabase';
import { SolutionCard } from './SolutionCard';

interface VirtualizedSolutionsGridProps {
  solutions: Solution[];
  onSolutionClick: (solution: Solution) => void;
  itemsPerRow?: number;
  rowHeight?: number;
  gridHeight?: number;
}

interface GridItemProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    solutions: Solution[];
    onSolutionClick: (solution: Solution) => void;
    itemsPerRow: number;
  };
}

// Item do grid virtualizado
const GridItem = memo<GridItemProps>(({ columnIndex, rowIndex, style, data }) => {
  const { solutions, onSolutionClick, itemsPerRow } = data;
  const itemIndex = rowIndex * itemsPerRow + columnIndex;
  const solution = solutions[itemIndex];

  if (!solution) {
    return <div style={style} />;
  }

  return (
    <div style={{ ...style, padding: '8px' }}>
      <SolutionCard solution={solution} onClick={() => onSolutionClick(solution)} />
    </div>
  );
});

GridItem.displayName = 'GridItem';

// Grid virtualizado para grandes listas de soluções
export const VirtualizedSolutionsGrid = memo<VirtualizedSolutionsGridProps>(({
  solutions,
  onSolutionClick,
  itemsPerRow = 3,
  rowHeight = 320,
  gridHeight = 600
}) => {
  // Calcular dimensões do grid
  const { columnCount, rowCount } = useMemo(() => ({
    columnCount: itemsPerRow,
    rowCount: Math.ceil(solutions.length / itemsPerRow)
  }), [solutions.length, itemsPerRow]);

  // Memoizar dados do grid
  const gridData = useMemo(() => ({
    solutions,
    onSolutionClick,
    itemsPerRow
  }), [solutions, onSolutionClick, itemsPerRow]);

  // Calcular largura das colunas dinamicamente
  const getColumnWidth = useCallback(() => {
    const containerWidth = window.innerWidth - 64; // Margem de segurança
    return Math.floor(containerWidth / itemsPerRow);
  }, [itemsPerRow]);

  // Calcular largura total do grid
  const gridWidth = useMemo(() => {
    const containerWidth = typeof window !== 'undefined' ? window.innerWidth - 64 : 1200;
    return Math.min(containerWidth, 1200); // Max width de 1200px
  }, []);

  // Se há poucas soluções, usar grid normal
  if (solutions.length <= 12) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        {solutions.map((solution) => (
          <SolutionCard
            key={solution.id}
            solution={solution}
            onClick={() => onSolutionClick(solution)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <Grid
        columnCount={columnCount}
        columnWidth={getColumnWidth()}
        height={gridHeight}
        width={gridWidth}
        rowCount={rowCount}
        rowHeight={rowHeight}
        itemData={gridData}
        overscanRowCount={2}
        overscanColumnCount={1}
      >
        {GridItem}
      </Grid>
    </div>
  );
});

VirtualizedSolutionsGrid.displayName = 'VirtualizedSolutionsGrid';
