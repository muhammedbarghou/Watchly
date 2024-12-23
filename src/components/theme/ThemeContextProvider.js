
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');

    // Optionally persist theme in localStorage or match system preference
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || 'light';
        setTheme(storedTheme);
        document.documentElement.setAttribute('data-theme', storedTheme); // For potential CSS integration
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme); // Persist theme
        document.documentElement.setAttribute('data-theme', newTheme); // Update `data-theme` attribute
    };

    // Provide the appropriate logo based on the theme
    const logo = theme === 'dark' ? '/assets/dark-logo.png' : '/assets/light-logo.png';

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, logo }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook to use the ThemeContext
export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
};