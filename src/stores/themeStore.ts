import type { Theme } from '@/types/types';
import { create } from 'zustand';
import { combine, devtools, persist } from 'zustand/middleware';

type State = {
  theme: Theme;
};

const initialState: State = {
  theme: 'light',
};

// 테마 적용하기
const applyTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;

  const htmlTag = document.documentElement;
  htmlTag.classList.remove('dark', 'light');
  if (theme === 'system') {
    const isDarkTheme = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    htmlTag.classList.add(isDarkTheme ? 'dark' : 'light');
  } else {
    htmlTag.classList.add(theme);
  }
};

const useThemeStore = create(
  devtools(
    persist(
      combine(initialState, set => ({
        actions: {
          setTheme: (theme: Theme) => {
            const htmlTag = document.documentElement;
            htmlTag.classList.remove('dark', 'light');

            if (theme === 'system') {
              const isDarkTheme = window.matchMedia(
                '(prefers-color-scheme: dark)'
              ).matches;

              htmlTag.classList.add(isDarkTheme ? 'dark' : 'light');
            } else {
              htmlTag.classList.add(theme);
            }

            set({ theme });
          },
        },
      })),
      {
        name: 'ThemeStore',
        partialize: store => ({
          theme: store.theme,
        }),
        // localStorage 가 불러와지는 직후에 실행되는 콜백함수
        // Store 가 초기화 될때 한 번 실행되는 콜백함수
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.log('로컬스토리지 에러', error);
            return;
          }
          if (state?.theme) {
            applyTheme(state.theme);
          }
        },
      }
    ),
    { name: 'ThemeStore' }
  )
);

export const useTheme = () => {
  const theme = useThemeStore(store => store.theme);
  return theme;
};

export const useSetTheme = () => {
  const setTheme = useThemeStore(store => store.actions.setTheme);
  return setTheme;
};
