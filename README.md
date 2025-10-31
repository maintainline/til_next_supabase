# Zustand 와 Supabase Auth

## 1. 참조

- supabase 계정에따라서 type 생성 오류 발생함
- supabase 로그인 이후 진행

```bash
npx supabase login
```

## 2. `React` 와 `Next.js` 는 다르다

- Supabase 는 `React 라면 Localstorage 에 로그인 정보` 보관
- Localstorage는 웹브라우저 종료해도 남아있다.
- Localstorage는 새로고침해도 남아있다.
- Localstorage는 유효기간이 없다..

- Supabase 는 `Next 라면 cookie 에 로그인 정보` 보관
- cookie는 웹브라우저 종료해도 남아있다.
- cookie는 새로고침해도 남아있다.
  -cookie는 일정기간만큼 보관(유효기간 존재)

## 3. zustand 로 관리하기

### 3.1. stores 만들기

- `/src/stores 폴더` 생성
- `/src/stores/session.ts 파일` 생성

- 단계 1.

```ts
import { create } from 'zustand';

create();
```

- 단계 2.

```ts
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

create(combine(state 객체 , 액션함수));
```

- 단계 3.

```ts
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

create(combine(state 객체 , 액션함수));
```

- 단계 4.

```ts
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

//보관할 state의 객체의 초기값
const initialState = {
  isLoading: false,
  session: null,
};

create(combine(initialState, 액션함수));
```

- 단계 5.

```ts
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

//Supabase 의 인증의 타입을 정의함
import type { Session } from '@supabase/supabase-js';
type State = {
  isLoading: boolean;
  session: null | Session;
};
//보관할 state의 객체의 초기값
const initialState = {
  isLoading: false,
  session: null,
} as State;

create(combine(initialState, 액션함수));
```

- 단계 6.

```ts
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

//Supabase 의 인증의 타입을 정의함
import type { Session } from '@supabase/supabase-js';
type State = {
  isLoading: boolean;
  session: null | Session;
};
//보관할 state의 객체의 초기값
const initialState = {
  isLoading: false,
  session: null,
} as State;

create(combine(initialState, () => ({ 액션객체 })));
```

- 단계 7.

```ts
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

//Supabase 의 인증의 타입을 정의함
import type { Session } from '@supabase/supabase-js';
type State = {
  isLoading: boolean;
  session: null | Session;
};
//보관할 state의 객체의 초기값
const initialState = {
  isLoading: false,
  session: null,
} as State;

create(combine(initialState, () => ({ 키명: 기능 })));
```

- 단계 8.

```ts
create(combine(initialState, () => ({ actions: {} })));
```

- 단계 9.

```ts
// set 은 state 값 설정
// get 은 state 값 일기
create(combine(initialState, (set, get) => ({ actions: {} })));
```

- 단계 10.

```ts
// set 은 state 값 설정
// get 은 state 값 일기
create(
  combine(initialState, (set, get) => ({
    actions: {
      setSession: () => {
        //하고싶은 일
      },
    },
  }))
);
```

- 단계 11.

```ts
// set 은 state 값 설정
// get 은 state 값 일기
create(
  combine(initialState, (set, get) => ({
    actions: {
      setSession: (session: Session | null) => {
        //하고싶은 일
        set({ isLoading: true, session });
      },
    },
  }))
);
```

### 3.2. devtools 로 개발을 편하게 처리

- 단계 1.

```ts
import { combine, devtools } from 'zustand/middleware';
```

- 단계 2.

```ts
create(devtools());
```

- 단계 3.

```ts
create(devtools(combine함수, { name: 'sessionStore' }));
```

- 단계 4.

```ts
create(
  devtools(
    combine(initialState, (set, get) => ({
      actions: {
        setSession: (session: Session | null) => {
          //하고싶은 일
          set({ isLoading: true, session });
        },
      },
    })),
    { name: 'sessionStore' }
  )
);
```

### 3.3. 커스텀 훅으로 뽑아주기

- 단계 1.

```ts
const useSessionStore = create(
  devtools(
    combine(initialState, (set, get) => ({
      actions: {
        setSession: (session: Session | null) => {
          //하고싶은 일
          set({ isLoading: true, session });
        },
      },
    })),
    { name: 'sessionStore' }
  )
);
```

- Session 정보만 추출하는 커스텀 훅

```ts
// session 정보
export const useSession = () => {
  //Selector 함수는 Store 에서 원하는 것을 선택해서 리턴한다.
  const session = useSessionStore(store => store.session);
  return session;
};
```

- loading 정보만 추출하는 커스텀 훅

```ts
// loading 정보
export const useSessionLoaded = () => {
  //Selector 함수는 Store 에서 원하는 것을 선택해서 리턴한다.
  const isSessionLoaded = useSessionStore(store => store.isLoading);
  return isSessionLoaded;
};
```

- setSession 액션만 추출하는 커스텀 훅

```ts
// setSession 보관 액션
export const useSetSession = () => {
  //Selector 함수는 Store 에서 원하는 것을 선택해서 리턴한다.
  const setSession = useSessionStore(store => store.actions.setSession);
  return setSession;
};
```

### 3.4. 왜 presist 는 안쓰지?

