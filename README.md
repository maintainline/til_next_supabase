# Supabase 인증 에러 처리하기

## 1. 인증 에러 정보 받기

- `/src/apis/auth.ts` 파악하기

```ts
// supabase 백엔드에 사용자 이메일 로그인
export async function signInWithPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  // 레퍼런스 참조
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 이 부분이 에러의 대한 정보를 가지고 있음.
  if (error) throw error;

  return data;
}
```

## 2. Mutation 에서 에러 정보 확인 및 처리

- `/src/hooks/muations/useSignInWithPassword.ts`

```ts
import { signInWithPassword } from '@/apis/auth';
import { useMutation } from '@tanstack/react-query';

export function useSignInWithPassword() {
  return useMutation({
    mutationFn: signInWithPassword,
    // 자동으로 error 전달받음
    onError: error => {
      console.error(error);
      alert(error.message);
    },
  });
}
```

## 3. shadcn/ui 의 sonner 컴포넌트 활용

- https://ui.shadcn.com/docs/components/sonner
- `npx shadcn@latest add sonner`

### 3.1. 토스트 안내메시지 (앱 전체에서 활용 필요)

- 전체 레이아웃에 배치하는 것이 좋음.
- 안타깝게도 `/src/app/layout.tsx` 에 `"use client"` 사용은 고민 필요
- 별도의 `토스트용 컴포넌트`를 생성해서 layout.tsx 에 배치 권장함.

### 3.2. 토스트 컴퍼넌트 생성

- `/src/components/providers/ToastProvider.tsx 파일` 생성

```tsx
'use client';
import { Toaster } from '../ui/sonner';
export default function ToastProvider() {
  return <Toaster />;
}
```

### 3.3. layout.tsx 에 배치하기

- `/src/app/layout.tsx` 업데이트(참조)
- 앱 전체에서 활용 가능하도록

```tsx
{
  /* 컴포넌트 배치 */
}
<ToastProvider />;
```

### 3.4. 이벤트 발생시키기

- `/src/hooks/muations/useSignInWithPassword.ts`

```ts
import { signInWithPassword } from '@/apis/auth';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useSignInWithPassword() {
  return useMutation({
    mutationFn: signInWithPassword,
    // 자동으로 error 전달받음
    onError: error => {
      console.error(error);
      // Sonner 로 띄우기
      toast.error(error.message, { position: 'top-center' });
    },
  });
}
```

## 4. 에러 발생시 우리가 원하는 함수 실행시키기

### 4.1. `콜백 함수 전달`하기

- `/src/app/signin/page.tsx`

```tsx
// 이메일로 로그인
const { mutate: signInPassword, isPending: isPendingPassword } =
  useSignInWithPassword();
```

- 단계 1. 객체 전달

```tsx
const { mutate: signInPassword, isPending: isPendingPassword } =
  useSignInWithPassword(객체);
```

- 단계 2. 객체 정의

```tsx
const { mutate: signInPassword, isPending: isPendingPassword } =
  useSignInWithPassword({});
```

- 단계 3. 객체에 키명: 기능정의

```tsx
const { mutate: signInPassword, isPending: isPendingPassword } =
  useSignInWithPassword({
    onError: () => {
      setPassword('');
    },
  });
```

- 단계 4. 훅에서 전달된 객체( 콜백 함수 형태 값)를 처리하는 과정

```ts
import { signInWithPassword } from '@/apis/auth';
import { UseMutationCallback } from '@/types/types';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useSignInWithPassword(callback?: UseMutationCallback) {
  return useMutation({
    mutationFn: signInWithPassword,
    // 자동으로 error 전달받음
    onError: error => {
      console.error(error);
      // Sonner 로 띄우기
      toast.error(error.message, { position: 'top-center' });

      // 전달 받은 함수실행
      if (callback?.onError) callback.onError(error);
    },
  });
}
```

- 단계 5. UI 및 훅 분리
- UI 부분

```tsx
// 이메일로 로그인
const { mutate: signInPassword, isPending: isPendingPassword } =
  useSignInWithPassword({
    onError: error => {
      setPassword('');
      // Sonner 로 띄우기
      toast.error(error.message, { position: 'top-center' });
    },
  });
```

- Hook 부분

```tsx
import { signInWithPassword } from '@/apis/auth';
import { UseMutationCallback } from '@/types/types';
import { useMutation } from '@tanstack/react-query';

export function useSignInWithPassword(callback?: UseMutationCallback) {
  return useMutation({
    mutationFn: signInWithPassword,
    // 자동으로 error 전달받음
    onError: error => {
      console.error(error);
      if (callback?.onError) callback.onError(error);
    },
  });
}
```

### 4.2. `Mutation 콜백함수 타입을 정의` 해서 활용하시길 권장

- `/src/types/types.ts` 참조

```ts
export type UseMutationCallback = {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
  onMutate?: () => void;
  onSettled?: () => void;
};
```
