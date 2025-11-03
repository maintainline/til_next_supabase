'use client';
import supabase from '@/lib/supabase/client';
import { useSessionLoaded, useSetSession } from '@/stores/session';
import { useEffect } from 'react';
import { GlobalLoading } from '../GlobalLoading';

interface SessionProviderProps {
  children: React.ReactNode;
}
export default function SessionProvider({ children }: SessionProviderProps) {
  const setSession = useSetSession();
  const isSessionLoaded = useSessionLoaded();

  useEffect(() => {
    // Supbase 의 인증의 상태가 변함을 체크함.
    supabase.auth.onAuthStateChange((event, session) => {
      // zustand 에 보관
      setSession(session);
    });
  }, []);

  // 아직 세션이 없다면
  if (!isSessionLoaded) return <GlobalLoading />;

  return <div>{children}</div>;
}
