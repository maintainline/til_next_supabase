'use client';

import { useRequestPasswordResetEmail } from '@/hooks/mutations/auth/useRequestPasswordResetEmail';
import { getErrorMessage } from '@/lib/error';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ForgetPasswordContet() {
  const [email, setEmail] = useState('');
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

  const handleEmailSendClick = () => {
    if (email.trim() === '') return;
    console.log(email);
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
