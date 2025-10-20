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

```

### 4.3. Store 활용하기
