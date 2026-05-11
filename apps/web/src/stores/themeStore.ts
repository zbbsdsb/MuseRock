import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const getSystemTheme = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyTheme = (isDark: boolean) => {
  if (typeof document === 'undefined') return;
  
  if (isDark) {
    document.body.classList.add('dark');
    document.documentElement.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
    document.documentElement.classList.remove('dark');
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      isDark: getSystemTheme(),
      
      setTheme: (theme: Theme) => {
        let isDark: boolean;
        
        if (theme === 'system') {
          isDark = getSystemTheme();
        } else {
          isDark = theme === 'dark';
        }
        
        set({ theme, isDark });
        applyTheme(isDark);
      },
      
      toggleTheme: () => {
        const { isDark } = get();
        const newIsDark = !isDark;
        const newTheme: Theme = newIsDark ? 'dark' : 'light';
        
        set({ theme: newTheme, isDark: newIsDark });
        applyTheme(newIsDark);
      },
    }),
    {
      name: 'muserock-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Re-apply theme after hydration
          if (state.theme === 'system') {
            state.isDark = getSystemTheme();
          }
          applyTheme(state.isDark);
        }
      },
    }
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    const { theme } = useThemeStore.getState();
    if (theme === 'system') {
      useThemeStore.setState({ isDark: e.matches });
      applyTheme(e.matches);
    }
  });
}