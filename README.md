# 프로필 업데이트 하기

- 회원가입시 회원프로필 업데이트
- 로그인 후 회원정보가 없으면 정보를 Insert 해준다.

## 1. API 만들기

- `/src/apis/profile.ts 파일` 생성

```ts
import supabase from '@/lib/supabase/client';

// 1. 회원정보 읽기
// 회원의 ID 를 전달받아서 정보 데이터 반환함.
// 비동기 작업이므로 asyn 적용
export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}
```

## 2. `쿼리 키 팩토리`를 생성

- `쿼리 키`를 별도로 생성 관리함.
- `/src/lib/constants.ts` 업데이트

```ts
// 쿼리키 팩토링 상수
export const QUERY_KEYS = {
  todo: {
    all: ['todos'],
    list: ['todos', 'list'],
    detail: (id: string) => ['todos', 'deatail', id],
  },
  // 프로필 useQuery 키 생성 및 관리
  profile: {
    all: ['profile'],
    list: ['profile', 'list'],
    byId: (userId: string) => ['profile', 'byId', userId],
  },
};
```

## 3. hook 만들기

- `/src/hooks/queries 폴더` 생성
- `/src/hooks/queries/useProfileData.ts 파일` 생성

```ts
import { fetchProfile } from '@/apis/profile';
import { QUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';

export default function useProfileData(userId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.profile.byId(userId!),
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });
}
```

## 4. 활용하기

- `/src/components/porviders/SessionProvider.tsx` 업데이트
- 1 단계

```tsx
'use client';
import supabase from '@/lib/supabase/client';
import { useSession, useSessionLoaded, useSetSession } from '@/stores/session';
import { useEffect } from 'react';
import { GlobalLoading } from '../GlobalLoading';
import useProfileData from '@/hooks/queries/useProfileData';

interface SessionProviderProps {
  children: React.ReactNode;
}
export default function SessionProvider({ children }: SessionProviderProps) {
  // 1 단계. 현재 세션 Store 로 부터 사용자의 세션 데이터를 불러옴
  const session = useSession();

  const setSession = useSetSession();
  const isSessionLoaded = useSessionLoaded();
  // 2 단계
  // session 데이터 안쪽의  user.id 를 인수로 전달함.
  const { data: profile, isLoading: isProfileLoading } = useProfileData(
    session?.user.id
  );

  useEffect(() => {
    // Supbase 의 인증의 상태가 변함을 체크함.
    supabase.auth.onAuthStateChange((event, session) => {
      // zustand 에 보관
      setSession(session);
    });
  }, []);

  // 아직 세션이 없다면
  if (!isSessionLoaded) return <GlobalLoading />;

  // 3단계
  if (isProfileLoading) return <GlobalLoading />;

  return <div>{children}</div>;
}
```

- 2 단계 : React Query 의 default 옵션 적용하기
- 굳이 profiles 테이블에 있는지 4번 이나 질의하는 것은 필요없다.
- `/src/components/porviders/QueryProvider.tsx` 업데이트

```tsx
/*
QueryClient 를 App 전체에 제공함
- 모든 하위 컴포넌트에서 useQuery, useMutaion 등의 훅을 사용할 수있게함
 **/
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools/production';
import { useState } from 'react';

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // React 라면 아래 설정은 달라집니다.
  // 현재 Next.js 에다가 셋팅을 진행함.
  // 서버 사이드 렌더링을 위한 QueryClient 인스턴스 생성
  // 각 요청마다 새로운 QueryClient 를 생성하여 상태 구분함.
  const [client, setClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {/* npm run dev 상태에서만 개발자 도구 보기 */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition='bottom-right'
        />
      )}
    </QueryClientProvider>
  );
}
```

## 5. 오류체크하고 기본 profile 입력해주기

- 자동으로 기본 프로필 생성함.

### 5.1. 중복되지 않는 닉네임 생성 기능 추가

- `/src/lib/utils.ts` 추가

```ts
// 랜덤하면서 중복되지 않는 닉네임 생성
export const getRandomNickName = () => {
  const randomResult = Math.random().toString(36).substring(2, 8);
  return `user_nickname_${randomResult}`;
};
```

### 5.2. API 생성하기

- `/src/apis/profile.ts` 기능 추가

```ts
// 2. 사용자 정보 생성하기
export async function createProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, nickname: getRandomNickName() })
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### 5.3. 프로필 조회 실패시 호출해 주기

- `/src/hooks/queries/useProfileData.ts` 업데이트

```ts
import { createProfile, fetchProfile } from '@/apis/profile';
import { QUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import type { PostgrestError } from '@supabase/supabase-js';

export default function useProfileData(userId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.profile.byId(userId!),
    queryFn: async () => {
      try {
        const profile = await fetchProfile(userId!);
        return profile;
      } catch (error) {
        // 에러코드 파악으로 처리함
        if ((error as PostgrestError).code === 'PGRST116') {
          // 기본 사용자 생성
          return await createProfile(userId!);
        }
        throw error;
      }
    },
    enabled: !!userId,
  });
}
```

### 5.4. 다른 사용자가 만약 없는 사용자 프로필을 호출한다면

- 타인의 프로필은 생성하지 않도록 처리 필요.

```ts
import { createProfile, fetchProfile } from '@/apis/profile';
import { QUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import type { PostgrestError } from '@supabase/supabase-js';
import { useSession } from '@/stores/session';

export default function useProfileData(userId?: string) {
  // 나의 정보 확인
  const session = useSession();
  // 나의 계정인지를 검사
  const isMine = userId === session?.user.id;

  return useQuery({
    queryKey: QUERY_KEYS.profile.byId(userId!),
    queryFn: async () => {
      try {
        const profile = await fetchProfile(userId!);
        return profile;
      } catch (error) {
        // 에러코드 파악으로 처리함
        if (isMine && (error as PostgrestError).code === 'PGRST116') {
          // 기본 사용자 생성
          return await createProfile(userId!);
        }
        throw error;
      }
    },
    enabled: !!userId,
  });
}
```
