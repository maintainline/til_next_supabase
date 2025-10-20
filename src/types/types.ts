// Counter Store 타입 정의
export interface CounterState {
  count: number; // 현재 카운터 값(숫자)
  increment: () => void; //  카운터 1 증가
  decrement: () => void; //  카운터 1 감소
  reset: () => void; //  카운터 0 초기화
  setCount: (count: number) => void; //  직접 카운터 값 설정
}
// User 타입 정의
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
// User Store 타입
export interface UserState {
  user: User | null; //  현재 로그인한 사용자 정보(null 이면 로그아웃된 상태)
  isLoggedIn: boolean; // 로그인 여부를 나타내는 Boolean
  isLoading: boolean; // 로그인/로그아웃 처리중인지 나타내는 Boolean 값
  login: (user: User) => void; // 사용자 로그인 처리 함수
  logout: () => void; // 사용자 로그아웃 처리 함수
  updateUser: (user: Partial<User>) => void; // User 의 모든 속성을 선택젓 옵션으로 정의
  setLoading: (loading: boolean) => void; // 로딩 상태 설정 함수
}

// 테마타입 정의
//system 테마 : 시스템 설정을 따르는 테마
export type Theme = 'light' | 'dark' | 'system';

// 테마 Store type 정의
export interface ThemeState {
  theme: Theme; // 현재 선택된 테마
  setTheme: (theme: Theme) => void; //  특정 테마로 설정하는 함수
  toggleTheme: () => void; // 라이트/다크 테마를 전환하는 함수
}
