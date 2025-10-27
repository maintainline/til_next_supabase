# Supabase 인증

## 1. 활성화

- Authentication > Sign In / Providers
- `Confirm email` 은 개발하는 동안은 비활성화
- `Save Change 실행`

## 2. email 관련 옵션

- Auth Providers > Email > `Enable Email provider` 만 활성화

## 3. 회원가입 UI 작업

- http://localhost:3000/signup
- `src/app/signup/page.tsx`

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

function SignUp() {
  return (
    <div className='flex flex-col gap-8 '>
      <div className='text-xl font-bold'>회원가입</div>
      <div className='flex flex-col gap-2'>
        <Input type='email' placeholder='example@example.com' />
        <Input type='password' placeholder='password' />
      </div>
      <div>
        <Button className='w-full'>회원가입</Button>
      </div>
      <div>
        <Link
          href={'/signin'}
          className='text-muted-foreground hover:underline'
        >
          이미 계정이 있다면? 로그인
        </Link>
      </div>
    </div>
  );
}

export default SignUp;
```

## 4. 클라이언트 컴포넌트 상태 및 이벤트 관리

- useState 활용
- 이벤트 핸들러 활용

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useState } from 'react';

function SignUp() {
  // 컴포넌트 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  //회원가입 버튼 클릭처리
  const handleSignUpClick = () => {
    if (!email.trim()) return;
    if (!password.trim()) return;
    // supabase 회원가입 처리 코드
  };
  return (
    <div className='flex flex-col gap-8 '>
      <div className='text-xl font-bold'>회원가입</div>
      <div className='flex flex-col gap-2'>
        <Input
          value={email}
          onChange={e => setEmail(e.target.value)}
          type='email'
          placeholder='example@example.com'
        />
        <Input
          value={password}
          onChange={e => setPassword(e.target.value)}
          type='password'
          placeholder='password'
        />
      </div>
      <div>
        <Button className='w-full'>회원가입</Button>
      </div>
      <div>
        <Link
          href={'/signin'}
          className='text-muted-foreground hover:underline'
        >
          이미 계정이 있다면? 로그인
        </Link>
      </div>
    </div>
  );
}

export default SignUp;
```

## 5. React Query 의 `Mutation` 의 이해

- 데이터 등록, 수정, 삭제 요청 관리하기

### 5.1. 백엔드 서버에 데이터 추가 요청 보낼때 비동기 함수 필요

- `/src/apis 폴더 생성`
- 참조 : 경로 주의해야함.
- 참조 : 절대로 `/src/app/api` 폴더에 작성하면 큰일남~!

### 5.2. 샘플 참조해 보기

- `/src/apis/create-todo.ts` : 할일 생성 API 함수

```ts
// Todo 를 등록하는 함수 : API 즉, 백엔드 연동용 함수

export async function createTodo({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  const response = await fetch(``, {
    method: 'POST',
    body: JSON.stringify({ title: title, content: content }),
  });
  if (!response.ok) throw new Error('할일등록에 실패');
  const data = await response.json();
  return data;
}
```

- 백엔드 연동 `API 가 완성`되면 이제 `관리해줄 mutation ` 을 만들다

### 5.3. 왜 Mutaion 을 쓰라는 거지?

- 현재 글을 등록을 하는데
- 현재 등록중인 상태를 `isPending 개발자가 코딩으로 관리한다.`
- 현재 글이 등록 완료되었는지 `response 가 true 이면 개발자가 코딩으로 관리한다.`
- 현재 글이 등록 실패했는지 `error 처리 개발자가 코딩으로 관리한다.`
- 현재 글이 등록 오류가 발생시 `error 개발자가 코딩으로 관리한다.`
- 각각의 상황에 맞는 함수들(이벤트에 따라서 실행할 콜백함수 등)을 직접 작성함.

### 5.4. Mutation 적용

- api 함수를 만들고 나면 mutaion 을 생성해 준다.
- `/src/hooks 폴더` 생성
- `/src/hooks/mutations 폴더` 생성
- `/src/hooks/mutations/useCreateTodo.ts 파일` 생성

```ts
import { createTodo } from '@/apis/create-todo';
import { useMutation } from '@tanstack/react-query';

const useCrateTodo = () => {
  // 1단계
  //   const {} = useMutation();

  // 2단계
  //   const {} = useMutation(객체);

  // 3단계
  //   const {} = useMutation({
  //     mutationFn: 실행할 API 함수
  //   });

  // 4단계
  const {} = useMutation({
    mutationFn: createTodo,
  });

  // 5단계
  //   const { mutate } = useMutation({
  //     mutationFn: createTodo,
  //   });

  // 6단계(선택사항.. 옵션들..)
  const { mutate, isPending } = useMutation({
    mutationFn: createTodo,
  });
};

// 외부로 훅 내보내기
export default useCrateTodo;
```

### 5.5. Mutation 이벤트 처리 적용

