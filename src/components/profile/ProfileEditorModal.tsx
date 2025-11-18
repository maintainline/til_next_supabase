import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useSession } from '@/stores/session';

import { Loader } from 'lucide-react';
import FallBack from '../FallBack';
import defaultAvatar from '/public/assets/icons/default-avatar.jpg';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useProfileData from '@/hooks/queries/useProfileData';
import { useProfileEditor } from '@/stores/profileEditorModal';

export default function ProfileEditorModal() {
  const session = useSession();
  const {
    data: profile,
    error: fetchProfileError,
    isPending: isFetchingProfile,
  } = useProfileData(session?.user.id);

  //store  적용
  const store = useProfileEditor();
  const {
    isOpen,
    actions: { close, open },
  } = store;

  return (
    <Dialog open={isOpen} onOpenChange={close} >
      <DialogContent className='flex flex-col gap-5'>
        <DialogTitle>프로필 수정하기</DialogTitle>
        {fetchProfileError && <FallBack />}
        {isFetchingProfile && <Loader />}
        {!fetchProfileError && !isFetchingProfile && (
          <>
            <div className='flex flex-col gap-2'>
              <div className='text-muted-foreground'>프로필 이미지</div>
              <Image
                src={profile?.avatar_url || defaultAvatar}
                alt='프로필 이미지'
                className='h-40 w-40 cursor-pointer rounded-full object-cover'
                width={160}
                height={160}
              />
            </div>

            <div className='flex flex-col gap-2'>
              <div className='text-muted-foreground'>닉네임</div>
              <Input />
            </div>

            <div className='flex flex-col gap-2'>
              <div className='text-muted-foreground'>소개</div>
              <Input />
            </div>

            <Button className='cursor-pointer'>수정하기</Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
