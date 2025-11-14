# 포스트 수정하기

- `/src/components/post/PostItem.tsx` 변경
- 수정 버튼 부분을 별도로 컴포넌트로 분리

```tsx
<div className='text-muted-foreground flex text-sm'>
  <EditPostItemButton />
  <Button className='cursor-pointer' variant={'ghost'}>
    삭제
  </Button>
</div>
```

- `/src/components/post/EditPostItemButton.tsx 파일` 생성

```tsx
import { Button } from '@/components/ui/button';

export default function EditPostItemButton() {
  return (
    <Button className='cursor-pointer' variant={'ghost'}>
      수정
    </Button>
  );
}
```

## 1. 수정기능 적용하기

### 1.1. 기본 에디터 모달의 문제점

- `ADD`, `EDIT` 구분필요

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { useOpenPostEditorModal } from '@/stores/postEditorModalStore';

export default function EditPostItemButton() {
  // modal 을 재활용함
  const openPostEditorModal = useOpenPostEditorModal();

  const handleClick = () => {
    // 추가인지, 편집인지 구분이 필요함.
    openPostEditorModal();
  };

  return (
    <Button onClick={handleClick} className='cursor-pointer' variant={'ghost'}>
      수정
    </Button>
  );
}
```

### 1.2. 매개변수로 편집인지, 추가인지 구분

- 필요로한 에디터 모달에 전달할 데이터 모양을 고려.

```tsx
const handleClick = () => {
  // 추가인지, 편집인지 구분이 필요함.
  openPostEditorModal({
    type: 'EDIT',
    postId: 100,
    content: '수정할 내용',
    imaeUrls: ['...'],
  });
};
```

### 1.3. 실제 데이터 Props 로 받아서 전달해 보자.

- `/src/components/post/PostItem.tsx` Props 전달

```tsx
<div className='text-muted-foreground flex text-sm'>
  <EditPostItemButton {...post} />

  <Button className='cursor-pointer' variant={'ghost'}>
    삭제
  </Button>
</div>
```

- `/src/components/post/EditPostItemButton.tsx` Props 활용

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { useOpenPostEditorModal } from '@/stores/postEditorModalStore';
import { PostEntity } from '@/types/types';

export default function EditPostItemButton(props: PostEntity) {
  // modal 을 재활용함
  const openPostEditorModal = useOpenPostEditorModal();

  const handleClick = () => {
    // 추가인지, 편집인지 구분이 필요함.
    openPostEditorModal({
      type: 'EDIT',
      postId: props.id,
      content: props.content,
      imaeUrls: props.image_urls,
    });
  };

  return (
    <Button onClick={handleClick} className='cursor-pointer' variant={'ghost'}>
      수정
    </Button>
  );
}
```

## 2. Store 변경하기

- `postEditorModalStore.ts` 업데이트

```ts
// 새 포스트 등록 타입
type CreateMode = {
  isOpen: true;
  type: 'CREATE';
};
// 포스트 편집 타입
type EditMode = {
  isOpen: true;
  type: 'EDIT';

  // 초기 설정값의 타입
  postId: number;
  content: string;
  imageUrls: string[] | null;
};

// 모달이 Open인 경우 타입
type OpenState = CreateMode | EditMode;

// 모달이 Close인 경우 타입
type CloseState = {
  isOpen: false;
};

type State = CloseState | OpenState;

const initialState = {
  isOpen: false,
} as State;
```

- create 변경

```ts
const usePostEditorStore = create(
  devtools(
    combine(initialState, set => ({
      actions: {
        openCreate: () => {
          set({ isOpen: true, type: 'CREATE' });
        },
        openEdit: (params: Omit<EditMode, 'isOpen' | 'type'>) => {
          // 코드 보시기 좋으시라고.
          set({ isOpen: true, type: 'EDIT', ...params });
        },
        close: () => {
          set({ isOpen: false });
        },
      },
    })),
    { name: 'PostEditorStore' }
  )
);
```

- 커스텀 훅 변경

