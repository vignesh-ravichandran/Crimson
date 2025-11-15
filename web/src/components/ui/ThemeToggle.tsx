import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, setTheme, effectiveTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return effectiveTheme === 'dark' ? '🌙' : '☀️';
    }
    return theme === 'dark' ? '🌙' : '☀️';
  };

  const getLabel = () => {
    if (theme === 'system') {
      return 'Auto';
    }
    return theme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border transition-colors"
      title={`Current: ${getLabel()} (click to cycle)`}
    >
      <span className="text-xl">{getIcon()}</span>
      <span className="text-sm font-medium text-text">{getLabel()}</span>
    </button>
  );
}

