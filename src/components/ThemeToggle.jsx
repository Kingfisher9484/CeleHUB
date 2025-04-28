import React, { useState, useEffect } from 'react';
import './ThemeToggle.css';
import '../index.css';

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || false
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <button onClick={() => setDarkMode(!darkMode)} className={`toggle-switch ${darkMode ? "dark" : ""}`}>
  <span className="toggle-thumb">
    {darkMode ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" viewBox="0 0 16 16">
        <path d="M12 8a4 4 0 1 1-4-4 4 4 0 0 1 4 4z"/>
        <path d="M8 0a.5.5 0 0 1 .5.5v1.25a.5.5 0 0 1-1 0V.5A.5.5 0 0 1 8 0zm0 13.25a.5.5 0 0 1 .5.5v1.25a.5.5 0 0 1-1 0v-1.25a.5.5 0 0 1 .5-.5zM15.5 7.5h-1.25a.5.5 0 0 1 0-1H15.5a.5.5 0 0 1 0 1zM2.75 7.5H1.5a.5.5 0 0 1 0-1h1.25a.5.5 0 0 1 0 1zM13.657 2.343a.5.5 0 0 1 .707 0l.884.884a.5.5 0 1 1-.707.707l-.884-.884a.5.5 0 0 1 0-.707zM2.343 13.657a.5.5 0 0 1 .707 0l.884.884a.5.5 0 1 1-.707.707l-.884-.884a.5.5 0 0 1 0-.707zM2.343 2.343a.5.5 0 0 1 .707 0l.884.884a.5.5 0 0 1-.707.707l-.884-.884a.5.5 0 0 1 0-.707zM13.657 13.657a.5.5 0 0 1 .707 0l.884.884a.5.5 0 1 1-.707.707l-.884-.884a.5.5 0 0 1 0-.707z"/>
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#000" viewBox="0 0 16 16">
        <path d="M6 0a6 6 0 0 0 0 12 6 6 0 0 1 0-12z"/>
      </svg>
    )}
  </span>
</button>

  );
};

export default ThemeToggle;
