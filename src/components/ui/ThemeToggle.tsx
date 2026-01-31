import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/utils/cn';

const ThemeToggle: React.FC<{ variant?: 'icon' | 'button' }> = ({ variant = 'icon' }) => {
    const { theme, toggleTheme } = useTheme();

    if (variant === 'button') {
        return (
            <button
                onClick={toggleTheme}
                className={cn(
                    "relative inline-flex items-center justify-between w-16 h-8 px-1 rounded-full transition-colors duration-300",
                    theme === 'dark'
                        ? "bg-linear-to-r from-indigo-600 to-purple-600 shadow-lg shadow-purple-500/30"
                        : "bg-slate-200 shadow-md shadow-slate-300/30"
                )}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
                {/* Animated background dot */}
                <span
                    className={cn(
                        "absolute h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300",
                        theme === 'dark' ? "right-1" : "left-1"
                    )}
                />

                {/* Icons */}
                <Sun
                    className={cn(
                        "relative h-4 w-4 transition-opacity duration-300 z-10",
                        theme === 'light' ? "text-amber-500 opacity-100" : "text-white opacity-30"
                    )}
                />
                <Moon
                    className={cn(
                        "relative h-4 w-4 transition-opacity duration-300 z-10",
                        theme === 'dark' ? "text-indigo-200 opacity-100" : "text-slate-400 opacity-30"
                    )}
                />
            </button>
        );
    }

    // Icon-only variant
    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 border",
                theme === 'dark'
                    ? "bg-slate-800/50 border-slate-700 text-amber-400 hover:bg-slate-700/50"
                    : "bg-secondary text-slate-700 border-slate-200 hover:bg-slate-100"
            )}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <Moon className="h-5 w-5" />
            ) : (
                <Sun className="h-5 w-5" />
            )}
        </button>
    );
};

export default ThemeToggle;
