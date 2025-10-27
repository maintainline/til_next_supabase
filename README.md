# Supabase 셋팅

## 1. 새로운 계정 이메일 준비

- 프로젝트 셋팅

## 2. `.env 파일` 생성 및 설정

- 화면 최상단의 `connect` 버튼 선택 후 내용 작성

```
NEXT_PUBLIC_SUPABASE_URL=https://프로젝트ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=본인키
```

## 3. supabase 관련 파일 작성

- Connect 메뉴에서는 utils 폴더 추천함.
- 우리는 lib 폴더를 사용함
  `/src/lib/supabase`폴더 생성

### 3.1. `client.ts 파일` 생성

- 클라이언트(웹 브라우저) 코드
- 브라우저 환경에서 supabase 와 통신함
- React 컴포넌트(클라이언트 컴포넌트)에서 직접 사용함.

```ts
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = () =>
  createBrowserClient(supabaseUrl!, supabaseKey!);
```

### 3.2. `server.ts 파일` 생성

- 서버 컴포넌트에서 Supabase 통신함.
- 쿠키 기반 인증 처리
- SSR/SSG 환경에서 사용
- SSR : Server Side Rendering(서버에서 html 생성)
- SSG : Server Static Generating(서버에서 미리 html 생성)

```ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
};
```

### 3.3. `middleware.ts 파일` 생성

- 통신 중간 단계를 처리해서 전달해주는 기계를 `미들웨어`라고 함.
- Next.js 의 미들웨어에서 사용함.
- 인증 상태 및 리다이렉션 처리

```ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = (request: NextRequest) => {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  return supabaseResponse;
};
```

## 4. 필요한 라이브러리

```bash
npm i @supabase/ssr
```

## 5. 참조사항

- 만약 React 프로젝트라면

```bash
npm i @supabase/supabase-js
```

## 6. Service Role 키도 보관해 두자.

- 필수 아닙니다.
- Project Settings > API Keys > Service_Role
- `.env` 내용 추가

```
NEXT_PUBLIC_SUPABASE_URL=https://프로젝트ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY= 본인 키
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE= 시크릿키
```
