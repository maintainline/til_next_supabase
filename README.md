# 비밀번호 찾기

## 1. 사전 준비

- `/src/app/(default)/signin/page.tsx` 업데이트

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSignInWithGoogle } from '@/hooks/mutations/useSignInWithGoogle';
import { useSignInWithKakao } from '@/hooks/mutations/useSignInWithKakao';
import { useSignInWithPassword } from '@/hooks/mutations/useSignInWithPassword';
import { getErrorMessage } from '@/lib/error';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //이메일로 로그인
  const { mutate: signInPassword, isPending: isPendingPassword } =
    useSignInWithPassword({
      onError: error => {
        setPassword('');
        // sonner 로 띄우기
        // 한글 메세지로 교체
        const message = getErrorMessage(error);
        toast.error(message, { position: 'top-center' });
      },
    });

  const handleSignInWithEmail = () => {
    if (!email.trim()) return;
    if (!password.trim()) return;
    // 이메일을 이용해서 로그인 진행
    signInPassword({ email: email, password: password });
  };

  // 카카오 로그인
  const { mutate: signInWithKakao, isPending: isPendingKakao } =
    useSignInWithKakao({
      onError: error => {
        setPassword('');
        // sonner 로 띄우기
        // 한글 메세지로 교체
        const message = getErrorMessage(error);
        toast.error(message, { position: 'top-center' });
      },
    });

  const handleSignInWithKakao = () => {
    signInWithKakao('kakao');
  };

  // 구글 로그인
  const { mutate: signInWithGoogle, isPending: isPendingGoogle } =
    useSignInWithGoogle({
      onError: error => {
        setPassword('');
        // sonner 로 띄우기
        // 한글 메세지로 교체
        const message = getErrorMessage(error);
        toast.error(message, { position: 'top-center' });
      },
    });
  const handleSignInWithGoogle = () => {
    signInWithGoogle('google');
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
        <Button
          onClick={handleSignInWithKakao}
          disabled={isPendingKakao}
          className='w-full cursor-pointer'
        >
          카카오 계정 로그인
        </Button>

        {/* 구글 소셜 로그인 */}
        <Button
          onClick={handleSignInWithGoogle}
          disabled={isPendingGoogle}
          className='w-full cursor-pointer'
        >
          구글 계정 로그인
        </Button>
      </div>

      <div className='flex flex-col gap-2'>
        <Link
          className='text-muted-foreground hover:underline'
          href={'/signup'}
        >
          계정이 없으시다면? 회원가입
        </Link>

        <Link
          className='text-muted-foreground hover:underline'
          href={'/forget-password'}
        >
          비밀번호를 잊으셨나요?
        </Link>
      </div>
    </div>
  );
}

export default SignIn;
```

- `/src/app/(default)/forget-password/page.tsx` 업데이트

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
