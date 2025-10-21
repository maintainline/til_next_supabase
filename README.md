# Zustands

- https://zustand.docs.pmnd.rs/getting-started/introduction
- zustand(불어 state) 로서 전역 상태관리
- Recoil 과 흡사하지만 Next.js 에서는 React 19로서 Recoil 지원안함.
- useState 는 컴포넌트 State, zustands 는 전역 State

## 1. 설치

```bash
npm install zustand
```

## 2. 카운터 테스트해 보기 예제

### 2.1. Store 의 타입 정의

- `/src/types 폴더` 생성
- `/src/types/types.ts 파일` 생성

```ts
// Counter Store 타입 정의
export interface CounterState {
  count: number; // 현재 카운터 값(숫자)
  increment: () => void; //  카운터 1 증가
  decrement: () => void; //  카운터 1 감소
  reset: () => void; //  카운터 0 초기화
  setCount: (count: number) => void; //  직접 카운터 값 설정
}
```

### 2.2. Store 의 구현하기

- `/src/stores 폴더` 생성
- `/src/stores/CounterStore.ts 파일` 생성

```ts
// Counter Store - zustand 로 카운터 관리
// 1 단계 - store 타입 정의 (통상 types/types.ts 에 정의)
// interface CounterState {
//   count: number; // 현재 카운터 값(숫자)
//   increment: () => void; //  카운터 1 증가
//   decrement: () => void; //  카운터 1 감소
//   reset: () => void; //  카운터 0 초기화
//   setCount: (count: number) => void; //  직접 카운터 값 설정
// }

import { CounterState } from '@/types/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 2 단계 - store 구현(필요시 local Storage 활용)
// create : store 즉, state 만들기
// get : state 읽기
// set : state 쓰기
// const counterState = create((set, get) => ({
//   //상태(state)
//   count: 0,
//   // 상태를 바꾸는 함수(action)
//   increment: () => set(state => ({ count: state.count + 1 })),
// }));

// 2단계 1. localStorage 가 적용 안된버전
const counterState = create<CounterState>()((set, get) => ({
  // 상태값(state)
  count: 0,
  // 상태값 갱신(actions)
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  setCount: (count: number) => set({ count: count }),
}));

// 2단계 2. localStorage 가 적용된 버전
const counterLocalState = create<CounterState>()(
  persist(
    (set, get) => ({
      count: 0,
      increment: () => set(state => ({ count: state.count + 1 })),
      decrement: () => set(state => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
      setCount: (count: number) => set({ count: count }),
    }),
    { name: 'counter-storage' }
  )
);

// 3 단계 - custom Hook 정의
export const useCounter = () => {
  const { count, increment, decrement, reset, setCount } = counterLocalState();
  return { count, increment, decrement, reset, setCount };
};
```

### 2.3. 활용해 보기

- `src/components/Counter.tsx 파일` 생성

```tsx
/**
 * Counter 컴포넌트 - Zustand를 사용한 카운터 기능 구현
 *
 * 이 컴포넌트는 useCounterStore 훅을 사용하여 카운터 상태를 관리합니다.
 * 사용자가 버튼을 클릭하거나 직접 값을 입력하여 카운터를 조작할 수 있습니다.
 */

'use client';

import { useCounterStore } from '@/stores/CounterStore';

/**
 * Counter - 카운터 기능을 제공하는 React 컴포넌트
 *
 * Zustand의 useCounterStore 훅을 사용하여:
 * - 현재 카운터 값을 표시
 * - 증가/감소/리셋 버튼 제공
 * - 직접 값 입력 기능 제공
 *
 * @returns JSX.Element - 카운터 UI 컴포넌트
 */
export default function Counter() {
  // Zustand 스토어에서 상태와 액션들을 가져옵니다
  const { count, increment, decrement, reset, setCount } = useCounterStore();

  return (
    <div className='p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg space-y-4'>
      {/* 컴포넌트 제목 */}
      <h2 className='text-2xl font-bold text-center text-gray-800'>
        Counter with Zustand
      </h2>

      <div className='text-center'>
        {/* 현재 카운터 값을 큰 글씨로 표시 */}
        <div className='text-4xl font-bold text-blue-600 mb-4'>{count}</div>

        {/* 카운터 조작 버튼들 */}
        <div className='space-x-2'>
          {/* 감소 버튼 - 클릭 시 decrement 액션 호출 */}
          <button
            onClick={decrement}
            className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors'
          >
            -1
          </button>

          {/* 증가 버튼 - 클릭 시 increment 액션 호출 */}
          <button
            onClick={increment}
            className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors'
          >
            +1
          </button>

          {/* 리셋 버튼 - 클릭 시 reset 액션 호출 */}
          <button
            onClick={reset}
            className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors'
          >
            Reset
          </button>
        </div>

        {/* 직접 값 입력 필드 */}
        <div className='mt-4'>
          <input
            type='number'
            value={count}
            onChange={e => setCount(Number(e.target.value))} // 입력값을 숫자로 변환하여 setCount 액션 호출
            className='w-20 px-2 py-1 border border-gray-300 rounded text-center'
          />
        </div>
      </div>
    </div>
  );
}
```

