import { useEffect, useRef } from 'react';

type UseDragResizeOptions = {
  active: boolean;
  cursor: 'col-resize' | 'row-resize';
  getNextValue: (event: MouseEvent) => number | null;
  onValueChange: (nextValue: number) => void;
  onResizeEnd: () => void;
};

export function useDragResize({
  active,
  cursor,
  getNextValue,
  onValueChange,
  onResizeEnd,
}: UseDragResizeOptions) {
  const getNextValueRef = useRef(getNextValue);
  const onValueChangeRef = useRef(onValueChange);
  const onResizeEndRef = useRef(onResizeEnd);

  useEffect(() => {
    getNextValueRef.current = getNextValue;
    onValueChangeRef.current = onValueChange;
    onResizeEndRef.current = onResizeEnd;
  }, [getNextValue, onResizeEnd, onValueChange]);

  useEffect(() => {
    if (!active || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const nextValue = getNextValueRef.current(event);
      if (nextValue === null) {
        return;
      }

      onValueChangeRef.current(nextValue);
    };

    const handleMouseUp = () => {
      onResizeEndRef.current();
    };

    document.body.style.cursor = cursor;
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [active, cursor]);
}