```ts
import { createTodo } from '@/apis/create-todo';
import { useMutation } from '@tanstack/react-query';

const useCrateTodo = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: createTodo,
    // 요청이 시작 될때 실행됨.
    onMutate: () => {
      console.log('요청시작');
    },
    // 요청이 성공했을때 실행됨.
    onSuccess: () => {
      console.log('요청성공');
    },
    // 요청이 실패했을때 실행됨.
    // error 에는 에러가 자동으로 매개변수로 전달됨.
    onError: error => {
      console.log('요청에러', error);
    },
    // 요청이 완료되었을때 실행됨.
    onSettled: () => {
      console.log('요청완료');
    },
  });
};

// 외부로 훅 내보내기
export default useCrateTodo;
```

### 5.6. 만약 데이터가 onSuccess 했을 때

- useQuery 로 생성한 `특정 키`를 `전체 캐시 갱신` : 성능상 좋지 않음

```ts
queryClient.invalidateQueries({ queryKey: ['todos'] });
```

- 캐시를 업데이트 하는 형식이 성능상 좋음

```ts
import { createTodo } from '@/apis/create-todo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const useCrateTodo = () => {
  // 전체 useQuery 로 만든 캐시와
  // 전체 useMutation 으로 만든 캐시를 관리하는 저장소 참조
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createTodo,
    // 요청이 시작 될때 실행됨.
    onMutate: () => {
      console.log('요청 시작');
    },
    // 요청이 성공했을때 실행됨
    // 자동으로 성공된 데이터를 매개변수로 전달을 해줌.
    onSuccess: newTodo => {
      console.log('요청 성공');
      // 데이터 새로읽기 좋은 자리
      //window.location.reload();

      // 아래는 데이터 전체를 모두 가지고 오므로 부하가 발생할 소지가 있다
      // queryKey: ['todos'] : 가지고 있던 데이터를 갱신해줘
      // queryClient.invalidateQueries({ queryKey: ['todos'] });

      // 캐시에 직접 데이터를 추가해주는 방식
      queryClient.setQueryData<
        { id: string; title: string; description: string }[]
      >(['todo'].todo.list, prevTodos => {
        if (!prevTodos) return [newTodo];
        return [...prevTodos, newTodo];
      });
    },
    // 요청이 실패했을때 실행됨
    // error 에는 에러가 자동으로 매개변수로 전달됨.
    onError: error => {
      console.log('요청 에러', error);
    },
    // 요청이 완료되었을 때 실행됨
    onSettled: () => {
      console.log('요청 완료');
    },
  });
};

// 외부로 훅 내보내기
export default useCrateTodo;
```

## 6. Supabase 이메일 회원 추가 Mutation 적용

- /src/lib/supabase/client.ts 수정

```ts
import { Database } from '@/types/database.types';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = () =>
  createBrowserClient<Database>(supabaseUrl!, supabaseKey!);

// 외부 클라이언트 컴포넌트에서 자유롭게 사용하도록 설정
const supabase = createClient();
export default supabase;
```

### 6.1. api 만들기

- `/src/apis/auth.ts` 파일 생성

```ts
import supabase from '@/lib/supabase/client';

// supabase 백엔드에 사용자 이메일 회원가입
export async function signUpWithEmail({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  // 웹 브라우저를 이용해서 이메일 회원가입
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}
```

### 6.2. mutation 만들기

- `/src/hooks/mutations/useSignUp.ts` 파일 생성

```ts
import { signUpWithEmail } from '@/apis/auth';
import { useMutation } from '@tanstack/react-query';

export function useSignUp() {
  return useMutation({
    mutationFn: signUpWithEmail,
  });
}
```

### 6.3. 활용하기

- `/src/app/signup/page.tsx`

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSignUp } from '@/hooks/mutations/useSignUp';
import Link from 'next/link';
import { useState } from 'react';

function SignUp() {
  // 컴포넌트 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Mutation Hook 활용하기
  // 1. 이메일 mutation 훅
  const { mutate, isPending } = useSignUp();

  // 회원가입 버튼 클릭처리
  const handleSignUpClick = () => {
    if (!email.trim()) return;
    if (!password.trim()) return;
    // supabase 회원가입 처리 코드
    mutate({ email: email, password: password });
  };

  return (
    <div className='flex flex-col gap-8'>
      <div className='text-xl font-bold'>회원가입</div>
      <div className='flex flex-col gap-2'>
        <Input
          value={email}
          disabled={isPending}
          onChange={e => setEmail(e.target.value)}
          type='email'
          placeholder='example@example.com'
        />
        <Input
          value={password}
          disabled={isPending}
          onChange={e => setPassword(e.target.value)}
          type='password'
          placeholder='password'
        />
      </div>
      <div>
        <Button
          disabled={isPending}
          className='w-full'
          onClick={handleSignUpClick}
        >
          {isPending ? '회원등록중..' : '회원가입'}
        </Button>
      </div>
      <div>
        <Link
          href={'/signin'}
          className='text-muted-foreground hover:underline'
        >
          이미 계정이 있다면? 로그인
        </Link>
      </div>
    </div>
  );
}

export default SignUp;
```
