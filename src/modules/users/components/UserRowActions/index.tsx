'use client';

import { Pencil, MoreVertical, UserPlus, UserX, UserCheck, Trash2, MapPin } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { UserResponse } from '@/modules/users/services/user.service';

interface UserRowActionsProps {
  user: UserResponse;
  hasCooperatives: boolean;
  onEdit: () => void;
  onAssign: () => void;
  onAssignPlots: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}

/** Edit + overflow action menu for user table rows. */
export const UserRowActions = ({
  user,
  hasCooperatives,
  onEdit,
  onAssign,
  onAssignPlots,
  onToggleActive,
  onDelete,
}: UserRowActionsProps) => (
  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
    <button
      type="button"
      onClick={onEdit}
      title="Editar"
      className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 active:scale-[0.97]"
    >
      <Pencil className="h-3.5 w-3.5" />
    </button>
    <DropdownMenu>
      <DropdownMenuTrigger>
        <span
          className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 active:scale-[0.97]"
        >
          <MoreVertical className="h-4 w-4" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {hasCooperatives && (
          <>
            <DropdownMenuItem onClick={onAssign}>
              <UserPlus className="h-3.5 w-3.5" />
              Asignar cooperativa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAssignPlots}>
              <MapPin className="h-3.5 w-3.5" />
              Asignar parcelas
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          onClick={onToggleActive}
          className={user.isActive ? 'text-red-600 focus:text-red-600 focus:bg-red-50' : 'text-[#27ae60] focus:text-[#27ae60] focus:bg-[#27ae60]/5'}
        >
          {user.isActive ? (
            <><UserX className="h-3.5 w-3.5" />Desactivar</>
          ) : (
            <><UserCheck className="h-3.5 w-3.5" />Activar</>
          )}
        </DropdownMenuItem>
        {!user.isSuperadmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);
