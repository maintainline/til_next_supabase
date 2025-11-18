# profile 기능 구현

## 1. 로그인 이후 이동하기

- `/src/app/(default)/signin/page.tsx`

```tsx
import { useSession } from '@/stores/session';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
```

```tsx
// 로그인 이후 이동
// 이미 로그인된 사용자는 홈으로 리다이렉트
const session = useSession();
useEffect(() => {
  if (session) {
    redirect('/');
  }
}, [session]);
```

## 2. Profile UI 구현하기

### 2.1. 프로필 페이지로 이동하기 링크

- 포스트의 `아바타 이미지` 클릭시 이동
- `src/components/post/PostItem.tsx` 링크 추가

```tsx
{
  /* 사용자 페이지 이동하기 */
}
<Link href={`/profile/${post.author.id}`}>
  <Image
    src={post.author.avatar_url || defaultAvatar}
    alt={`${post.author.nickname}의 프로필 이미지`}
    className='h-10 w-10 rounded-full object-cover'
    width={40}
    height={40}
  />
</Link>;
```

### 2.2. 프로필 페이지 UI 구성

- `src/app/(protected)/profile/[id]/page.tsx`

### 2.3. 유효하지 않은 프로필 페이지 처리하기

```tsx
import { redirect } from 'next/navigation';

interface ProfileDetailProps {
  params: {
    id: string;
  };
}

function ProfileDetail({ params }: ProfileDetailProps) {
  const { id } = params;
  // id 파라메터를 검증
  if (!id || id.trim() === '') {
    redirect('/');
  }

  return <div>{id} ProfileDetail</div>;
}

export default ProfileDetail;
```

### 2.4. 프로필 페이지 middleware.ts 에서 처리하기

- `src/middleware.ts` 업데이트
- `URI 를 처리하기 전`에 즉, `/src/app/ 으로 페이지 이동전에 중간에서 처리`한다.

- 1 단계

```ts
export const config = {
  matcher: ['/reset-password', '/', '/profile/:path*'],
};
```

- 2 단계

```ts
// profile 경로에서 유효하지 않은 id 처리
// /profile/ 또는 /profile/undefined 같은 경우 처리
if (pathname === '/profile' || pathname === '/profile/') {
  return NextResponse.redirect(new URL('/', request.url));
}

const profileMatch = pathname.match(/^\/profile\/(.+)$/);
if (profileMatch) {
  const profileId = profileMatch[1];
  // id가 없거나 빈 문자열이거나 'undefined' 문자열인 경우
  if (
    !profileId ||
    profileId.trim() === '' ||
    profileId === 'undefined' ||
    profileId === 'null'
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}
```

- 전체코드

```ts
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // 사용자가 어느 주소로 왔는가?
  const { pathname } = request.nextUrl;

  // profile 경로에서 유효하지 않은 id 처리
  // /profile/ 또는 /profile/undefined 같은 경우 처리
  if (pathname === '/profile' || pathname === '/profile/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const profileMatch = pathname.match(/^\/profile\/(.+)$/);
  if (profileMatch) {
    const profileId = profileMatch[1];
    // id가 없거나 빈 문자열이거나 'undefined' 문자열인 경우
    if (
      !profileId ||
      profileId.trim() === '' ||
      profileId === 'undefined' ||
      profileId === 'null'
    ) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // reset-password 경로 특별 처리
  if (pathname === '/reset-password') {
    const { supabase, response } = createClient(request);

    // 세션 확인
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // recovery 세션이 없으면 signin으로 리다이렉트
    if (!session) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    // recovery 세션이 있으면 통과
    return response;
  }

  // 루트 경로 접근 시 세션 체크
  if (pathname === '/') {
    const { supabase, response } = createClient(request);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // 세션이 없으면 signin으로 리다이렉트
    if (!session) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    // 세션이 있으면 통과
    return response;
  }

  // 다른 경로는 그대로 통과
  return NextResponse.next();
}

export const config = {
  matcher: ['/reset-password', '/', '/profile/:path*'],
};
```

### 2.5. 프로필 페이지 UI 작업 진행 - 사용자 프로필 컴포넌트

- `src/components/profile` 폴더 생성
- `src/components/profile/ProfileInfo.tsx` 파일 생성

