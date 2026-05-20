import { Mail } from 'lucide-react';

import { cn } from '../../lib/cn';

type DirectorExpressTriggerProps = {
  unreadCount: number;
  onClick: () => void;
  buttonClassName?: string;
  badgeClassName?: string;
  iconSize?: number;
};

export default function DirectorExpressTrigger({
  unreadCount,
  onClick,
  buttonClassName,
  badgeClassName,
  iconSize = 16,
}: DirectorExpressTriggerProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        className={cn('flex items-center gap-2', buttonClassName)}
      >
        <Mail size={iconSize} />
        总监直通车
      </button>
      {unreadCount > 0 ? (
        <span
          className={cn(
            'absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-[10px] text-white',
            badgeClassName
          )}
        >
          {unreadCount}
        </span>
      ) : null}
    </div>
  );
}
