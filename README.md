# 비밀번호 찾기

## 1. 사전 준비

- `/src/app/(default)/signin/page.tsx` 업데이트

```tsx
<div className='flex flex-col gap-2'>
  <Link className='text-muted-foreground hover:underline' href={'/signup'}>
    계정이 없으시다면? 회원가입
  </Link>
  <Link
    className='text-muted-foreground hover:underline'
    href={'/forget-password'}
  >
    비밀번호를 잊으셨나요?
  </Link>
</div>
```

- `/src/app/(default)/forget-password/page.tsx`
- UI 작업

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgetPassword() {
  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-1'>
        <div className='text-xl font-bold'>비밀번호를 잊으셨나요?</div>
        <div className='text-muted-foreground'>
          이메일 비밀번호를 재설정 할 수 있는 인증 링크를 보내드립니다.
        </div>
      </div>
      <Input className='py-6' type='email' placeholder='example@example.com' />
      <Button className='w-full'>인증 메일 요청하기</Button>
    </div>
  );
}
```

## 2. 컴포넌트 state 작업

- /src/app/forget-password/page.tsx

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function ForgetPassword() {
  // 컴포넌트 state
  const [email, setEmail] = useState('');
  // 이메일 전송 이벤트 핸들러
  const handleEmailSendClick = () => {
    if (email.trim() === '') return;
    console.log(email);
  };

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-1'>
        <div className='text-xl font-bold'>비밀번호를 잊으셨나요?</div>
        <div className='text-muted-foreground'>
          이메일 비밀번호를 재설정 할 수 있는 인증 링크를 보내드립니다.
        </div>
      </div>
      <Input
        value={email}
        onChange={e => setEmail(e.target.value)}
        className='py-6'
        type='email'
        placeholder='example@example.com'
      />
      <Button onClick={handleEmailSendClick} className='w-full'>
        인증 메일 요청하기
      </Button>
    </div>
  );
}
```

## 3. api 구현하기

- `/src/apis/auth.ts` 업데이트
- /auth/callback?next=`비밀번호 수정될 라우터 경로`
- env : `NEXT_PUBLIC_APP_URL=http://localhost:3000` 추가

```ts
// supabase 의 비밀번호 찾기 이메일을 전송함.
export async function requestPasswordResetEmail({ email }: { email: string }) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
  });
  if (error) throw error;
  return data;
}
```

## 4. /auth/callback 처리

- Supabase 의 Auth 인증 처리해 주는 역할
- `/src/app/auth 폴더` 생성
- `/src/app/auth/callback 폴더` 생성

### 4.1. page.tsx 말고 `route.ts` 생성에 대한 이해

- page.tsx 는 화면의 UI 출력
- Next.js 에서는 route 만 처리하는 파일명이 별도로 존재함.
- route.ts 는 UI 를 리턴하지 않음.
- route.ts 는 Next.js 의 App Router 처리를 진행함.
- route.ts 는 HTTP 메서드를 처리함.
- route.ts 는 NextRequest, NextResponse 를 처리함.
- route.ts 는 오로지 서버 컴포넌트에서만 작성 가능.
- Supabase 는 웹브라우저에서 처리됨.
- Next.js 는 서버라서 웹브라우저에 접근이 불가하다.
- 즉, 웹브라우저에 보관해주어야 할 Supabase 의 쿠키를 생성못함
- 그래서 Next.js 에서 조금 복잡한 과정으로 Supabase 인증 키를 구워주어야 함.
- 그래서 route.ts 를 활용함.

### 4.2. route.ts 구현

