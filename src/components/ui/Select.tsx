import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options?: { value: string | number; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, children, className, ...props }, ref) => {
        // No injected styles: prefer Tailwind classes on options below

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-semibold mb-2.5  dark:text-slate-300">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        className={cn(
                            "w-full px-4 py-2.5 rounded-lg border   focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all  appearance-none cursor-pointer",
                            "dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20",
                            error && " focus:border-red-500 focus:ring-red-500/20 dark:border-red-400 dark:focus:border-red-400",
                            props.disabled && "dark:bg-slate-800 dark:text-slate-400",
                            className
                        )}
                        {...props}
                    >
                        {options ? (
                            options.map((option) => {
                                const selectedValue = props.value ?? props.defaultValue;
                                const isSelected = selectedValue !== undefined && String(selectedValue) === String(option.value);

                                const optionClass = cn(
                                    'dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600',
                                    isSelected && 'dark:bg-blue-600 dark:text-white'
                                );

                                return (
                                    <option key={option.value} value={option.value} className={optionClass}>
                                        {option.label}
                                    </option>
                                );
                            })
                        ) : (
                            React.Children.map(children, (child) => {
                                if (!React.isValidElement(child)) return child;
                                const childProps = child.props as any;
                                const selectedValue = props.value ?? props.defaultValue;
                                const isSelected = selectedValue !== undefined && childProps.value !== undefined && String(selectedValue) === String(childProps.value);
                                const childClass = cn(
                                    childProps.className,
                                    'hover:bg-slate-100',
                                    'dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600',
                                    isSelected && 'dark:bg-blue-600 dark:text-white'
                                );
                                return React.cloneElement(child as React.ReactElement<any>, { className: childClass });
                            })
                        )}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5  dark:text-slate-500 pointer-events-none" />
                </div>
                {error && (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;