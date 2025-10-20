// User Store - zustand 로 카운터 관리

import { User, UserState } from '@/types/types';
import { create, useStore } from 'zustand';
import { persist } from 'zustand/middleware';

// 1 단계 - store 타입 정의 (통상 types/types.ts 에 정의)
// import { User } from '@/types/types';
// interface UserState {
//   user: User | null; //  현재 로그인한 사용자 정보(null 이면 로그아웃된 상태)
//   isLoggedIn: boolean; // 로그인 여부를 나타내는 Boolean
//   isLoading: boolean; // 로그인/로그아웃 처리중인지 나타내는 Boolean 값
//   login: (user: User) => void; // 사용자 로그인 처리 함수
//   logout: () => void; // 사용자 로그아웃 처리 함수
//   updateUser: (user: Partial<User>) => void; // User 의 모든 속성을 선택젓 옵션으로 정의
//   setLoading: (loading: boolean) => void; // 로딩 상태 설정 함수
// }

// 2 단계 - store 구현(필요시 localStorage 활용)
// create :  store 즉, state 만들기
// get : state 읽기
// set : state 쓰기

// 2 단계 1. localStorage 가 적용 안된버전
const userStore = create<UserState>()((set, get) => ({
  // 초기상태
  user: null,
  isLoggedIn: false,
  isLoading: false,

  // 사용자 정보 업데이트
  login: (user: User) =>
    set({ user: user, isLoggedIn: true, isLoading: false }),
  logout: () => set({ user: null, isLoggedIn: false, isLoading: false }),
  updateUser: (userData: Partial<User>) =>
    set(state => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),

  // 로딩 상태 설정
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

// 2 단계 2. localStorage 가 적용된 버전
const userLocalStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 초기상태
      user: null,
      isLoggedIn: false,
      isLoading: false,

      // 사용자 정보 업데이트
      login: (user: User) =>
        set({ user: user, isLoggedIn: true, isLoading: false }),
      logout: () => set({ user: null, isLoggedIn: false, isLoading: false }),
      updateUser: (userData: Partial<User>) =>
        set(state => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      // 로딩 상태 설정
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    { name: 'user-storage' }
  )
);

// 3 단계 - custom Hook 정의
export const useUserState = () => {
  const { user, isLoading, isLoggedIn, login, logout, setLoading, updateUser } =
    userLocalStore();
  return { user, isLoading, isLoggedIn, login, logout, setLoading, updateUser };
};
