# Post 이미지 저장하기

## 1. Storage 생성

- `uploads` 저장소 생성
- Public bucket : `활성`
- Restrict file size : `5M`
- Restrict MIME types : `image/*`
- Create 버튼 클릭

## 2. Storage 권한설정

- SQL Editor 실행

```sql
-- 조회: 모든 사용자 (SNS 특성상 공개)
CREATE POLICY "Anyone can view uploads" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads');

-- 업로드: 자신의 폴더에만 업로드 가능
CREATE POLICY "Users can upload to own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 수정: 자신의 폴더 아래의 파일만 수정 가능
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 삭제: 자신의 폴더 아래의 파일만 삭제 가능
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

```

- Storage > 목록 > `uploads` > Policies 확인

## 3. 저장 및 Post 업데이트 하기

### 3.1. 버킷명 관리하기

- 관리를 편하게 하기위해서 저장소 이름 관리
- `/src/lib/constants.ts` 업데이트

```ts
// 버킷 이름 : Supabase Storage
export const BUCKET_NAME = 'uploads';
```

### 3.2. API 만들기 : 파일 업로드

- `/src/apis/image.ts 파일` 생성

```ts
import { BUCKET_NAME } from '@/lib/constants';
import supabase from '@/lib/supabase/client';

type ImageType = {
  filePath: string;
  file: File;
};

export async function uploadImage({ filePath, file }: ImageType) {
  // 파일을 업로드 함.
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (error) throw error;

  // 업로드된 파일의 URL 을 받아서 Post 에 이미지 목록(배열)에 저장
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  return publicUrl;
}
```

### 3.3. API 만들기 : 포스트 생성 관련

- 단계 : 포스트 등록 > `포스트의 ID` 알아냄 > 파일 업로드 > 파일의 URL > 포스트 업데이트
- 생성되는 구조: `/사용자 ID 폴더 / 포스트 ID 폴더 / 파일들...`
- `/src/apis/post.ts` 기능 추가

```ts
import supabase from '@/lib/supabase/client';
import { UpdatePostEntity } from '@/types/types';
import { uploadImage } from './image';

// 1. 글 등록
export async function createPost(content: string) {
  const { data, error } = await supabase
    .from('posts')
    .insert({ content })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 2. 이미지와 함께 글 등록
type PostImageType = {
  userId: string;
  content: string;
  images: File[];
};

export async function createPostWithImages({
  userId,
  content,
  images,
}: PostImageType) {
  // 단계 1. 포스트 생성
  const post = await createPost(content);
  // 단계 2. 이미지 파일들이 있는지 검사함
  if (images.length === 0) return post;

  // 단계 3. 이미지 파일들이 존재한다면
  try {
    // 파일을 업로드하는 것은 병렬로 진행함.
    // imageUrls : 업로드된 URL 목록들을 리턴 받음
    const imageUrls = await Promise.all(
      // images 파일 배열에서 하나씩 업로드를 병렬로 진행
      images.map(file => {
        // 1. 확장자를 추출함.
        const fileExtension = file.name.split('.').pop() || 'webp';
        // 2. 고유한 이름을 생성
        const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;
        // 3. 파일의 업로드할 경로를 만들어 냄
        const filePath = `${userId}/${post.id}/${fileName}`;
        // 4. 파일 업로드 함.
        return uploadImage({ filePath, file });
      })
    );

    // 단계 4. 포스트를 업데이트 해줌. (업로드된 이미지들의 URL 을 기록해줘야함.)
    // 별도의 함수로 추출
    const updatePosts = updatePost({ image_urls: imageUrls, id: post.id });
    return updatePosts;
  } catch (error) {
    // 에러가 발생하면 포스트를 삭제해야함.
    // 별도의 함수로 추출
    await deletePost(post.id);
    throw error;
  }
}

// 3. 이미지 여러개 등록 이후에 포스트 업데이트 함수
export async function updatePost(post: UpdatePostEntity & { id: number }) {
  const { data, error } = await supabase
    .from('posts')
    .update(post)
    .eq('id', post.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
// 4. 업로드 오류시 처리 함.
export async function deletePost(id: number) {
  const { data, error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // 삭제된 아이템
  return data;
}
```