- `src/app/page.tsx` 출력하기

```tsx
import ButtonTest from '@/components/ButtonTest';
import Counter from '@/components/Counter';
import SCSSTest from '@/components/SCSSTest';

export default function Home() {
  return (
    <div>
      <ButtonTest />
      <SCSSTest />
      <Counter />
    </div>
  );
}
```

## 3. 사용자 프로필 테스트 해보기 예제

### 3.1. Store 의 타입 정의

- `/src/types/types.ts` 에 정의 추가

```ts
// Counter Store 타입 정의
export interface CounterState {
  count: number; // 현재 카운터 값(숫자)
  increment: () => void; //  카운터 1 증가
  decrement: () => void; //  카운터 1 감소
  reset: () => void; //  카운터 0 초기화
  setCount: (count: number) => void; //  직접 카운터 값 설정
}
// User 타입 정의
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
// User Store 타입
export interface UserState {
  user: User | null; //  현재 로그인한 사용자 정보(null 이면 로그아웃된 상태)
  isLoggedIn: boolean; // 로그인 여부를 나타내는 Boolean
  isLoading: boolean; // 로그인/로그아웃 처리중인지 나타내는 Boolean 값
  login: (user: User) => void; // 사용자 로그인 처리 함수
  logout: () => void; // 사용자 로그아웃 처리 함수
  updateUser: (user: Partial<User>) => void; // User 의 모든 속성을 선택젓 옵션으로 정의
  setLoading: (loading: boolean) => void; // 로딩 상태 설정 함수
}
```

### 3.2. Store 구현하기

- `src/stores/UserStore.ts 파일` 생성

```ts
// User Store - zustand 로 카운터 관리

import { User, UserState } from '@/types/types';
import { create, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

// 1 단계 - store 타입 정의 (통상 types/types.ts 에 정의)
// import { User } from '@/types/types';
// interface UserState {
//   user: User | null; //  현재 로그인한 사용자 정보(null 이면 로그아웃된 상태)
//   isLoggedIn: boolean; // 로그인 여부를 나타내는 Boolean
//   isLoading: boolean; // 로그인/로그아웃 처리중인지 나타내는 Boolean 값
//   login: (user: User) => void; // 사용자 로그인 처리 함수
//   logout: () => void; // 사용자 로그아웃 처리 함수
//   updateUser: (user: Partial<User>) => void; // User 의 모든 속성을 선택젓 옵션으로 정의
//   setLoading: (loading: boolean) => void; // 로딩 상태 설정 함수
// }

// 2 단계 - store 구현(필요시 localStorage 활용)
// create :  store 즉, state 만들기
// get : state 읽기
// set : state 쓰기

// 2 단계 1. localStorage 가 적용 안된버전
const userStore = create<UserState>()((set, get) => ({
  // 초기상태
  user: null,
  isLoggedIn: false,
  isLoading: false,

  // 사용자 정보 업데이트
  login: (user: User) =>
    set({ user: user, isLoggedIn: true, isLoading: false }),
  logout: () => set({ user: null, isLoggedIn: false, isLoading: false }),
  updateUser: (userData: Partial<User>) =>
    set(state => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),

  // 로딩 상태 설정
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

// 2 단계 2. localStorage 가 적용된 버전
const userLocalStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 초기상태
      user: null,
      isLoggedIn: false,
      isLoading: false,

      // 사용자 정보 업데이트
      login: (user: User) =>
        set({ user: user, isLoggedIn: true, isLoading: false }),
      logout: () => set({ user: null, isLoggedIn: false, isLoading: false }),
      updateUser: (userData: Partial<User>) =>
        set(state => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      // 로딩 상태 설정
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    { name: 'user-storage' }
  )
);

// 3 단계 - custom Hook 정의
export const useUserState = () => {
  const { user, isLoading, isLoggedIn, login, logout, setLoading, updateUser } =
    userLocalStore();
  return { user, isLoading, isLoggedIn, login, logout, setLoading, updateUser };
};
```

