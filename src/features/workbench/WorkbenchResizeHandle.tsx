import type { MouseEventHandler } from 'react';

import { cn } from '../../lib/cn';

type WorkbenchResizeHandleProps = {
  direction: 'row' | 'col';
  active: boolean;
  ariaLabel: string;
  className: string;
  trackClassName: string;
  indicatorClassName: string;
  onMouseDown: MouseEventHandler<HTMLButtonElement>;
  onDoubleClick: MouseEventHandler<HTMLButtonElement>;
};

export default function WorkbenchResizeHandle({
  direction,
  active,
  ariaLabel,
  className,
  trackClassName,
  indicatorClassName,
  onMouseDown,
  onDoubleClick,
}: WorkbenchResizeHandleProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      className={cn(
        'group hidden shrink-0 items-center justify-center rounded-full transition-colors xl:flex',
        direction === 'row' ? 'cursor-row-resize' : 'cursor-col-resize',
        active ? 'bg-emerald-50' : 'hover:bg-slate-100',
        className
      )}
    >
      <span className={cn(trackClassName, active && 'bg-emerald-50')}>
        {Array.from({ length: 2 }, (_, index) => (
          <span key={index} className={cn(indicatorClassName, active && 'bg-emerald-300')} />
        ))}
      </span>
    </button>
  );
}
