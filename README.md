# cache 설정하기

- `/src/hooks/queries/useInfinitePostData.ts`

```ts
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { fetchPosts } from '@/apis/post';
const PAGE_SIZE = 5;

export function useInfinitePostData() {
  // 1. 쿼리클라이언트 불러오기
  const queryClient = useQueryClient();

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.posts.list,

    queryFn: async ({ pageParam }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const posts = await fetchPosts({ from, to });

      //2. 캐시 저장
      posts.forEach(post => {
        queryClient.setQueryData(QUERY_KEYS.posts.byId(post.id), post);
      });

      //3. 리턴
      //return posts;
      return posts.map(post => post.id);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
  });
}
```

## 1. chche 사용하기

- `/src/components/post/PostFeed.tsx` 수정

```tsx
{
  data?.pages.map(page =>
    page.map(postId => <PostItem key={postId} postId={postId} />)
  );
}
```

## 2. 출력하기 : Id 전달받은 거 활용 출력.

### 2.1. API 만들기

- `/src/apis/post.ts` 업데이트

```ts
// 6. 포스트 하나 조회
export async function fetchPostById(postId: number) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, author: profiles!author_id(*)')
    .eq('id', postId)
    .single();
  if (error) throw error;
  return data;
}
```

### 2.2. 훅 만들기

- `/src/hooks/queries/usePostByIdData.ts 파일` 생성

```ts
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { fetchPostById } from '@/apis/post';

// 매겨변수의 순서가 중요하므로
export function usePostByIdData({
  postId,
  type,
}: {
  postId: number;
  type: 'FEED' | 'DETAIL';
}) {
  return useQuery({
    queryKey: QUERY_KEYS.posts.byId(postId),
    queryFn: () => fetchPostById(postId),
    enabled: type === 'FEED' ? false : true,
  });
}
```

### 2.3. 활용하기

- `/src/components/post/PostItem.tsx` 수정

```tsx
// 실제 쿼리로 id 를 전달해서 post를 가져오자.
const {
  data: post,
  isPending,
  error,
} = usePostByIdData({ postId, type: 'FEED' });

if (isPending) return <Loader />;
if (error) return <FallBack />;
```

### 2.4. 전체 코드

```tsx
'use client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { formatTimeAgo } from '@/lib/time';
import type { Post } from '@/types/types';
import { HeartIcon, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import DeletePostButton from './DeletePostButton';
import EditPostItemButton from './EditPostItemButton';
import defaultAvatar from '/public/assets/icons/default-avatar.jpg';
import { useSession } from '@/stores/session';
import { usePostByIdData } from '@/hooks/queries/usePostByIdData';
import Loader from '../Loader';
import FallBack from '../FallBack';

export default function PostItem({ postId }: { postId: number }) {
  // 내가 만든 post 인지 확인
  const session = useSession();
  const userId = session?.user.id;
  // 실제 쿼리로 id 를 전달해서 post를 가져오자.
  const {
    data: post,
    isPending,
    error,
  } = usePostByIdData({ postId, type: 'FEED' });

  if (isPending) return <Loader />;
  if (error) return <FallBack />;

  const isMine = userId === post.author.id;

  return (
    <div className='flex flex-col gap-4 border-b pb-8'>
      {/* 1. 유저 정보, 수정/삭제 버튼 */}
      <div className='flex justify-between'>
        {/* 1-1. 유저 정보 */}
        <div className='flex items-start gap-4'>
          <Image
            src={post.author.avatar_url || defaultAvatar}
            alt={`${post.author.nickname}의 프로필 이미지`}
            className='h-10 w-10 rounded-full object-cover'
            width={40}
            height={40}
          />
          <div>
            <div className='font-bold hover:underline'>
              {post.author.nickname}
            </div>
            <div className='text-muted-foreground text-sm'>
              {formatTimeAgo(post.created_at)}
              {/* {new Date(post.created_at).toLocaleString()} */}
            </div>
          </div>
        </div>

        {/* 1-2. 수정/삭제 버튼 */}
        <div className='text-muted-foreground flex text-sm'>
          {isMine && (
            <>
              <EditPostItemButton {...post} />
              <DeletePostButton id={post.id} />
            </>
          )}
        </div>
      </div>

      {/* 2. 컨텐츠, 이미지 캐러셀 */}
      <div className='flex cursor-pointer flex-col gap-5'>
        {/* 2-1. 컨텐츠 */}
        <div className='line-clamp-2 break-words whitespace-pre-wrap'>
          {post.content}
        </div>

        {/* 2-2. 이미지 캐러셀 */}
        <Carousel>
          <CarouselContent>
            {post.image_urls?.map((url, index) => (
              <CarouselItem className={`basis-3/5`} key={index}>
                <div className='overflow-hidden rounded-xl'>
                  <img
                    src={url}
                    className='h-full max-h-[350px] w-full object-cover'
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* 3. 좋아요, 댓글 버튼 */}
      <div className='flex gap-2'>
        {/* 3-1. 좋아요 버튼 */}
        <div className='hover:bg-muted flex cursor-pointer items-center gap-2 rounded-xl border-1 p-2 px-4 text-sm'>
          <HeartIcon className='h-4 w-4' />
          <span>0</span>
        </div>

        {/* 3-2. 댓글 버튼 */}
        <div className='hover:bg-muted flex cursor-pointer items-center gap-2 rounded-xl border-1 p-2 px-4 text-sm'>
          <MessageCircle className='h-4 w-4' />
          <span>댓글 달기</span>
        </div>
      </div>
    </div>
  );
}
```