### 3.3. Store 활용하기

- `/src/components/UserProfile.tsx` 파일 생성

```tsx
/**
 * UserProfile 컴포넌트 - Zustand를 사용한 사용자 인증 기능 구현
 *
 * 이 컴포넌트는 useUserStore 훅을 사용하여 사용자 로그인/로그아웃과
 * 프로필 정보 수정 기능을 제공합니다.
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useUserState } from '@/stores/UserStore';

/**
 * UserProfile - 사용자 인증 및 프로필 관리 컴포넌트
 *
 * Zustand의 useUserStore 훅을 사용하여:
 * - 로그인/로그아웃 기능
 * - 사용자 정보 표시 및 수정
 * - 로딩 상태 관리
 *
 * @returns JSX.Element - 사용자 프로필 UI 컴포넌트
 */
export default function UserProfile() {
  // Zustand 스토어에서 사용자 관련 상태와 액션들을 가져옵니다
  const { user, isLoggedIn, isLoading, login, logout, updateUser, setLoading } =
    useUserState();

  // 로컬 상태: 편집 모드와 편집 중인 이름
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  /**
   * handleLogin - 로그인 처리 함수
   *
   * 로딩 상태를 true로 설정하고 1초 후 시뮬레이션된 사용자 정보로 로그인합니다.
   * 실제 프로젝트에서는 API 호출로 대체되어야 합니다.
   */
  const handleLogin = () => {
    setLoading(true);
    // 시뮬레이션된 로그인 (실제로는 API 호출)
    setTimeout(() => {
      login({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://via.placeholder.com/150',
      });
    }, 1000);
  };

  /**
   * handleLogout - 로그아웃 처리 함수
   *
   * Zustand 스토어의 logout 액션을 호출하여 사용자 정보를 초기화합니다.
   */
  const handleLogout = () => {
    logout();
  };

  /**
   * handleUpdateName - 사용자 이름 업데이트 함수
   *
   * 편집된 이름이 유효한 경우에만 사용자 정보를 업데이트하고
   * 편집 모드를 종료합니다.
   */
  const handleUpdateName = () => {
    if (editName.trim()) {
      updateUser({ name: editName });
      setIsEditing(false);
      setEditName('');
    }
  };

  // 로딩 상태일 때 로딩 스피너 표시
  if (isLoading) {
    return (
      <div className='p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2 text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg space-y-4'>
      <h2 className='text-2xl font-bold text-center text-gray-800'>
        User Profile
      </h2>

      {!isLoggedIn ? (
        // 로그아웃 상태: 로그인 버튼 표시
        <div className='text-center'>
          <p className='text-gray-600 mb-4'>
            Please log in to view your profile
          </p>
          <button
            onClick={handleLogin}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
          >
            Login
          </button>
        </div>
      ) : (
        // 로그인 상태: 사용자 정보 표시
        <div className='space-y-4'>
          {/* 사용자 아바타 이미지 */}
          {user?.avatar && (
            <div className='text-center'>
              <Image
                src={user.avatar}
                alt='Avatar'
                width={80}
                height={80}
                className='w-20 h-20 rounded-full mx-auto'
              />
            </div>
          )}

          <div className='text-center'>
            {isEditing ? (
              // 편집 모드: 이름 수정 폼
              <div className='space-y-2'>
                <input
                  type='text'
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded'
                  placeholder='Enter new name'
                />
                <div className='space-x-2'>
                  <button
                    onClick={handleUpdateName}
                    className='px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600'
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditName('');
                    }}
                    className='px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // 표시 모드: 사용자 정보 표시
              <div>
                <h3 className='text-xl font-semibold'>{user?.name}</h3>
                <p className='text-gray-600'>{user?.email}</p>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditName(user?.name || '');
                  }}
                  className='mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600'
                >
                  Edit Name
                </button>
              </div>
            )}
          </div>

          {/* 로그아웃 버튼 */}
          <div className='text-center'>
            <button
              onClick={handleLogout}
              className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors'
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- `src/app/page.tsx` 업데이트

```tsx
import ButtonTest from '@/components/ButtonTest';
import Counter from '@/components/Counter';
import SCSSTest from '@/components/SCSSTest';
import UserProfile from '@/components/UserProfile';

