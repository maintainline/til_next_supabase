# 프로필 수정하기

## 1. 수정버튼 생성

- `src/components/profile/EditProfileButton.tsx` 파일 생성

```tsx
'use client';
import { Button } from '@/components/ui/button';

export default function EditProfileButton() {
  return (
    <Button variant='secondary' className='cursor-pointer'>
      프로필 수정
    </Button>
  );
}
```

## 2. 배치

- `src/components/profile/ProfileInfo.tsx` 배치

```tsx
// 세션 정보 참조하기(zustand 보관됨)
const session = useSession();
// 본인인지를 검증
const isMine = session?.user.id === userId;
```

```tsx
/* 프로필 수정 */
{
  isMine && <EditProfileButton />;
}
```

## 3. 프로필 수정 모달 구성하기

### 3.1. 프로필 모달의 상태를 관리할 Store 생성

- `src/stores/profileEditorModal.ts 파일` 생성

```ts
import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

const initialState = {
  isOpen: false,
};

const useProfileEditorModalStore = create(
  devtools(
    combine(initialState, set => ({
      actions: {
        open: () => {
          set({ isOpen: true });
        },
        close: () => {
          set({ isOpen: false });
        },
      },
    })),
    { name: 'profileEditorModalStore' }
  )
);

// 사용하기 좋도록 별도 hook 으로 뽑기
export const useOpenProfileEditorModal = () => {
  const open = useProfileEditorModalStore(store => store.actions.open);
  return open;
};

// 전체 내보내기
export const useProfileEditor = () => {
  const store = useProfileEditorModalStore();
  return store;
};
```

### 3.2. Modal 컴포넌트 만들기

- `src/components/profile/ProfileEditorModal.tsx` 파일 생성

```tsx
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useSession } from '@/stores/session';

import { Loader } from 'lucide-react';
import FallBack from '../FallBack';
import defaultAvatar from '/public/assets/icons/default-avatar.jpg';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useProfileData from '@/hooks/queries/useProfileData';

export default function ProfileEditorModal() {
  const session = useSession();
  const {
    data: profile,
    error: fetchProfileError,
    isPending: isFetchingProfile,
  } = useProfileData(session?.user.id);

  return (
    <Dialog>
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
```

### 3.3. Modal 에 Store 적용하기

- `src/components/profile/ProfileEditorModal.tsx`

```tsx
//store  적용
const store = useProfileEditor();
const {
  isOpen,
  actions: { close, open },
} = store;
```

```tsx
<Dialog open={isOpen} onOpenChange={close} >
```

### 3.4. Modal 이라면 portal 입니다..

- `src/components/provider/ModalProvider.tsx` 배치

```tsx
'use client';
import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import PostEditorModal from '../modal/PostEditorModal';
import AleartModal from '../modal/AlertModal';
import ProfileEditorModal from '../profile/ProfileEditorModal';

export default function ModalProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {createPortal(
        <>
          <PostEditorModal />
          <AleartModal />
          <ProfileEditorModal />
        </>,
        document.getElementById('modal-root')!
      )}
      {children}
    </>
  );
}
```

### 3.5. 모달창 띄우기

- `src/components/profile/EditProfileButton.tsx` 수정

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { useOpenProfileEditorModal } from '@/stores/profileEditorModal';

export default function EditProfileButton() {
  const openProfileEditorModal = useOpenProfileEditorModal();
  return (
    <Button
      variant='secondary'
      className='cursor-pointer'
      onClick={openProfileEditorModal}
    >
      프로필 수정
    </Button>
  );
}
```

## 4. 프로필 업데이트

- `src/components/profile/ProfileEditorModal.tsx` 업데이트

### 4.1. state 와 avatar 이미지 파일 타입 정의

```tsx
// 아바타 이미지 타입정보 : 파일과 미리보기 주소
type ImageType = {
  file: File;
  previewUrl: string;
};
```

```tsx
// 사용자 아바타 이미지 파일 관리
const [avatarImage, setAvatarImage] = useState<ImageType | null>(null);
// 기타 정보
const [nickName, setNickName] = useState('');
const [bio, setBio] = useState('');
```

### 4.2. 프로필 이미지 기능 구현

```tsx
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
```

```tsx
 {/* 파일 이미지 Input 태그 */}
  <input
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
```

### 4.3. 닉네임과 자기소개 기능 구현

```tsx
  <div className='flex flex-col gap-2'>
  <div className='text-muted-foreground'>닉네임</div>
  <Input
    value={nickName}
    onChange={e => setNickName(e.target.value)}
  />
</div>

<div className='flex flex-col gap-2'>
  <div className='text-muted-foreground'>소개</div>
  <Input value={bio} onChange={e => setBio(e.target.value)} />
