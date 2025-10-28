# 이메일 회원 로그인 구현

- `/src/app/signin/page.tsx`

## 1. UI 구성

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

function SignIn() {
  return (
    <div className='flex flex-col gap-8'>
      <div className='text-xl font-bold'>로그인</div>
      <div className='flex flex-col gap-2'>
        <Input
          type='email'
          className='py-6'
          placeholder='example@example.com'
        />
        <Input type='password' className='py-6' placeholder='password' />
      </div>
      <div>
        <Button className='w-full'>로그인</Button>
      </div>
      <div>
        <Link
          href={'/signup'}
          className='text-muted-foreground hover:underline'
        >
          계정이 없으시다면? 회원가입
        </Link>
      </div>
    </div>
  );
}

export default SignIn;
```

## 2. 클라이언트 컴포넌트 State 구성

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useState } from 'react';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  //이메일로 로그인
  const handleSignInWithEmail = () => {
    if (!email.trim()) return;
    if (!password.trim()) return;
    // 이메일을 이용해서 로그인 진행
  };

  return (
    <div className='flex flex-col gap-8'>
      <div className='text-xl font-bold'>로그인</div>
      <div className='flex flex-col gap-2'>
        <Input
          value={email}
          onChange={e => setEmail(e.target.value)}
          type='email'
          className='py-6'
          placeholder='example@example.com'
        />
        <Input
          type='password'
          value={password}
          onChange={e => setPassword(e.target.value)}
          className='py-6'
          placeholder='password'
        />
      </div>
      <div>
        <Button
          onClick={handleSignInWithEmail}
          className='w-full cursor-pointer'
        >
          로그인
        </Button>
      </div>
      <div>
        <Link
          href={'/signup'}
          className='text-muted-foreground hover:underline'
        >
          계정이 없으시다면? 회원가입
        </Link>
      </div>
    </div>
  );
}

export default SignIn;
```

## 3. API 구성

- `/src/apis/auth.ts` 업데이트

```ts
import supabase from '@/lib/supabase/client';

// supabase 백엔드에 사용자 이메일 회원가입
export async function signUpWithEmail({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  // 웹 브라우저를 이용해서 이메일 회원가입
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

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
  if (error) throw error;
  return data;
}
```

## 4. Mutation 구성

- `src/hooks/mutations/useSignInWithPassword.ts ` 파일 생성

```ts
import { signInWithPassword } from '@/apis/auth';
import { useMutation } from '@tanstack/react-query';

export function useSignInWithPassword() {
  return useMutation({
    mutationFn: signInWithPassword,
  });
}
```

## 5. 적용하기

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSignInWithPassword } from '@/hooks/mutations/useSignInWithPassword';
import Link from 'next/link';
import { useState } from 'react';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  //이메일로 로그인
  const { mutate: signInPassword, isPending: isPendingPassword } =
    useSignInWithPassword();

  const handleSignInWithEmail = () => {
    if (!email.trim()) return;
    if (!password.trim()) return;
    // 이메일을 이용해서 로그인 진행
    signInPassword({ email: email, password: password });
  };

  return (
    <div className='flex flex-col gap-8'>
      <div className='text-xl font-bold'>로그인</div>
      <div className='flex flex-col gap-2'>
        <Input
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={isPendingPassword}
          type='email'
          className='py-6'
          placeholder='example@example.com'
        />
        <Input
          type='password'
          value={password}
          disabled={isPendingPassword}
          onChange={e => setPassword(e.target.value)}
          className='py-6'
          placeholder='password'
        />
      </div>
      <div>
        <Button
          onClick={handleSignInWithEmail}
          className='w-full cursor-pointer'
          disabled={isPendingPassword}
        >
          로그인
        </Button>
      </div>
      <div>
        <Link
          href={'/signup'}
          className='text-muted-foreground hover:underline'
        >
          계정이 없으시다면? 회원가입
        </Link>
      </div>
    </div>
  );
}

export default SignIn;
```

# Supabase 카카오 로그인 구현

## 1. 카카오 개발자 앱 등록 및 supabase 셋팅

- https://developers.kakao.com/

## 2. UI 구성하기

- `/src/app/signin/page.tsx` 추가

```tsx
<div className='flex flex-col gap-2'>
   {/* 비밀번호 및 이메일 로그인 */}
       <Button
          onClick={handleSignInWithEmail}
          className='w-full cursor-pointer'
          disabled={isPendingPassword}
        >
          로그인
        </Button>
        {/* 카카오 소셜 로그인 */}
        <Button className='w-full cursor-pointer'>카카오 계정 로그인</Button>
      </div>
 <div>
```

## 3. api 구성하기

- `src/apis/auth.ts`추가

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

## 4. mutation 구성하기

- `/src/lib/hooks/mutations/useSignInWithKakao.ts` 파일 생성

```ts
import { signInWithOAuth } from '@/apis/auth';
import { useMutation } from '@tanstack/react-query';

export function useSignInWithKakao() {
  return useMutation({
    mutationFn: signInWithOAuth,
  });
}
```

## 5. 적용하기

- `/src/app/signin/page.tsx`

```tsx
// 카카오 로그인
const { mutate: signInWithKakao, isPending: isPendingKakao } =
  useSignInWithKakao();
const handleSignInWithKakao = () => {
  signInWithKakao('kakao');
};
```

```tsx
/* 카카오 소셜 로그인 */
<Button
  onClick={handleSignInWithKakao}
  disabled={isPendingKakao}
  className='w-full cursor-pointer'
>
  카카오 계정 로그인
</Button>
```
