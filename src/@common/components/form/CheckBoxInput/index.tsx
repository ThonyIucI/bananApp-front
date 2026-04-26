'use client';

import { Checkbox } from '@/components/ui/checkbox';

interface CheckBoxInputProps {
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    id?: string;
    description?: string;
    error?: string;
}

export const CheckBoxInput = ({
    label,
    checked,
    onCheckedChange,
    id,
    description,
    error
}: CheckBoxInputProps) => {
    const generatedId = id ?? label.replace(/\s+/g, '-').toLowerCase();

    return (
        <div className="space-y-1">
            <div className="flex cursor-pointer items-start gap-2.5">
                <Checkbox
                    id={generatedId}
                    checked={checked}
                    onCheckedChange={(v) => onCheckedChange(!!v)}
                    className="mt-0.5 border-gray-400 data-[state=checked]:border-[#27ae60] data-[state=checked]:bg-[#27ae60]"
                />
                <label
                    htmlFor={generatedId}
                    className="flex flex-1 cursor-pointer flex-col gap-0.5"
                >
                    <span className="text-sm font-medium text-gray-700 leading-none">
                        {label}
                    </span>
                    {description && (
                        <span className="text-xs text-gray-500">{description}</span>
                    )}
                </label>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
};