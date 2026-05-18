'use client';

import { type ReactNode } from 'react';

interface ISettingsSection {
  id: string;
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
}

interface SettingsViewProps {
  sections: ISettingsSection[];
}

/**
 * Generic settings page layout.
 * Renders a list of labelled sections, each with a title, optional description and content.
 * Add new sections by passing additional items to the `sections` prop.
 */
export const SettingsView = ({ sections }: SettingsViewProps) => (
  <div className="mx-auto max-w-2xl space-y-8 py-6">
    {sections.map((section) => (
      <section key={section.id} aria-labelledby={`settings-${section.id}`}>
        {/* Section header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3BB25E]/10">
            {section.icon}
          </div>
          <div>
            <h2 id={`settings-${section.id}`} className="text-base font-semibold text-gray-900">
              {section.title}
            </h2>
            {section.description && (
              <p className="text-xs text-gray-400">{section.description}</p>
            )}
          </div>
        </div>

        {/* Section content */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          {section.children}
        </div>
      </section>
    ))}
  </div>
);
