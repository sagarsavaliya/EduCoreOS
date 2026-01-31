import React from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-semibold mb-2.5  dark:text-slate-300">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2  dark:text-slate-500">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            "w-full px-4 py-2.5 rounded-lg border  dark:border-slate-600  dark:bg-slate-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 transition-all  dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500",
                            icon && "pl-12",
                            error && "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/30 dark:focus:ring-red-400/30",
                            props.disabled && " dark:bg-slate-800 dark:text-slate-400 cursor-not-allowed",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1.5 text-xs  dark:text-red-400 font-medium">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
