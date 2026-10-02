import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Check localStorage first
        const saved = localStorage.getItem('harsh_electrical_theme');
        if (saved) {
            return saved === 'dark';
        }
        // Default to light mode
        return false;
    });

    useEffect(() => {
        const root = document.documentElement;

        if (isDarkMode) {
            root.classList.add('dark');
            root.style.colorScheme = 'dark';
            localStorage.setItem('harsh_electrical_theme', 'dark');
        } else {
            root.classList.remove('dark');
            root.style.colorScheme = 'light';
            localStorage.setItem('harsh_electrical_theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
