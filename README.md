# 캐싱 데이터 무효화하기

- 데이터 보관하고 있는 캐시된 데이터를 특정 시점에 무효화가 가능해야함.
- 특정 시점 : `데이터를 추가하거나 수정하는 경우`
- Mutation 이 진행되는 시점에 onSuccess 된 경우에 필요함.
- onSuccess 이벤트 핸들러에서 캐시 데이터를 수정하고 즉시 렌더링 하도록 구성

## 1. Mutation 을 위한 API

- `/src/apis/todo.ts` 업데이트

```ts
// 새로운 할일 등록 API
export async function createTodo(title: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL_DEMO}/todos`,
    {
      method: 'POST',
      body: JSON.stringify({ title }),
    }
  );
  if (!response.ok) throw new Error('Failed to create todo');
  const data: Todo = await response.json();
  return data;
}
```

## 2. hooks 만들기

- `src/hooks/todos/mutations 폴더` 생성
- `src/hooks/todos/mutations/useCreateMutation.ts 파일` 생성

```ts
import { createTodo } from '@/apis/todo';
import { useMutation } from '@tanstack/react-query';

export default function useCreateMutation() {
  return useMutation({
    mutationFn: createTodo,
    onError: error => {
      console.log(error);
    },
    onSuccess: () => {
      // 새로운데이터가 들어왓으니 처음부터 다시 테이터 리셋
      window.location.reload();
    },
  });
}
```

## 3. 효율적인 캐시된 데이터 무효화하기

- `window.loaction.reload()`효율적이지 않은 방안

### 3.1. queryClient 를 활용해서 데이터 무효화 하기

```ts
import { createTodo } from '@/apis/todo';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function useCreateMutation() {
  //1. 전역으로 생성해둔 React Query 의 상태관리를 활용한다.
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onError: error => {
      console.log(error);
    },
    onSuccess: () => {
      // 새로운데이터가 들어왓으니 처음부터 다시 테이터 리셋
      //   window.location.reload();

      // 아래 코드는 데이터를 무효화 시켜서 리패칭을 실행한다.
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
```

### 3.2. 쿼리의 키를 자동으로 관리해 주는 방식을 도입하자.

- 쿼리키를 여러 곳에서 작성하면 문제 (오타, 잘못된 키 등)가 발생할 소지가 높다.
- `쿼리키 팩토링 방식` 을 실무에서는 선호함.
- 쿼리키를 상수화 시켜서 재활용하는 것을 말함.
- `src/lib/constants.ts 파일` 생성

```ts
// 쿼리키 팩토링 상수
export const QUERY_KEYS = {
  todo: {
    all: ['todos'],
    list: ['todos', 'list'],
    detail: (id: string) => ['todos', 'detail', id],
  },
};
```

### 3.3. QUERY_KEY 활용하여 관리하기

```ts
import { createTodo } from '@/apis/todo';
import { QUERY_KEYS } from '@/lib/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function useCreateMutation() {
  // 1. 전역으로 생성해둔 React Query 의 상태관리를 활용한다.
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onError: error => {
      console.log(error);
    },
    onSuccess: () => {
      // 새로운 데이터가 들어왔으니 처음부터 다시 데이터 리셋
      // window.location.reload();

      // 2. 아래 코드는 데이터를 무효화시켜서 리패칭을 실행한다.
      // 3. QUERY_KEYS 로 적용
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todo.all });
    },
  });
}
```

```ts
import { fetchTodos } from '@/apis/todo';
import { QUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';

export function useFetchTodos() {
  return useQuery({
    queryKey: QUERY_KEYS.todo.list,
    queryFn: fetchTodos,
  });
}
```

```ts
import { fetchTodoById } from '@/apis/todo';
import { QUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';

export function useTodoDataById(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.todo.detail(id.toString()),
    queryFn: () => fetchTodoById(id),
    staleTime: 5000,
    gcTime: 10000,
  });
}
```

## 4. 전체를 다시 불러들이는 방식 개선

### 4.1. 문제점

- `queryClient.invalidateQueries({queryKey:QUERY_KEYS.todo.all})`
- 위의 경우에 너무 많은 데이터를 불러오는 경우에는 조금 고민을 하자.
- 서버에 부하가 되고, 성능상 좋지 않다.
- Mutation 에 onSuccess 에 전달되어지는 데이터를 활용하기를 권장함.
- 아래 API 에서는 성공시 data 를 return 받도록 구성됨

```ts
// 새로운 할일 등록 API
export async function createTodo(title: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL_DEMO}/todos`,
    {
      method: 'POST',
      body: JSON.stringify({ title }),
    }
  );
  if (!response.ok) throw new Error('Failed to create todo');
  const data: Todo = await response.json();
  return data;
}
```

