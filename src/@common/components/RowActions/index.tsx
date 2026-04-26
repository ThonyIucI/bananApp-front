'use client';

import type { LucideIcon } from 'lucide-react';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface RowAction {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  /** Renders as a standalone icon button. Defaults to dropdown item. */
  inline?: boolean;
  /** Visual variant. Defaults to 'default'. */
  variant?: 'default' | 'destructive';
}

export interface RowActionsProps {
  actions: RowAction[];
}

/** Configurable row action buttons: inline icon buttons and/or a dropdown menu. */
export const RowActions = ({ actions }: RowActionsProps) => {
  const inlineActions = actions.filter((a) => a.inline);
  const menuActions = actions.filter((a) => !a.inline);

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      {inlineActions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.label}
            type="button"
            variant="ghost"
            size="icon"
            onClick={action.onClick}
            title={action.label}
            className={action.variant === 'destructive' ? 'hover:bg-red-50 hover:text-red-500' : undefined}
          >
            <Icon />
          </Button>
        );
      })}

      {menuActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button type="button" variant="ghost" size="icon" title="Más acciones">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {menuActions.map((action, i) => {
              const Icon = action.icon;
              const isDestructive = action.variant === 'destructive';
              const prevIsDestructive = i > 0 && menuActions[i - 1].variant === 'destructive';
              return (
                <span key={action.label}>
                  {isDestructive && i > 0 && !prevIsDestructive && <DropdownMenuSeparator />}
                  <DropdownMenuItem variant={action.variant} onClick={action.onClick}>
                    <Icon />
                    {action.label}
                  </DropdownMenuItem>
                </span>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
