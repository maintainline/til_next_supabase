# 데이터캐싱 실습

## 1. 상세페이지

- http://localhost:3000/todo-detail/100 글
- `src/app/todo-deatil 폴더` 생성
- `src/app/todo-deatil/[id] 폴더` 생성
- `src/app/todo-deatil/[id]/page.tsx 파일` 생성

```tsx
type TodoDetailPage = {
  params: Promise<{ id: number }>;
};

export default async function TodoDetailPage({ params }: TodoDetailPage) {
  const { id } = await params;
  return <div>{id} : 상세페이지</div>;
}
```

## 2. 링크걸기

- `src/components/TodoItem.tsx` 업데이트

```tsx
'use client';
import Link from 'next/link';
import { Button } from '../ui/button';

export default function TodoItem({
  id,
  content,
}: {
  id: number;
  content: string;
}) {
  const handleDeleteClick = () => {};

  return (
    <div className='flex items-center justify-between border p-2'>
      {/* 링크걸기 */}
      <Link href={`/todo-detail/${id}`}>{content}</Link>
      <Button onClick={handleDeleteClick} variant={'destructive'}>
        삭제
      </Button>
    </div>
  );
}
```

## 3. API 만들기

- `src/apis/todo.ts` api 추가

```ts
// API 함수로 1개의 아이디를 전달받아서 상세 내용 불러들이기 기능
export async function fetchTodoById(id: number) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL_DEMO}/todos/${id}`
  );
  if (!response.ok) throw new Error('상세데이터가 없습니다.');
  const data: Todo = await response.json();
  return data;
}
```

## 4. query hook 만들기

- `src/hooks/todos/quires/useTodoDataById.ts 파일`생성

```ts
import { fetchTodoById } from '@/apis/todo';
import { useQuery } from '@tanstack/react-query';

export function useTodoDataById(id: number) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => fetchTodoById(id),
  });
}
```

## 5. 활용하기

- `src/components/todo/TodoDetail.tsx` 파일 생성

```tsx
'use client';

import { useTodoDataById } from '@/hooks/todos/queries/useTodoDataById';

type TodoDetailProps = {
  id: number;
};

const TodoDetail = ({ id }: TodoDetailProps) => {
  const { data, isLoading, error } = useTodoDataById(id);
  if (isLoading) return <div>로딩중</div>;
  if (error) return <div>에러입니다.{error.message}</div>;
  if (!data) return <div>자료가 없습니다.</div>;

  return <div>TodoDetail : {data.title}</div>;
};

export default TodoDetail;
```

- `src/app/todo-deatil/[id]/page.tsx 파일` 업데이트

```tsx
import TodoDetail from '@/components/todo/TodoDetail';

type TodoDetailPage = {
  params: Promise<{ id: number }>;
};

export default async function TodoDetailPage({ params }: TodoDetailPage) {
  const { id } = await params;

  return <TodoDetail id={id} />;
}
```

## 6. 데이터 캐싱 확인해보기

- Devtools 활용
- 처음에는 `Stale` 상태이다.
- 이유는 기본 `staleTime` 이 `0` 으로 글로벌 셋팅되어있다.
- 컴포넌트가 화면에 Mount 가 되면 `stale` 상태면 `Refetching` 으로 데이터 호출함.
- 웹브라우저의 WindowFocus 가 되면 `stale` 상태면 `Refetching` 으로 데이터 호출함.
- 네트워크가 끊겼다가 연결(Reconnect)되면 `stale` 상태면 `Refetching` 으로 데이터 호출함.
- 옵션으로 refetchInterval 를 초단위로 지정하면 `stale` 상태면 `Refetching` 으로 데이터 호출함.

### 6.1. 리패칭 끄기 옵션

```ts
export function useTodoDataById(id: number) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => fetchTodoById(id),
    // 1초마다 리패칭.
    // refetchInterval: 1000,
    refetchOnMount: false, //  마운트 시점에 리패칭 끄기
    refetchOnWindowFocus: false, // 윈도우 포커스 시점에 리패칭 끄기
    refetchOnReconnect: false, // 리커넥트 시점에 리패칭 끄기
    refetchInterval: false, // 인터벌 리패칭 끄기
  });
}
```

### 6.2. staleTime 옵션 이해하기

```ts
export function useTodoDataById(id: number) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => fetchTodoById(id),
    // 5초동안 fresh 유효기간
    staleTime: 5000,
  });
}
```

- stale 한 데이터의 역할은 일단 화면에 내용을 빠르게 출력을 해주는 역할
- 리패칭이 끝나면 새로운 데이터를 출력시켜줍니다.
- 일단 캐싱된 데이터를 사용해서 빠르게 화면을 랜더링하고
- 최신 데이터를 불러오는 리패칭 과정이 마무리 되면
- 그때 교체하는 방식입니다.

### 6.3. Refetching 4가지

- 전제 조건을 해당하는 캐시 데이터가 `stale` 상태라면
- Mount : 해당하는 캐시데이터를 사용하는 컴포넌트가 마운트 될때
- WindowFocus : 사용자가 현재 탭으로 돌아올때
- Reconnect : 인터넷 연결이 끊어졌다가 다시 연결될때
- Interval : 특정시간을 주기로

## 7. 데이터캐싱 inactive 와 deleted 상태

- 전제조건이 다른 화면에 있을 때
- 컴포넌트가 unMount 된 경우 진행됨.

### 7.1 inactive 상태

- 전제 조건이 다른 화면에 있을 때
- fresh 상태에서 inactive 상태 가능
- stale 상태에서 inactive 상태 가능
- gcTime 값이 안지나면 계속 inactive 상탠

### 7.2. deleted 상태

- 전제 조건이 다른 화면에 있을 때
- gcTime 값이 지나면 자동으로 deleted 시켜버린다.
- 메모리 공간 절약해 줌.

```ts
export function useTodoDataById(id: number) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => fetchTodoById(id),
    // 5초동안 fresh 유효기간
    staleTime: 5000,
    // 10초 동안 inactive 상태 지정
    gcTime: 10000,
  });
}
```

## 8. 모든 옵션은 글로벌, 개별 설정 가능

- 우선은 글로벌 적용되고, 개별 설정 적용됨.
- 추천하는 글로벌 셋팅
- `src/comoponents/providers/QueryProvider.tsx` 업데이트

```tsx
const [client, setClient] = useState(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 0,
          gcTime: 5 * 60 * 1000, // 5분
          refetchOnMount: true,
          refetchOnWindowFocus: true,
          refetchOnReconnect: false,
          refetchInterval: false,
        },
      },
    })
);
```
