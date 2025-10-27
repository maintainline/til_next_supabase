# 테이블 셋팅해보기

## 1. posts 테이블 생성해보기

- 게시글을 보관하는 용도
- Table Editor > New Table

## 2. 칼럼 구조

- id : 글의 아이디 / int8 / Not Null
- crated_at : 생성날짜 / timestampz / Not Null
- content : 내용 / text / Not Null
- image_urls : 게시글에 여러 이미지경로를 문자열로 관리/ text / Nullable / Array
- like_count : 좋아요수 / int8 / 0 / Not Null
- author_id : 작성자 / uuid / auth.uid() / Not Null

## 3. Supabase CLI 설치 : 테이블에 대한 types.ts 생성 목적

- 새로운 이메일로 로그인 후에 진행.

```bash
npx supabase login
```

- 웹브라우저에 출력된 키 복사후 Terminal 에 붙여넣고 Enter 키 입력

```bash
Enter your verification code: 키값 입력
```

## 4. package.json 추가

- supabase 타입 자동 생성 스크립트 추가
- `/src/types 폴더 `생성

```json
 "generate-types": "npx supabase gen types typescript --project-id 프로젝트아이디 > src/types/database.types.ts"
```

```bash
npm run generate-types
```

## 5. 타입 활용

- `/src/lib/supabase/client.ts` 업데이트
- Supabase 연동시 타입을 자동 추론하는데 도움을 주기위한 처리

```ts
import { Database } from '@/types/database.types';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = () =>
  createBrowserClient<Database>(supabaseUrl!, supabaseKey!);
```

## 6. `/src/lib/supabase/server.ts` 업데이트

- Next.js 15 부터 cookies( )가 비동기로 변경됨.
- 현재 Connet 예시에는 반영안되어 있음.

```ts
import { Database } from '@/types/database.types';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = async () => {
  // 최신 문법 처리
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl!, supabaseKey!, {
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

## 7. 테이블의 타입을 별도 관리

- `src/types/types.ts 파일` 생성

```ts
import { type Database } from './database.types';

export type PostEntity = Database['public']['Tables']['posts']['Row'];
export type InsertPostEntity = Database['public']['Tables']['posts']['Insert'];
export type UpdatePostEntity = Database['public']['Tables']['posts']['Update'];
export type PostTableEntity = Database['public']['Tables']['posts'];
```
