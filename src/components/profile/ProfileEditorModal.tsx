'use client';
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
import { useEffect, useRef, useState } from 'react';
import { useUpdateProfile } from '@/hooks/mutations/profile/useUpdateProfile';
import { toast } from 'sonner';

// 아바타 이미지 타입정보 : 파일과 미리보기 주소
type ImageType = {
  file: File;
  previewUrl: string;
};

export default function ProfileEditorModal() {
  // 사용자 정보 store 에서 가져옴
  const session = useSession();

  // 사용자 프로필 정보 가져옴
  const {
    data: profile,
    error: fetchProfileError,
    isPending: isFetchingProfile,
  } = useProfileData(session?.user.id);

  //store  적용 : modal 열고, 닫은 상태를 반영함.
  const store = useProfileEditor();
  const {
    isOpen,
    actions: { close, open },
  } = store;

  // 프로필 수정 처리
  const { mutate: updateProfile, isPending: isUpdateProfilePending } =
    useUpdateProfile({
      onSuccess: () => {
        close();
      },
      onError: error => {
        toast.error('프로필 수정에 실패하였습니다.', {
          position: 'top-center',
        });
      },
    });

  // 사용자 아바타 이미지 파일 관리
  const [avatarImage, setAvatarImage] = useState<ImageType | null>(null);
  // 기타 정보
  const [nickName, setNickName] = useState('');
  const [bio, setBio] = useState('');

  //input 태그 참조
  const fileInputRef = useRef<HTMLInputElement>(null);
  // input 태그에서 이미지가 선택되었다면 처리
  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 왜 file 이아니라 files 라는 복수형인가? 배열로 값이 담겨 오므로
    if (!e.target.files) return;

    // 배열의 첫번째 이미지 선택
    const file = e.target.files[0];

    // 메모리 누수방지책
    if (avatarImage) {
      URL.revokeObjectURL(avatarImage.previewUrl);
    }

    // 미리 보기 이미지 생성
    setAvatarImage({ file: file, previewUrl: URL.createObjectURL(file) });
    e.target.value = '';
  };

  // 수정 버튼
  const handleUpdateClick = () => {
    if (nickName.trim() === '') return;
    updateProfile({
      userId: session!.user.id,
      nickname: nickName,
      bio,
      avatarImageFile: avatarImage?.file,
    });
  };

  // 최초 상태값 적용하기
  useEffect(() => {
    if (isOpen && profile) {
      setNickName(profile.nickname);
      setBio(profile.bio);
      setAvatarImage(null);
    }
  }, [profile, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className='flex flex-col gap-5'>
        <DialogTitle>프로필 수정하기</DialogTitle>
        {fetchProfileError && <FallBack />}
        {isFetchingProfile && <Loader />}
        {!fetchProfileError && !isFetchingProfile && (
          <>
            <div className='flex flex-col gap-2'>
              <div className='text-muted-foreground'>프로필 이미지</div>
              {/* 파일 이미지 Input 태그 */}
              <input
                disabled={isUpdateProfilePending}
                onChange={handleSelectImage}
                type='file'
                ref={fileInputRef}
                className='hidden'
                accept='image/*'
              />

              <Image
                // 이미지를 클릭하면 file 클릭 처리 진행 : current 로 접근
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                src={
                  avatarImage?.previewUrl ||
                  profile?.avatar_url ||
                  defaultAvatar
                }
                alt='프로필 이미지'
                className='h-40 w-40 cursor-pointer rounded-full object-cover'
                width={160}
                height={160}
              />
            </div>

            <div className='flex flex-col gap-2'>
              <div className='text-muted-foreground'>닉네임</div>
              <Input
                disabled={isUpdateProfilePending}
                value={nickName}
                onChange={e => setNickName(e.target.value)}
              />
            </div>

            <div className='flex flex-col gap-2'>
              <div className='text-muted-foreground'>소개</div>
              <Input
                disabled={isUpdateProfilePending}
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </div>

            <Button
              disabled={isUpdateProfilePending}
              onClick={handleUpdateClick}
              className='cursor-pointer'
            >
              {isUpdateProfilePending ? '수정중...' : '수정하기'}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
