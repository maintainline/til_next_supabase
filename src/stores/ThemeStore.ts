// Theme Store - zustand 로 카운터 관리

import { Theme, ThemeState } from '@/types/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1 단계 - store 타입 정의 (통상 types/types.ts 에 정의)
// interface ThemeState {
//   theme: Theme; // 현재 선택된 테마
//   setTheme: (theme: Theme) => void; //  특정 테마로 설정하는 함수
//   toggleTheme: () => void; // 라이트/다크 테마를 전환하는 함수
// }

// 2 단계 - store 구현(필요시 localStorage 활용)
// create :  store 즉, state 만들기
// get : state 읽기
// set : state 쓰기

// 2 단계 1. localStorage 가 적용 안된 버전
const themeStore = create<ThemeState>()((set, get) => ({
  // State 값
  theme: 'system' as Theme,
  setTheme: (theme: Theme) => {
    set({ theme });
    // 실제 테마 적용 하도록 함수 생성해서 호출
    applyTheme(theme);
  },
  toggleTheme: () => {
    const currentTheme = get().theme; //  현재 설정된 테마를 읽어옴
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    // 실제 테마 적용하도록 함수 호출
    applyTheme(newTheme);
  },
}));
// 2 단계 2. localStorage 가 적용된 버전
const themeLocalStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // State 값
      theme: 'system' as Theme,
      setTheme: (theme: Theme) => {
        set({ theme });
        // 실제 테마 적용 하도록 함수 생성해서 호출
        applyTheme(theme);
      },
      toggleTheme: () => {
        const currentTheme = get().theme; //  현재 설정된 테마를 읽어옴
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        // 실제 테마 적용하도록 함수 호출
        applyTheme(newTheme);
      },
    }),
    {
      //localStorage 이름
      name: 'theme-storage',
    }
  )
);
// 실제 테마가 적용되도록 하는 함수
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    // 시스템 테마 감지
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light';
    root.setAttribute('data-theme', systemTheme);
  } else {
    root.setAttribute('data-theme', theme);
  }
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
// 3 단계 - custom Hook 정의
export const useThemeStore = () => {
  const { setTheme, theme, toggleTheme } = themeLocalStore();
  return { setTheme, theme, toggleTheme };
};
