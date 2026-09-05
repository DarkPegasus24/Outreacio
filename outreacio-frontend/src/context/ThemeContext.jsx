import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children, user }) {
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  // Before login, theme is always white ('light').
  // After login, theme restores the user's saved preference or defaults to 'light'.
  useEffect(() => {
    if (!user) {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      const savedTheme = localStorage.getItem('outreacio-theme') || 'light';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    setIsLoading(false);
  }, [user]);

  const toggleTheme = () => {
    if (!user) return; // Theme switching is only enabled after login
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('outreacio-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme: user ? theme : 'light', toggleTheme, isLoading }}>
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
