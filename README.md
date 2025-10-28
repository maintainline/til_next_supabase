# supabase google 소셜 로그인

## 1. 개발자 사이트 등록 및 Supabase 셋팅

- https://cloud.google.com/cloud-console?hl=ko

## 2. UI 작성

- `/src/app/signin/page.tsx`

```tsx
/* 구글 소셜 로그인 */
<Button className='w-full cursor-pointer'>구글 계정 로그인</Button>
```

## 3. API 작성

- `/src/apis/auth.ts` 기능 재활용

```ts
import type { Provider } from '@supabase/auth-js';
```

```ts
// supabase 백엔드에 소셜 로그인
export async function signInWithOAuth(provider: Provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider });
  if (error) throw error;
  return data;
}
```

## 4. Mutation 작성

- `/src/hooks/mutations/useSignInWithGoogle.ts` 파일 생성

```ts
import { signInWithOAuth } from '@/apis/auth';
import { useMutation } from '@tanstack/react-query';

export function useSignInWithGoogle() {
  return useMutation({
    mutationFn: signInWithOAuth,
  });
}
```

## 5. 활용하기

- `/src/app/signin/page.tsx`

```tsx
// 구글 로그인
const { mutate: signInWithGoogle, isPending: isPendingGoogle } =
  useSignInWithGoogle();
const handleSignInWithGoogle = () => {
  signInWithGoogle('google');
};
```

```tsx
/* 구글 소셜 로그인 */
<Button
  onClick={handleSignInWithGoogle}
  disabled={isPendingGoogle}
  className='w-full cursor-pointer'
>
  구글 계정 로그인
</Button>
```
