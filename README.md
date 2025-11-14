# 무한스크롤 구현하기

## 1. 시나리오

- 스크롤 바가 최하단에 오면 추가 데이터 로드 및 출력
- 무한 스크롤 하단 감지 기능
- 데이터 추가 기능

## 2. 무한 스크롤 하단 감지

- 스크롤이 화면의 최 하단에 닿았을 때 감지하는 기능.
- 최하단을 알 수 있는 div 태그를 하나 추가해서 처리한다.
- 웹브라우저 API 중에 `IntersectionObserver` 를 활용함.

### 2.1. IntersectionObserver

- 특정 태그(div) 즉, DOM 요소가 화면에 나타남을 감지하는 브라우저 API
- 이벤트 발생시 이벤트 핸들러로 처리가능

### 2.2. DOM 요소 추가하기

- `/src/components/post/PostFeed.tsx` 업데이트

```tsx
'use client';
import { usePostsData } from '@/hooks/queries/usePostsData';
import FallBack from '../FallBack';
import Loader from '../Loader';
import PostItem from './PostItem';

export default function PostFeed() {
  const { data, error, isPending } = usePostsData();
  if (error) return <FallBack />;
  if (isPending) return <Loader />;
  return (
    <div className='flex flex-col gap-10'>
      {data?.map(post => (
        <PostItem key={post.id} {...post} />
      ))}
      {/* 웹브라우저 하단 감지용 DOM 요소를 추가 */}
      <div></div>
    </div>
  );
}
```

### 2.3. 무한스크롤 npm 설치하기

```bash
npm i react-intersection-observer
```

### 2.4. useRef 로 참조 적용하기

- DOM 요소가 화면에 나오면 IntersectionObserver 가 관측하도록 설정함.
- `inView: true` : 화면에 나옴
- `inView: false` : 화면에 보여지지 않음.

```tsx
'use client';
import { usePostsData } from '@/hooks/queries/usePostsData';
import FallBack from '../FallBack';
import Loader from '../Loader';
import PostItem from './PostItem';

// intersectionObjser
import { useInView } from 'react-intersection-observer';

export default function PostFeed() {
  const { data, error, isPending } = usePostsData();

  // intersectionObserver 레퍼런스
  const { ref, inView } = useInView();

  if (error) return <FallBack />;
  if (isPending) return <Loader />;
  return (
    <div className='flex flex-col gap-10'>
      {data?.map(post => (
        <PostItem key={post.id} {...post} />
      ))}
      {/* 웹브라우저 하단 감지용 DOM 요소를 추가 */}
      <div ref={ref}></div>
    </div>
  );
}
```

### 2.5. 데이터 로드 체크 하기

```tsx
// 데이터 추가 관리
useEffect(() => {
  console.log('inView', inView);
  // 데이터를 추가함
}, [inView]);
```

## 3. 새로운 데이터 호출 및 최하단에 배치하기

- `useQuery` 외에도 `useInfiniteQuery` 가 존재함.
- 무한 스크롤 전용 훅

### 3.1. Hook 만들기

- `src/hooks/queries/useInfinitePostData.ts 파일` 생성

```ts
import { fetchPosts } from '@/apis/post';
import { QUERY_KEYS } from '@/lib/constants';
import { useInfiniteQuery } from '@tanstack/react-query';

// 하나의 페이지마다 불러들일 개수
const PAGE_SIZE = 5;

export function useInfinitePostData() {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.posts.list,
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE;
      const posts = await fetchPosts({ from, to });
      return posts;
    },
    initialPageParam: 0,
    // 다음페이지 번호 계산용 함수
    getNextPageParam: (lastPage, allPages) => {
      // 마지막 페이지라면
      if (lastPage.length < PAGE_SIZE) return undefined;
      // 첫페이지 즉, initialPageParam 가 0 으로 출발
      // 다음페이지는 allPage.length 가 됩니다.
      // 첫페이지 0 출력후 1로 증가
      //두번째 페이지 1 출력후 2로 증가
      return allPages.length;
    },
  });
}
```

### 3.2. API 변경함

- `src/apis/post.ts` 변경
- range : 일부분만 가져오도록 추가함.

```ts
// 5. 포스트 목록 조회
export async function fetchPosts({ from, to }: { from: number; to: number }) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, author: profiles!author_id(*)')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return data;
}
```

## 4. 활용하기

- `src/components/post/PostFeed.ts` 수정

### 4.1. 데이터 불러와서 출력함.

```ts
'use client';
import FallBack from '../FallBack';
import Loader from '../Loader';
import PostItem from './PostItem';

// intersectionObjser
import { useInfinitePostData } from '@/hooks/queries/useInfinitePostData';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export default function PostFeed() {
  // 무한루프 API 호출 (fetchNextPage 추가)
  const { data, error, isPending, fetchNextPage } = useInfinitePostData();
  // intersectionObserver 레퍼런스
  const { ref, inView } = useInView();
  // 데이터 추가 관리
  useEffect(() => {
    console.log('inView', inView);
    // 데이터를 추가함(fetchNextPage 호출)
    fetchNextPage();
  }, [inView]);

  if (error) return <FallBack />;
  if (isPending) return <Loader />;
  return (
    <div className='flex flex-col gap-10'>
      {/* useinfinite 는 리턴으로 페이지별로 배열로 묶어서 전달함*/}
      {/* map 을 2번 반복함. */}
      {data.pages?.map(page =>
        page.map(post => <PostItem key={post.id} {...post} />)
      )}
      {/* 웹브라우저 하단 감지용 DOM 요소를 추가 */}
      <div ref={ref}></div>
    </div>
  );
}
```

### 4.2. 데이터 추가시 로딩창 출력함

- `isFetchingNextPage` 를 활용하여 로딩창 처리함.

```tsx
'use client';
import FallBack from '../FallBack';
import Loader from '../Loader';
import PostItem from './PostItem';

// intersectionObjser
import { useInfinitePostData } from '@/hooks/queries/useInfinitePostData';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export default function PostFeed() {
  // 무한루프 API 호출 (fetchNextPage 추가)
  const { data, error, isPending, fetchNextPage, isFetchingNextPage } =
    useInfinitePostData();
  // intersectionObserver 레퍼런스
  const { ref, inView } = useInView();
  // 데이터 추가 관리
  useEffect(() => {
    console.log('inView', inView);
    // 데이터를 추가함(fetchNextPage 호출)
    fetchNextPage();
  }, [inView]);

  if (error) return <FallBack />;
  if (isPending) return <Loader />;
  return (
    <div className='flex flex-col gap-10'>
      {/* useinfinite 는 리턴으로 페이지별로 배열로 묶어서 전달함*/}
      {/* map 을 2번 반복함. */}
      {data.pages?.map(page =>
        page.map(post => <PostItem key={post.id} {...post} />)
      )}
      {isFetchingNextPage && <Loader />}
      {/* 웹브라우저 하단 감지용 DOM 요소를 추가 */}
      <div ref={ref}></div>
    </div>
  );
}
```