export default function Home() {
  return (
    <div>
      <ButtonTest />
      <SCSSTest />
      <Counter />
      <br />
      <br />
      <UserProfile />
    </div>
  );
}
```

- `next.comfig.ts` : 외부 이미지 URL 참조시 옵션 정리

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: ['./src/styles'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
};

export default nextConfig;
```

## 4. 테마 테스트해보기 예제

### 4.1. Store 의 타입 정의

- `/src/types/types.ts` 에 정의 추가
- system 테마는 사용자가 pc 에서 설정한 테마 적용

```ts
// 테마타입 정의
//system 테마 : 시스템 설정을 따르는 테마
export type Theme = 'light' | 'dark' | 'system';

// 테마 Store type 정의
export interface ThemeState {
  theme: Theme; // 현재 선택된 테마
  setTheme: (theme: Theme) => void; //  특정 테마로 설정하는 함수
  toggleTheme: () => void; // 라이트/다크 테마를 전환하는 함수
}
```

### 4.2. Store 구현하기

- `src/stores/ThemeStore.ts 파일` 생성

```ts
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
```

### 4.3. Store 활용하기

- `src/components/ThemeToggle.tsx` 파일 생성

```tsx
'use client';

import { useThemeStore } from '@/stores/ThemeStore';

export default function ThemeToggle() {
  const { theme, setTheme, toggleTheme } = useThemeStore();

  return (
    <div className='p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg space-y-4'>
      <h2 className='text-2xl font-bold text-center text-gray-800'>
        Theme Settings
      </h2>

      <div className='text-center'>
        <p className='text-gray-600 mb-4'>
          Current theme:{' '}
          <span className='font-semibold capitalize'>{theme}</span>
        </p>

        <div className='space-y-2'>
          <button
            onClick={toggleTheme}
            className='w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
          >
            Toggle Theme
          </button>

          <div className='grid grid-cols-3 gap-2'>
            <button
              onClick={() => setTheme('light')}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                theme === 'light'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Light
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Dark
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                theme === 'system'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              System
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- `src/app/page.tsx` 업데이트

```tsx
import ButtonTest from '@/components/ButtonTest';
import Counter from '@/components/Counter';
import SCSSTest from '@/components/SCSSTest';
import ThemeToggle from '@/components/ThemeToggle';
import UserProfile from '@/components/UserProfile';

export default function Home() {
  return (
    <div>
      <ButtonTest />
      <SCSSTest />
      <Counter />
      <br />
      <br />
      <UserProfile />
      <br />
      <br />
      <ThemeToggle />
    </div>
  );
}
```

## 5. Todo 테스트 해보기

### 5.1. Store 의 타입 정의

- `src/types/type.ts` 업데이트

```ts
// Counter Store 타입 정의
export interface CounterState {
  count: number; // 현재 카운터 값(숫자)
  increment: () => void; //  카운터 1 증가
  decrement: () => void; //  카운터 1 감소
  reset: () => void; //  카운터 0 초기화
  setCount: (count: number) => void; //  직접 카운터 값 설정
}
// User 타입 정의
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
// User Store 타입
export interface UserState {
  user: User | null; //  현재 로그인한 사용자 정보(null 이면 로그아웃된 상태)
  isLoggedIn: boolean; // 로그인 여부를 나타내는 Boolean
  isLoading: boolean; // 로그인/로그아웃 처리중인지 나타내는 Boolean 값
  login: (user: User) => void; // 사용자 로그인 처리 함수
  logout: () => void; // 사용자 로그아웃 처리 함수
  updateUser: (user: Partial<User>) => void; // User 의 모든 속성을 선택젓 옵션으로 정의
  setLoading: (loading: boolean) => void; // 로딩 상태 설정 함수
}