### 4.2. 해결과정

- API 호출 후 `return 결과`는 `onSuccess 로 전달`됨.
- 1 단계.

```ts
  onSuccess: (API 실행 후 리턴받은 데이터) => {
    //   queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todo.all });
  },
```

- 2 단계.

```ts
    onSuccess: (data) => {
      //   queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todo.all });
      queryClient.setQueryData()
    },
```

- 3 단계.

```ts
    onSuccess: (data) => {
      //   queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todo.all });
      queryClient.setQueryData<Todo[]>()
    },
```

- 4 단계. `매개변수 1`,`매개변수 2` 이므로

```ts
  onSuccess: (data) => {
      //   queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todo.all });
      queryClient.setQueryData<Todo[]>(수정할캐시 데이터 키값, 화살표함수)
    },
```

- 5 단계. `쿼리키 적용`

```ts
    onSuccess: data => {
      //   queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todo.all });
      queryClient.setQueryData<Todo[]>(QUERY_KEYS.todo.all, 화살표함수);
    },
```

- 6 단계. `화살표함수 적용`

```ts
    onSuccess: data => {
      //   queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todo.all });
      queryClient.setQueryData<Todo[]>(QUERY_KEYS.todo.all, ()=>{});
    },
```

- 7 단계. `화살표함수 매개변수 적용`

```ts
    onSuccess: data => {
      //   queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todo.all });
      queryClient.setQueryData<Todo[]>(QUERY_KEYS.todo.all, (키값을 갖는 기존 캐시데이터) => {});
    },
```

- 8 단계. `새로운 캐시 데이터 리턴`

```ts
    onSuccess: data => {
      //   queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todo.all });
      queryClient.setQueryData<Todo[]>(QUERY_KEYS.todo.all, prevTodos => {
        // 반환될 업데이트한 캐시 데이터를 리턴
      });
    },
```

- 9 단계.

```ts
    onSuccess: data => {
      //   queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todo.all });
      queryClient.setQueryData<Todo[]>(QUERY_KEYS.todo.all, prevTodos => {
        // 반환될 업데이트한 캐시 데이터를 리턴
        if (!prevTodos) return [data];
        return [...기존캐시데이터, data];
      });
    },
```

- 10 단계.

```ts
    onSuccess: data => {
      //   queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todo.all });
      queryClient.setQueryData<Todo[]>(QUERY_KEYS.todo.all, prevTodos => {
        // 반환될 업데이트한 캐시 데이터를 리턴
        if (!prevTodos) return [data];
        return [...prevTodos, data];
      });
    },
```

### 4.3. 최종코드

```ts
import { createTodo } from '@/apis/todo';
import { QUERY_KEYS } from '@/lib/constants';
import { Todo } from '@/types/todo-type';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function useCreateMutation() {
  // 1. 전역으로 생성해둔 React Query 의 상태관리를 활용한다.
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onError: error => {
      console.log(error);
    },
    onSuccess: data => {
      // queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todo.all });
      queryClient.setQueryData<Todo[]>(QUERY_KEYS.todo.all, prevTodos => {
        // 반환될 업데이트한 캐시 데이터를 리턴
        if (!prevTodos) return [data];
        return [...prevTodos, data];
      });
    },
  });
}
```

## 5. Optimistic Updates(낙관적 업데이트)

- `성공적으로 데이터의 수정 요청이 될것이라고 미리 판단`해서 업데이트함.
- 네트워크 요청이 성공하기 전에 그냥 성공을 가정하고 반영해줌.
- UI 상 많은 서비스가 이런 형태로 제공됨.

### 5.1. completed 토글에 적용하기

- 할일의 토글 상태를 표시에 적용해봄.
- `src/components/todo/TodoItem.tsx`업데이트

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

      <div className='flex gap-5'>
        <input type={'checkbox'} />
        <Link href={`/todo-detail/${id}`}>{content}</Link>
      </div>

      <Button onClick={handleDeleteClick} variant={'destructive'}>
        삭제
      </Button>
    </div>
  );
}
```

### 5.2. 이벤트 연결하기

```ts
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
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.checked);
  };
  const handleDeleteClick = () => {};

  return (
    <div className='flex items-center justify-between border p-2'>
      {/* 링크걸기 */}

      <div className='flex gap-5'>
        <input type={'checkbox'} onChange={handleCheckboxChange} />
        <Link href={`/todo-detail/${id}`}>{content}</Link>
      </div>

      <Button onClick={handleDeleteClick} variant={'destructive'}>
        삭제
      </Button>
    </div>
  );
}
```

### 5.3. checked 에 completed 값 연결하기

- `src/app/todo-list/page.tsx` 업데이트

```tsx
{
  todos.map(item => (
    <TodoItem
      key={item.id}
      id={item.id}
      title={item.title}
      userId={item.userId}
      completed={item.completed}
    />
  ));
}
```

- `src/components/todo/TodoItem.tsx`업데이트

```tsx
'use client';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Todo } from '@/apis/todo-type';