### 3.4. Mutation 만들기

- `src/hooks/mutations/post/useCreatePost.ts` 변경

```ts
import { createPostWithImages } from '@/apis/post';
import { UseMutationCallback } from '@/types/types';
import { useMutation } from '@tanstack/react-query';

export function useCreatePost(callback?: UseMutationCallback) {
  return useMutation({
    // mutation 함수가 변경됨
    mutationFn: createPostWithImages,
    onSuccess: () => {
      if (callback?.onSuccess) callback.onSuccess();
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
```

### 3.5. 적용하기

- `src/components/modal/PostEditorModal.tsx` 적용

```tsx
'use client';
import { ImageIcon, XIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useCreatePost } from '@/hooks/post/useCreatePost';
import { usePostEditorModal } from '@/stores/postEditorModalStore';
import { Carousel, CarouselContent, CarouselItem } from '../ui/carousel';
import Image from 'next/image';
import { useSession } from '@/stores/session';

type ImageFile = {
  file: File;
  previewUrl: string;
};

export default function PostEditorModal() {
  // 사용자 정보 받아오기
  const session = useSession();

  const { isOpen, close } = usePostEditorModal();
  // 글등록 mutation 을 사용함.
  const { mutate: createPost, isPending: isCreatePostPending } = useCreatePost({
    onSuccess: () => {
      close();
    },
    onError: error => {
      toast.error('포스트 생성에 실패했습니다.', {
        position: 'top-center',
      });
    },
  });

  // post 에 저장할 내용
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 이미지 input 태그 참조
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 이미지 미리보기 내용들
  const [images, setImages] = useState<ImageFile[]>([]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // 자동포커스 및 내용 초기화
  useEffect(() => {
    if (!isOpen) return;
    textareaRef.current?.focus();
    setContent('');
    setImages([]);
  }, [isOpen]);

  const handleCloseModal = () => {
    close();
  };

  // 실제 포스트 등록하기
  const handleCreatePost = () => {
    if (content.trim() === '') return;
    // createPost(content);
    createPost({
      content: content,
      userId: session!.user.id,
      // 파일만 추출해주기
      images: images.map(item => item.file),
    });
  };

  // 이미지들이 선택되었을때 실행할 핸들러
  const handleSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // 객체로 부터 배열 만드는 Array.from
      const files = Array.from(e.target.files);
      files.forEach(file => {
        setImages(prev => [
          ...prev,
          { file, previewUrl: URL.createObjectURL(file) },
        ]);
      });
    }
    // 초기화 시킴
    e.target.value = '';
  };

  // 이미지가 제거될 때 실행될 핸들러
  const handleDeleteImage = (img: ImageFile) => {
    setImages(prevImg =>
      prevImg.filter(item => item.previewUrl != img.previewUrl)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className='max-h-[90vh]'>
        <DialogTitle>포스트 작성</DialogTitle>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          disabled={isCreatePostPending}
          className='max-h-125 min-h-25 focus:outline-none'
          placeholder='새로운 글을 등록해주세요.'
        />
        {/*  이미지 선택 input 태그 숨김 */}
        <input
          onChange={handleSelectImages}
          ref={fileInputRef}
          type='file'
          accept='image/*'
          multiple
          className='hidden'
        />
        {/*  이미지 미리보기 슬라이드 */}
        {images.length > 0 && (
          <Carousel>
            <CarouselContent>
              {images.map((img, index) => (
                <CarouselItem key={index} className='basis-2/5'>
                  <div className='relative w-full h-48'>
                    <Image
                      alt='이미지 미리보기'
                      fill
                      unoptimized
                      src={img.previewUrl}
                      className='rounded-sm object-cover'
                    />
                    {/* 삭제 아이콘 및 기능 추가 */}
                    <div
                      onClick={() => handleDeleteImage(img)}
                      className='absolute top-0 right-0 m-1 cursor-pointer rounded-full bg-black/30 p-1'
                    >
                      <XIcon className='w-4 h-4 text-white' />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}

        <Button
          onClick={() => fileInputRef.current?.click()}
          variant='outline'
          className='cursor-pointer'
        >
          <ImageIcon /> 이미지 추가
        </Button>
        <Button
          disabled={isCreatePostPending}
          onClick={handleCreatePost}
          className='cursor-pointer'
        >
          저장
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

- 테스트 해보기 : posts 테이블, uploads 저장소 확인

## 4. 작성 중 닫힘 방지

- `src/components/modal/PostEditorModal.tsx`

```tsx
const handleCloseModal = () => {
  close(); // 방지해 보자.
};
```

- 수정 시나리오

```tsx
const handleCloseModal = () => {
  if (content !== '' || images.length !== 0) {
    // 안내창을 띄워서 확인 후 닫기 실행 처리
  }
  close();
};
```

### 4.1 AlertModal 을 생성해서 처리해보자.

- `src/components/modal/AlertModal.tsx ` 파일 생성

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AleartModal() {
  return (
    <AlertDialog>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>헤더</AlertDialogTitle>
          <AlertDialogDescription>설명</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction>확인</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 4.2. Store 로 전역 상태 관리

- `src/stores/alertModalStore.ts` 파일 생성
- 단계 1

```ts
import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

