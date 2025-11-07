# 캐시된 데이터 정규화

- 보관된 캐시 데이터에 중복된 데이터 제거
- 겹쳐진 캐시 데이터(배열 안에 객체 등)를 평탄화 처리

## 1. 현재 캐시된 데이터 확인해 보기

- 현재 캐시되어진 데이터는 중복으로 관리가 되고 있다.
- 메모리 공간이 낭비된다.
- 성능 최적화도 문제가 된다.
- 수정을 하면 현재 2개 캐시데이터가 수정됨

## 2. 캐시데이터 정규화로 관리하도록 수정 진행

- `src/hooks/todo/queries/useFetchTodos.ts` 업데이트

```ts
export function useFetchTodos() {
  return useQuery({
    queryKey: QUERY_KEYS.todo.list,
    // queryFn: fetchTodos,
    queryFn: async () => {
      // 함수 내부에서 정규화를 진행함.
      const todos = await fetchTodos();
      // console.log(todos);
      // todo 의 id 값만을 따로 모아서 배열로 캐시해 둔다
      return todos.map(item => item.id);
    },
  });
}
```

- 평탄화 작업

```ts
import { fetchTodos } from '@/apis/todo';
import { Todo } from '@/apis/todo-type';
import { QUERY_KEYS } from '@/lib/constants';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useFetchTodos() {
  // 전역에서 관리하는 상태
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: QUERY_KEYS.todo.list,
    // queryFn: fetchTodos,
    queryFn: async () => {
      // 함수 내부에서 정규화를 진행함.
      const todos = await fetchTodos();
      // console.log(todos);

      // 평탄화 작업
      todos.forEach(todo => {
        // 개별 캐시 데이터들까지 함께 보관하도록 설정
        queryClient.setQueryData<Todo>(
          QUERY_KEYS.todo.detail(todo.id.toString()),
          todo
        );
      });
      // todo 의 id 값만을 따로 모아서 배열로 캐시해 둔다
      return todos.map(item => item.id);
    },
  });
}
```

## 3. 출력해 보기

- `src/app/todo-list/page.tsx` 업데이트
- 이제는 ID 값만 props 로 전달한다.

```tsx
'use client';
import TodoEditor from '@/components/todo/TodoEditor';
import TodoItem from '@/components/todo/TodoItem';
import { useFetchTodos } from '@/hooks/todos/queries/useFetchTodos';

export default function TodoListPage() {
  const { data: todos, isLoading, error } = useFetchTodos();

  if (isLoading) return <div>로딩중 ...</div>;
  if (error) return <div>에러입니다: {error.message}</div>;
  if (!todos) return <div>데이터가 없습니다.</div>;

  return (
    <div className='flex flex-col gap-5 p-5'>
      <h1 className='text-2xl font-bold'>Todo List</h1>
      <TodoEditor />
      <div className='flex flex-col gap-2'>
        {todos.map(id => (
          <TodoItem key={id} id={id} />
        ))}
      </div>
    </div>
  );
}
```

### 3.1. 리패칭 여부 관리

- 'LIST'와 'DETAIL' 로 구분
- 'LIST' 일때
  - 아예 `리패칭 실행하지 않도록`
  - 계속 `fresh`상태 유지
- 'DETAIL' 일때
  - 아이템 하나를 선택하면
  - `리패칭 실행하도록`

### 3.2. 코드반영

- `src/hooks/todos/queries/useTodoDataById.ts` 업데이트
- 기존 호출 : `useTodoDataById (아이디)`
- 개선된 리패칭 하지않도록 호출 : `useTodoDataById (아이디, 'LIST')`
- 개선된 리패칭 하도록 호출 : `useTodoDataById (아이디, 'DETAIL')`
- 아래처럼 하려면 옵션중 `enabled` 를 활용하자.

```ts
import { fetchTodoById } from '@/apis/todo';
import { QUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';

export function useTodoDataById(id: number, type: 'LIST' | 'DETAIL') {
  return useQuery({
    queryKey: QUERY_KEYS.todo.detail(id.toString()),
    queryFn: () => fetchTodoById(id),
    // enabled 옵션은 true 이면 queryFn 진행
    // enabled 옵션은 false 이면  캐시를 리턴받고
    enabled: type === 'DETAIL',
  });
}
```

- `src/components/todo/TodoItem.tsx` 업데이트

```tsx
'use client';
import { useUpdateTodoMutation } from '@/hooks/todos/mutations/useUpdateTodoMutation';
import { useTodoDataById } from '@/hooks/todos/queries/useTodoDataById';
import Link from 'next/link';
import { Button } from '../ui/button';

export default function TodoItem({ id }: { id: number }) {
  // 개선된 코드 시작================================
  // 캐시된 데이터를 활용한다. ('List' 매개변수 추가)
  const { data: todo } = useTodoDataById(id, 'LIST');
  if (!todo) throw new Error('현재 Todo가 없어요');
  // 원하는 자료를 캐시로 부터 가져온다.
  const { completed, title } = todo;
  // 개선된 코드 종료================================

  // hook 활용하기
  const { mutate: updateTodo } = useUpdateTodoMutation();

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // console.log(e.target.checked);
    updateTodo({ id, completed: !completed });
  };

  const handleDeleteClick = () => {};

  return (
    <div className='flex items-center justify-between border p-2'>
      {/* 링크걸기 */}

      <div className='flex gap-5'>
        <input
          type={'checkbox'}
          checked={completed}
          onChange={handleCheckboxChange}
        />
        <Link href={`/todo-detail/${id}`}>{title}</Link>
      </div>

      <Button onClick={handleDeleteClick} variant={'destructive'}>
        삭제
      </Button>
    </div>
  );
}
```

- `src/components/todo/TodoDetail.tsx` 업데이트

```tsx
'use client';

import { useTodoDataById } from '@/hooks/todos/queries/useTodoDataById';

const TodoDetail = ({ id }: { id: number }) => {
  // 'DETAIL' 매개변수 : 리패칭 실행하도록
  const { data, isLoading, error } = useTodoDataById(id, 'DETAIL');

  if (isLoading) return <div>로딩중...</div>;
  if (error) return <div>에러입니다. {error.message}</div>;
  if (!data) return <div>자료가 없어요</div>;

  return <div>TodoDetail : {data.title}</div>;
};

export default TodoDetail;
```

## 4. 토글기능에도 적용하기

- `src/hooks/todos/mutations/useUpdateTodoMutation.ts` 업데이트

```ts
import { updateTodo } from '@/apis/todo';
import { QUERY_KEYS } from '@/lib/constants';
import { Todo } from '@/types/todo-type';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTodo,
    onMutate: async updatedTodo => {
      // 하나만 업데이트 하기
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.todo.detail(updatedTodo.id.toString()),
      });
      const prevTodo = queryClient.getQueryData<Todo>(
        QUERY_KEYS.todo.detail(updatedTodo.id.toString())
      );
      // 업데이트 된 데이터만 반영해줌
      queryClient.setQueryData<Todo>(
        QUERY_KEYS.todo.detail(updatedTodo.id.toString()),
        prevTodo => {
          if (!prevTodo) return;
          return { ...prevTodo, ...updatedTodo };
        }
      );

      return { prevTodo };
    },
    // 에러가 발생함
    onError: (error, valiable, context) => {
      if (context?.prevTodo) {
        queryClient.setQueryData<Todo>(
          QUERY_KEYS.todo.detail(context.prevTodo.id.toString()),
          context.prevTodo
        );
      }
      return { error };
    },
  });
}
```

