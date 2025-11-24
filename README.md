# 회원 탈퇴

## 1. 기초 기능 구성

### 1.1. 회원 탈퇴 버튼 만들기

- `src/components/profile/DeleteProfileButton.tsx 파일` 생성

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { useOpenAlertModal } from '@/stores/alertModalStore';

export default function DeleteProfileButton() {
  const openAlertModal = useOpenAlertModal();

  const handleClick = () => {
    openAlertModal({
      title: '회원 탈퇴',
      description: '정말로 회원을 탈퇴하시겠습니까?',
      onPositive: () => {
        console.log('회원탈퇴');
      },
    });
  };

  return (
    <Button
      variant='destructive'
      className='cursor-pointer'
      onClick={handleClick}
    >
      회원 탈퇴
    </Button>
  );
}
```

### 1.2. 컴포넌트 출력

- `src/components/profile/ProfileInfo.tsx`

```tsx
{
  /* 프로필 수정 */
}
{
  isMine && (
    <div>
      <EditProfileButton />
      <DeleteProfileButton />
    </div>
  );
}
```

- 전체 코드

```tsx
'use client';
import useProfileData from '@/hooks/queries/useProfileData';
import FallBack from '../FallBack';
import Loader from '../Loader';
import defaultAvatar from '/public/assets/icons/default-avatar.jpg';
import Image from 'next/image';
import { useEffect } from 'react';
import EditProfileButton from './EditProfileButton';
import { useSession } from '@/stores/session';
import DeleteProfileButton from './DeleteProfileButton';

export default function ProfileInfo({ userId }: { userId: string }) {
  // 세션 정보 참조하기(zustand 보관됨)
  const session = useSession();
  // 본인인지를 검증
  const isMine = session?.user.id === userId;

  const {
    data: profile,
    error: fetchProfileError,
    isPending: isFetchingProfile,
  } = useProfileData(userId);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

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

      {/* 프로필 수정 */}
      {isMine && (
        <div>
          <EditProfileButton />
          <DeleteProfileButton />
        </div>
      )}
    </div>
  );
}
```

## 2. Supabase 회원 탈퇴 적용하기

- Next.js 에서만 가능함.
- supabase 의 Role Key 즉, `관리자 키`가 필요로함.

### 2.1. `.env` 중요함

- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE` 접두어는 웹브라우저에 노출될 소지 있음.
- `SUPABASE_SERVICE_ROLE` 없으면 Next.js 서버에서만 활용됨.

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE=
NEXT_PUBLIC_APP_URL=
```

### 2.2. `src/app/api/기능명/route.ts` 폴더 및 파일의 이해

- `src/app/페이지폴더명/page.tsx` 는 웹브라우저 경로 및 파일명
- `SERVICE ROLE KEY` 는 서버 전용으로 `숨겨야 함.`
- `src/app/api` 폴더명은 약속되어있음
- `src/app/api/기능명/route.ts 파일` 은 약속되어있음

## 3. 탈퇴기능 작성하기

### 3.1. 버튼 기능 구현하기

- `/src/components/profile/DeleteProfileButton.tsx`

```tsx
const router = useRouter();
const setSession = useSetSession();
const deleteProfile = async () => {
  try {
    // src/app/api/profile/delete/route.ts 라우트 API 실행
    const response = await fetch('/api/profile/delete', {
      method: 'POST',
    });

    if (!response.ok) {
      const { message } = await response.json();
      throw new Error(message);
    }

    await signOut();
    setSession(null);
    router.replace('/signin');
    router.refresh();
  } catch (error) {
    console.log(error);
    openAlertModal({
      title: '회원 탈퇴 실패',
      description: '잠시 후 다시 시도해주세요.',
    });
  }
};

const handleClick = () => {
  openAlertModal({
    title: '회원 탈퇴',
    description: '정말로 회원을 탈퇴하시겠습니까?',
    onPositive: deleteProfile,
  });
};
```

### 3.2. API 만들기

- `src/lib/supabase/admin.ts 파일` 생성

```ts
import { Database } from '@/types/database.types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

export function createAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase admin credentials are missing.');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey);
}
```

- 위의 파일을 활용해서 Admin 에서 활용할 API 를 생성해 보자.
- `src/app/api/profile/delete 폴더` 생성
- `src/app/api/profile/delete/route.ts 파일` 생성

```ts
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();

    if (sessionError || !user) {
      return NextResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const admin = createAdminClient();
    const { error: deleteProfileError } = await admin
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (deleteProfileError && deleteProfileError.code !== 'PGRST116') {
      console.error(deleteProfileError);
      return NextResponse.json(
        { message: '프로필 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(
      user.id
    );

    if (deleteUserError) {
      console.error(deleteUserError);
      return NextResponse.json(
        { message: '회원 탈퇴 처리에 실패했습니다.' },
        { status: 500 }
      );
    }

    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
```

## 4. 적용하기

- `/src/components/profile/DeleteProfileButton.tsx` : 업데이트

```tsx
//   router.refresh();
if (typeof window !== 'undefined') {
  window.location.assign('/signin');
}
```

- 전체코드

```tsx
'use client';
import { signOut } from '@/apis/auth';
import { Button } from '@/components/ui/button';
import { useOpenAlertModal } from '@/stores/alertModalStore';

import { useSetSession } from '@/stores/session';
import { useRouter } from 'next/navigation';

export default function DeleteProfileButton() {
  const openAlertModal = useOpenAlertModal();

  const router = useRouter();
  const setSession = useSetSession();
  const deleteProfile = async () => {
    try {
      // src/app/api/profile/delete/route.ts 라우트 API 실행
      const response = await fetch('/api/profile/delete', {
        method: 'POST',
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      await signOut();
      setSession(null);
      router.replace('/signin');
      // router.refresh();
      if (typeof window !== 'undefined') {
        window.location.assign('/signin');
      }
    } catch (error) {
      console.log(error);
      openAlertModal({
        title: '회원 탈퇴 실패',
        description: '잠시 후 다시 시도해주세요.',
      });
    }
  };

  const handleClick = () => {
    openAlertModal({
      title: '회원 탈퇴',
      description: '정말로 회원을 탈퇴하시겠습니까?',
      onPositive: deleteProfile,
    });
  };

  return (
    <Button
      variant='destructive'
      className='cursor-pointer'
      onClick={handleClick}
    >
      회원 탈퇴
    </Button>
  );
}
```
