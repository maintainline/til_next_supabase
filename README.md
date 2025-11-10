# Post

## 1. Post 추가하기 버튼

- `/src/components/post 폴더` 생성
- `/src/components/post/CreatePostButton.tsx 파일` 생성

```tsx
import { PlusCircle } from 'lucide-react';

export function CreatePostButton() {
  return (
    <div className='bg-muted text-muted-foreground cursor-pointer rounded-xl px-6 py-4'>
      <div className='flex items-center justify-between'>
        <div>새글을 등록하세요.</div>
        <PlusCircle className='h-5 w-5' />
      </div>
    </div>
  );
}
```

## 2. 페이지 추가하기

- `/src/app/(protected)/page.tsx` 추가

```tsx
import { CreatePostButton } from '@/components/post/CreatePostButton';

export default function Home() {
  return (
    <div className='flex flex-col gap-10'>
      <CreatePostButton />
    </div>
  );
}
```

## 3. 모달 만들기

- `/src/components/modal 폴더` 만들기
- `/src/components/modal/PostEditorModal.tsx` 만들기

```tsx
import { ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function PostEditorModal() {
  return (
    <Dialog>
      <DialogContent>
        <DialogTitle>포스트 작성</DialogTitle>
        <textarea />
        <Button>
          <ImageIcon /> 이미지 추가
        </Button>
        <Button>저장</Button>
      </DialogContent>
    </Dialog>
  );
}
```

## 4. 모달창 출력후 스타일 하기

- `/src/components/post/CreatePostButton.tsx`

```tsx
'use client';
import { PlusCircle } from 'lucide-react';
import PostEditorModal from '../modal/PostEditorModal';
import { useState } from 'react';

export function CreatePostButton() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className='bg-muted text-muted-foreground cursor-pointer rounded-xl px-6 py-4'
      >
        <div className='flex items-center justify-between'>
          <div>새글을 등록하세요.</div>
          <PlusCircle className='h-5 w-5' />
        </div>
      </div>

      <PostEditorModal isOpen={modalOpen} />
    </>
  );
}
```

- `/src/components/modal/PostEditorModal.tsx`

```tsx
import { ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function PostEditorModal({ isOpen }: { isOpen: boolean }) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className='max-h-[90vh]'>
        <DialogTitle>포스트 작성</DialogTitle>
        <textarea
          className='max-h-125 min-h-25 focus:outline-none'
          placeholder='새로운 글을 등록해주세요.'
        />
        <Button variant='outline' className='cursor-pointer'>
          <ImageIcon /> 이미지 추가
        </Button>
        <Button className='cursor-pointer'>저장</Button>
      </DialogContent>
    </Dialog>
  );
}
```

- 다시 원복시킴

```tsx
import { PlusCircle } from 'lucide-react';

export function CreatePostButton() {
  return (
    <div className='bg-muted text-muted-foreground cursor-pointer rounded-xl px-6 py-4'>
      <div className='flex items-center justify-between'>
        <div>새글을 등록하세요.</div>
        <PlusCircle className='h-5 w-5' />
      </div>
    </div>
  );
}
```

## 5. zustand로 modal 의 상태를 전역 관리하기

### 5.1 store 만들기

- `src/stores/postEditorModalStore.ts 파일` 생성

```ts
import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

const initialState = {
  isOpen: false,
};
// 단계가 중요함.
// 미들웨어와 겹침을 주의하자
// Store 는 state 와 action 이 있다.
const usePostEditorStore = create(
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
    { name: 'usePostEditorStore' }
  )
);

// 오로지 store 의 actions 의 open만 가져감
export const useOpenPostEditorModal = () => {
  const open = usePostEditorStore(store => store.actions.open);
  return open;
};

// 미리 store 전체 내보내기
export const usePostEditorModal = () => {
  const {
    isOpen,
    actions: { open, close },
  } = usePostEditorStore();
  return { isOpen, open, close };
};
```

### 5.2. PostEditorModal 컴포넌트 화면에 렌더링 하기

- 화면에 출력을 시키려면 누군가의 `자식 컴포넌트 (children)`여야 한다.
- `src/components/providers/ModalProvider.tsx` 파일 생성
- 여기에서 새로운 `createPortal` 문법을 살펴봄

```tsx
'use client';
import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import PostEditorModal from '../modal/PostEditorModal';

export default function ModalProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {createPortal(
        <PostEditorModal />,
        document.getElementById('modal-root')!
      )}
      {children}
    </>
  );
}
```

