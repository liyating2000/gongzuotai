import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Move, X } from 'lucide-react';

import { cn } from '../../lib/cn';

type FloatingPanelProps = {
  isOpen: boolean;
  title: ReactNode;
  subtitle?: ReactNode;
  accent?: 'brand' | 'accent';
  width?: number;
  maxHeight?: number;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
};

const DEFAULT_MARGIN = 24;

export default function FloatingPanel({
  isOpen,
  title,
  subtitle,
  accent = 'brand',
  width = 520,
  maxHeight = 560,
  children,
  footer,
  onClose,
}: FloatingPanelProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Place panel at top-right on first open.
  useEffect(() => {
    if (!isOpen || position !== null) return;
    const vw = window.innerWidth;
    setPosition({
      x: Math.max(DEFAULT_MARGIN, vw - width - DEFAULT_MARGIN),
      y: 96,
    });
  }, [isOpen, position, width]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    const nextX = dragRef.current.offsetX + dx;
    const nextY = dragRef.current.offsetY + dy;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setPosition({
      x: Math.min(Math.max(-width + 80, nextX), vw - 80),
      y: Math.min(Math.max(0, nextY), vh - 80),
    });
  }, [width]);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleDragStart = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!position) return;
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      offsetX: position.x,
      offsetY: position.y,
    };
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Reset saved position when closed, so next open re-anchors.
  useEffect(() => {
    if (!isOpen) setPosition(null);
  }, [isOpen]);

  if (!isOpen || !position) return null;

  const accentBar =
    accent === 'accent'
      ? 'from-accent-500 to-accent-400'
      : 'from-brand-500 to-brand-400';

  return createPortal(
    <div
      role="dialog"
      aria-modal="false"
      className="pointer-events-auto fixed z-[120] overflow-hidden rounded-[16px] border border-slate-200/80 bg-white shadow-[0_28px_60px_rgba(15,23,42,0.22)]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${width}px`,
        maxHeight: `${maxHeight}px`,
      }}
    >
      <div className="flex h-full max-h-[inherit] flex-col">
        {/* Draggable header */}
        <div
          onMouseDown={handleDragStart}
          className="flex shrink-0 cursor-grab items-center justify-between gap-3 border-b border-hairline bg-gradient-to-b from-white to-slate-50/60 px-4 py-3 active:cursor-grabbing"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden
              className={cn(
                'h-4 w-1 rounded-full bg-gradient-to-b',
                accentBar
              )}
            />
            <div className="min-w-0">
              <div className="truncate text-[14px] font-bold text-slate-800">
                {title}
              </div>
              {subtitle ? (
                <div className="mt-0.5 truncate text-[11px] text-slate-400">
                  {subtitle}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-slate-300">
            <Move size={13} className="mr-1" aria-hidden />
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭窗口"
              className="focus-ring flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
          {children}
        </div>

        {footer ? (
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-hairline bg-slate-50/40 px-4 py-2.5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
