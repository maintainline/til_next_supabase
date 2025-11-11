# Post 등록하기 (글자)

## 1. 글등록 API 작성하기

- `src/apis/post.ts 파일` 생성

```ts
import supabase from '@/lib/supabase/client';

// 1. 글 등록
export async function createPost(content: string) {
  const { data, error } = await supabase.from('posts').insert({ content });
  if (error) throw error;
  return data;
}
```

## 2. hook 생성하기

- Mutation 들 정리하자..
- `src/hooks/auth 폴더` 생성 및 관련 파일 이동.
- `src/hooks/mutations/post 폴더`
- `src/hooks/mutations/post/useCreatePost.ts 파일` 생성

```ts
import { createPost } from '@/apis/post';
import { UseMutationCallback } from '@/types/types';
import { useMutation } from '@tanstack/react-query';

export function useCreatePost(callback?: UseMutationCallback) {
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      if (callback?.onSuccess) callback.onSuccess();
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
```

## 3. 적용하기

- `src/components/modal/PostEditorModal.tsx` 적용
- 단계 1. mutation 활용

```tsx
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
```

- 단계 2.

```tsx
// 실제 포스트 등록하기
const handleCreatePost = () => {
  if (content.trim() === '') return;
  createPost(content);
};
```

- 단계 3.

```tsx
'use client';
import { ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePostEdiotorModal } from '@/stores/postEditorModalStore';
import { useEffect, useRef, useState } from 'react';
import { useCreatePost } from '@/hooks/mutations/post/useCreatePost';
import { toast } from 'sonner';

export default function PostEditorModal() {
  const { isOpen, close } = usePostEdiotorModal();
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
  }, [isOpen]);

  const handleCloseModal = () => {
    close();
  };

  // 실제 포스트 등록하기
  const handleCreatePost = () => {
    if (content.trim() === '') return;
    createPost(content);
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
        <Button variant='outline' className='cursor-pointer'>
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
