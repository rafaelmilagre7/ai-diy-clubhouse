import { useRef, useCallback } from 'react';

interface UseClickDragDetectionProps {
  onQuickClick: () => void;
  clickThreshold?: number; // ms para considerar um "clique rápido"
  moveThreshold?: number; // pixels de movimento para considerar "arrasto"
}

export const useClickDragDetection = ({
  onQuickClick,
  clickThreshold = 200,
  moveThreshold = 5
}: UseClickDragDetectionProps) => {
  const mouseDownTime = useRef<number | null>(null);
  const mouseDownPosition = useRef<{ x: number; y: number } | null>(null);
  const hasMoved = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    mouseDownTime.current = Date.now();
    mouseDownPosition.current = { x: e.clientX, y: e.clientY };
    hasMoved.current = false;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!mouseDownPosition.current) return;

    const deltaX = Math.abs(e.clientX - mouseDownPosition.current.x);
    const deltaY = Math.abs(e.clientY - mouseDownPosition.current.y);

    if (deltaX > moveThreshold || deltaY > moveThreshold) {
      hasMoved.current = true;
    }
  }, [moveThreshold]);

  const handleMouseUp = useCallback(() => {
    if (!mouseDownTime.current) return;

    const elapsed = Date.now() - mouseDownTime.current;
    const wasQuickClick = elapsed < clickThreshold && !hasMoved.current;

    if (wasQuickClick) {
      onQuickClick();
    }

    // Reset
    mouseDownTime.current = null;
    mouseDownPosition.current = null;
    hasMoved.current = false;
  }, [clickThreshold, onQuickClick]);

  // Touch events para mobile
  const touchStartTime = useRef<number | null>(null);
  const touchStartPosition = useRef<{ x: number; y: number } | null>(null);
  const touchHasMoved = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartTime.current = Date.now();
    touchStartPosition.current = { x: touch.clientX, y: touch.clientY };
    touchHasMoved.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartPosition.current || e.touches.length === 0) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPosition.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPosition.current.y);

    if (deltaX > moveThreshold || deltaY > moveThreshold) {
      touchHasMoved.current = true;
    }
  }, [moveThreshold]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartTime.current) return;

    const elapsed = Date.now() - touchStartTime.current;
    const wasQuickTap = elapsed < clickThreshold && !touchHasMoved.current;

    if (wasQuickTap) {
      onQuickClick();
    }

    // Reset
    touchStartTime.current = null;
    touchStartPosition.current = null;
    touchHasMoved.current = false;
  }, [clickThreshold, onQuickClick]);

  return {
    // Mouse events
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    
    // Touch events
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};
