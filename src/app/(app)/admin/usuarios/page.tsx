'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useListUsers } from '@/modules/users/hooks/useListUsers';
import { useUpdateUser } from '@/modules/users/hooks/useUpdateUser';
import { useDeleteUser } from '@/modules/users/hooks/useDeleteUser';
import { useListCooperatives } from '@/modules/cooperatives/hooks/useListCooperatives';
import { useBoolean } from '@/@common/hooks/useBoolean';
import { useConfirmModal } from '@/@common/hooks/useConfirmModal';
import { UserFormModal } from '@/modules/users/components/UserFormModal';
import { AssignCooperativeModal } from '@/modules/users/components/AssignCooperativeModal';
import { AssignPlotsModal } from '@/modules/users/components/AssignPlotsModal';
import { UserDetailPanel } from '@/modules/users/components/UserDetailPanel';
import { UserRowActions } from '@/modules/users/components/UserRowActions';
import { type UserResponse, ERoles } from '@/modules/users/services/user.service';

/** Usuarios admin page — list, create, edit, delete, assign cooperatives, and assign plots. */
const UsersPage = () => {
  const ListUsers = useListUsers();
  const ListCooperatives = useListCooperatives();
  const UpdateUser = useUpdateUser();
  const DeleteUser = useDeleteUser();
  const showForm = useBoolean();
  const { confirm, dialog } = useConfirmModal();

  const userList = ListUsers.data?.items ?? [];
  const cooperatives = ListCooperatives.data?.items ?? [];

  const [editTarget, setEditTarget] = useState<UserResponse | undefined>();
  const [detailUser, setDetailUser] = useState<UserResponse | null>(null);
  const [assignTarget, setAssignTarget] = useState<UserResponse | null>(null);
  const [assignPlotsTarget, setAssignPlotsTarget] = useState<UserResponse | null>(null);

  useEffect(() => {
    ListUsers.handler();
    ListCooperatives.handler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Upserts the saved user and merges cooperative assignment if it's a new user. */
  const handleSaved = (u: UserResponse, cooperativeId?: string, roleKey?: ERoles, memberCode?: string) => {
    const isNew = !ListUsers.data?.items.find((x) => x.id === u.id);
    if (isNew && cooperativeId) {
      const coop = cooperatives.find((c) => c.id === cooperativeId);
      ListUsers.onUpsert({
        ...u,
        cooperatives: [
          ...u.cooperatives,
          {
            cooperativeId,
            cooperativeName: coop?.name ?? '',
            memberCode: memberCode ?? null,
            roles: [roleKey ?? 'member'],
          },
        ],
      });
    } else {
      ListUsers.onUpsert(u);
    }
    setDetailUser((prev) => (prev?.id === u.id ? u : prev));
  };

  /** Appends a cooperative entry to the user in both list and detail panel. */
  const handleAssigned = (userId: string, cooperativeId: string, roleKey: ERoles, memberCode?: string) => {
    const coop = cooperatives.find((c) => c.id === cooperativeId);
    if (!coop) return;
    const entry = { cooperativeId: coop.id, cooperativeName: coop.name, memberCode: memberCode ?? null, roles: [roleKey] };
    const current = ListUsers.data?.items.find((u) => u.id === userId);
    if (!current) return;
    const updated = { ...current, cooperatives: [...current.cooperatives, entry] };
    ListUsers.onUpsert(updated);
    setDetailUser((prev) => (prev?.id === userId ? updated : prev));
  };

  const handleToggleActive = async (u: UserResponse) => {
    const result = await UpdateUser.handler(u.id, { isActive: !u.isActive });
    if (result) {
      const patched = { ...u, ...result };
      ListUsers.onUpsert(patched);
      setDetailUser((prev) => (prev?.id === u.id ? patched : prev));
    }
  };

  const handleDelete = async (u: UserResponse) => {
    const ok = await confirm({
      title: `¿Eliminar a "${u.fullName}"?`,
      description: 'Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      variant: 'destructive',
    });
    if (!ok) return;
    await DeleteUser.handler(u.id);
    ListUsers.onRemove(u.id);
    if (detailUser?.id === u.id) setDetailUser(null);
  };

  const openCreate = () => {
    setEditTarget(undefined);
    showForm.on();
  };

  const openEdit = (u: UserResponse) => {
    setEditTarget(u);
    showForm.on();
  };

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Usuarios</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {userList.length} usuario{userList.length !== 1 ? 's' : ''} registrado{userList.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#27ae60] px-4 py-2 text-sm font-medium text-white shadow-sm transition-[transform,background-color] duration-160 ease-out hover:bg-[#219a52] active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </button>
        </div>

        {ListUsers.loading && userList.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#27ae60] border-t-transparent" />
          </div>
        )}

        {!ListUsers.loading && userList.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16">
            <p className="text-sm font-medium text-gray-500">Ningún usuario registrado</p>
            <p className="mt-1 text-xs text-gray-400">Crea el primero usando el botón superior</p>
          </div>
        )}

        {userList.length > 0 && (
          <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Nombre</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Correo</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Cooperativas</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {userList.map((u) => (
                  <tr key={u.id} onClick={() => setDetailUser(u)} className="cursor-pointer transition-colors hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{u.fullName}</p>
                      {u.isSuperadmin && (
                        <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700">superadmin</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{u.email}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {u?.cooperatives?.length === 0
                        ? <span className="text-gray-300">—</span>
                        : u?.cooperatives?.map((c) => c.cooperativeName).join(', ')}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <UserRowActions
                        user={u}
                        hasCooperatives={cooperatives.length > 0}
                        onEdit={() => openEdit(u)}
                        onAssign={() => setAssignTarget(u)}
                        onAssignPlots={() => setAssignPlotsTarget(u)}
                        onToggleActive={() => handleToggleActive(u)}
                        onDelete={() => handleDelete(u)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {userList.length > 0 && (
          <div className="space-y-3 md:hidden">
            {userList.map((u) => (
              <div key={u.id} className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
                <button type="button" onClick={() => setDetailUser(u)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#27ae60]/10 text-sm font-bold text-[#27ae60]">
                    {u.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-gray-900">{u.fullName}</p>
                      {u.isSuperadmin && (
                        <span className="shrink-0 rounded-full bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700">SA</span>
                      )}
                    </div>
                    <p className="truncate text-xs text-gray-400">{u.email}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {u.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </button>
                <UserRowActions
                  user={u}
                  hasCooperatives={cooperatives.length > 0}
                  onEdit={() => openEdit(u)}
                  onAssign={() => setAssignTarget(u)}
                  onAssignPlots={() => setAssignPlotsTarget(u)}
                  onToggleActive={() => handleToggleActive(u)}
                  onDelete={() => handleDelete(u)}
                />
              </div>
            ))}
          </div>
        )}

        <UserFormModal
          open={showForm.active}
          onClose={showForm.off}
          onSaved={handleSaved}
          user={editTarget}
          cooperatives={cooperatives}
        />

        {detailUser && <UserDetailPanel user={detailUser} onClose={() => setDetailUser(null)} />}

        {assignTarget && (
          <AssignCooperativeModal
            user={assignTarget}
            cooperatives={cooperatives}
            onClose={() => setAssignTarget(null)}
            onAssigned={(cooperativeId, roleKey, memberCode) => {
              handleAssigned(assignTarget.id, cooperativeId, roleKey, memberCode);
              setAssignTarget(null);
            }}
          />
        )}

        {assignPlotsTarget && cooperatives.length > 0 && (
          <AssignPlotsModal
            user={assignPlotsTarget}
            cooperativeId={cooperatives[0].id}
            onClose={() => setAssignPlotsTarget(null)}
            onAssigned={() => setAssignPlotsTarget(null)}
          />
        )}
      </div>

      {dialog}
    </>
  );
};

export default UsersPage;
