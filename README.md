# like 기능 구현

## 1. like 기능에 대한 고민

- 현재 `like`는 `like 횟수` 만큼 `select` 하고 + 1 또는 -1 을 해준다.
- 여러명이 동시에 `like` 를 호출했을 때 `update` 에 숫자 오류 발생 가능
- 아주 흔하게 발생하는 이슈.
- 통칭 `동시성 이슈` 라고 칭함.
- `업데이트 이전까지는 다른 사용자가 접근 처리를 제어`해야 함.

## 2. 해결책

- `select 요청`이 보내질때 `update 가 진행중인지를 조회 후 행을 잠금`
- 리액트에서는 행을 잠글 수 없다.
- 데이터베이스의 잠금 기능 및 업데이트를 제어하려면 DB 명령어로 실행 필요
- Supabase 에서는 RPC 를 제공함.
- `RPC` : Remote Procedure Call (원격으로 데이터베이스의 명령 실행)
- React : React Query 에서 `낙관적 업데이트` 로 진행

## 3. like UI 구성

- `src/components/post/PostItem.tsx`
- 아래 버튼을 별도의 컴포넌트로 추출

```tsx
{
  /* 3-1. 좋아요 버튼 */
}
<div className='hover:bg-muted flex cursor-pointer items-center gap-2 rounded-xl border-1 p-2 px-4 text-sm'>
  <HeartIcon className='h-4 w-4' />
  <span>0</span>
</div>;
```

### 3.1. 버튼 컴포넌트 만들기

- `src/components/post/LikeButtion.tsx 파일` 생성

```tsx
import { HeartIcon } from 'lucide-react';

export default function LikeButton() {
  return (
    <>
      <div className='hover:bg-muted flex cursor-pointer items-center gap-2 rounded-xl border-1 p-2 px-4 text-sm'>
        <HeartIcon className='h-4 w-4' />
        <span>0</span>
      </div>
    </>
  );
}
```

### 3.2. 필요로 한 props 전달하기

```tsx
import { HeartIcon } from 'lucide-react';

export default function LikeButton({
  id,
  likeCount,
}: {
  id: number;
  likeCount: number;
}) {
  return (
    <>
      <div className='hover:bg-muted flex cursor-pointer items-center gap-2 rounded-xl border-1 p-2 px-4 text-sm'>
        <HeartIcon className='h-4 w-4' />
        <span>{likeCount}</span>
      </div>
    </>
  );
}
```

- `src/components/post/PostItem.tsx`

```tsx
{
  /* 3-1. 좋아요 버튼 */
}
<LikeButton id={post.id} likeCount={post.like_count} />;
```

## 4. Supabase `likes 테이블` 생성

### 4.1. `likes` 테이블생성

- 칼럼 추가 : `post_id`, `int8`, `Null`, Not Null
- 칼럼 추가 : `user_id`, `uuid`, `auth.uid`, Not Null

### 4.2. `FK`

- `public` > `posts` > `post_id` > `id` > `Cascade` > `Cascade` > Save

## 5. `RPC` 생성 신청하기

- 데이터 베이스에 직접 명령어를 실행하는 형식

### 5.1. SQL Editor

```sql
-- 원래 함수가 있다면 삭제
DROP FUNCTION IF EXISTS toggle_post_like(bigint, uuid);

-- RPC로 호출할, 새로운 함수 생성
CREATE OR REPLACE FUNCTION toggle_post_like(p_post_id BIGINT, p_user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
BEGIN
  -- 포스트 존재 확인 & 행 잠금
  IF NOT EXISTS (
    SELECT 1 FROM posts
    WHERE id = p_post_id
    FOR UPDATE
  ) THEN
    RAISE EXCEPTION '존재하지 않는 게시글입니다' USING ERRCODE = 'P0001';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "likes"
    WHERE post_id = p_post_id AND user_id = p_user_id
  ) THEN
    -- 좋아요 기록 추가
    INSERT INTO "likes" (post_id, user_id)
    VALUES (p_post_id, p_user_id);

    -- 좋아요 카운트 증가
    UPDATE posts
    SET like_count = like_count + 1
    WHERE id = p_post_id;

    -- TRUE 반환
    RETURN TRUE;
  ELSE
    -- 좋아요 기록 삭제
    DELETE FROM "likes"
    WHERE post_id = p_post_id AND user_id = p_user_id;

    -- 좋아요 카운트 감소
    UPDATE posts
    SET like_count = like_count - 1
    WHERE id = p_post_id;

    -- FALSE 반환
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### 5.2. 등록 확인

- `Database` > `Functions` > `toggle_post_like` 항목확인

## 6. 테이블의 타입 추출

```bash
npx supabase login
npm run generate-types
```

### 6.1. 생성된 타입에서 내용확인하기

- Function 확인 : `toggle_post_like`

### 6.2. 타입을 편리하게 활용

- `src/types/types.ts` 추가

```ts
// 좋아요 기능
export type LikeEntity = Database['public']['Tables']['likes']['Row'];
export type InsertLikeEntity = Database['public']['Tables']['likes']['Insert'];
export type UpdateLikeEntity = Database['public']['Tables']['likes']['Update'];
export type LikeTableEntity = Database['public']['Tables']['likes'];
```

## 7. API 구현하기

- `src/apis/post.ts` 추가

```ts
// 7. 좋아요 토글 :RPC 활용
export async function togglePostLike({
  postId,
  userId,
}: {
  postId: number;
  userId: string;
}) {
  const { data, error } = await supabase.rpc('toggle_post_like', {
    p_post_id: postId,
    p_user_id: userId,
  });
  if (error) throw error;
  return data;
}
```

## 8. Mutation 구현하기

- `src/hooks/mutations/post/useToggleLike.ts 파일` 생성

```ts
import { useMutation } from '@tanstack/react-query';
import { togglePostLike } from '@/apis/post';
import { UseMutationCallback } from '@/types/types';