```ts
// 오로지 store 의 acitons 의  open 만 가져감
// export const useOpenPostEditorModal = () => {
//   const open = usePostEditorStore(store => store.actions.open);
//   return open;
// };
export const useOpenCreatePostModal = () => {
  const openCreate = usePostEditorStore(store => store.actions.openCreate);
  return openCreate;
};
export const useOpenEditPostModal = () => {
  const openEdit = usePostEditorStore(store => store.actions.openEdit);
  return openEdit;
};
// 미리 store 전체 내보기니
export const usePostEdiotorModal = () => {
  // const {
  //   isOpen,
  //   actions: { open, close },
  // } = usePostEditorStore();
  // return { isOpen, open, close };
  const store = usePostEditorStore();
  return store as typeof store & State;
};
```

## 3. hook 변경 사항 적용하기

- `/src/components/posts/CreatePostButton.tsx` 변경

```tsx
// 함수 이름  변경
const openPostEditorModal = useOpenCreatePostModal();
```

- `/src/components/posts/EditPostButton.tsx` 변경

```tsx
// modal 을 재활용함
const openPostEditorModal = useOpenEditPostModal();

const handleClick = () => {
  // 추가인지, 편집인지 구분이 필요함.
  openPostEditorModal({
    postId: props.id,
    content: props.content,
    imageUrls: props.image_urls,
  });
};
```

## 4. 모달 변경사항 적용하기

- `/src/components/modal/PostEditorModal.tsx` 업데이트
- 추후 본인이 추가적인 기능을 업데이트 시 아래 코드에서 `postEditorModalStore` 를 검색해서 확인.

```tsx
'use client';
import { ImageIcon, XIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePostEdiotorModal } from '@/stores/postEditorModalStore';
import { useEffect, useRef, useState } from 'react';
import { useCreatePost } from '@/hooks/mutations/post/useCreatePost';
import { toast } from 'sonner';
import { Carousel, CarouselContent, CarouselItem } from '../ui/carousel';
import Image from 'next/image';
import { useSession } from '@/stores/session';
import { useOpenAlertModal } from '@/stores/alertModalStore';

type ImageFile = {
  file: File;
  previewUrl: string;
};

export default function PostEditorModal() {
  // 사용자 정보 받아오기
  const session = useSession();

  // 경고창
  const openAlertModal = useOpenAlertModal();

  // const { isOpen, close } = usePostEdiotorModal();
  const postEditorModalStore = usePostEdiotorModal();

  // 글등록 mutation 을 사용함.
  const { mutate: createPost, isPending: isCreatePostPending } = useCreatePost({
    onSuccess: () => {
      postEditorModalStore.actions.close();
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

  // 이미지 Input 태그 참조
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
    if (!postEditorModalStore.isOpen) {
      images.forEach(img => {
        URL.revokeObjectURL(img.previewUrl);
      });
      return;
    }
    if (postEditorModalStore.type === 'CREATE') {
      // 생성이므로 값을 비워둠
      setContent('');
      setImages([]);
    } else {
      // 수정모드에서는 내용이 나와야 합니다.
      setContent(postEditorModalStore.content);
      setImages([]);
    }

    textareaRef.current?.focus();
  }, [postEditorModalStore.isOpen]);

  const handleCloseModal = () => {
    if (content !== '' || images.length !== 0) {
      // 안내창을 띄워서 확인후 닫기 실행처리
      openAlertModal({
        title: '포스트 작성이 완료되지 않았습니다.',
        description: '화면에서 나가면 작성중이던 내용이 사라집니다.',
        onPositive: () => {
          postEditorModalStore.actions.close();
        },
        onNegative: () => {
          console.log('취소 확인');
        },
      });
      return;
    }
    postEditorModalStore.actions.close();
  };

  // 실제 포스트 등록하기
  const handleCreatePost = () => {
    if (content.trim() === '') return;
    // createPost(content);
    createPost({
      content: content,
      userId: session!.user.id,
      // 파일만 추출해 주기
      images: images.map(item => item.file),
    });
  };

  // 이미지들이 선택되었을 때 실행할 핸들러
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
    // 웹브라우저 캐시 메모리 지우기
    URL.revokeObjectURL(img.previewUrl);
  };

  return (
    <Dialog open={postEditorModalStore.isOpen} onOpenChange={handleCloseModal}>
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

        {/* 이미지 선택 Input 태그 숨김 */}
        <input
          onChange={handleSelectImages}
          ref={fileInputRef}
          type='file'
          accept='image/*'
          multiple
          className='hidden'
        />

        {/* 편집 모드일때 보여지는 부분 */}
        {postEditorModalStore.isOpen &&
          postEditorModalStore.type === 'EDIT' && (
            <Carousel>
              <CarouselContent>
                {postEditorModalStore.imageUrls?.map(url => (
                  <CarouselItem key={url} className='basis-2/5'>
                    <div className='relative w-full h-48'>
                      <Image
                        src={url}
                        alt='이미지 미리보기'
                        fill
                        unoptimized
                        className='rounded-sm object-cover'
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          )}

        {/* 포스트 생성시 활용 */}
        {images.length > 0 && (
          <Carousel>
            <CarouselContent>
              {images.map((img, index) => (
                <CarouselItem key={index} className='basis-2/5'>
                  <div className='relative w-full h-48'>
                    <Image
                      src={img.previewUrl}
                      alt='이미지 미리보기'
                      fill
                      unoptimized
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

        {/* 편집 상태에서는 이미지 추가 안함 */}
        {postEditorModalStore.isOpen &&
          postEditorModalStore.type === 'CREATE' && (
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant='outline'
              className='cursor-pointer'
            >
              <ImageIcon /> 이미지 추가
            </Button>
          )}

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

## 5. 수정 API 추가하기

- `src/apis/post.ts` 추가
- 기존의 API 재활용 가능함.
- 새글등록 > 포스트 등록 > 파일등록 > `포스트 업데이트` 기존에 이미 구현함

```ts
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
```

## 6. Update 용 hook 추가하기

- `src/hooks/mutations/post/useUpdatePost.ts` 파일 생성

```ts
import { updatePost } from '@/apis/post';
import { UseMutationCallback } from '@/types/types';
import { useMutation } from '@tanstack/react-query';

