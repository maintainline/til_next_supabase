# Theme

- Next.js 에서 테마 로컬스토리지에 저장(`zustand 활용`)

## 1. UI 진행

- `/src/app/layout.tsx`

```tsx
{
  /* 테마 적용 버튼 */
}
<div className='hover:bg-muted cursor-pointer rounded-full p-2'>
  <Sun />
</div>;
```

- 별도의 컴포넌트로 추출
- `/src/components/header/ThemeButton.tsx 파일` 생성

```tsx
import { Sun } from 'lucide-react';

export default function ThemeButton() {
  return (
    <div className='hover:bg-muted cursor-pointer rounded-full p-2'>
      <Sun />
    </div>
  );
}
```

- `/src/app/layout.tsx`

```tsx
<div className='flex items-center gap-5'>
  {/* 테마 적용 버튼 */}
  <ThemeButton />
  <ProfileButton />
</div>
```

## 2. 선택 메뉴 추가하기

- 펼침 메뉴로 테마 선택하기
- `/src/components/header/ThemeButton.tsx`
- 1단계

```tsx
import { Sun } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// system :  사용자가 웹브라우저에 셋팅한 테마
const THEMES = ['system', 'light', 'dark'];

export default function ThemeButton() {
  return (
    <Popover>
      <PopoverTrigger>
        <div className='hover:bg-muted cursor-pointer rounded-full p-2'>
          <Sun />
        </div>
      </PopoverTrigger>
      <PopoverContent></PopoverContent>
    </Popover>
  );
}
```

- 테마 타입 정의하기 : `/src/types/types.ts`

```ts
export type Theme = 'system' | 'light' | 'dark';
```

- 2단계 : 타입 활용
- `/src/components/header/ThemeButton.tsx`

```tsx
import { Theme } from '@/types/types';
const THEMES: Theme[] = ['system', 'light', 'dark'];
```

- 3단계 : 출력 하기 및 클릭 처리

```tsx
import { Sun } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { Theme } from '@/types/types';
import { PopoverClose } from '@radix-ui/react-popover';
const THEMES: Theme[] = ['system', 'light', 'dark'];

export default function ThemeButton() {
  return (
    <Popover>
      <PopoverTrigger>
        <div className='hover:bg-muted cursor-pointer rounded-full p-2'>
          <Sun />
        </div>
      </PopoverTrigger>
      <PopoverContent>
        {THEMES.map(theme => (
          <PopoverClose key={`theme-button-${theme}`} asChild>
            <div>{theme}</div>
          </PopoverClose>
        ))}
      </PopoverContent>
    </Popover>
  );
}
```

- 4단계 : 스타일링

```tsx
<PopoverClose key={`theme-button-${theme}`} asChild>
  <div className='hover:bg-muted cursor-pointer p-3'>{theme}</div>
</PopoverClose>
```

## 3. 테마 기능 적용하기

### 3.1. 테마 선택 기능

```tsx
// 테마선택시 실행함
const onChangeTheme = (theme: Theme) => {};
```

```tsx
<div
  onClick={() => onChangeTheme(theme)}
  className='hover:bg-muted cursor-pointer p-3'
>
  {theme}
</div>
```

```tsx
'use client';
import { Sun } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { Theme } from '@/types/types';
import { PopoverClose } from '@radix-ui/react-popover';
const THEMES: Theme[] = ['system', 'light', 'dark'];

export default function ThemeButton() {
  // 테마선택시 실행함
  const onChangeTheme = (theme: Theme) => {};

  return (
    <Popover>
      <PopoverTrigger>
        <div className='hover:bg-muted cursor-pointer rounded-full p-2'>
          <Sun />
        </div>
      </PopoverTrigger>
      <PopoverContent>
        {THEMES.map(theme => (
          <PopoverClose key={`theme-button-${theme}`} asChild>
            <div
              onClick={() => onChangeTheme(theme)}
              className='hover:bg-muted cursor-pointer p-3'
            >
              {theme}
            </div>
          </PopoverClose>
        ))}
      </PopoverContent>
    </Popover>
  );
}
```

### 3.2. 테마 적용을 위한 `html 태그 변경`

```tsx
// 테마선택시 실행함
const onChangeTheme = (theme: Theme) => {
  // html 의 테마 적용하는 코드로 변경
  const htmlTag = document.documentElement;
  // 그냥 무조건 클래스를 지운다.
  htmlTag.classList.remove('light', 'dark');
  htmlTag.classList.add(theme);
};
```

### 3.3. `system` 테마 적용은 없음.

- system 에 대한 예외처리 진행

```tsx
// 테마선택시 실행함
const onChangeTheme = (theme: Theme) => {
  // html 의 테마 적용하는 코드로 변경
  const htmlTag = document.documentElement;
  // 그냥 무조건 클래스를 지운다.
  htmlTag.classList.remove('light', 'dark');
  if (theme === 'system') {
    // 웹브라우저에 사용자가 셋팅한 테마를 적용해야함.
    const isDarkTheme = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    htmlTag.classList.add(isDarkTheme ? 'dark' : 'light');
  } else {
    htmlTag.classList.add(theme);
  }
};
```

