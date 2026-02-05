'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDarkMode = localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!mounted) {
    return (
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-400 dark:border-gray-600" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        group relative p-2.5 md:p-3.5 rounded-xl md:rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95
        ${isDark 
          ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 hover:from-yellow-300 hover:via-yellow-400 hover:to-orange-400 shadow-lg shadow-yellow-500/50 hover:shadow-xl hover:shadow-yellow-500/60' 
          : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-600 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60'
        }
        border-2 ${isDark ? 'border-yellow-300' : 'border-purple-400'}
      `}
      aria-label="Tema değiştir"
      title={isDark ? 'Gündüz Moduna Geç' : 'Gece Moduna Geç'}
    >
      {/* Işık Efekti */}
      <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* İkon */}
      <div className="relative z-10">
        {isDark ? (
          <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {isDark ? '☀️ Gündüz' : '🌙 Gece'}
      </div>
    </button>
  );
}