- Supabase 인증은 자동으로 cookie 에 보관됩니다.
- local Storage 에 보관하지 않아도 웹 브라우저가 가지고 있습니다.

## 4. 활용하기

### 4.1. 전역에서 활용하기 위해서 /src/app/layout.tsx 입니다.

### 4.2. 그런데, 'use client'를 layout.tsx 에 적용은 곤란함.

### 4.3. 별도의 컴포넌트를 만들어서 layout.tsx 에 배치 권장

- `/src/components/providers 폴더` 생성
- `/src/components/providers/SessionProvider.tsx 파일` 생성

- 단계 1.

```tsx
export default function SessionProvider() {
  return <div>세션관리 컴포넌트</div>;
}
```

- 단계 2

```tsx
interface SessionProviderProps {
  children: React.ReactNode;
}

export default function SessionProvider({ children }: SessionProviderProps) {
  return <div>{children}</div>;
}
```

- 단계 3.

```tsx
'use client';
import { useSessionLoaded, useSetSession } from '@/stores/session';

interface SessionProviderProps {
  children: React.ReactNode;
}

export default function SessionProvider({ children }: SessionProviderProps) {
  const setSession = useSetSession();
  const isSessionLoaded = useSessionLoaded();
  return <div>{children}</div>;
}
```

- 단계 4.

```tsx
'use client';
import supabase from '@/lib/supabase/client';
import { useSessionLoaded, useSetSession } from '@/stores/session';
import { useEffect } from 'react';

interface SessionProviderProps {
  children: React.ReactNode;
}

export default function SessionProvider({ children }: SessionProviderProps) {
  const setSession = useSetSession();
  const isSessionLoaded = useSessionLoaded();

  useEffect(() => {
    //supabase 의 인증의 상태가 변함을 체크함
    supabase.auth.onAuthStateChange((event, session) => {
      // zustand 에 보관
      setSession(session);
    });
  }, []);

  return <div>{children}</div>;
}
```

- 단계 5.

```tsx
'use client';
import supabase from '@/lib/supabase/client';
import { useSessionLoaded, useSetSession } from '@/stores/session';
import { useEffect } from 'react';

interface SessionProviderProps {
  children: React.ReactNode;
}

export default function SessionProvider({ children }: SessionProviderProps) {
  const setSession = useSetSession();
  const isSessionLoaded = useSessionLoaded();

  useEffect(() => {
    //supabase 의 인증의 상태가 변함을 체크함
    supabase.auth.onAuthStateChange((event, session) => {
      // zustand 에 보관
      setSession(session);
    });
  }, []);

  // 아직 세션이 없다면
  if (!isSessionLoaded) return <div>로딩중...🎠</div>;

  return <div>{children}</div>;
}
```

### 4.4. 배치해보기

- `/src/app/layout.tsx` 업데이트

```tsx
<SessionProvider>
  <header className='h-15 border-b'>
    <div className='m-auto flex h-full w-full max-w-175 justify-between px-4'>
      <Link href={'/'} className='flex items-center gap-2'>
        <Image src={logo} alt='SNS 서비스 로고' width={40} height={40} />
        <div className='font-bold'>SNS 서비스</div>
      </Link>

      <div className='flex items-center gap-5'>
        <div className='hover:bg-muted cursor-pointer rounded-full p-2'>
          <Sun />
        </div>
        <Image
          src={defaultAvatar}
          alt='기본 아바타'
          width={24}
          height={24}
          className='h-6'
        />
      </div>
    </div>
  </header>
  <main className='m-auto w-full max-w-175 flex-1 border-x px-4 py-6'>
    {children}
  </main>
  <footer className='text-muted-foreground border-t py-10 text-center'>
    @devgeact
  </footer>
</SessionProvider>
```

### 4.5. 로딩창 만들기

- `/src/components/GlobalLoading.tsx `파일생성

```tsx
import React from 'react';
import Image from 'next/image';
export const GlobalLoader = () => {
  return (
    <div className='bg-muted flex h-[100vh] w-[100vw] flex-col items-center justify-center'>
      <div className='mb-15 flex animate-bounce items-center gap-4'>
        <Image
          src={'/assets/logo.png'}
          alt='SNS'
          className='w-10'
          width={40}
          height={40}
        />
        <div className='text-2xl font-bold'>SNS 서비스</div>
      </div>
    </div>
  );
};
```

- 배치
- `/src/components/providers/SessionProvider.tsx` 업데이트

```tsx
'use client';
import supabase from '@/lib/supabase/client';
import { useSessionLoaded, useSetSession } from '@/stores/session';
import { useEffect } from 'react';
import { GlobalLoader } from '../GlobalLoading';

interface SessionProviderProps {
  children: React.ReactNode;
}

export default function SessionProvider({ children }: SessionProviderProps) {
  const setSession = useSetSession();
  const isSessionLoaded = useSessionLoaded();

  useEffect(() => {
    //supabase 의 인증의 상태가 변함을 체크함
    supabase.auth.onAuthStateChange((event, session) => {
      // zustand 에 보관
      setSession(session);
    });
  }, []);

  // 아직 세션이 없다면
  if (!isSessionLoaded) return <GlobalLoader />;

  return <div>{children}</div>;
}
```