// 테마타입 정의
//system 테마 : 시스템 설정을 따르는 테마
export type Theme = 'light' | 'dark' | 'system';

// 테마 Store type 정의
export interface ThemeState {
  theme: Theme; // 현재 선택된 테마
  setTheme: (theme: Theme) => void; //  특정 테마로 설정하는 함수
  toggleTheme: () => void; // 라이트/다크 테마를 전환하는 함수
}

// Todo 타입 저의
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
// Todo Store 타입정의
export interface TodoState {
  todos: Todo[]; // 모든 할일 목록 배열
  filter: 'all' | 'active' | 'completed'; // 현재적용된 필터
  // action 타입
  addTodo: (text: string) => void; //  새로운 할일 추가
  toggleTodo: (id: string) => void; // 할일 완료 상태 토글
  deleteTodo: (id: string) => void; // 할일 삭제
  updateTodo: (id: string, text: string) => void; // 할일 내용 수정
  setFilter: (filter: 'all' | 'active' | 'completed') => void; // 필터 설정
  clearCompleted: () => void; // 완료된 할일 모두 삭제
  getFilterdTodos: () => void; // 현재 선택된 할일 목록만 반환
}
```

### 5.2. Store 구현하기

- `/src/stores/TodoStore.ts 파일` 생성

```ts
// Todo Store - zustand 로 카운터 관리

import { Todo, TodoState } from '@/types/types';
import { stat } from 'fs';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1 단계 - store 타입 정의 (통상 types/types.ts 에 정의)
// interface TodoState {
//   // state 타입
//   todos: Todo[]; // 모든 할일 목록 배열
//   filter: 'all' | 'active' | 'completed'; // 현재 적용된 필터
//   // action 타입
//   addTodo: (text: string) => void; // 새로운 할일 추가
//   toggleTodo: (id: string) => void; // 할일 완료 상태 토글
//   deleteTodo: (id: string) => void; // 할일 삭제
//   updateTodo: (id: string, text: string) => void; // 할일 내용 수정
//   setFilter: (filter: 'all' | 'active' | 'completed') => void; // 필터 설정
//   clearCompleted: () => void; // 완료된 할일 모두 삭제
//   getFilteredTodos: () => Todo[]; // 현재 선택된 할일 목록만 반환
// }

// 2 단계 - store 구현(필요시 localStorage 활용)
// create :  store 즉, state 만들기
// get : state 읽기
// set : state 쓰기

