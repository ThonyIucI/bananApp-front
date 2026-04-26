'use client';

import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DetailPanelProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
  /**
   * Arbitrary action elements rendered in the panel header to the right of the title.
   * Use Button with variant="ghost" size="icon-sm" for consistency.
   */
  headerActions?: React.ReactNode;
}

/** Reusable slide-in detail panel with backdrop, header, and scrollable body. */
export const DetailPanel = ({ title, subtitle, children, onClose, headerActions }: DetailPanelProps) => (
  <div
    className="fixed inset-0 z-40 flex items-stretch justify-end"
    style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="animate-panel-in flex h-full w-full flex-col bg-white shadow-2xl sm:max-w-sm">
      <div className="flex items-center gap-1 border-b border-gray-100 px-4 py-4">
        <Button type="button" variant="ghost" size="icon-sm" onClick={onClose}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1 pl-1">
          <p className="truncate text-base font-semibold text-gray-900">{title}</p>
          {subtitle && <p className="truncate text-xs text-gray-400">{subtitle}</p>}
        </div>
        {headerActions}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
    </div>
  </div>
);