export function useTogglePostLike(callback?: UseMutationCallback) {
  return useMutation({
    mutationFn: togglePostLike,
    onSuccess: () => {
      if (callback?.onSuccess) callback.onSuccess();
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
```

## 9. 활용하기

- `src/components/post/LikeButton.tsx` 업데이트

```tsx
import { useTogglePostLike } from '@/hooks/mutations/post/useToggleLike';
import { useSession } from '@/stores/session';
import { HeartIcon } from 'lucide-react';

export default function LikeButton({
  id,
  likeCount,
}: {
  id: number;
  likeCount: number;
}) {
  const session = useSession();

  const { mutate: togglePostLike } = useTogglePostLike();

  const handleLikeClick = () => {
    togglePostLike({
      postId: id,
      userId: session!.user.id,
    });
  };

  return (
    <>
      <div
        onClick={handleLikeClick}
        className='hover:bg-muted flex cursor-pointer items-center gap-2 rounded-xl border-1 p-2 px-4 text-sm'
      >
        <HeartIcon className='h-4 w-4' />
        <span>{likeCount}</span>
      </div>
    </>
  );
}
```

## 10. 목록에 likes 상태 표시하기

### 10.1. API 업데이트 하기

- `src/apis/post.ts` 업데이트

```ts
// 5. 포스트 목록 조회 : like 관련내용도 가져옴
export async function fetchPosts({
  from,
  to,
  userId,
}: {
  from: number;
  to: number;
  userId: string;
}) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, author: profiles!author_id(*), myLiked: likes!post_id(*)')
    .eq('myLiked.user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return data.map(post => ({
    ...post,
    isLiked: post.myLiked && post.myLiked.length > 0,
  }));
}
```

```ts
// 6. 포스트 하나 조회
export async function fetchPostById({
  postId,
  userId,
}: {
  postId: number;
  userId: string;
}) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, author: profiles!author_id(*), myLiked: likes!post_id(*)')
    .eq('myLiked.user_id', userId)
    .eq('id', postId)
    .single();
  if (error) throw error;
  return {
    ...data,
    isLiked: data.myLiked && data.myLiked.length > 0,
  };
}
```

### 10.2 타입에서 post 에 Like 의 타입도 포함한 형태로 업데이트

- `src/types/types.ts` 업데이트

```ts
// 포스트와 프로필 타입 조합
export type Post = PostEntity & { author: ProfileEntity; isLiked: boolean };
```

### 10.3. 호출 수정

- `/src/hooks/queries/useInfinitePostData.ts`

```ts
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { fetchPosts } from '@/apis/post';
import { useSession } from '@/stores/session';
const PAGE_SIZE = 5;