export default function TodoItem({ id, title, completed, userId }: Todo) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.checked);
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

### 5.4. api 만들기 (할일 항목 업데이트 API)

- `src/apis/todo.ts` api 추가

```ts
// 할일업데이트 API
export async function updateTodo(todo: Partial<Todo> & { id: number }) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL_DEMO}/todos/${todo.id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(todo),
    }
  );
  if (!response.ok) throw new Error('Failed to update todo');
  const data: Todo = await response.json();
  return data;
}
```

### 5.5. hook 만들기

- `src/hooks/todos/mutations/useUpdateTodoMutation.ts 파일` 생성

```ts
import { updateTodo } from '@/apis/todo';
import { useMutation } from '@tanstack/react-query';

export function useUpdateTodoMutation() {
  return useMutation({
    mutationFn: updateTodo,
  });
}
```

### 5.6. 활용하기

- `src/components/todo/TodoItem.tsx`업데이트

```tsx
// hook 활용하기
const { mutate: updateTodo } = useUpdateTodoMutation();

const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // console.log(e.target.checked);
  updateTodo({ id, completed: !completed });
};
```

### 5.7. 전체 코드

```tsx
'use client';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Todo } from '@/apis/todo-type';
import { useUpdateTodoMutation } from '@/hooks/todos/mutations/useUpdateTodoMutation';

export default function TodoItem({ id, title, completed, userId }: Todo) {
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

## 6. 낙관적 업데이트 적용하기

- 즉시 요청이 성공할 것이라고 가정하고 체크박스를 바로 변경 적용
- mutate 함수가 실행되면 캐시 데이터를 즉시 업데이트 함.

### 6.1. 단계들

- 1 단계

```ts
import { updateTodo } from '@/apis/todo';
import { useMutation } from '@tanstack/react-query';

export function useUpdateTodoMutation() {
  return useMutation({
    mutationFn: updateTodo,
    // mutate 함수가 실행 되는 시점에 작성
    onMutate: ( 매개변수로 mutate함수의 재료가 전달됨 ) => {},
  });
}
```

- 2 단계

```ts
export function useUpdateTodoMutation() {
  return useMutation({
    mutationFn: updateTodo,
    // mutate 함수가 실행 되는 시점에 작성
    onMutate: updatedTodo => {
      // 캐시 데이터를 업데이트 기능 작성
    },
  });
}
```

- 3 단계

```ts
export function useUpdateTodoMutation() {
  // 1.전역 접근용 변수
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTodo,
    // mutate 함수가 실행 되는 시점에 작성
    onMutate: updatedTodo => {
      // 캐시 데이터를 업데이트 기능 작성
      // 2. 데이터 일부만 수정함.
      queryClient.setQueryData<Todo[]>(QUERY_KEYS.todo.list, () => {});
    },
  });
}
```

- 4 단계

```ts
import { updateTodo } from '@/apis/todo';
import { Todo } from '@/apis/todo-type';
import { QUERY_KEYS } from '@/lib/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateTodoMutation() {
  // 1.전역 접근용 변수
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTodo,
    // mutate 함수가 실행 되는 시점에 작성
    onMutate: updatedTodo => {
      // 캐시 데이터를 업데이트 기능 작성
      // 2. 데이터 일부만 수정함.
      queryClient.setQueryData<Todo[]>(QUERY_KEYS.todo.list, prevTodos => {
        if (!prevTodos) return [];
        return prevTodos.map(todo =>
          todo.id === updatedTodo.id ? { ...todo, ...updatedTodo } : todo
        );
      });
    },
  });
}
```

- 테스트해 보면 체크박스는 체크되고, 네트워크는 나중에 처리됨을 파악함.

## 7. 예외사항을 반드시 처리해야 합니다.

- 안정적으로 낙관적 업데이트를 처리해주어야 한다.

### 7.1. 비동기 요청이 실패 했을때 처리

- onError 핸들러에서 원상복구 구현

- 1 단계

```ts
  // 에러가 발생함
  onError: error => {
    console.log(error);
  },
