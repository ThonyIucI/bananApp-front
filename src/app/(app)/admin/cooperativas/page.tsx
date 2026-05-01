'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import useRequest from '@/@common/hooks/useRequest';
import { useCreateCooperative } from '@/modules/cooperatives/hooks/useCreateCooperative';
import { useUpdateCooperative } from '@/modules/cooperatives/hooks/useUpdateCooperative';
import { useDeleteCooperative } from '@/modules/cooperatives/hooks/useDeleteCooperative';
import { useConfirmModal } from '@/@common/hooks/useConfirmModal';
import { ConfirmCloseDialog } from '@/@common/components/modals/ConfirmCloseDialog';
import { Input } from '@/@common/components/form/Input';
import {
  listCooperativesRequest,
  type CooperativeResponse,
} from '@/modules/cooperatives/services/cooperative.service';

interface CoopFormValues {
  name: string;
  ruc: string;
  address: string;
  department: string;
  province: string;
  district: string;
  sectors: { value: string }[];
}

/* ─── Form modal (create + edit) ─── */

const CooperativeFormModal = ({
  open,
  onClose,
  onSaved,
  cooperative,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (c: CooperativeResponse) => void;
  cooperative?: CooperativeResponse;
}) => {
  const isEdit = !!cooperative;
  const [showConfirm, setShowConfirm] = useState(false);
  const { loading: loadingCreate, handler: create } = useCreateCooperative();
  const { loading: loadingUpdate, handler: update } = useUpdateCooperative();
  const loading = isEdit ? loadingUpdate : loadingCreate;

  const { register, handleSubmit, control, reset, formState: { isDirty, errors } } =
    useForm<CoopFormValues>({
      defaultValues: {
        name: cooperative?.name ?? '',
        ruc: cooperative?.ruc ?? '',
        address: cooperative?.address ?? '',
        department: cooperative?.department ?? '',
        province: cooperative?.province ?? '',
        district: cooperative?.district ?? '',
        sectors: [],
      },
    });

  const { fields, append, remove } = useFieldArray({ control, name: 'sectors' });
  const tryClose = () => (isDirty ? setShowConfirm(true) : onClose());

  useEffect(() => {
    if (open)
      reset({
        name: cooperative?.name ?? '',
        ruc: cooperative?.ruc ?? '',
        address: cooperative?.address ?? '',
        department: cooperative?.department ?? '',
        province: cooperative?.province ?? '',
        district: cooperative?.district ?? '',
        sectors: [],
      });
  }, [open, cooperative, reset]);

  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') tryClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isDirty]);


  const onSubmit = async (v: CoopFormValues) => {
    let result: CooperativeResponse | null | undefined;
    if (isEdit) {
      result = await update(cooperative!.id, {
        name: v.name.trim(),
        address: v.address.trim() || undefined,
        department: v.department.trim() || undefined,
        province: v.province.trim() || undefined,
        district: v.district.trim() || undefined,
      });
    } else {
      const sectors = v.sectors.map((s) => s.value.trim()).filter(Boolean);
      result = await create({
        name: v.name.trim(),
        ruc: v.ruc.trim(),
        address: v.address.trim() || undefined,
        department: v.department.trim() || undefined,
        province: v.province.trim() || undefined,
        district: v.district.trim() || undefined,
        sectors: sectors.length ? sectors : undefined,
      });
    }
    if (result) { onSaved(result); onClose(); }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) tryClose(); }}
      >
        <div
          className="w-full rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl"
          style={{ animation: 'modal-in 250ms cubic-bezier(0.23,1,0.32,1) both' }}
        >
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-gray-300" />
          </div>
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              {isEdit ? 'Editar cooperativa' : 'Nueva cooperativa'}
            </h2>
            <button type="button" onClick={tryClose} className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form id="coop-form" onSubmit={handleSubmit(onSubmit)} className="max-h-[65vh] overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Input label="Nombre" required autoFocus placeholder="Cooperativa Agraria San José"
                    error={errors.name?.message}
                    {...register('name', { required: 'Campo requerido', minLength: { value: 3, message: 'Mínimo 3 caracteres' }, maxLength: 200 })}
                  />
                </div>
                <div className="col-span-2">
                  <Input label="RUC" required={!isEdit} placeholder="20123456789" maxLength={11}
                    disabled={isEdit}
                    error={errors.ruc?.message}
                    {...register('ruc', !isEdit ? { required: 'Campo requerido', pattern: { value: /^\d{11}$/, message: 'Debe tener 11 dígitos' } } : {})}
                  />
                </div>
                <div className="col-span-2">
                  <Input label="Dirección" placeholder="Av. Principal 123" {...register('address', { maxLength: 300 })} />
                </div>
                <Input label="Departamento" placeholder="La Libertad" {...register('department', { maxLength: 100 })} />
                <Input label="Provincia" placeholder="Trujillo" {...register('province', { maxLength: 100 })} />
                <div className="col-span-2">
                  <Input label="Distrito" placeholder="Víctor Larco" {...register('district', { maxLength: 100 })} />
                </div>
              </div>

              {!isEdit && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700">
                      Sectores <span className="text-gray-400">({fields.length}/50)</span>
                    </label>
                    <button type="button" onClick={() => fields.length < 50 && append({ value: '' })}
                      disabled={fields.length >= 50}
                      className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#27ae60] hover:bg-[#27ae60]/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Añadir sector
                    </button>
                  </div>
                  {fields.length === 0 && (
                    <p className="rounded-xl border border-dashed border-gray-200 px-3 py-4 text-center text-xs text-gray-400">
                      Sin sectores. Puedes añadirlos ahora o después.
                    </p>
                  )}
                  <div className="space-y-2">
                    {fields.map((field, idx) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <span className="w-5 text-center text-xs text-gray-400">{idx + 1}</span>
                        <input {...register(`sectors.${idx}.value`, { minLength: 2, maxLength: 100 })}
                          autoFocus placeholder="Nombre del sector"
                          className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#27ae60] focus:ring-2 focus:ring-[#27ae60]/20"
                        />
                        <button type="button" onClick={() => remove(idx)} className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>

          <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
            <button type="button" onClick={tryClose} className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-[transform,background-color] duration-160 ease-out hover:bg-gray-50 active:scale-[0.97]">
              Cancelar
            </button>
            <button type="submit" form="coop-form" disabled={loading || (isEdit && !isDirty)}
              className="cursor-pointer rounded-xl bg-[#27ae60] px-4 py-2 text-sm font-medium text-white transition-[transform,background-color] duration-160 ease-out hover:bg-[#219a52] disabled:opacity-60 active:scale-[0.97]"
            >
              {loading ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear cooperativa'}
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmCloseDialog
          onConfirm={() => { setShowConfirm(false); onClose(); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      <style>{`@keyframes modal-in{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}`}</style>
    </>
  );
};

/* ─── Detail panel (read-only) ─── */

const CooperativeDetailPanel = ({
  cooperative,
  onClose,
}: {
  cooperative: CooperativeResponse;
  onClose: () => void;
}) => (
  <>
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end"
      style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="flex h-full w-full flex-col bg-white shadow-2xl sm:max-w-sm"
        style={{ animation: 'panel-in 280ms cubic-bezier(0.23,1,0.32,1) both' }}
      >
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4">
          <button type="button" onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-gray-900">{cooperative.name}</p>
            <p className="text-xs text-gray-400">RUC {cooperative.ruc}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="divide-y divide-gray-50 rounded-2xl border border-gray-100">
            {[
              { label: 'Nombre', value: cooperative.name },
              { label: 'RUC', value: cooperative.ruc },
              { label: 'Dirección', value: cooperative.address ?? '—' },
              { label: 'Departamento', value: cooperative.department ?? '—' },
              { label: 'Provincia', value: cooperative.province ?? '—' },
              { label: 'Distrito', value: cooperative.district ?? '—' },
              { label: 'Creada', value: new Date(cooperative.createdAt).toLocaleDateString('es-PE') },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between px-4 py-3">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="ml-4 text-right text-sm font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <style>{`
      @keyframes panel-in{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}
      @media(max-width:639px){@keyframes panel-in{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}}
    `}</style>
  </>
);

/* ─── Row actions ─── */

const CoopRowActions = ({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <button type="button" onClick={onEdit}
        className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        title="Editar"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
        </svg>
      </button>
      <div ref={ref} className="relative">
        <button type="button" onClick={() => setMenuOpen((v) => !v)}
          className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 z-10 min-w-32 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
            <button type="button" onClick={() => { setMenuOpen(false); onDelete(); }}
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Page ─── */

const CooperativesPage = () => {
  const [cooperatives, setCooperatives] = useState<CooperativeResponse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<CooperativeResponse | undefined>();
  const [detail, setDetail] = useState<CooperativeResponse | null>(null);
  const { loading, handleRequest } = useRequest<Awaited<ReturnType<typeof listCooperativesRequest>>>();
  const { handler: deleteCoop } = useDeleteCooperative();
  const { confirm, dialog } = useConfirmModal();

  useEffect(() => {
    handleRequest(() => listCooperativesRequest()).then((r) => { if (r) setCooperatives(r.items); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Adds or replaces a cooperative in local state after create/edit. */
  const handleSaved = (c: CooperativeResponse) => {
    setCooperatives((prev) => {
      const idx = prev.findIndex((x) => x.id === c.id);
      return idx >= 0 ? prev.map((x) => (x.id === c.id ? c : x)) : [c, ...prev];
    });
  };

  const handleDelete = async (c: CooperativeResponse) => {
    const ok = await confirm({
      title: `¿Eliminar "${c.name}"?`,
      description: 'Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      variant: 'destructive',
    });
    if (!ok) return;
    await deleteCoop(c.id);
    setCooperatives((prev) => prev.filter((x) => x.id !== c.id));
    if (detail?.id === c.id) setDetail(null);
  };

  const openEdit = (c: CooperativeResponse) => { setEditTarget(c); setShowForm(true); };
  const openCreate = () => { setEditTarget(undefined); setShowForm(true); };

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Cooperativas</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {cooperatives.length} cooperativa{cooperatives.length !== 1 ? 's' : ''} registrada{cooperatives.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={openCreate} className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#27ae60] px-4 py-2 text-sm font-medium text-white shadow-sm transition-[transform,background-color] duration-160 ease-out hover:bg-[#219a52] active:scale-[0.97]">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva cooperativa
          </button>
        </div>

        {loading && cooperatives.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#27ae60] border-t-transparent" />
          </div>
        )}

        {!loading && cooperatives.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16">
            <svg className="mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
            <p className="text-sm font-medium text-gray-500">Ninguna cooperativa registrada</p>
            <p className="mt-1 text-xs text-gray-400">Crea la primera usando el botón superior</p>
          </div>
        )}

        {/* Desktop table */}
        {cooperatives.length > 0 && (
          <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Nombre</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">RUC</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Ubicación</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Creada</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cooperatives.map((c) => (
                  <tr key={c.id} onClick={() => setDetail(c)} className="cursor-pointer transition-colors hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-5 py-3 font-mono text-gray-600">{c.ruc}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {[c.district, c.province, c.department].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-400">{new Date(c.createdAt).toLocaleDateString('es-PE')}</td>
                    <td className="px-3 py-3">
                      <CoopRowActions onEdit={() => openEdit(c)} onDelete={() => handleDelete(c)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile cards */}
        {cooperatives.length > 0 && (
          <div className="space-y-3 md:hidden">
            {cooperatives.map((c) => (
              <div key={c.id} className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
                <button type="button" onClick={() => setDetail(c)} className="min-w-0 flex-1 text-left">
                  <p className="truncate font-semibold text-gray-900">{c.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-gray-500">{c.ruc}</p>
                  {(c.district || c.province || c.department) && (
                    <p className="mt-0.5 truncate text-xs text-gray-400">
                      {[c.district, c.province, c.department].filter(Boolean).join(', ')}
                    </p>
                  )}
                </button>
                <CoopRowActions onEdit={() => openEdit(c)} onDelete={() => handleDelete(c)} />
              </div>
            ))}
          </div>
        )}

        <CooperativeFormModal
          open={showForm}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
          cooperative={editTarget}
        />

        {detail && <CooperativeDetailPanel cooperative={detail} onClose={() => setDetail(null)} />}

        <style>{`@keyframes modal-in{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}@keyframes panel-in{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}@media(max-width:639px){@keyframes panel-in{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}}`}</style>
      </div>

      {dialog}
    </>
  );
};

export default CooperativesPage;
