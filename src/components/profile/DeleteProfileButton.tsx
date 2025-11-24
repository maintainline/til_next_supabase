'use client';
import { signOut } from '@/apis/auth';
import { Button } from '@/components/ui/button';
import { useOpenAlertModal } from '@/stores/alertModalStore';

import { useSetSession } from '@/stores/session';
import { useRouter } from 'next/navigation';

export default function DeleteProfileButton() {
  const openAlertModal = useOpenAlertModal();

  const router = useRouter();
  const setSession = useSetSession();
  const deleteProfile = async () => {
    try {
      // src/app/api/profile/delete/route.ts 라우트 API 실행
      const response = await fetch('/api/profile/delete', {
        method: 'POST',
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      await signOut();
      setSession(null);
      router.replace('/signin');
      // router.refresh();
      if (typeof window !== 'undefined') {
        window.location.assign('/signin');
      }
    } catch (error) {
      console.log(error);
      openAlertModal({
        title: '회원 탈퇴 실패',
        description: '잠시 후 다시 시도해주세요.',
      });
    }
  };

  const handleClick = () => {
    openAlertModal({
      title: '회원 탈퇴',
      description: '정말로 회원을 탈퇴하시겠습니까?',
      onPositive: deleteProfile,
    });
  };

  return (
    <Button
      variant='destructive'
      className='cursor-pointer'
      onClick={handleClick}
    >
      회원 탈퇴
    </Button>
  );
}