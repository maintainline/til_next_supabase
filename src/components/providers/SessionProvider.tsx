'use client';
import useProfileData from '@/hooks/queries/useProfileData';
import supabase from '@/lib/supabase/client';
import { useSession, useSessionLoaded, useSetSession } from '@/stores/session';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { GlobalLoading } from '../GlobalLoading';

interface SessionProviderProps {
  children: React.ReactNode;
}
export default function SessionProvider({ children }: SessionProviderProps) {
  const router = useRouter();

  const session = useSession();
  const setSession = useSetSession();
  const isSessionLoaded = useSessionLoaded();
  const { data: profile, isLoading: isProfileLoading } = useProfileData(
    session?.user.id
  );

  // SessionProvider 가 마운트시 즉시 세션을 동기화함.
  useEffect(() => {
    // 이미 사용자가 로그인 해서 잘 사용하고 있다면
    // 아래는 호출할 필요가 없어요.
    let isMounted = true;

    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;
      isMounted = false;
      setSession(session);
    };

    syncSession();

    // 사용자가 로그인, 로그아웃을 하면 자동실행 이벤트 핸들러
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      console.log('로그아웃 또는 로그인시의 상태 체크 : ', event);
      // 로그아웃 진행시에는
      if (event === 'SIGNED_OUT') {
        // redirect('/signin');
        router.push('/signin');
      }
    });

    // 클린업 함수
    return () => {
      isMounted = false;
      subscription.unsubscribe(); // 이벤트 감지 해제
    };
  }, [session, router]);

  if (!isSessionLoaded) return <GlobalLoading />;
  if (isProfileLoading) return <GlobalLoading />;

  return <div>{children}</div>;
}
