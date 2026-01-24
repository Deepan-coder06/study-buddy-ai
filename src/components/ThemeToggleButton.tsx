
import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button onClick={toggleTheme} className="theme-toggle-button">
      {theme === 'light' ? <Moon /> : <Sun />}
    </button>
  );
};

export default ThemeToggleButton;
