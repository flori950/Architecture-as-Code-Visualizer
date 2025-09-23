import type { Theme } from '../types';

interface MermaidConfig {
  theme: 'default' | 'neutral' | 'dark' | 'forest' | 'base';
  themeVariables?: {
    primaryColor?: string;
    primaryTextColor?: string;
    primaryBorderColor?: string;
    lineColor?: string;
    sectionBkgColor?: string;
    altSectionBkgColor?: string;
    gridColor?: string;
    secondaryColor?: string;
    tertiaryColor?: string;
  };
}

export const themes: Theme[] = [
  {
    name: 'default',
    primary: '#0ea5e9',
    secondary: '#64748b',
    background: '#ffffff',
    accent: '#06b6d4',
    textColor: '#1e293b',
  },
  {
    name: 'dark',
    primary: '#3b82f6',
    secondary: '#6b7280',
    background: '#1f2937',
    accent: '#10b981',
    textColor: '#f3f4f6',
  },
  {
    name: 'forest',
    primary: '#22c55e',
    secondary: '#16a34a',
    background: '#f0fdf4',
    accent: '#059669',
    textColor: '#14532d',
  },
  {
    name: 'neutral',
    primary: '#525252',
    secondary: '#737373',
    background: '#fafafa',
    accent: '#404040',
    textColor: '#171717',
  },
  {
    name: 'base',
    primary: '#dc2626',
    secondary: '#991b1b',
    background: '#fef2f2',
    accent: '#ea580c',
    textColor: '#7f1d1d',
  },
];

export const getMermaidConfig = (themeName: string): MermaidConfig => {
  const theme = themes.find(t => t.name === themeName) || themes[0];

  const baseConfig: MermaidConfig = {
    theme: themeName as MermaidConfig['theme'],
    themeVariables: {
      primaryColor: theme.primary,
      primaryTextColor: theme.textColor,
      primaryBorderColor: theme.primary,
      lineColor: theme.secondary,
      sectionBkgColor: theme.background,
      altSectionBkgColor: theme.accent + '20', // 20% opacity
      gridColor: theme.secondary + '40', // 40% opacity
      secondaryColor: theme.secondary,
      tertiaryColor: theme.accent,
    },
  };

  return baseConfig;
};

export const applyThemeToDocument = (themeName: string) => {
  const theme = themes.find(t => t.name === themeName) || themes[0];
  const root = document.documentElement;

  // Apply CSS custom properties for theme
  root.style.setProperty('--theme-primary', theme.primary);
  root.style.setProperty('--theme-secondary', theme.secondary);
  root.style.setProperty('--theme-background', theme.background);
  root.style.setProperty('--theme-accent', theme.accent);
  root.style.setProperty('--theme-text', theme.textColor);

  // Remove all theme classes first
  root.classList.remove('dark', 'theme-forest', 'theme-neutral', 'theme-base');

  // Add appropriate theme class
  switch (themeName) {
    case 'dark':
      root.classList.add('dark');
      break;
    case 'forest':
      root.classList.add('theme-forest');
      break;
    case 'neutral':
      root.classList.add('theme-neutral');
      break;
    case 'base':
      root.classList.add('theme-base');
      break;
    default:
      // default theme, no additional classes needed
      break;
  }

  // Store theme preference
  localStorage.setItem('aac-theme', themeName);
};

export const getThemeByName = (name: string): Theme | undefined => {
  return themes.find(theme => theme.name === name);
};

export const getDefaultTheme = (): Theme => {
  return themes[0];
};
