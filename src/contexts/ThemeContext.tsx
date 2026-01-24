
import React, { createContext, useState, useMemo, useEffect } from 'react';

// Define the shape of the context value
interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

// Create the context with a default value
export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

// Create the provider component
export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // State to hold the current theme
  const [theme, setTheme] = useState('light');

  // Check for saved theme in local storage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Function to toggle the theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    theme,
    toggleTheme,
  }), [theme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
