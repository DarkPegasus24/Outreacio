import React, { createContext, useContext, useState, useEffect } from 'react';
import VignetteThemeTransition from '../components/VignetteThemeTransition';

const ThemeContext = createContext();

export function ThemeProvider({ children, user }) {
  const [theme, setTheme] = useState(() => {
    // Read saved preference immediately to avoid flash
    return localStorage.getItem('outreacio-theme') || 'light';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionStage, setTransitionStage] = useState('idle'); // 'idle' | 'in' | 'hold' | 'out'
  const [targetTheme, setTargetTheme] = useState(null);

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
    if (isTransitioning) return; // Prevent double-triggering

    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTargetTheme(nextTheme);
    setIsTransitioning(true);
    setTransitionStage('in');

    // Let the liquid wash completely cover the current palette before swapping it.
    setTimeout(() => {
      // Stage 2: Center is completely sealed, swap theme tokens instantly underneath
      setTransitionStage('hold');
      setTheme(nextTheme);
      localStorage.setItem('outreacio-theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);

      // Give the new palette a tiny beat before dissolving the wash away.
      setTimeout(() => {
        setTransitionStage('out');

        // Stage 4: Reset overlay once iris has expanded fully beyond viewport
        setTimeout(() => {
          setIsTransitioning(false);
          setTransitionStage('idle');
          setTargetTheme(null);
        }, 560);
      }, 70);
    }, 520);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      isLoading,
      isTransitioning,
      transitionStage,
      targetTheme
    }}>
      {children}
      <VignetteThemeTransition 
        isTransitioning={isTransitioning}
        stage={transitionStage}
        targetTheme={targetTheme || theme}
      />
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
