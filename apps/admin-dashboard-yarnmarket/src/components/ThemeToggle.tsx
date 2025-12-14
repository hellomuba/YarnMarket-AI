'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, actualTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('auto');
    } else {
      setTheme('dark');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'auto':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Moon className="w-4 h-4" />;
    }
  };

  const getTooltipText = () => {
    switch (theme) {
      case 'light':
        return 'Switch to Auto theme';
      case 'dark':
        return 'Switch to Light theme';
      case 'auto':
        return 'Switch to Dark theme';
      default:
        return 'Switch theme';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
      title={getTooltipText()}
    >
      {getIcon()}
      <span className="sr-only">{getTooltipText()}</span>
    </button>
  );
}