const initialState = {};

const useAlertModalStore = create(
  devtools(
    combine(initialState, set => ({})),
    { name: 'AlertModalStore' }
  )
);
```

- 단계 2

```ts
import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

type CloseState = {
  isOpen: false;
};

type OpenState = {
  isOpen: true;
  title: string;
  description: string;
  onPositive?: () => void;
  onNegative?: () => void;
};

type State = CloseState | OpenState;
const initialState = {
  isOpen: false,
} as State;

const useAlertModalStore = create(
  devtools(
    combine(initialState, set => ({})),
    { name: 'AlertModalStore' }
  )
);
```

- 단계 3

```ts
import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

type CloseState = {
  isOpen: false;
};

type OpenState = {
  isOpen: true;
  title: string;
  description: string;
  onPositive?: () => void;
  onNegative?: () => void;
};

type State = CloseState | OpenState;
const initialState = {
  isOpen: false,
} as State;

const useAlertModalStore = create(
  devtools(
    combine(initialState, set => ({
      actions: {
        open: (params: Omit<OpenState, 'isOpen'>) => {
          set({ ...params, isOpen: true });
        },
        close: () => {
          set({ isOpen: false });
        },
      },
    })),
    { name: 'AlertModalStore' }
  )
);
```

### 4.3. `Omit<OpenState, 'isOpen'>`

- 문법적 설명

```ts
type OpenState = {
  isOpen: true;
  title: string;
  description: string;
  onPositive?: () => void;
  onNegative?: () => void;
};
```

- `Omit<OpenState, 'isOpen'>` 실행하면 생성되는 타입
- 아래처럼 `isOpen` 속성이 제거된다.

```ts
 {
  title: string;
  description: string;
  onPositive?: () => void;
  onNegative?: () => void;
};
```

- 활용

```ts
 {
  title:'정말 삭제하시겠습니까?';
  description: '삭제하면 내용이 모두 제거됩니다.';
  onPositive?: () => console.log('확인 클릭');
  onNegative?: () => console.log('취소 클릭');
};
```

### 4.4. 최종 코드

```ts
import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

type CloseState = {
  isOpen: false;
};

type OpenState = {
  isOpen: true;
  title: string;
  description: string;
  onPositive?: () => void;
  onNegative?: () => void;
};

type State = CloseState | OpenState;
const initialState = {
  isOpen: false,
} as State;

const useAlertModalStore = create(
  devtools(
    combine(initialState, set => ({
      actions: {
        open: (params: Omit<OpenState, 'isOpen'>) => {
          set({ ...params, isOpen: true });
        },
        close: () => {
          set({ isOpen: false });
        },
      },
    })),
    { name: 'AlertModalStore' }
  )
);

export const useOpenAlertModal = () => {
  const open = useAlertModalStore(store => store.actions.open);
  return open;
};