```tsx
'use client';
import useProfileData from '@/hooks/queries/useProfileData';
import FallBack from '../FallBack';
import Loader from '../Loader';
import defaultAvatar from '/public/assets/icons/default-avatar.jpg';
import Image from 'next/image';

export default function ProfileInfo({ userId }: { userId: string }) {
  const {
    data: profile,
    error: fetchProfileError,
    isPending: isFetchingProfile,
  } = useProfileData(userId);
  if (fetchProfileError) return <FallBack />;
  if (isFetchingProfile) return <Loader />;
  return (
    <div className='flex flex-col items-center  justify-center gap-5'>
      <Image
        src={profile?.avatar_url || defaultAvatar}
        alt={`${profile?.nickname}의 프로필 이미지`}
        className='h-30 w-30 rounded-full object-cover'
        width={120}
        height={120}
      />
      <div className='flex flex-col items-center gap-2'>
        <div className='text-l font-bold'>{profile?.nickname}</div>
        <div className=' text-muted-foreground'>{profile?.bio}</div>
        <div className='text-muted-foreground'>{profile?.role}</div>
      </div>
    </div>
  );
}
```

### 2.6. 프로필 페이지 UI 작업 진행 - 사용자 프로필 정보 출력

- `src/app/(protected)/profile/[id]/page.tsx` : 컴포넌트 출력

```tsx
return (
  <div className='flex flex-col gap-10'>
    <ProfileInfo userId={id} />
    <div className='border-b' />
  </div>
);
```

- 전체코드

```tsx
import ProfileInfo from '@/components/profile/ProfileInfo';
import { redirect } from 'next/navigation';

interface ProfileDetailProps {
  params: {
    id: string;
  };
}

async function ProfileDetail({ params }: ProfileDetailProps) {
  const { id } = await params;
  // id 파라메터를 검증
  if (!id || id.trim() === '') {
    redirect('/');
  }

  return (
    <div className='flex flex-col gap-10'>
      <ProfileInfo userId={id} />
      <div className='border-b' />
    </div>
  );
}

export default ProfileDetail;
```

### 2.7. 프로필 페이지 UI 작업 진행 - 사용자 포스트 리스트 출력

- `src/app/(protected)/profile/[id]/page.tsx` : 컴포넌트 출력
- 전체코드

```tsx
import PostFeed from '@/components/post/PostFeed';
import ProfileInfo from '@/components/profile/ProfileInfo';
import { redirect } from 'next/navigation';

interface ProfileDetailProps {
  params: {
    id: string;
  };
}

async function ProfileDetail({ params }: ProfileDetailProps) {
  const { id } = await params;
  // id 파라메터를 검증
  if (!id || id.trim() === '') {
    redirect('/');
  }

  return (
    <div className='flex flex-col gap-10'>
      {/* 사용자 정보 출력 */}
      <ProfileInfo userId={id} />
      <div className='border-b' />
      {/* 사용자 포스트 리스트 출력 */}
      <PostFeed />
    </div>
  );
}

export default ProfileDetail;
```

### 2.8. 프로필 페이지 UI 작업 진행 - `특정 사용자 기준 포스트` 출력

- `src/components/post/PostFeed.tsx` 수정
- Props 추가 : `authorId?: string`

```tsx
export default function PostFeed({ authorId }: { authorId?: string }) {
  const { data, error, isPending, fetchNextPage, isFetchingNextPage } =
    useInfinitePostData(authorId);
```

- `src/hooks/queries/useInfinitePostData.ts` 수정

