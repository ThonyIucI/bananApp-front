import { IOption } from '@/@common/types/IOption'
import { cn } from "@/lib/utils"
import React from 'react'
import ReactSelect, { type Props as SelectProps } from 'react-select'
import CreatableSelect from 'react-select/creatable'

interface CustomSelectProps extends Omit<SelectProps<IOption, boolean>, 'className'> {
    label?: string
    error?: string
    className?: string
    creatable?: boolean
    size?: 'sm' | 'md' | 'lg'
    onCreateOption?: (inputValue: string) => void
}

/** React-select based component supporting single and multi-value selection, creatable options, and design-system green focus styles. */
export const Select = React.forwardRef<any, CustomSelectProps>(({
    label,
    error,
    className,
    creatable,
    size = 'md',
    onCreateOption,
    ...props
}, ref) => {
    const Component = creatable ? CreatableSelect : ReactSelect

    return (
        <div className={cn('flex flex-col gap-1', className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <Component
                ref={ref}
                classNames={{
                    control: ({ isFocused, isDisabled }) => cn(
                        '!rounded-md !border !px-2 !py-0.5 !text-sm !shadow-none !min-h-[38px] !flex !items-center',
                        isDisabled ? '!opacity-60 !cursor-not-allowed' : '!cursor-pointer',
                        isFocused ? '!border-[#27ae60] !ring-2 !ring-[#27ae60]/20' : 
                        '!border-gray-300 hover:!border-gray-400 focus:!border-[#27ae60] focus:!ring-2 focus:!ring-[#27ae60]/20 ',
                        error ? '!border-red-400' : '',
                        size === 'sm' ? '!px-2 !min-h-[28px]' : '',
                        
                    ),
                    option: ({ isFocused, isSelected }) => cn(
                        '!cursor-pointer !px-4 !py-2 !text-sm !bg-white',
                        isSelected ? '!bg-[#27ae60]/10 !text-[#27ae60] !font-medium' : '',
                        isFocused && !isSelected ? '!bg-gray-50' : '',
                        !isSelected && !isFocused ? '!text-gray-700' : ''
                    ),
                    menu: () => '!rounded-md !border !border-gray-200 !shadow-lg !mt-1 !overflow-hidden bg-white',
                    menuPortal: () => '!z-100',
                    placeholder: () => '!text-gray-400',
                    singleValue: () => '!text-gray-900',
                    multiValue: () => '!rounded-md !bg-[#27ae60]/10',
                    multiValueLabel: () => '!text-[#27ae60] !font-medium !text-xs !px-2 !py-0.5',
                    multiValueRemove: () => '!rounded-r-lg !text-[#27ae60] hover:!bg-[#27ae60]/20 hover:!text-[#219a52] !px-1',
                    input: () => '!m-0 !p-0',
                    valueContainer: () => '!p-0 !gap-1',
                    noOptionsMessage: () => 'bg-white !text-gray-400 p-2',
                    dropdownIndicator: ({ isFocused }) => cn(isFocused ? '!text-[#27ae60]' : '!text-gray-300 hover:!text-gray-400'),
                    clearIndicator: () => '!text-gray-400 hover:!text-gray-600',
                }}
                unstyled
                onCreateOption={onCreateOption}
                noOptionsMessage={() => 'No hay opciones'}
                {...props}
            />
            {error && (
                <span className="text-xs text-red-500">{error}</span>
            )}
        </div>
    )
})

Select.displayName = 'Select'
