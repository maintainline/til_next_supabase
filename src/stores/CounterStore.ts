// Counter Store - zustand 로 카운터 관리
// 1 단계 - store 타입 정의 (통상 types/types.ts 에 정의)
// interface CounterState {
//   count: number; // 현재 카운터 값(숫자)
//   increment: () => void; //  카운터 1 증가
//   decrement: () => void; //  카운터 1 감소
//   reset: () => void; //  카운터 0 초기화
//   setCount: (count: number) => void; //  직접 카운터 값 설정
// }

import { CounterState } from '@/types/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 2 단계 - store 구현(필요시 local Storage 활용)
// create : store 즉, state 만들기
// get : state 읽기
// set : state 쓰기
// const counterState = create((set, get) => ({
//   //상태(state)
//   count: 0,
//   // 상태를 바꾸는 함수(action)
//   increment: () => set(state => ({ count: state.count + 1 })),
// }));

// 2단계 1. localStorage 가 적용 안된버전
const counterState = create<CounterState>()((set, get) => ({
  // 상태값(state)
  count: 0,
  // 상태값 갱신(actions)
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  setCount: (count: number) => set({ count: count }),
}));

// 2단계 2. localStorage 가 적용된 버전
const counterLocalState = create<CounterState>()(
  persist(
    (set, get) => ({
      count: 0,
      increment: () => set(state => ({ count: state.count + 1 })),
      decrement: () => set(state => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
      setCount: (count: number) => set({ count: count }),
    }),
    { name: 'counter-storage' }
  )
);

// 3 단계 - custom Hook 정의
export const useCounterStore = () => {
  const { count, increment, decrement, reset, setCount } = counterLocalState();
  return { count, increment, decrement, reset, setCount };
};