## 3. 업데이트

### 3.1. 무한루프 캐시 관리

```ts
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { fetchPosts } from '@/apis/post';
const PAGE_SIZE = 5;

export function useInfinitePostData() {
  // 1. 쿼리클라이언트 불러오기
  const queryClient = useQueryClient();

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.posts.list,

    queryFn: async ({ pageParam }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const posts = await fetchPosts({ from, to });

      //2. 캐시 저장
      posts.forEach(post => {
        queryClient.setQueryData(QUERY_KEYS.posts.byId(post.id), post);
      });

      //3. 리턴
      //return posts;
      return posts.map(post => post.id);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
    //옵션들 : stale 상태로 안감
    staleTime: Infinity,
  });
}
```

### 3.2. 새글 등록시 캐시 관리

- `/src/hooks/mutations/post/useCreatePost.ts`

```ts
import { createPostWithImages } from '@/apis/post';
import { QUERY_KEYS } from '@/lib/constants';
import { UseMutationCallback } from '@/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreatePost(callback?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPostWithImages,
    onSuccess: () => {
      if (callback?.onSuccess) callback.onSuccess();
      // 1. 캐시 아예 초기화
      queryClient.resetQueries({ queryKey: QUERY_KEYS.posts.list });
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
```

- `/src/hooks/mutations/post/useUpdatePost.ts`

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePost } from '@/apis/post';
import { QUERY_KEYS } from '@/lib/constants';
import type { Post, UseMutationCallback } from '@/types/types';

export function useUpdatePost(callback?: UseMutationCallback) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePost,
    onSuccess: updatedPost => {
      if (callback?.onSuccess) callback.onSuccess();
      // 현재 업데이트 된 캐시 데이터만 업데이트해주면된다.
      queryClient.setQueryData<Post>(
        QUERY_KEYS.posts.byId(updatedPost.id),
        prevPost => {
          if (!prevPost)
            throw new Error(
              `${updatedPost.id} 에 해당하는 포스트를 캐시 데이터에서 찾을 수 없습니다.`
            );
          return {
            ...prevPost,
            ...updatedPost,
          };
        }
      );
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
```

- `/src/hooks/mutations/post/useDeletePost.ts`

```ts
import { deleteImagesInPath } from '@/apis/image';
import { deletePost } from '@/apis/post';
import { QUERY_KEYS } from '@/lib/constants';
import { UseMutationCallback } from '@/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeletePost(callback?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: async deletedPost => {
      if (callback?.onSuccess) callback.onSuccess();

      if (deletedPost.image_urls && deletedPost.image_urls.length > 0) {
        await deleteImagesInPath(`${deletedPost.author_id}/${deletedPost.id}`);
      }

      // 무한 스크롤 때문에 이렇게 리셋을 한 것이다.
      // 여러개를 불러들일 수도 있기 때문에
      queryClient.resetQueries({ queryKey: QUERY_KEYS.posts.list });
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
```