```ts
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { fetchPosts } from '@/apis/post';
import { useSession } from '@/stores/session';
const PAGE_SIZE = 5;

//  authorId?: string 포스트의 작성자 아이디 매개변수 전달
export function useInfinitePostData(authorId?: string) {
  const queryClient = useQueryClient();

  //  like 추가 적용 : 사용자 정보
  const session = useSession();

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.posts.list,

    queryFn: async ({ pageParam }) => {
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

- `src/apis/post.ts` 매개변수 변경

```ts
// 5. 포스트 목록 조회 :  likes 관련 내용도 추가
export async function fetchPosts({
  from,
  to,
  userId,
  authorId, // 추가됨
}: {
  from: number;
  to: number;
  userId: string;
  authorId?: string; // 추가됨
}) {
  // authorId 가 있으면 추가적으로   Query 추가
  // const { data, error } = await supabase
  const request = supabase
    .from('posts')
    .select('*, author: profiles!author_id(*), myLiked: likes!post_id(*)')
    .eq('myLiked.user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  // 추가됨.
  if (authorId) request.eq('author_id', authorId);
  // 추가됨. await 주의함
  const { data, error } = await request;

  if (error) throw error;
  return data.map(post => ({
    ...post,
    isLiked: post.myLiked && post.myLiked.length > 0,
  }));
}
```

- `src/app/(protected)/profile/[id]/page.tsx` : Props 전달하기

```tsx
import PostFeed from '@/components/post/PostFeed';
import ProfileInfo from '@/components/profile/ProfileInfo';
import { redirect } from 'next/navigation';

interface ProfileDetailProps {
  params: {
    id: string;
  };
}

async function ProfileDetail({ params }: ProfileDetailProps) {
  const { id } = await params;
  // id 파라메터를 검증
  if (!id || id.trim() === '') {
    redirect('/');
  }

  return (
    <div className='flex flex-col gap-10'>
      {/* 사용자 정보 출력 */}
      <ProfileInfo userId={id} />
      <div className='border-b' />
      {/* 사용자 포스트 리스트 출력 */}
      <PostFeed authorId={id} />
    </div>
  );
}

export default ProfileDetail;
```

### 2.9. `첫 화면에 목록 오류 개선`하기

- `src/lib/constants.ts` 쿼리키 추가

```ts
  // 포스트 useQuery 키 생성 및 관리
  posts: {
    all: ['posts'],
    list: ['posts', 'list'],
    byId: (postId: number) => ['posts', 'byId', postId],
    // 추가됨
    userList: (userId: string) => ['posts', 'userList', userId],
  },
```

- `src/hooks/queries/useInfinitePostData.ts` 업데이트

```ts
  // 보관하고 있는 캐시가 같이 업데이트
    // 구분해 주자.
    // queryKey: QUERY_KEYS.posts.list,

    queryKey: !authorId
      ? QUERY_KEYS.posts.list
      : QUERY_KEYS.posts.userList(authorId),
```

### 2.10. UI 개선

- 스크롤바 위치 개선
- `src/components/profile/ProfileInfo.tsx` 추가

```tsx
useEffect(() => {
  window.scrollTo({ top: 0 });
}, []);
```

## 3. 프로필 및 로그아웃 버튼 구현하기

- `src/app/layout.tsx`
- 수정전 코드

```tsx
<Image
  src={defaultAvatar}
  alt='기본 아바타'
  width={24}
  height={24}
  className='h-6'
/>
```

- 수정후

```tsx
<ProfileButton />
```

### 3.1. 컴포넌트로 추출하기

- `src/components/header 폴더` 생성
- `src/components/header/ProfileButton.tsx` 파일 생성

```tsx
import Image from 'next/image';
import defaultAvatar from '/public/assets/icons/default-avatar.jpg';

export default function ProfileButton() {
  return (
    <>
      <Image
        src={defaultAvatar}
        alt='기본 아바타'
        width={24}
        height={24}
        className='h-6'
      />
    </>
  );
}
```

### 3.2. 프로필 버튼 컴포넌트 업데이트

- `src/components/header/ProfileButton.tsx` 업데이트

```tsx
'use client';
import defaultAvatar from '/public/assets/icons/default-avatar.jpg';
import { useSession } from '@/stores/session';
import { PopoverClose } from '@radix-ui/react-popover';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Image from 'next/image';
import useProfileData from '@/hooks/queries/useProfileData';
import Link from 'next/link';

export default function ProfileButton() {
  const session = useSession();
  const { data: profile } = useProfileData(session?.user.id);
  if (!session) return null;
  return (
    <Popover>
      <PopoverTrigger>
        <Image
          src={profile?.avatar_url || defaultAvatar}
          alt='기본 아바타'
          width={24}
          height={24}
          className='h-6 w-6 rounded-full object-cover'
        />
      </PopoverTrigger>
      <PopoverContent className='flex w-40 flex-col p-0'>
        <PopoverClose asChild>
          <Link href={`/profile/${session.user.id}`}>
            <div className='hover:bg-muted cursor-pointer px-4 py-3 text-sm'>
              프로필
            </div>
          </Link>
        </PopoverClose>
        <PopoverClose asChild>
          <div className='hover:bg-muted cursor-pointer px-4 py-3 text-sm'>
            로그아웃
          </div>
        </PopoverClose>
      </PopoverContent>
    </Popover>
  );
}
```

### 3.3. 로그아웃 구현 하기

- `src/apis/auth.ts` 기능 추가

```ts
// 로그아웃
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    await supabase.auth.signOut({
      scope: 'local',
    });
  }
}
```

- `src/components/header/ProfileButton.tsx` 추가

```tsx
<div
  onClick={signOut}
  className='hover:bg-muted cursor-pointer px-4 py-3 text-sm'
>
  로그아웃
</div>
```

### 3.4. 로그아웃 성공시 화면 이동하기

- `src/components/provider/SessionProvider.tsx` 기능추가

```tsx
useEffect(() => {
  // 사용자가 로그인, 로그아웃을 하면 자동실행 이벤트 핸들러
  supabase.auth.onAuthStateChange((event, session) => {
    setSession(session);
    //로그아웃 진행시
    if (event === 'SIGNED_OUT') {
      redirect('/signin');
    }
  });
}, [session]);
```
