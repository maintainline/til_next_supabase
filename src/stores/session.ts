import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

// Supabase 의 인증의 타입을 정의함
import type { Session } from '@supabase/supabase-js';
type State = {
  isLoading: boolean;
  session: null | Session;
};
// 보관할 state의 객체의 초기값
const initialState = {
  isLoading: false,
  session: null,
} as State;

const useSessionStore = create(
  devtools(
    combine(initialState, (set, get) => ({
      actions: {
        setSession: (session: Session | null) => {
          // 하고싶은일
          set({ isLoading: true, session });
        },
      },
    })),
    { name: 'sessionStore' }
  )
);
// session 정보
export const useSession = () => {
  // Selector 함수는 Store 에서 원하는 것을 선택해서 리턴한다.
  const session = useSessionStore(store => store.session);
  return session;
};
// loading 정보
export const useSessionLoaded = () => {
  // Selector 함수는 Store 에서 원하는 것을 선택해서 리턴한다.
  const isSessionLoaded = useSessionStore(store => store.isLoading);
  return isSessionLoaded;
};
// sesstion 보관 액션
export const useSetSession = () => {
  // Selector 함수는 Store 에서 원하는 것을 선택해서 리턴한다.
  const setSession = useSessionStore(store => store.actions.setSession);
  return setSession;
};
