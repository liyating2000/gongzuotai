import type { ReactNode, RefObject } from 'react';

import { cn } from '../../lib/cn';
import WorkbenchResizeHandle from '../workbench/WorkbenchResizeHandle';

type CallWorkbenchContentProps = {
  layoutRef: RefObject<HTMLDivElement | null>;
  leftPanelStackRef: RefObject<HTMLDivElement | null>;
  centerPanelRef: RefObject<HTMLDivElement | null>;
  centerPanelStackRef: RefObject<HTMLDivElement | null>;
  rightPanelStackRef: RefObject<HTMLDivElement | null>;
  leftPanelWidth: number;
  leftTopPanelHeight: number;
  centerPanelWidth: number;
  centerTopPanelHeight: number;
  rightTopPanelHeight: number;
  isLeftTopResizing: boolean;
  isLeftResizing: boolean;
  isCenterTopResizing: boolean;
  isCenterResizing: boolean;
  isRightTopResizing: boolean;
  onStartLeftTopResize: () => void;
  onResetLeftTopPanelHeight: () => void;
  onStartLeftResize: () => void;
  onResetLeftPanelWidth: () => void;
  onStartCenterTopResize: () => void;
  onResetCenterTopPanelHeight: () => void;
  onStartCenterResize: () => void;
  onResetCenterPanelWidth: () => void;
  onStartRightTopResize: () => void;
  onResetRightTopPanelHeight: () => void;
  leftTopContent: ReactNode;
  leftBottomContent: ReactNode;
  centerTopContent: ReactNode;
  centerBottomContent?: ReactNode;
  rightSidebar: ReactNode;
  rightLayoutMode: 'split' | 'single';
  rightTopContent?: ReactNode;
  rightBottomContent?: ReactNode;
  rightSingleContent?: ReactNode;
};