</div>
```

### 4.4. 초기값으로 최초 적용

```tsx
// 최초 상태값 적용하기
useEffect(() => {
  if (isOpen && profile) {
    setNickName(profile.nickname);
    setBio(profile.bio);
    setAvatarImage(null);
  }
}, [profile, isOpen]);
```

- 전체 코드

```tsx
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
                value={nickName}
                onChange={e => setNickName(e.target.value)}
              />
            </div>

            <div className='flex flex-col gap-2'>
              <div className='text-muted-foreground'>소개</div>
              <Input value={bio} onChange={e => setBio(e.target.value)} />
            </div>

            <Button className='cursor-pointer'>수정하기</Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

## 5. Supabase 연동하기

### 5.1. API 만들기

- `/src/apis/image.ts` 보완

```ts
// 특정 경로 밑에 있는 모든 이미지를 지우는 기능
export async function deleteImagesInPath(path: string) {
  const { data: files, error: fetchFilesError } = await supabase.storage
    .from(BUCKET_NAME)
    .list(path);

  // 안전하게 업데이트 처리함.
  if (!files || files.length === 0) {
    return;
  }

  if (fetchFilesError) throw fetchFilesError;

  const { error: removeError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(files.map(file => `${path}/${file.name}`));

  if (removeError) throw removeError;
}
```

- `/src/apis/profile.ts` 추가

```ts
// 3. 프로필 업데이트
export async function updateProfile({
  userId,
  nickname,
  bio,
  avatarImageFile,
}: {
  userId: string;
  nickname: string;
  bio?: string;
  avatarImageFile?: File;
}) {
  // 1. 기존 아바타 이미지 삭제
  if (avatarImageFile) {
    await deleteImagesInPath(`${userId}/avatar`);
  }

  // 업로드된 url 을 보관할 변수
  let newAvatarUrl: string | null = null;

  // 2. 새로운 아바타 이미지 업로드
  if (avatarImageFile) {
    // 확장자 알아내기
    const fileExtension = avatarImageFile.name.split('.').pop() || 'webp';
    // 업로드될 이름이 중복되면 안되므로
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;
    // 파일이 업로드 될 경로생성
    const filePath = `${userId}/avatar/${fileName}`;

    // 실제 파일 업로드
    newAvatarUrl = await uploadImage({
      file: avatarImageFile,
      filePath: filePath,
    });
  }

  // 3. 프로필 테이블 업데이트 작업
  const { data, error } = await supabase
    .from('profiles')
    .update({ nickname, bio, avatar_url: newAvatarUrl })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  return data;
}
```

### 5.2. Mutation 만듥

- `src/hooks/mutations/profile 폴더` 생성
- `src/hooks/mutations/profile/useUpdateProfile.ts 파일` 생성

- 1 단계

```ts
import { updateProfile } from '@/apis/profile';
import { UseMutationCallback } from '@/types/types';
import { useMutation } from '@tanstack/react-query';

export function useUpdateProfile(callback?: UseMutationCallback) {
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      if (callback?.onSuccess) callback.onSuccess();
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
```

- 2 단계

```tsx
import { updateProfile } from '@/apis/profile';
import { QUERY_KEYS } from '@/lib/constants';
import { ProfileEntity, UseMutationCallback } from '@/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateProfile(callback?: UseMutationCallback) {
  // 서버의 상태
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,

    // 결과값이 매개변수에 담겨짐
    onSuccess: updatedProfile => {
      if (callback?.onSuccess) callback.onSuccess();

      // 캐시를 업데이트 해줌 : 리랜더링
      queryClient.setQueryData<ProfileEntity>(
        QUERY_KEYS.profile.byId(updatedProfile.id),
        updatedProfile
      );
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
```

### 5.3. 활용하기

- `src/components/profile/ProfileEditorModal.tsx` 적용

```tsx
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
```

```tsx
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
```

- 전체 코드

```tsx
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
```

- 테스트 해보기

### 5.4. Next.js 의 Image URL 정책 설정하기

- `/next.config.ts` 추가하기

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '프로젝트아이디.supabase.co',
        // 아래는 생략이 가능합니다.
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
```

- 테스트 하기 (버그있음. 각 포스트의 아바타 이미지 변경 필요)

## 6.profiles 테이블에 RLS 설정

### 6.1. 셋팅

- supabase > Authentication > Policies 이동
- `Enable RLS` 버튼으로 활성화 시킴

### 6.2. RLS 설정

- `Anyone can select profile` > `SELECT`> `Default` > `true` > 저장
- `Users can create profile` > `INSERT`> `authenicated` > `(select auth.uid()) = id` > 저장
- `Users can update profile` > `UPDATE`> `authenicated` > `(select auth.uid()) = id` > `(select auth.uid()) = id` > 저장
- `Users can delete profile` > `DELETE`> `authenicated` > `(select auth.uid()) = id` > 저장

- 테스트 해보기
