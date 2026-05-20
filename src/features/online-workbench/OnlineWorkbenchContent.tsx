import type { ReactNode, RefObject } from 'react';

import WorkbenchResizeHandle from '../workbench/WorkbenchResizeHandle';

type OnlineWorkbenchContentProps = {
  layoutRef: RefObject<HTMLDivElement | null>;
  leftPanelWidth: number;
  isLeftResizing: boolean;
  onStartLeftResize: () => void;
  onResetLeftPanelWidth: () => void;
  leftContent: ReactNode;
  children: ReactNode;
};

export default function OnlineWorkbenchContent({
  layoutRef,
  leftPanelWidth,
  isLeftResizing,
  onStartLeftResize,
  onResetLeftPanelWidth,
  leftContent,
  children,
}: OnlineWorkbenchContentProps) {
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1280;

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden bg-canvas px-4 pb-4 pt-3 animate-fade-in-up">
      <div ref={layoutRef} className="flex h-full min-h-0 w-full flex-col gap-3 xl:flex-row xl:gap-1.5">
        <div
          className="flex min-h-0 xl:shrink-0"
          style={{
            width: isDesktop ? `${leftPanelWidth}px` : undefined,
          }}
        >
          {leftContent}
          <WorkbenchResizeHandle
            direction="col"
            active={isLeftResizing}
            ariaLabel="调整在线工作台左侧宽度"
            className="w-2"
            trackClassName="flex h-20 w-[3px] flex-col items-center justify-center gap-1 rounded-full bg-transparent transition-colors"
            indicatorClassName="h-8 w-[2px] rounded-full bg-slate-200 transition-colors group-hover:bg-brand-300"
            onMouseDown={(event) => {
              event.preventDefault();
              onStartLeftResize();
            }}
            onDoubleClick={(event) => {
              event.preventDefault();
              onResetLeftPanelWidth();
            }}
          />
        </div>
        {children}
      </div>
    </div>
  );
}
