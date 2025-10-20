/**
 * Counter 컴포넌트 - Zustand를 사용한 카운터 기능 구현
 *
 * 이 컴포넌트는 useCounterStore 훅을 사용하여 카운터 상태를 관리합니다.
 * 사용자가 버튼을 클릭하거나 직접 값을 입력하여 카운터를 조작할 수 있습니다.
 */

'use client';
import { useCounterStore } from '@/stores/CounterStore';

/**
 * Counter - 카운터 기능을 제공하는 React 컴포넌트
 *
 * Zustand의 useCounterStore 훅을 사용하여:
 * - 현재 카운터 값을 표시
 * - 증가/감소/리셋 버튼 제공
 * - 직접 값 입력 기능 제공
 *
 * @returns JSX.Element - 카운터 UI 컴포넌트
 */
export default function Counter() {
  // Zustand 스토어에서 상태와 액션들을 가져옵니다
  const { count, increment, decrement, reset, setCount } = useCounterStore();

  return (
    <div className='p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg space-y-4'>
      {/* 컴포넌트 제목 */}
      <h2 className='text-2xl font-bold text-center text-gray-800'>
        Counter with Zustand
      </h2>

      <div className='text-center'>
        {/* 현재 카운터 값을 큰 글씨로 표시 */}
        <div className='text-4xl font-bold text-blue-600 mb-4'>{count}</div>

        {/* 카운터 조작 버튼들 */}
        <div className='space-x-2'>
          {/* 감소 버튼 - 클릭 시 decrement 액션 호출 */}
          <button
            onClick={decrement}
            className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors'
          >
            -1
          </button>

          {/* 증가 버튼 - 클릭 시 increment 액션 호출 */}
          <button
            onClick={increment}
            className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors'
          >
            +1
          </button>

          {/* 리셋 버튼 - 클릭 시 reset 액션 호출 */}
          <button
            onClick={reset}
            className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors'
          >
            Reset
          </button>
        </div>

        {/* 직접 값 입력 필드 */}
        <div className='mt-4'>
          <input
            type='number'
            value={count}
            onChange={e => setCount(Number(e.target.value))} // 입력값을 숫자로 변환하여 setCount 액션 호출
            className='w-20 px-2 py-1 border border-gray-300 rounded text-center'
          />
        </div>
      </div>
    </div>
  );
}
