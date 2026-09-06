import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children, user }) {
  const [theme, setTheme] = useState(() => {
    // Read saved preference immediately to avoid flash
    return localStorage.getItem('outreacio-theme') || 'light';
  });
  const [isLoading, setIsLoading] = useState(true);

  // On mount / user change, sync data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setIsLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When user logs in, restore their saved preference; when they log out, keep current theme
  useEffect(() => {
    if (user) {
      const savedTheme = localStorage.getItem('outreacio-theme') || 'light';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, [user]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('outreacio-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