export function useInfinitePostData() {
  // 1. 쿼리클라이언트 불러오기
  const queryClient = useQueryClient();

  //  like 추가 적용 : 사용자 정보
  const session = useSession();

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.posts.list,

    queryFn: async ({ pageParam }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      //  like 추가 적용 : 사용자 정보
      const posts = await fetchPosts({ from, to, userId: session!.user.id });

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

- `src/hooks/queries/usePostByIdData.ts` 업데이트

```ts
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { fetchPostById } from '@/apis/post';
import { useSession } from '@/stores/session';

// 매겨변수의 순서가 중요하므로
export function usePostByIdData({
  postId,
  type,
}: {
  postId: number;
  type: 'FEED' | 'DETAIL';
}) {
  const session = useSession();

  return useQuery({
    queryKey: QUERY_KEYS.posts.byId(postId),
    // like 기능 업데이트
    queryFn: () => fetchPostById({ postId: postId, userId: session!.user.id }),
    enabled: type === 'FEED' ? false : true,
  });
}
```

## 11. 아이콘에 색칠하기

- `src/components/post/PostItem.tsx` 업데이트

```tsx
<LikeButton id={post.id} likeCount={post.like_count} isLiked={post.isLiked} />
```

- `src/components/post/LikeButton.tsx` 업데이트

```tsx
import { useTogglePostLike } from '@/hooks/mutations/post/useToggleLike';
import { useSession } from '@/stores/session';
import { HeartIcon } from 'lucide-react';

export default function LikeButton({
  id,
  likeCount,
  isLiked,
}: {
  id: number;
  likeCount: number;
  isLiked: boolean;
}) {
  const session = useSession();

  const { mutate: togglePostLike } = useTogglePostLike();

  const handleLikeClick = () => {
    togglePostLike({
      postId: id,
      userId: session!.user.id,
    });
  };

  return (
    <>
      <div
        onClick={handleLikeClick}
        className='hover:bg-muted flex cursor-pointer items-center gap-2 rounded-xl border-1 p-2 px-4 text-sm'
      >
        <HeartIcon
          className={`h-4 w-4 ${isLiked ? 'fill-foreground border-foreground' : ''}`}
        />
        <span>{likeCount}</span>
      </div>
    </>
  );
}
```

## 12. 낙관적 업데이트

- `미리 사용자의 예상을 적용` 후 사후 처리 진행
- 명령을 실행할 때 미리 캐시를 업데이트 해 준다.
- `onMutate` 에 핸들러에 미리 적용함.
- `src/hooks/mutations/post/useToggleLike.ts`

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { togglePostLike } from '@/apis/post';
import { Post, UseMutationCallback } from '@/types/types';
import { QUERY_KEYS } from '@/lib/constants';

export function useTogglePostLike(callback?: UseMutationCallback) {
  // 캐시의 모든 것이 관리 되는 구조
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: togglePostLike,
    // onMutate 에서는 mutate 함수의 매개변수를 받을 수 있다.
    onMutate: async ({ postId }) => {
      // 캐시를 업데이트해서 렌더링 시켜줌.
      // 쿼리를 가져오기 중지 : key 값을 이용함
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.posts.byId(postId),
      });
      // 이전에 값을 보관해줌. 오류 시 복원의 용도로 활용
      const prevPost = queryClient.getQueryData<Post>(
        QUERY_KEYS.posts.byId(postId)
      );
      // 우선 캐시를 마치 원하는 결과가 반영된 것처럼 캐시를 업데이트 한다.
      queryClient.setQueryData<Post>(QUERY_KEYS.posts.byId(postId), post => {
        if (!post) throw new Error(`해당하는 포스트가 존재하지 않습니다.`);
        return {
          ...post,
          isLiked: !post.isLiked,
          like_count: post.isLiked ? post.like_count - 1 : post.like_count + 1,
        };
      });
      // 이전 데이터 복원용
      return { prevPost };
    },

    onSuccess: () => {
      if (callback?.onSuccess) callback.onSuccess();
    },
    onError: (error, _, context) => {
      // 타입 좁히기로 잘 접근해줌
      if (context && context?.prevPost) {
        queryClient.setQueryData<Post>(
          QUERY_KEYS.posts.byId(context.prevPost.id),
          context.prevPost
        );
      }
      if (callback?.onError) callback.onError(error);
    },
  });
}
```

## 13. RLS 적용하기

- supabase > tables > likes
- Authentication > Policies > Enable RLS 버튼 > 확인
- Authentication > Policies > Create policy 버튼 > 확인
- `Users can select own like` > `SELECT` > `authenticated` > `(select auth.uid()) = user_id` > Save Policy 버튼
- `Users can insert own like` > `INSERT` > `authenticated` > `(select auth.uid()) = user_id` > Save Policy 버튼
- `Users can update own like` > `UPDATE` > `authenticated` > `(select auth.uid()) = user_id`> `(select auth.uid()) = user_id` > Save Policy 버튼
- `Users can delete own like` > `DELETE` > `authenticated` > `(select auth.uid()) = user_id` > Save Policy 버튼
