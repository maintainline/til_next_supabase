'use client';
import useProfileData from '@/hooks/queries/useProfileData';
import FallBack from '../FallBack';
import Loader from '../Loader';
import defaultAvatar from '/public/assets/icons/default-avatar.jpg';
import Image from 'next/image';
import { useEffect } from 'react';
import EditProfileButton from './EditProfileButton';
import { useSession } from '@/stores/session';

export default function ProfileInfo({ userId }: { userId: string }) {
  // 세션 정보 참조하기(zustand 보관됨)
  const session = useSession();
  // 본인인지를 검증
  const isMine = session?.user.id === userId;

  const {
    data: profile,
    error: fetchProfileError,
    isPending: isFetchingProfile,
  } = useProfileData(userId);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  if (fetchProfileError) return <FallBack />;
  if (isFetchingProfile) return <Loader />;

  return (
    <div className='flex flex-col items-center  justify-center gap-5'>
      <Image
        src={profile?.avatar_url || defaultAvatar}
        alt={`${profile?.nickname}의 프로필 이미지`}
        className='h-30 w-30 rounded-full object-cover'
        width={120}
        height={120}
      />
      <div className='flex flex-col items-center gap-2'>
        <div className='text-l font-bold'>{profile?.nickname}</div>
        <div className=' text-muted-foreground'>{profile?.bio}</div>
        <div className='text-muted-foreground'>{profile?.role}</div>
      </div>
      {/* 프로필 수정 */}
      {isMine && <EditProfileButton />}
    </div>
  );
}