```ts
// 아래는 주의사항 : 왜냐하면 서버에서 클라이언트로 접근해야함
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
// 사용자가 로그인을 하고 난 다음에 돌아오는 처리
// 전달받은 url 의 ? 즉 쿼리스트링 다음에 내용을 파악해서 처리
// /auth/callback     ?    next=/reset-password
export async function GET(request: NextRequest) {
  // 사용자가 들어온 주소를 파악함.
  const url = new URL(request.url);
  // 주소에서 code 라는 값을 뜯어냄
  // code 에 값은 supabase 에서 만들어줌
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/';

  // code 가 없으면 로그인 과정에 문제가 있는 거라서 로그인 페이지로 이동
  if (!code) {
    return NextResponse.redirect(
      new URL('/signin?error=missing_code', request.url)
    );
  }

  // code 가 존재하면 Supabase 서버 연결 라이브러리로 생성함.
  const supabase = await createClient();
  // code 가 존재하면 진짜 로그인 세션으로 바꿔달라는 요청을 Supabase 에 전달함.
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL('/signin?error=exchange_failed', request.url)
    );
  }
  // 성공했다면 사용자가 가고 싶은 곳으로 간다.
  // next=/reset-password
  return NextResponse.redirect(new URL(next, request.url));
}
```

## 5. Supabase 의 createClient() 종류

- /src/lib/supabase/client.ts : 클라이언트 컴포넌트에서 활용(웹브라우저용)
- /src/lib/supabase/server.ts : 서버 컴포넌트에서 활용(서버용), 비동기(await)
- /src/lib/supabase/middleware.ts : Next.js 와 연동하는 경우 활용, 동기

## 6. supabase의 middleware.ts

- 화면에 페이지 즉, app/layout.tsx 를 그려내기 전에 사전에 처리가 필요
- `/src/lib/supabase/middleware.ts` 리턴값 업데이트
- 쿠키 관리, Next.js 의 middleware 에 활용

```ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = (request: NextRequest) => {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // supabase : 활용을 위해서 리턴함
  // response : 쿠키(Auth 인증관련 키값이 포함되어 있음)가 들어있는 응답을 리턴함.
  return { supabase, response: supabaseResponse };
};
```

## 7. Next.js 의 middleware

- 반드시 `middleware.ts` 라는 파일명은 약속되어있음.
- 예) layout.tsx, page.tsx, loading.tsx....
- 파일의 위치가 고정이 되어있음. (`/src/middleware.ts` 고정)

```ts
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // 사용자가 어느 주소로 왔는가?
  const { pathname } = request.nextUrl;

  // reset-password 경로 특별 처리
  if (pathname === '/reset-password') {
    const { supabase, response } = createClient(request);

    // 세션 확인
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // recovery 세션이 없으면 signin으로 리다이렉트
    if (!session) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    // recovery 세션이 있으면 통과
    return response;
  }

  // 루트 경로 접근 시 세션 체크
  if (pathname === '/') {
    const { supabase, response } = createClient(request);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // 세션이 없으면 signin으로 리다이렉트
    if (!session) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    // 세션이 있으면 통과
    return response;
  }

  // 다른 경로는 그대로 통과
  return NextResponse.next();
}

export const config = {
  matcher: ['/reset-password', '/'],
};
```

## 8. api 연결하기위해서 mutation 만들기

- `/src/hooks/mutations/useRequestPasswordResetEmail.ts 파일` 생성

```ts
import { requestPasswordResetEmail } from '@/apis/auth';
import { UseMutationCallback } from '@/types/types';

import { useMutation } from '@tanstack/react-query';

export function useRequestPasswordResetEmail(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: requestPasswordResetEmail,
    onSuccess: () => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: error => {
      console.error(error);
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
```

## 9. mutation 활용하기

