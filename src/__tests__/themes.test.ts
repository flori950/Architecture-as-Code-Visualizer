import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  themes,
  getMermaidConfig,
  applyThemeToDocument,
  getThemeByName,
  getDefaultTheme,
} from '../utils/themes';

// Mock DOM methods
Object.defineProperty(document, 'documentElement', {
  value: {
    style: {
      setProperty: vi.fn(),
    },
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
  },
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('themes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('themes array', () => {
    it('should contain all expected themes', () => {
      const expectedThemes = ['default', 'dark', 'forest', 'neutral', 'base'];
      const themeNames = themes.map(t => t.name);

      expectedThemes.forEach(themeName => {
        expect(themeNames).toContain(themeName);
      });
    });

    it('should have valid color values for all themes', () => {
      themes.forEach(theme => {
        expect(theme.name).toBeTruthy();
        expect(theme.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(theme.secondary).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(theme.background).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(theme.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(theme.textColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  describe('getMermaidConfig', () => {
    it('should return correct config for known themes', () => {
      const config = getMermaidConfig('dark');

      expect(config.theme).toBe('dark');
      expect(config.themeVariables).toBeDefined();
      expect(config.themeVariables?.primaryColor).toBe('#3b82f6');
    });

    it('should fallback to default theme for unknown theme', () => {
      const config = getMermaidConfig('unknown-theme');

      expect(config.theme).toBe('unknown-theme');
      expect(config.themeVariables?.primaryColor).toBe('#0ea5e9'); // default theme primary
    });
  });

  describe('applyThemeToDocument', () => {
    it('should set CSS custom properties', () => {
      applyThemeToDocument('dark');

      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--theme-primary',
        '#3b82f6'
      );
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--theme-secondary',
        '#6b7280'
      );
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--theme-background',
        '#1f2937'
      );
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--theme-accent',
        '#10b981'
      );
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--theme-text',
        '#f3f4f6'
      );
    });

    it('should add dark class for dark theme', () => {
      applyThemeToDocument('dark');

      expect(document.documentElement.classList.remove).toHaveBeenCalledWith(
        'dark',
        'theme-forest',
        'theme-neutral',
        'theme-base'
      );
      expect(document.documentElement.classList.add).toHaveBeenCalledWith(
        'dark'
      );
    });

    it('should add forest class for forest theme', () => {
      applyThemeToDocument('forest');

      expect(document.documentElement.classList.remove).toHaveBeenCalledWith(
        'dark',
        'theme-forest',
        'theme-neutral',
        'theme-base'
      );
      expect(document.documentElement.classList.add).toHaveBeenCalledWith(
        'theme-forest'
      );
    });

    it('should store theme preference in localStorage', () => {
      applyThemeToDocument('neutral');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'aac-theme',
        'neutral'
      );
    });

    it('should handle unknown theme gracefully', () => {
      applyThemeToDocument('unknown');

      // Should still call setProperty with default theme values
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--theme-primary',
        '#0ea5e9'
      );
    });
  });

  describe('getThemeByName', () => {
    it('should return theme for valid name', () => {
      const theme = getThemeByName('dark');

      expect(theme).toBeDefined();
      expect(theme?.name).toBe('dark');
      expect(theme?.primary).toBe('#3b82f6');
    });

    it('should return undefined for invalid name', () => {
      const theme = getThemeByName('invalid');

      expect(theme).toBeUndefined();
    });
  });

  describe('getDefaultTheme', () => {
    it('should return the first theme as default', () => {
      const defaultTheme = getDefaultTheme();

      expect(defaultTheme).toBe(themes[0]);
      expect(defaultTheme.name).toBe('default');
    });
  });
});
