# 버그 개선

## 1. 프로필 수정 시 오류

### 1.1 사용자 아바타 이미지 변경 적용 오류

- `src/hooks/mutation/profile/useUpdateProfile.ts` 업데이트

```ts
import { updateProfile } from '@/apis/profile';
import { QUERY_KEYS } from '@/lib/constants';
import { Post, ProfileEntity, UseMutationCallback } from '@/types/types';
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
      // 추가로 postItem 의 avatar 이미지도 캐시변경 해야함.
      // 피드/디테일 게시글 캐시에 남아있는 작성자 정보도 동시에 갱신한다.
      queryClient
        .getQueryCache()
        .findAll({ queryKey: QUERY_KEYS.posts.all })
        .forEach(query => {
          if (query.queryKey[1] !== 'byId') return;
          const cachedPost = query.state.data as Post | undefined;
          if (!cachedPost || cachedPost.author.id !== updatedProfile.id) return;

          queryClient.setQueryData<Post>(query.queryKey, {
            ...cachedPost,
            author: {
              ...cachedPost.author,
              ...updatedProfile,
            },
          });
        });
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
```

### 1.2. 닉네임 또는 자기소개를 수정하고 적용시 `아바타 이미지 초기화`.

- `src/apis/profile.ts`

```ts
 // 3. 프로필 테이블 업데이트 작업
  // 텍스트 필드만 바뀔 때는 기존 avatar_url을 그대로 두기 위한 payload 구성.
  const payload: {
    nickname: string;
    bio?: string;
    avatar_url?: string | null;
  } = { nickname, bio };

  if (avatarImageFile) {
    //이미지가 새로 업로드된 경우에만 avatar_url을 덮어쓴다.
    payload.avatar_url = newAvatarUrl;
  }

  const { data, error } = await supabase
    .from('profiles')
    // .update({ nickname, bio, avatar_url: newAvatarUrl })
    .update(payload)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
```

## 2. 첫 로그인 직후에 리다이렉트 시 목록 오류

### 2.1 해결책

- `SessionPrvider` 가 `Mount` 되면 `supabase.auth.getSession()`을 활용 `즉시 현재 Session 을 담아준다.`
- 포스트쿼리 훅에서 `userId` 가 준비 될때 까지 호출을 지연시킴

### 2.2. 업데이트

- `src/components/providers/SessionProvider.tsx` 업데이트

```tsx
// SessionProvider 가 마운트시 즉시 세션을 동기화함.
useEffect(() => {
  // 이미 사용자가 로그인 해서 잘 사용하고 있다면
  // 아래는 호출할 필요가 없어요.
  let isMounted = true;

  const syncSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!isMounted) return;
    isMounted = false;
    setSession(session);
  };

  syncSession();

  // 사용자가 로그인, 로그아웃을 하면 자동실행 이벤트 핸들러
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    setSession(session);
    console.log('로그아웃 또는 로그인시의 상태 체크 : ', event);
    // 로그아웃 진행시에는
    if (event === 'SIGNED_OUT') {
      // redirect('/signin');
      router.push('/signin');
    }
  });

  // 클린업 함수
  return () => {
    isMounted = false;
    subscription.unsubscribe(); // 이벤트 감지 해제
  };
}, [session, router]);
```

- 전체코드

```tsx
'use client';
import useProfileData from '@/hooks/queries/useProfileData';
import supabase from '@/lib/supabase/client';
import { useSession, useSessionLoaded, useSetSession } from '@/stores/session';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { GlobalLoading } from '../GlobalLoading';

interface SessionProviderProps {
  children: React.ReactNode;
}
export default function SessionProvider({ children }: SessionProviderProps) {
  const router = useRouter();

  const session = useSession();
  const setSession = useSetSession();
  const isSessionLoaded = useSessionLoaded();
  const { data: profile, isLoading: isProfileLoading } = useProfileData(
    session?.user.id
  );

  // SessionProvider 가 마운트시 즉시 세션을 동기화함.
  useEffect(() => {
    // 이미 사용자가 로그인 해서 잘 사용하고 있다면
    // 아래는 호출할 필요가 없어요.
    let isMounted = true;

    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;
      isMounted = false;
      setSession(session);
    };

    syncSession();

    // 사용자가 로그인, 로그아웃을 하면 자동실행 이벤트 핸들러
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      console.log('로그아웃 또는 로그인시의 상태 체크 : ', event);
      // 로그아웃 진행시에는
      if (event === 'SIGNED_OUT') {
        // redirect('/signin');
        router.push('/signin');
      }
    });

    // 클린업 함수
    return () => {
      isMounted = false;
      subscription.unsubscribe(); // 이벤트 감지 해제
    };
  }, [session, router]);

  if (!isSessionLoaded) return <GlobalLoading />;
  if (isProfileLoading) return <GlobalLoading />;

  return <div>{children}</div>;
}
```

### 2.3. 업데이트

- `src/hooks/quieries/useInfinitePostData.ts`업데이트

```ts
// 세션이 준비 되었는지 파악한다.
const session = useSession();
const userId = session?.user.id;
```

```ts
enabled: Boolean(userId), // 사용자 아이디에 대한 유무
```

```ts
queryFn: async ({ pageParam }) => {
  if (!userId) throw new Error('사용자 정보가 없습니다.');
```

- 전체 코드

```ts
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { fetchPosts } from '@/apis/post';
import { useSession } from '@/stores/session';
const PAGE_SIZE = 5;

//  authorId?: string 포스트의 작성자 아이디 매개변수 전달
export function useInfinitePostData(authorId?: string) {
  const queryClient = useQueryClient();

  // 세션이 준비 되었는지 파악한다.
  const session = useSession();
  const userId = session?.user.id;

  return useInfiniteQuery({
    // queryKey: QUERY_KEYS.posts.list,
    queryKey: !authorId
      ? QUERY_KEYS.posts.list
      : QUERY_KEYS.posts.userList(authorId),

    enabled: Boolean(userId), // 사용자 아이디에 대한 유무

    queryFn: async ({ pageParam }) => {
      if (!userId) throw new Error('사용자 정보가 없습니다.');

      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // authorId 포스트 작성자의 아이디도 전달
      const posts = await fetchPosts({
        from,
        to,
        userId: session!.user.id,
        authorId,
      });

      posts.forEach(post => {
        queryClient.setQueryData(QUERY_KEYS.posts.byId(post.id), post);
      });

      return posts.map(post => post.id);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
    staleTime: Infinity,
  });
}
```

### 2.4. 업데이트

- `src/hooks/quieries/usePostByIdData.ts`업데이트

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
  // 사용자 검증
  const userId = session?.user.id;

  return useQuery({
    queryKey: QUERY_KEYS.posts.byId(postId),
    // like 기능 업데이트
    queryFn: () => fetchPostById({ postId: postId, userId: session!.user.id }),
    // 아래 업데이트
    enabled: type === 'FEED' ? false : Boolean(userId),
  });
}
```

