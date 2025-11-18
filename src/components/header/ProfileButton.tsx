'use client';
import defaultAvatar from '/public/assets/icons/default-avatar.jpg';
import { useSession } from '@/stores/session';
import { PopoverClose } from '@radix-ui/react-popover';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Image from 'next/image';
import useProfileData from '@/hooks/queries/useProfileData';
import Link from 'next/link';
import { sign } from 'crypto';
import { signOut } from '@/apis/auth';

export default function ProfileButton() {
  const session = useSession();
  const { data: profile } = useProfileData(session?.user.id);
  if (!session) return null;
  return (
    <Popover>
      <PopoverTrigger>
        <Image
          src={profile?.avatar_url || defaultAvatar}
          alt='기본 아바타'
          width={24}
          height={24}
          className='h-6 w-6 rounded-full object-cover'
        />
      </PopoverTrigger>
      <PopoverContent className='flex w-40 flex-col p-0'>
        <PopoverClose asChild>
          <Link href={`/profile/${session.user.id}`}>
            <div className='hover:bg-muted cursor-pointer px-4 py-3 text-sm'>
              프로필
            </div>
          </Link>
        </PopoverClose>
        <PopoverClose asChild>
          <div
            onClick={signOut}
            className='hover:bg-muted cursor-pointer px-4 py-3 text-sm'
          >
            로그아웃
          </div>
        </PopoverClose>
      </PopoverContent>
    </Popover>
  );
}