export const useAlertModal = () => {
  const store = useAlertModalStore();
  // 아래는 우리가 원하는 타입을 추가해서 리턴하기 위한 처리
  return store as typeof store & State;
};
```

### 4.5. Store 활용하기

- `src/components/modal/PostEditorModal.tsx`

```tsx
// 경고창
const openAlertModal = useOpenAlertModal();
```

```tsx
const handleCloseModal = () => {
  if (content !== '' || images.length !== 0) {
    // 안내창을 띄워서 확인 후 닫기 실행 처리
  }
  close();
};
```

- 적용하기

```tsx
const handleCloseModal = () => {
  if (content !== '' || images.length !== 0) {
    // 안내창을 띄워서 확인 후 닫기 실행 처리
    openAlertModal({
      title: '포스트 작성이 완료되지 않았습니다.',
      description: '화면에서 나가면 작성중이던 내용이 사라집니다.',
      onPositive: () => {
        close();
      },
      onNegative: () => {
        console.log('취소 확인');
      },
    });
    return;
  }
  close();
};
```

### 4.6. 컴포넌트 적용하기

- `src/components/modal/AlertModal.tsx` 적용

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAlertModal } from '@/stores/alertModalStore';

export default function AleartModal() {
  const store = useAlertModal();
  if (!store.isOpen) return null;

  const handleCancle = () => {
    if (store.onNegative) store.onNegative;
    store.actions.close();
  };

  const handleOk = () => {
    if (store.onPositive) store.onPositive;
    store.actions.close();
  };

  return (
    <AlertDialog>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{store.title}</AlertDialogTitle>
          <AlertDialogDescription>{store.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancle}>취소</AlertDialogCancel>
          <AlertDialogAction onClick={handleOk}>확인</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 4.7. 실제 화면에 출력시켜보기

- `src/components/providers/ModalProvider.tsx` 추가

```tsx
'use client';

import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import PostEditorModal from '../modal/PostEditorModal';
import AleartModal from '../modal/AlertModal';

export default function ModalProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {createPortal(
        <>
          <PostEditorModal />
          <AleartModal />
        </>,
        document.getElementById('modal-root')!
      )}
      {children}
    </>
  );
}
```

## 5. 이미지 캐시 지우기

- `src/components/modal/PostEditorModal.tsx`

```tsx
// 자동포커스 및 내용 초기화
useEffect(() => {
  if (!isOpen) return;

  //웹 브라우저의 캐시에 저장된 이미지 리셋
  images.forEach(img => {
    // 메모리 상에서 제거
    URL.revokeObjectURL(img.previewUrl);
  });

  textareaRef.current?.focus();
  setContent('');
  setImages([]);
}, [isOpen]);
```

```tsx
// 이미지가 제거될 때 실행될 핸들러
const handleDeleteImage = (img: ImageFile) => {
  setImages(prevImg =>
    prevImg.filter(item => item.previewUrl != img.previewUrl)
  );
  // 웹브라우저 캐시 메모리 지우기
  URL.revokeObjectURL(img.previewUrl);
};
```

## 6. Post 조회 기능

### 6.1. 목록 전용 컴포넌트

- `src/components/post/PostFeed.tsx` 파일 생성

```tsx
function PostFeed() {
  return <div>글목록</div>;
}

export default PostFeed;
```

- `src/app/(protected)/page.tsx`

```tsx
import { CreatePostButton } from '@/components/post/CreatePostButton';
import PostFeed from '@/components/post/PostFeed';

export default function Home() {
  return (
    <div className='flex flex-col gap-10'>
      <CreatePostButton />
      <PostFeed />
    </div>
  );
}
```

### 6.2. Post 목록 API 작성하기

- `src/apis/post.ts` 추가

```ts
// 5. 포스트 목록 조회
export async function fetchPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

## 7. 테이블의 외래키 설정하기

- Table > `posts`> Edit Table > Foreign keys
- Add foreign key relation 버튼 클릭
- Select a schema : `public`
- Select a table to reference to : `profiles`
- Select columns from public.profiles to reference to
- public.posts : `author_id`
- public.profiles : `id`
- Action if referenced row is updated : `Cascade`
- Action if referenced row is removedd : `Cascade`
- 저장 버튼 선택

### 7.1. 타입을 다시 생성해야함.

```bash
npx supabase login
npm run generate-types
```

## 8. 무한 스크롤

## 9. Post 편집

## 10. Post 삭제

## 11. 목록 갱신
