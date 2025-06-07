import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import './toggle-switch.css';

const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div className="theme-toggle-container">
      <span className={`theme-icon ${!isDark ? 'active' : ''}`}>☀️</span>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={isDark}
          onChange={toggleTheme}
        />
        <span className="slider"></span>
      </label>
      <span className={`theme-icon ${isDark ? 'active' : ''}`}>🌙</span>
    </div>
  );
};

export default ThemeToggle;