- `/src/app/forget-password/page.tsx` 업데이트

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRequestPasswordResetEmail } from '@/hooks/mutations/useRequestPasswordResetEmail';
import { getErrorMessage } from '@/lib/error';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ForgetPassword() {
  // 컴포넌트 state
  const [email, setEmail] = useState('');
  // mutation 실행하기
  const { mutate, isPending } = useRequestPasswordResetEmail({
    onSuccess: () => {
      toast.info('인증 메일이 잘 발송되었습니다.', {
        position: 'top-center',
      });
      setEmail('');
    },
    onError: error => {
      const message = getErrorMessage(error);
      toast.error(message, {
        position: 'top-center',
      });
      setEmail('');
    },
  });

  // 이메일 전송 이벤트 핸들러
  const handleEmailSendClick = () => {
    if (email.trim() === '') return;
    console.log(email);
    // mutation 실행하기
    mutate({ email });
  };

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-1'>
        <div className='text-xl font-bold'>비밀번호를 잊으셨나요?</div>
        <div className='text-muted-foreground'>
          이메일 비밀번호를 재설정 할 수 있는 인증 링크를 보내드립니다.
        </div>
      </div>
      <Input
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={isPending}
        className='py-6'
        type='email'
        placeholder='example@example.com'
      />
      <Button
        onClick={handleEmailSendClick}
        disabled={isPending}
        className='w-full'
      >
        {isPending ? '인증 메일 요청 중...' : '인증 메일 요청하기'}
      </Button>
    </div>
  );
}
```

## 10. 비밀번호 변경하기

- /src/app/reset-password/page.tsx

### 10.1. UI 구성하기

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function ResetPassword() {
  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-1'>
        <div className='text-xl font-bold'>비밀번호 재설정하기</div>
        <div className='text-muted-foreground'>
          새로운 비밀번호를 입력하세요.
        </div>
      </div>
      <Input className='py-6' type='password' placeholder='password' />
      <Button className='w-full'>비밀번호 변경하기</Button>
    </div>
  );
}

export default ResetPassword;
```

### 10.2. 컴포넌트 state 구성하기

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const handleResetPasswordClick = () => {
    if (password.trim() === '') return;
    console.log(password);
  };
  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-1'>
        <div className='text-xl font-bold'>비밀번호 재설정하기</div>
        <div className='text-muted-foreground'>
          새로운 비밀번호를 입력하세요.
        </div>
      </div>
      <Input
        value={password}
        onChange={e => setPassword(e.target.value)}
        className='py-6'
        type='password'
        placeholder='password'
      />
      <Button onClick={handleResetPasswordClick} className='w-full'>
        비밀번호 변경하기
      </Button>
    </div>
  );
}

export default ResetPassword;
```

### 10.3. api 만들기

```tsx
// 비밀번호 재설정
export async function updatePassword({ password }: { password: string }) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  if (error) throw error;
  return data;
}
```

### 10.4. mutation 만들기

- `/src/hooks/muations/useUpdatePassword.ts 파일` 생성

```tsx
import { updatePassword } from '@/apis/auth';
import { UseMutationCallback } from '@/types/types';
import { useMutation } from '@tanstack/react-query';

export function useUpdatePassword(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: error => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
```

### 10.5. mutation 활용하기

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpdatePassword } from '@/hooks/mutations/useUpdatePassword';
import { getErrorMessage } from '@/lib/error';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const { mutate: updatePassword, isPending: isUpdatePasswordPending } =
    useUpdatePassword({
      onSuccess: () => {
        toast.success('비밀번호가 성공적으로 변경되었습니다.', {
          position: 'top-center',
        });
        router.push('/');
      },
      onError: error => {
        const message = getErrorMessage(error);
        toast.error(message, {
          position: 'top-center',
        });
        setPassword('');
      },
    });
  const handleResetPasswordClick = () => {
    if (password.trim() === '') return;
    console.log(password);
    updatePassword({ password });
  };
  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-1'>
        <div className='text-xl font-bold'>비밀번호 재설정하기</div>
        <div className='text-muted-foreground'>
          새로운 비밀번호를 입력하세요.
        </div>
      </div>
      <Input
        value={password}
        onChange={e => setPassword(e.target.value)}
        disabled={isUpdatePasswordPending}
        className='py-6'
        type='password'
        placeholder='password'
      />
      <Button
        onClick={handleResetPasswordClick}
        disabled={isUpdatePasswordPending}
        className='w-full'
      >
        {isUpdatePasswordPending ? '비밀번호 변경 중...' : '비밀번호 변경하기'}
      </Button>
    </div>
  );
}

export default ResetPassword;
```