### 5.3. 새로운 div 태그 만들기

- `src/app/layout.tsx` 업데이트

```tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/components/providers/QueryProvider';
import Link from 'next/link';
import Image from 'next/image';
import { Sun } from 'lucide-react';
import ToastProvider from '@/components/providers/ToastProvider';
import SessionProvider from '@/components/providers/SessionProvider';
import ModalProvider from '@/components/providers/ModalProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

// 이미지 가져오기
const logo = '/assets/logo.png';
const defaultAvatar = '/assets/icons/default-avatar.jpg';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Portal 용 DIV */}
        <div id='modal-root' />

        <div className='flex min-h-[100vh] flex-col'>
          {/* 컴포넌트 배치 */}
          <ToastProvider />

          <QueryProvider>
            <SessionProvider>
              <ModalProvider>
                <header className='h-15 border-b'>
                  <div className='m-auto flex h-full w-full max-w-175 justify-between px-4'>
                    <Link href={'/'} className='flex items-center gap-2'>
                      <Image
                        src={logo}
                        alt='SNS 서비스 로고'
                        width={40}
                        height={40}
                      />
                      <div className='font-bold'>SNS 서비스</div>
                    </Link>

                    <div className='flex items-center gap-5'>
                      <div className='hover:bg-muted cursor-pointer rounded-full p-2'>
                        <Sun />
                      </div>
                      <Image
                        src={defaultAvatar}
                        alt='기본 아바타'
                        width={24}
                        height={24}
                        className='h-6'
                      />
                    </div>
                  </div>
                </header>
                <main className='m-auto w-full max-w-175 flex-1 border-x px-4 py-6'>
                  {children}
                </main>
                <footer className='text-muted-foreground border-t py-10 text-center'>
                  @z.seon.dev
                </footer>
              </ModalProvider>
            </SessionProvider>
          </QueryProvider>
        </div>
      </body>
    </html>
  );
}
```

## 6. zustand Modal 적용하기

- `src/components/post/CratePostButton.tsx`

```tsx
import { useOpenPostEditorModal } from '@/stores/postEditorModalStore';
import { PlusCircle } from 'lucide-react';

export function CreatePostButton() {
  const openPostEditorModal = useOpenPostEditorModal();
  return (
    <div
      onClick={openPostEditorModal}
      className='bg-muted text-muted-foreground cursor-pointer rounded-xl px-6 py-4'
    >
      <div className='flex items-center justify-between'>
        <div>새글을 등록하세요.</div>
        <PlusCircle className='h-5 w-5' />
      </div>
    </div>
  );
}
```

- `/src/components/modal/PostEditorModal.tsx` 업데이트

- 업데이트

```tsx
import { ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePostEditorModal } from '@/stores/postEditorModalStore';

export default function PostEditorModal() {
  const { isOpen, close } = usePostEditorModal();
  const handleCloseModal = () => {
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className='max-h-[90vh]'>
        <DialogTitle>포스트 작성</DialogTitle>
        <textarea
          className='max-h-125 min-h-25 focus:outline-none'
          placeholder='새로운 글을 등록해주세요.'
        />
        <Button variant='outline' className='cursor-pointer'>
          <ImageIcon /> 이미지 추가
        </Button>
        <Button className='cursor-pointer'>저장</Button>
      </DialogContent>
    </Dialog>
  );
}
```

## 7. 편의 기능 넣기

### 7.1. 자동으로 내용 높이 창 변경하기

```tsx
'use client';
import { ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePostEditorModal } from '@/stores/postEditorModalStore';
import { useEffect, useRef, useState } from 'react';

export default function PostEditorModal() {
  const { isOpen, close } = usePostEditorModal();
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleCloseModal = () => {
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className='max-h-[90vh]'>
        <DialogTitle>포스트 작성</DialogTitle>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          className='max-h-125 min-h-25 focus:outline-none'
          placeholder='새로운 글을 등록해주세요.'
        />
        <Button variant='outline' className='cursor-pointer'>
          <ImageIcon /> 이미지 추가
        </Button>
        <Button className='cursor-pointer'>저장</Button>
      </DialogContent>
    </Dialog>
  );
}
```

### 7.2. 자동 포커스 및 내용 초기화 넣기

```tsx
// 자동 포커스 및 초기화
useEffect(() => {
  if (!isOpen) return;
  textareaRef.current?.focus();
  // 내용 비우기
  setContent('');
}, [isOpen]);
```
