import { ChevronDown } from 'lucide-react';
import type { ComponentType } from 'react';

import { cn } from '../../lib/cn';

type IconComponent = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;

type SidebarItemProps = {
  icon: IconComponent;
  label: string;
  active?: boolean;
  hasSub?: boolean;
  expanded?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
};

export default function SidebarItem({
  icon: Icon,
  label,
  active = false,
  hasSub = false,
  expanded = false,
  collapsed = false,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={hasSub ? expanded : undefined}
      className={cn(
        'focus-ring group w-full cursor-pointer border-0 bg-transparent text-left transition-colors duration-200',
        collapsed ? 'flex justify-center px-0 py-4' : 'flex items-center justify-between px-5 py-4',
        active
          ? collapsed
            ? 'bg-[var(--color-sidebar-active-bg)] font-semibold text-[var(--color-sidebar-active-text)]'
            : 'border-r-[3px] border-[var(--color-sidebar-active-accent)] bg-[var(--color-sidebar-active-bg)] font-semibold text-[var(--color-sidebar-active-text)]'
          : 'text-[var(--color-text-primary)] hover:bg-[var(--color-sidebar-hover-bg)]'
      )}
    >
      <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-4')}>
        <Icon
          size={collapsed ? 18 : 22}
          className={cn(
            'transition-colors duration-200',
            active
              ? 'text-[var(--color-sidebar-active-text)]'
              : 'text-[var(--color-text-primary)] group-hover:text-[var(--color-sidebar-active-text)]'
          )}
        />
        {!collapsed ? (
          <span className={cn('text-[16px] leading-none', active ? 'font-semibold' : 'font-medium')}>
            {label}
          </span>
        ) : null}
      </div>
      {!collapsed && hasSub ? (
        <ChevronDown
          size={16}
          className={cn(
            'transition-transform duration-200',
            active ? 'text-[var(--color-sidebar-active-text)]' : 'text-[var(--color-text-primary)]',
            expanded && 'rotate-180'
          )}
        />
      ) : null}
    </button>
  );
}
