'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpdatePassword } from '@/hooks/auth/useUpdatePassword';
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
