# 라우터 그룹으로 분기하기

- 사용자 권한별 라우터 분기하기

## 1. 회원을 위한 그룹 생성

- `/src/app/(protected) 폴더` 생성

## 2. 비회원을 위한 그룹 생성

- `/src/app/(default) 폴더` 생성

## 3. 회원을 위한 그룹에 포함할 라우터

- 아래의 경로는 모두 (protected) 폴더로 이동할 예정.

- `/`
- `/post/id`
- `/profile`
- `/reset-password`

## 4. 비회원을 위한 그룹에 포함할 라우터

- 아래의 경로는 모두 (default) 폴더로 이동할 예정.

- `/forget-password`
- `/signin`
- `/signup`

## 5. 인증된 사용자 접근 페이지

- 라우터 경로에 따른 처리로 진행
- `/src/app/(protected)/layout.tsx 파일` 생성

```tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}
export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const supabase = await createClient();
  // 세션 정보가 있는지 없는지 기다립니다..
  const { data } = await supabase.auth.getSession();
  // 세션 정보를 가져왔는데 null 이라면 비회원이다.
  if (!data.session) redirect('/signin');

  return <>{children}</>;
}
```

## 6. 인증되지않은 비사용자 접근 페이지

- `/src/app/(default)/layout.tsx 파일` 생성

```tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}
export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const supabase = await createClient();
  // 세션 정보가 있는지 없는지 기다립니다..
  const { data } = await supabase.auth.getSession();
  // 세션 정보를 가져왔는데 null 아니라면 비회원이다.
  if (!data.session) redirect('/');

  return <>{children}</>;
}
```
