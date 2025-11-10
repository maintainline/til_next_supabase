'use client';
import supabase from '@/lib/supabase/client';
import { useSession, useSessionLoaded, useSetSession } from '@/stores/session';
import { useEffect } from 'react';
import { GlobalLoading } from '../GlobalLoading';
import useProfileData from '@/hooks/queries/useProfileData';

interface SessionProviderProps {
  children: React.ReactNode;
}
export default function SessionProvider({ children }: SessionProviderProps) {
  // 1 단계. 현재 세션 Store 로 부터 사용자의 세션 데이터를 불러옴
  const session = useSession();

  const setSession = useSetSession();
  const isSessionLoaded = useSessionLoaded();
  // 2 단계
  // session 데이터 안쪽의  user.id 를 인수로 전달함.
  const { data: profile, isLoading: isProfileLoading } = useProfileData(
    session?.user.id
  );

  useEffect(() => {
    // Supbase 의 인증의 상태가 변함을 체크함.
    supabase.auth.onAuthStateChange((event, session) => {
      // zustand 에 보관
      setSession(session);
    });
  }, []);

  // 아직 세션이 없다면
  if (!isSessionLoaded) return <GlobalLoading />;

  // 3단계
  if (isProfileLoading) return <GlobalLoading />;

  return <div>{children}</div>;
}
