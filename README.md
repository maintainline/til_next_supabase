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
