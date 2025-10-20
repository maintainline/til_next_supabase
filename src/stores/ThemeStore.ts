// Theme Store - zustand 로 카운터 관리

import { Theme } from '@/types/types';

// 1 단계 - store 타입 정의 (통상 types/types.ts 에 정의)
// interface ThemeState {
//   theme: Theme; // 현재 선택된 테마
//   setTheme: (theme: Theme) => void; //  특정 테마로 설정하는 함수
//   toggleTheme: () => void; // 라이트/다크 테마를 전환하는 함수
// }

// 2 단계 - store 구현(필요시 localStorage 활용)
// create :  store 즉, state 만들기
// get : state 읽기
// set : state 쓰기

// 2 단계 1. localStorage 가 적용 안된 버전

// 2 단계 2. localStorage 가 적용된 버전

// 3 단계 - custom Hook 정의
