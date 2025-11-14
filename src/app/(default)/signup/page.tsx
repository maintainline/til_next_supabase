'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSignUp } from '@/hooks/auth/useSignUp';
import { getErrorMessage } from '@/lib/error';
import { error } from 'console';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

function SignUp() {
  // 컴포넌트 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Mutation Hook 활용하기
  // 1. 이메일 mutation 훅
  const { mutate, isPending } = useSignUp({
    onError: error => {
      const message = getErrorMessage(error);
      toast.error(message, { position: 'top-center' });
    },
  });

  // 회원가입 버튼 클릭처리
  const handleSignUpClick = () => {
    if (!email.trim()) return;
    if (!password.trim()) return;
    // supabase 회원가입 처리 코드
    mutate({ email: email, password: password });
  };

  return (
    <div className='flex flex-col gap-8'>
      <div className='text-xl font-bold'>회원가입</div>
      <div className='flex flex-col gap-2'>
        <Input
          value={email}
          disabled={isPending}
          onChange={e => setEmail(e.target.value)}
          type='email'
          placeholder='example@example.com'
        />
        <Input
          value={password}
          disabled={isPending}
          onChange={e => setPassword(e.target.value)}
          type='password'
          placeholder='password'
        />
      </div>
      <div>
        <Button
          disabled={isPending}
          className='w-full'
          onClick={handleSignUpClick}
        >
          {isPending ? '회원등록중...' : '회원가입'}
        </Button>
      </div>
      <div>
        <Link
          href={'/signin'}
          className='text-muted-foreground hover:underline'
        >
          이미 계정이 있다면? 로그인
        </Link>
      </div>
    </div>
  );
}

export default SignUp;
