'use client';
import supabase from '@/lib/supabase/client';
import { useSession, useSessionLoaded, useSetSession } from '@/stores/session';
import { useEffect } from 'react';
import { GlobalLoading } from '../GlobalLoading';
import useProfileData from '@/hooks/queries/useProfileData';
import { redirect } from 'next/navigation';

interface SessionProviderProps {
  children: React.ReactNode;
}
export default function SessionProvider({ children }: SessionProviderProps) {
  const session = useSession();
  const setSession = useSetSession();
  const isSessionLoaded = useSessionLoaded();
  const { data: profile, isLoading: isProfileLoading } = useProfileData(
    session?.user.id
  );
  useEffect(() => {
    // 사용자가 로그인, 로그아웃을 하면 자동실행 이벤트 핸들러
    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      //로그아웃 진행시
      if (event === 'SIGNED_OUT') {
        redirect('/signin');
      }
    });
  }, [session]);

  if (!isSessionLoaded) return <GlobalLoading />;
  if (isProfileLoading) return <GlobalLoading />;

  return <div>{children}</div>;
}
