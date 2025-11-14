# 포스트 삭제하기

- `/src/components/post/DeletePostButton.tsx` 생성

```tsx
import { Button } from '@/components/ui/button';
import { useOpenAlertModal } from '@/stores/alertModalStore';

export default function DeletePostButton() {
  const openAlertModal = useOpenAlertModal();

  const handleDeleteClick = () => {
    openAlertModal({
      title: '게시글 삭제',
      description: '삭제된 포스트는 되돌릴 수 없습니다. 정말 삭제하시겠습니까?',
      onPositive: () => {
        // 포스트 삭제 요청
      },
    });
  };
  return (
    <Button
      className='cursor-pointer'
      variant={'ghost'}
      onClick={handleDeleteClick}
    >
      삭제
    </Button>
  );
}
```

- `/src/components/post/PostItem.tsx` 수정

```tsx
<div className='text-muted-foreground flex text-sm'>
  <EditPostItemButton {...post} />
  <DeletePostButton />
</div>
```

## 1. API 생성하기

- `src/apis/post.ts` 재활용

```ts
// 4. 업로드 오류시 처리 함. (재활용)
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

## 2. hook 생성하기

-`/src/hooks/mutation/post/useDeletePost.ts` 파일 생성

```ts
import { deletePost } from '@/apis/post';
import { UseMutationCallback } from '@/types/types';
import { useMutation } from '@tanstack/react-query';

export function useDeletePost(callback?: UseMutationCallback) {
  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      if (callback?.onSuccess) callback.onSuccess();
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
```

## 3. 활용하기

- `/src/components/post/DeletePostButton.tsx`

```tsx
import { Button } from '@/components/ui/button';
import { useDeletePost } from '@/hooks/mutations/post/useDeletePost';
import { useOpenAlertModal } from '@/stores/alertModalStore';
import { toast } from 'sonner';

export default function DeletePostButton() {
  const openAlertModal = useOpenAlertModal();

  const { mutate: deletePost, isPending: isDeletePostPending } = useDeletePost({
    onError: error => {
      toast.error('포스트 삭제에 실패하였습니다.', {
        position: 'top-center',
      });
    },
  });

  const handleDeleteClick = () => {
    openAlertModal({
      title: '게시글 삭제',
      description: '삭제된 포스트는 되돌릴 수 없습니다. 정말 삭제하시겠습니까?',
      onPositive: () => {
        // 포스트 삭제 요청
      },
    });
  };
  return (
    <Button
      className='cursor-pointer'
      variant={'ghost'}
      onClick={handleDeleteClick}
    >
      삭제
    </Button>
  );
}
```

### 3.1. PostItem 에서 props 로 삭제할 ID 를 전달함.

```tsx
<DeletePostButton id={post.id} />
```

### 3.2. Mutation 실행 및 pending 처리.

- props 로 값 전달 실행

```tsx
import { Button } from '@/components/ui/button';
import { useDeletePost } from '@/hooks/mutations/post/useDeletePost';
import { useOpenAlertModal } from '@/stores/alertModalStore';
import { toast } from 'sonner';

export default function DeletePostButton({ id }: { id: number }) {
  const openAlertModal = useOpenAlertModal();

  const { mutate: deletePost, isPending: isDeletePostPending } = useDeletePost({
    onError: error => {
      toast.error('포스트 삭제에 실패하였습니다.', {
        position: 'top-center',
      });
    },
  });

  const handleDeleteClick = () => {
    openAlertModal({
      title: '게시글 삭제',
      description: '삭제된 포스트는 되돌릴 수 없습니다. 정말 삭제하시겠습니까?',
      onPositive: () => {
        // 포스트 삭제 요청
        deletePost(id);
      },
    });
  };
  return (
    <Button
      disabled={isDeletePostPending}
      className='cursor-pointer'
      variant={'ghost'}
      onClick={handleDeleteClick}
    >
      삭제
    </Button>
  );
}
```

## 4. 이미지 삭제하기

- 포스트 글을 지우면, 이미지들도 모두 지워주어야 함

### 4.1. API 추가

- `src/apis/image.ts` 업데이트

```ts
// 특정 경로 밑에 있는 모든 이미지를 지우는 기능
export async function deleteImagesInPath(path: string) {
  const { data: files, error: fetchFilesError } = await supabase.storage
    .from(BUCKET_NAME)
    .list(path);

  if (fetchFilesError) throw fetchFilesError;

  const { error: removeError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(files.map(file => `${path}/${file.name}`));

  if (removeError) throw removeError;
}
```

### 4.2. Mutation 업데이트

- `/src/hooks/mutations/hooks/useDeletePost.ts` 업데이트

```ts
import { deleteImagesInPath } from '@/apis/image';
import { deletePost } from '@/apis/post';
import { UseMutationCallback } from '@/types/types';
import { useMutation } from '@tanstack/react-query';

export function useDeletePost(callback?: UseMutationCallback) {
  return useMutation({
    mutationFn: deletePost,

    // mutationFN 의 리턴값을 활용
    onSuccess: async deletedPost => {
      if (callback?.onSuccess) callback.onSuccess();

      if (deletedPost.image_urls && deletedPost.image_urls.length > 0) {
        await deleteImagesInPath(`${deletedPost.author_id}/${deletedPost.id}`);
      }
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
```

## 5. 내 포스트만 지우기 버튼 출력

```tsx
// 내가 만든 post 인지 확인
const session = useSession();
const userId = session?.user.id;
const isMine = userId === post.author.id;
```

```tsx
<div className='text-muted-foreground flex text-sm'>
  {isMine && (
    <>
      <EditPostItemButton {...post} />
      <DeletePostButton id={post.id} />
    </>
  )}
</div>
```