// 2 단계 1. localStorage 가 적용 안된버전
const todoState = create<TodoState>()((set, get) => ({
  // state 의 초기상태 값
  todos: [],
  filter: 'all',
  // state 를 다루는 액션의 기능 작성
  addTodo: (text: string) => {
    const newTodo: Todo = {
      id: '',
      text: text,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 기존 할일 목록에 새로운 할일 추가
    set(state => ({ todos: [...state.todos, newTodo] }));
  },
  toggleTodo: (id: string) => {
    set(state => ({
      todos: state.todos.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    }));
  },
  deleteTodo: (id: string) => {
    set(state => ({ todos: state.todos.filter(item => item.id !== id) }));
  },
  updateTodo: (id: string, text: string) => {
    set(state => ({
      todos: state.todos.map(item =>
        item.id === id ? { ...item, text: text, updatedAt: new Date() } : item
      ),
    }));
  },
  setFilter: (filter: 'all' | 'active' | 'completed') => {
    set({ filter });
  },
  clearCompleted: () => {
    set(state => ({ todos: state.todos.filter(item => !item.completed) }));
  },
  getFilteredTodos: () => {
    // 현재 state 를 읽어옴
    const { todos, filter } = get();
    switch (filter) {
      case 'active':
        return todos.filter(item => !item.completed);
      case 'completed':
        return todos.filter(item => item.completed);
      default:
        return todos;
    }
  },
}));

// 2 단계 2. localStorage 가 적용된버전
const todoLocalState = create<TodoState>()(
  persist(
    (set, get) => ({
      // state 의 초기상태 값
      todos: [],
      filter: 'all',
      // state 를 다루는 액션의 기능 작성
      addTodo: (text: string) => {
        const newTodo: Todo = {
          // 고유한 UUID 생성하기
          // https://developer.mozilla.org/ko/docs/Web/API/Window/crypto
          id: crypto.randomUUID(),
          text: text,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // 기존 할일 목록에 새로운 할일 추가
        set(state => ({ todos: [...state.todos, newTodo] }));
      },
      toggleTodo: (id: string) => {
        set(state => ({
          todos: state.todos.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
          ),
        }));
      },
      deleteTodo: (id: string) => {
        set(state => ({ todos: state.todos.filter(item => item.id !== id) }));
      },
      updateTodo: (id: string, text: string) => {
        set(state => ({
          todos: state.todos.map(item =>
            item.id === id
              ? { ...item, text: text, updatedAt: new Date() }
              : item
          ),
        }));
      },
      setFilter: (filter: 'all' | 'active' | 'completed') => {
        set({ filter });
      },
      clearCompleted: () => {
        set(state => ({ todos: state.todos.filter(item => !item.completed) }));
      },
      getFilteredTodos: () => {
        // 현재 state 를 읽어옴
        const { todos, filter } = get();
        switch (filter) {
          case 'active':
            return todos.filter(item => !item.completed);
          case 'completed':
            return todos.filter(item => item.completed);
          default:
            return todos;
        }
      },
    }),
    {
      name: 'todo-storage', // 로컬스토리지에 저장하는 이름(키명)
      // 모두 저장할 이유가 없고 내가 선별해서 저장하고 싶다면?
      // 새로 고침시 filter 는 "all" 이었으면 좋겠다.
      partialize: state => ({ todos: state.todos }),
    }
  )
);

// 3 단계 - custom Hook 정의
export const useTodoStore = () => {
  const {
    todos,
    filter,
    addTodo,
    toggleTodo,
    updateTodo,
    setFilter,
    deleteTodo,
    clearCompleted,
    getFilteredTodos,
  } = todoLocalState();

  return {
    todos,
    filter,
    addTodo,
    toggleTodo,
    updateTodo,
    setFilter,
    deleteTodo,
    clearCompleted,
    getFilteredTodos,
  };
};
```

### 5.3. Store 활용하기

- `src/components/TodoList.tsx` 파일 생성

```tsx
/**
 * TodoList 컴포넌트 - Zustand를 사용한 할일 목록 기능 구현
 *
 * 이 컴포넌트는 useTodoStore 훅을 사용하여 할일 목록의 CRUD 작업과
 * 필터링 기능을 제공합니다.
 */

'use client';
import { useTodoStore } from '@/stores/TodoStore';
import { useState } from 'react';

/**
 * TodoList - 할일 목록 관리 컴포넌트
 *
 * Zustand의 useTodoStore 훅을 사용하여:
 * - 할일 추가/수정/삭제/완료 토글
 * - 필터링 (전체/활성/완료)
 * - 완료된 할일 일괄 삭제
 *
 * @returns JSX.Element - 할일 목록 UI 컴포넌트
 */
export default function TodoList() {
  // Zustand 스토어에서 할일 관련 상태와 액션들을 가져옵니다
  const {
    todos,
    filter,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    setFilter,
    clearCompleted,
    getFilteredTodos,
  } = useTodoStore();

  // 로컬 상태: 새 할일 입력과 편집 중인 할일
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  /**
   * handleAddTodo - 새 할일 추가 처리
   *
   * 입력된 텍스트가 유효한 경우 새 할일을 추가하고 입력 필드를 초기화합니다.
   */
  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo(newTodo.trim());
      setNewTodo('');
    }
  };

  /**
   * handleEditStart - 할일 편집 시작
   *
   * @param id - 편집할 할일의 ID
   * @param text - 현재 할일 내용
   *
   * 편집 모드를 활성화하고 현재 텍스트를 편집 필드에 설정합니다.
   */
  const handleEditStart = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  /**
   * handleEditSave - 할일 편집 저장
   *
   * 편집된 텍스트가 유효한 경우 할일을 업데이트하고 편집 모드를 종료합니다.
   */
  const handleEditSave = () => {
    if (editingId && editingText.trim()) {
      updateTodo(editingId, editingText.trim());
      setEditingId(null);
      setEditingText('');
    }
  };

  /**
   * handleEditCancel - 할일 편집 취소
   *
   * 편집 모드를 취소하고 편집 상태를 초기화합니다.
   */
  const handleEditCancel = () => {
    setEditingId(null);
    setEditingText('');
  };

  // 현재 필터에 맞는 할일 목록 가져오기
  const filteredTodos = getFilteredTodos();

  return (
    <div className='p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-lg space-y-4'>
      {/* 컴포넌트 제목 */}
      <h2 className='text-2xl font-bold text-center text-gray-800'>
        Todo List
      </h2>

      {/* 새 할일 추가 폼 */}
      <div className='flex space-x-2'>
        <input
          type='text'
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleAddTodo()}
          placeholder='Add a new todo...'
          className='flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
        <button
          onClick={handleAddTodo}
          className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
        >
          Add
        </button>
      </div>

      {/* 필터 버튼들 */}
      <div className='flex space-x-2'>
        {(['all', 'active', 'completed'] as const).map(filterType => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              filter === filterType
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* 할일 목록 */}
      <div className='space-y-2'>
        {filteredTodos.length === 0 ? (
          <p className='text-center text-gray-500 py-4'>
            {filter === 'all' ? 'No todos yet' : `No ${filter} todos`}
          </p>
        ) : (
          filteredTodos.map(todo => (
            <div
              key={todo.id}
              className='flex items-center space-x-2 p-3 border border-gray-200 rounded hover:bg-gray-50'
            >
              {/* 완료 상태 토글 체크박스 */}
              <input
                type='checkbox'
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
              />

              {/* 할일 내용 */}
              <div className='flex-1'>
                {editingId === todo.id ? (
                  // 편집 모드: 입력 필드
                  <input
                    type='text'
                    value={editingText}
                    onChange={e => setEditingText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleEditSave()}
                    className='w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    autoFocus
                  />
                ) : (
                  // 표시 모드: 할일 텍스트
                  <span
                    className={`${
                      todo.completed
                        ? 'line-through text-gray-500'
                        : 'text-gray-800'
                    }`}
                  >
                    {todo.text}
                  </span>
                )}
              </div>

              {/* 액션 버튼들 */}
              <div className='flex space-x-1'>
                {editingId === todo.id ? (
                  // 편집 모드: 저장/취소 버튼
                  <>
                    <button
                      onClick={handleEditSave}
                      className='px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600'
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className='px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600'
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  // 표시 모드: 편집/삭제 버튼
                  <>
                    <button
                      onClick={() => handleEditStart(todo.id, todo.text)}
                      className='px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className='px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600'
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 통계 및 액션 */}
      <div className='flex justify-between items-center pt-4 border-t border-gray-200'>
        <div className='text-sm text-gray-600'>
          {todos.filter(todo => !todo.completed).length} active,{' '}
          {todos.filter(todo => todo.completed).length} completed
        </div>
        {todos.some(todo => todo.completed) && (
          <button
            onClick={clearCompleted}
            className='px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors'
          >
            Clear Completed
          </button>
        )}
      </div>
    </div>
  );
}
```

- `src/app/page.tsx` 업데이트

```tsx
import ButtonTest from '@/components/ButtonTest';
import Counter from '@/components/Counter';
import SCSSTest from '@/components/SCSSTest';
import ThemeToggle from '@/components/ThemeToggle';
import TodoList from '@/components/TodoList';
import UserProfile from '@/components/UserProfile';

export default function Home() {
  return (
    <div>
      <ButtonTest />
      <SCSSTest />
      <Counter />
      <br />
      <br />
      <UserProfile />
      <br />
      <br />
      <ThemeToggle />
      <br />
      <br />
      <TodoList />
    </div>
  );
}
```
