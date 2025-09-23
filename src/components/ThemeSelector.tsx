import React from 'react';
import { Palette } from 'lucide-react';
import type { ThemeSelectorProps } from '../types';

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  themes,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Palette
        className="h-4 w-4"
        style={{ color: 'var(--theme-secondary)' }}
      />
      <select
        value={currentTheme}
        onChange={e => onChange(e.target.value)}
        className="input-field text-sm transition-colors duration-200"
        style={{
          backgroundColor: 'var(--theme-background)',
          color: 'var(--theme-text)',
          borderColor: 'var(--theme-secondary)',
        }}
      >
        {themes.map(theme => (
          <option key={theme.name} value={theme.name}>
            {theme.name.charAt(0).toUpperCase() + theme.name.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSelector;