- 전체 코드

```tsx
'use client';
import { Sun } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { Theme } from '@/types/types';
import { PopoverClose } from '@radix-ui/react-popover';
const THEMES: Theme[] = ['system', 'light', 'dark'];

export default function ThemeButton() {
  // 테마선택시 실행함
  const onChangeTheme = (theme: Theme) => {
    // html 의 테마 적용하는 코드로 변경
    const htmlTag = document.documentElement;
    // 그냥 무조건 클래스를 지운다.
    htmlTag.classList.remove('light', 'dark');
    if (theme === 'system') {
      // 웹브라우저에 사용자가 셋팅한 테마를 적용해야함.
      const isDarkTheme = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      htmlTag.classList.add(isDarkTheme ? 'dark' : 'light');
    } else {
      htmlTag.classList.add(theme);
    }
  };

  return (
    <Popover>
      <PopoverTrigger>
        <div className='hover:bg-muted cursor-pointer rounded-full p-2'>
          <Sun />
        </div>
      </PopoverTrigger>
      <PopoverContent>
        {THEMES.map(theme => (
          <PopoverClose key={`theme-button-${theme}`} asChild>
            <div
              onClick={() => onChangeTheme(theme)}
              className='hover:bg-muted cursor-pointer p-3'
            >
              {theme}
            </div>
          </PopoverClose>
        ))}
      </PopoverContent>
    </Popover>
  );
}
```

## 4. 새로고침시 테마 유지하기

### 4.1. Store 만들기

- `/src/stores/themeStore.ts 파일` 생성

```ts
import type { Theme } from '@/types/types';
import { create } from 'zustand';
import { combine, devtools, persist } from 'zustand/middleware';

type State = {
  theme: Theme;
};

const initialState: State = {
  theme: 'light',
};

const useThemeStore = create(
  devtools(
    combine(initialState, set => ({
      actions: {
        setTheme: (theme: Theme) => {
          const htmlTag = document.documentElement;
          htmlTag.classList.remove('light', 'dark');
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
    }))
  )
);
```

### 4.2. 로컬스토리지에 보관하려면 `persist` 활용

- middleware 의 겹침을 주의하자.

```ts
import type { Theme } from '@/types/types';
import { create } from 'zustand';
import { combine, devtools, persist } from 'zustand/middleware';

type State = {
  theme: Theme;
};

const initialState: State = {
  theme: 'light',
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
```

### 4.3. 활용하기

- `/src/stores/themeStore.ts` : 업데이트

```ts
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
```

```ts
// localStorage 가 불러와지는 직후에 실행되는 콜백함수
// Store 가 초기화 될때 한 번 실행되는 콜백함수
onRehydrateStorage: () => {함수},
// 단계별 적용 1
onRehydrateStorage: () => (state, error) => {},
// 단계별 적용 2
onRehydrateStorage: () => (state, error) => {
  if (error) {
    console.log('로컬스토리지 에러', error);
    return;
  }
  if (state?.theme) {
    applyTheme(state.theme);
  }
},
```

- 전체 코드

```ts
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
```

### 4.4. Next.js 의 적용

- `/src/app/layout.tsx` 활용함.(Next.js)
- Next.js 에서 웹브라우저의 `외부 js 를 실시간 실행시 참조`
- Next.js 는 Node.js 라서 웹브라우저에 보관한 localStorage를 부를 수 없다.

- 단계 1: 경고 출력하지 않기 (`서버렌더링 결과 HTML 과 클라이언트 렌더링 결과가 다를때`)

```tsx
<html lang='ko' suppressHydrationWarning>
```

- 단계 2: 문자열로 html 작성시 경고 출력 하지 않기

```tsx
 <html lang='ko' suppressHydrationWarning>
      {/* 추가 */}
      <head>

      </head>
```

```tsx
<head>
  <script dangerouslySetInnerHTML={} />
</head>
```

```tsx
<head>
  <script dangerouslySetInnerHTML={{ __html: `` }} />
</head>
```

```tsx
<head>
  <script
    dangerouslySetInnerHTML={{
      __html: `(function() {
                try {
                  const stored = localStorage.getItem('ThemeStore');
                  if (stored) {
                    const parsed = JSON.parse(stored);
                    const themeValue = parsed?.state?.theme || parsed?.theme || 'light';
                    const htmlTag = document.documentElement;
                    htmlTag.classList.remove('dark', 'light');
                    
                    if (themeValue === 'system') {
                      const isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
                      htmlTag.classList.add(isDarkTheme ? 'dark' : 'light');
                    } else {
                      htmlTag.classList.add(themeValue);
                    }
                  }
                } catch (e) {
                  console.error('Theme initialization error:', e);
                }
              })()`,
    }}
  />
</head>
```
