import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<ThemeType>('light');

    // Initialize theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('app-theme') as ThemeType | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        setThemeState(initialTheme);
        applyTheme(initialTheme);
    }, []);

    const applyTheme = (newTheme: ThemeType) => {
        const root = document.documentElement;
        
        console.log('🎨 Applying theme:', newTheme);
        
        if (newTheme === 'dark') {
            root.classList.add('dark');
            document.body.style.backgroundColor = '#0a0a0a';
            console.log('✅ Dark mode applied, dark class:', root.classList.contains('dark'));
        } else {
            root.classList.remove('dark');
            document.body.style.backgroundColor = '#f8fafc';
            console.log('✅ Light mode applied, dark class removed');
        }
        
        localStorage.setItem('app-theme', newTheme);
    };

    const setTheme = (newTheme: ThemeType) => {
        setThemeState(newTheme);
        applyTheme(newTheme);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