export default function CallWorkbenchContent({
  layoutRef,
  leftPanelStackRef,
  centerPanelRef,
  centerPanelStackRef,
  rightPanelStackRef,
  leftPanelWidth,
  leftTopPanelHeight,
  centerPanelWidth,
  centerTopPanelHeight,
  rightTopPanelHeight,
  isLeftTopResizing,
  isLeftResizing,
  isCenterTopResizing,
  isCenterResizing,
  isRightTopResizing,
  onStartLeftTopResize,
  onResetLeftTopPanelHeight,
  onStartLeftResize,
  onResetLeftPanelWidth,
  onStartCenterTopResize,
  onResetCenterTopPanelHeight,
  onStartCenterResize,
  onResetCenterPanelWidth,
  onStartRightTopResize,
  onResetRightTopPanelHeight,
  leftTopContent,
  leftBottomContent,
  centerTopContent,
  centerBottomContent,
  rightSidebar,
  rightLayoutMode,
  rightTopContent,
  rightBottomContent,
  rightSingleContent,
}: CallWorkbenchContentProps) {
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1280;
  const hasCenterBottomContent = centerBottomContent !== undefined && centerBottomContent !== null;

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden bg-canvas px-3 pb-3 pt-2">
      <div ref={layoutRef} className="flex h-full min-h-0 w-full flex-col gap-3 xl:flex-row xl:gap-0">
        <div
          className="flex min-h-0 xl:shrink-0"
          style={{
            width: isDesktop ? `${leftPanelWidth}px` : undefined,
          }}
        >
          <div ref={leftPanelStackRef} className="flex min-h-0 flex-1 flex-col gap-3 xl:gap-0">
            {leftTopContent}
            <WorkbenchResizeHandle
              direction="row"
              active={isLeftTopResizing}
              ariaLabel="调整呼叫工作台左侧区域高度"
              className="h-3"
              trackClassName="flex h-[3px] w-20 items-center justify-center gap-1 rounded-full bg-transparent transition-colors"
              indicatorClassName="h-[2px] w-7 rounded-full bg-slate-200 transition-colors group-hover:bg-brand-300"
              onMouseDown={(event) => {
                event.preventDefault();
                onStartLeftTopResize();
              }}
              onDoubleClick={(event) => {
                event.preventDefault();
                onResetLeftTopPanelHeight();
              }}
            />
            {leftBottomContent}
          </div>
        </div>

        <WorkbenchResizeHandle
          direction="col"
          active={isLeftResizing}
          ariaLabel="调整呼叫工作台左侧宽度"
          className="w-3"
          trackClassName="flex h-20 w-[3px] flex-col items-center justify-center gap-1 rounded-full bg-transparent transition-colors"
          indicatorClassName="h-7 w-[2px] rounded-full bg-slate-200 transition-colors group-hover:bg-brand-300"
          onMouseDown={(event) => {
            event.preventDefault();
            onStartLeftResize();
          }}
          onDoubleClick={(event) => {
            event.preventDefault();
            onResetLeftPanelWidth();
          }}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 xl:flex-row xl:gap-0">
          <div
            ref={centerPanelRef}
            className="flex min-h-0 min-w-0 xl:shrink-0"
            style={{
              width: isDesktop ? `${centerPanelWidth}px` : undefined,
            }}
          >
            <div ref={centerPanelStackRef} className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 xl:gap-0">
              <div
                className={cn('flex min-h-0 min-w-0 flex-1', hasCenterBottomContent && 'xl:flex-none')}
                style={
                  isDesktop && hasCenterBottomContent
                    ? { height: `${centerTopPanelHeight}px` }
                    : undefined
                }
              >
                {centerTopContent}
              </div>

              {hasCenterBottomContent ? (
                <>
                  <WorkbenchResizeHandle
                    direction="row"
                    active={isCenterTopResizing}
                    ariaLabel="调整呼叫工作台中间区域高度"
                    className="h-3"
                    trackClassName="flex h-[3px] w-20 items-center justify-center gap-1 rounded-full bg-transparent transition-colors"
                    indicatorClassName="h-[2px] w-7 rounded-full bg-slate-200 transition-colors group-hover:bg-brand-300"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onStartCenterTopResize();
                    }}
                    onDoubleClick={(event) => {
                      event.preventDefault();
                      onResetCenterTopPanelHeight();
                    }}
                  />

                  {centerBottomContent}
                </>
              ) : null}
            </div>
          </div>

          <WorkbenchResizeHandle
            direction="col"
            active={isCenterResizing}
            ariaLabel="调整呼叫工作台中间区域宽度"
            className="w-3"
            trackClassName="flex h-20 w-[3px] flex-col items-center justify-center gap-1 rounded-full bg-transparent transition-colors"
            indicatorClassName="h-7 w-[2px] rounded-full bg-slate-200 transition-colors group-hover:bg-brand-300"
            onMouseDown={(event) => {
              event.preventDefault();
              onStartCenterResize();
            }}
            onDoubleClick={(event) => {
              event.preventDefault();
              onResetCenterPanelWidth();
            }}
          />

          <div className="flex min-h-0 min-w-0 flex-1">
            <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[minmax(0,1fr)_50px] gap-2.5">
              <div
                ref={rightPanelStackRef}
                className={cn(
                  'min-h-0',
                  rightLayoutMode === 'split'
                    ? 'flex flex-col gap-4 xl:gap-0'
                    : 'grid grid-rows-[minmax(0,1fr)] gap-4'
                )}
              >
                {rightLayoutMode === 'split' ? (
                  <>
                    <div
                      className="flex min-h-0 flex-1 xl:flex-none"
                      style={isDesktop ? { height: `${rightTopPanelHeight}px` } : undefined}
                    >
                      {rightTopContent}
                    </div>
                    <WorkbenchResizeHandle
                      direction="row"
                      active={isRightTopResizing}
                      ariaLabel="调整呼叫工作台右侧区域高度"
                      className="h-4"
                      trackClassName="flex h-[3px] w-20 items-center justify-center gap-1 rounded-full bg-transparent transition-colors"
                      indicatorClassName="h-[2px] w-7 rounded-full bg-slate-200 transition-colors group-hover:bg-brand-300"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        onStartRightTopResize();
                      }}
                      onDoubleClick={(event) => {
                        event.preventDefault();
                        onResetRightTopPanelHeight();
                      }}
                    />
                    <div className="flex min-h-0 flex-1">{rightBottomContent}</div>
                  </>
                ) : (
                  rightSingleContent
                )}
              </div>

              {rightSidebar}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