```

- 2 단계 . 매개변수를 추가함
- valiable : onMutate 매개변수(원재료)와 동일한 값

```ts
  // 에러가 발생함
  onError: (error, valiable) => {
    console.log(error);
  },
```

- 3 단계 . 매개변수를 추가함
- context : onMutate 에서 리턴하는 반환값이 들어옴
- context 를 이용해서 요청 실패시 원상복구 가능함.

```ts
  // 에러가 발생함
  onError: (error, valiable, context) => {
    console.log(error);
  },
```

- 4 단계 . 일단 `원본 데이터를 보관`해 둔다. 이후 에러 시 복구함

```ts
onMutate: updatedTodo => {

   // 원본데이트를 보관함.
   const originTodos = queryClient.getQueryData();
      // 낙관적 업데이트 진행함
      나머지 코드...
   },
```

- 5 단계 .

```ts
onMutate: updatedTodo => {

   // 원본데이트를 보관함.
   const originTodos = queryClient.getQueryData<Todo[]>();
      // 낙관적 업데이트 진행함
      나머지 코드...
   },
```

- 6 단계 .

```ts
onMutate: updatedTodo => {

   // 원본데이트를 보관함.
   const originTodos = queryClient.getQueryData<Todo[]>(키명);
      // 낙관적 업데이트 진행함
      나머지 코드...
   },
```

- 7 단계 .

```ts
onMutate: updatedTodo => {

   // 원본데이트를 보관함.
   const originTodos = queryClient.getQueryData<Todo[]>(QUERY_KEYS.todo.list );
      // 낙관적 업데이트 진행함
      나머지 코드...
   },
```

- 8 단계 .

```ts
onMutate: updatedTodo => {

   // 원본데이트를 보관함.
   const originTodos = queryClient.getQueryData<Todo[]>( QUERY_KEYS.todo.list );
      // 낙관적 업데이트 진행함
      나머지 코드...

      // 원상복구할 데이터를 리턴해 준다.
      return { originTodos };
   },
```

- 9 단계 . 복구 파일 활용하기 (`return { originTodos };`)
- onError 핸들러에 context 를 활용함.

```ts
onError: (error, valiable, context) => {
      console.log(error);

      // 원상복구를 위해서 context 에 보관해둔 값으로 갱신한다.
      if (context?.originTodos) {
        queryClient.setQueryData<Todo[]>(
          QUERY_KEYS.todo.list,
          context.originTodos
        );
      }
      return { error };
    },
```

- 전체코드

```ts
import { updateTodo } from '@/apis/todo';
import { Todo } from '@/apis/todo-type';
import { QUERY_KEYS } from '@/lib/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTodo,
    onMutate: updatedTodo => {
      // 원본데이트를 보관함.
      const originTodos = queryClient.getQueryData<Todo[]>(
        QUERY_KEYS.todo.list
      );

      // 낙관적 업데이트 진행함.
      queryClient.setQueryData<Todo[]>(QUERY_KEYS.todo.list, prevTodos => {
        if (!prevTodos) return [];
        return prevTodos.map(todo =>
          todo.id === updatedTodo.id ? { ...todo, ...updatedTodo } : todo
        );
      });

      // 원상복구할 데이터를 리턴해 준다.
      return { originTodos };
    },
    // 에러가 발생함
    onError: (error, valiable, context) => {
      console.log(error);
      if (context?.originTodos) {
        queryClient.setQueryData<Todo[]>(
          QUERY_KEYS.todo.list,
          context.originTodos
        );
      }
      return { error };
    },
  });
}
```

- 테스트 해보기 : 의도적으로 오류내기

### 7.2. 타이밍에 의한 낙관적 업데이트 싱크오류

- 수정하고 있는데 다른곳에서 목록을 조회하고 있다.
- 수정이 진행중인데 ===> 목록조회 ===> 수정완료 ==> 목록조회 완료
- 시점의 문제를 해결해야 한다.
- `async await 을 활용하여 키 실행를 취소함`

```ts
  onMutate: async updatedTodo => {
      // 요청취소 기능 구현
      await queryClient.cancelQueries({queryKey:QUERY_KEYS.todo.list});

  나머지 코드...
    },
```

### 7.3. onMutate 데이터와 실제 서버에 수정데이터가 다를때

- 프론트에서 성공으로 처리되었지만 실제 서버측에서 오류발생 존재함.
- 요청이 종료되었을 때 캐시데이터를 무효화 시킴

```ts
  // 요청이 완료됨
  onSettled: () => {
     queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todo.list });
  },
```