export function useUpdatePost(callback?: UseMutationCallback) {
  return useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      if (callback?.onSuccess) callback.onSuccess();
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
```

## 7. 적용

- `src/components/modal/PostEditorModal.tsx` 적용
- 1단계

```tsx
// 글 수정 mutation 을 사용함.
const { mutate: updatePost, isPending: isUpdatePending } = useUpdatePost({
  onSuccess: () => {
    postEditorModalStore.actions.close();
  },
  onError: error => {
    toast.error('포스트 수정에 실패하였습니다.', { position: 'top-center' });
  },
});
```

- 2단계

```ts
const handleSavePost = () => {
  if (content.trim() === '') return;
  if (!postEditorModalStore.isOpen) return;
  if (postEditorModalStore.type === 'CREATE') {
    // 새글 생성
    createPost({
      content: content,
      userId: session!.user.id,
      // 파일만 추출해 주기
      images: images.map(item => item.file),
    });
  } else {
    // 수정상태
    if (content === postEditorModalStore.content) return;
    updatePost({ id: postEditorModalStore.postId, content: content });
  }
};
```

- 3 단계

```tsx
<Button
  disabled={isCreatePostPending}
  onClick={handleSavePost}
  className='cursor-pointer'
>
  저장
</Button>
```

- 4 단계 : 로딩창 적용하기
- 새글 등록중이거나 수정중일때 처리가 필요함.

```tsx

```

- 테스트 하기

## 8. 전체 코드

```tsx
'use client';
import { ImageIcon, XIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePostEdiotorModal } from '@/stores/postEditorModalStore';
import { useEffect, useRef, useState } from 'react';
import { useCreatePost } from '@/hooks/mutations/post/useCreatePost';
import { toast } from 'sonner';
import { Carousel, CarouselContent, CarouselItem } from '../ui/carousel';
import Image from 'next/image';
import { useSession } from '@/stores/session';
import { useOpenAlertModal } from '@/stores/alertModalStore';
import { useUpdatePost } from '@/hooks/mutations/post/useUpdatePost';

type ImageFile = {
  file: File;
  previewUrl: string;
};

export default function PostEditorModal() {
  // 사용자 정보 받아오기
  const session = useSession();
  // 경고창
  const openAlertModal = useOpenAlertModal();
  const postEditorModalStore = usePostEdiotorModal();

  // 글등록 mutation 을 사용함.
  const { mutate: createPost, isPending: isCreatePostPending } = useCreatePost({
    onSuccess: () => {
      postEditorModalStore.actions.close();
    },
    onError: error => {
      toast.error('포스트 생성에 실패했습니다.', {
        position: 'top-center',
      });
    },
  });

  // 글수정 mutation 을 사용함.
  const { mutate: updatePost, isPending: isUpdatePostPending } = useUpdatePost({
    onSuccess: () => {
      postEditorModalStore.actions.close();
    },
    onError: error => {
      toast.error('포스트 수정에 실패했습니다.', {
        position: 'top-center',
      });
    },
  });

  // post 에 저장할 내용
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 이미지 Input 태그 참조
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
    if (!postEditorModalStore.isOpen) {
      images.forEach(img => {
        URL.revokeObjectURL(img.previewUrl);
      });
      return;
    }
    if (postEditorModalStore.type === 'CREATE') {
      // 생성이므로 값을 비워둠
      setContent('');
      setImages([]);
    } else {
      // 수정 모드에서는 내용이 나와야 합니다.
      setContent(postEditorModalStore.content);
      setImages([]);
    }

    textareaRef.current?.focus();
  }, [postEditorModalStore.isOpen]);

  const handleCloseModal = () => {
    if (content !== '' || images.length !== 0) {
      // 안내창을 띄워서 확인후 닫기 실행처리
      openAlertModal({
        title: '포스트 작성이 완료되지 않았습니다.',
        description: '화면에서 나가면 작성중이던 내용이 사라집니다.',
        onPositive: () => {
          postEditorModalStore.actions.close();
        },
        onNegative: () => {
          console.log('취소 확인');
        },
      });
      return;
    }
    postEditorModalStore.actions.close();
  };

  // 실제 포스트 등록 또는 편집 하기
  // 이름만 바꿈
  // const handleCreatePost = () => {

  const handleSavePost = () => {
    if (content.trim() === '') return;
    if (!postEditorModalStore.isOpen) return;

    if (postEditorModalStore.type === 'CREATE') {
      // 새글 생성
      createPost({
        content: content,
        userId: session!.user.id,
        // 파일만 추출해 주기
        images: images.map(item => item.file),
      });
    } else {
      // 수정 상태
      if (content === postEditorModalStore.content) return;
      updatePost({
        id: postEditorModalStore.postId,
        content: content,
      });
    }
  };

  // 이미지들이 선택되었을 때 실행할 핸들러
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
    // 웹브라우저 캐시 메모리 지우기
    URL.revokeObjectURL(img.previewUrl);
  };

  // 글 수정 또는 새글 작성시 로딩 처리
  const isPending = isCreatePostPending || isUpdatePostPending;

  return (
    <Dialog open={postEditorModalStore.isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className='max-h-[90vh]'>
        <DialogTitle>포스트 작성</DialogTitle>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          disabled={isPending}
          className='max-h-125 min-h-25 focus:outline-none'
          placeholder='새로운 글을 등록해주세요.'
        />

        {/* 이미지 선택 Input 태그 숨김 */}
        <input
          onChange={handleSelectImages}
          ref={fileInputRef}
          type='file'
          accept='image/*'
          multiple
          className='hidden'
        />

        {/* 편집모드일 때 보여지는 부분 */}
        {postEditorModalStore.isOpen &&
          postEditorModalStore.type === 'EDIT' && (
            <Carousel>
              <CarouselContent>
                {postEditorModalStore.imageUrls?.map(url => (
                  <CarouselItem key={url} className='basis-2/5'>
                    <div className='relative w-full h-48'>
                      <Image
                        src={url}
                        alt='이미지 미리보기'
                        fill
                        unoptimized
                        className='rounded-sm object-cover'
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          )}

        {/* 포스트 생성시 활용 */}
        {images.length > 0 && (
          <Carousel>
            <CarouselContent>
              {images.map((img, index) => (
                <CarouselItem key={index} className='basis-2/5'>
                  <div className='relative w-full h-48'>
                    <Image
                      src={img.previewUrl}
                      alt='이미지 미리보기'
                      fill
                      unoptimized
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

        {/* 편집 상태에서는 이미지 추가 안함 */}
        {postEditorModalStore.isOpen &&
          postEditorModalStore.type === 'CREATE' && (
            <Button
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
              variant='outline'
              className='cursor-pointer'
            >
              <ImageIcon /> 이미지 추가
            </Button>
          )}

        <Button
          disabled={isPending}
          onClick={handleSavePost}
          className='cursor-pointer'
        >
          저장
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```
