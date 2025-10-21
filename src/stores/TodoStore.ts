// Todo Store - zustand 로 카운터 관리

import { Todo, TodoState } from '@/types/types';
import { stat } from 'fs';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1 단계 - store 타입 정의 (통상 types/types.ts 에 정의)
// interface TodoState {
//   // state 타입
//   todos: Todo[]; // 모든 할일 목록 배열
//   filter: 'all' | 'active' | 'completed'; // 현재 적용된 필터
//   // action 타입
//   addTodo: (text: string) => void; // 새로운 할일 추가
//   toggleTodo: (id: string) => void; // 할일 완료 상태 토글
//   deleteTodo: (id: string) => void; // 할일 삭제
//   updateTodo: (id: string, text: string) => void; // 할일 내용 수정
//   setFilter: (filter: 'all' | 'active' | 'completed') => void; // 필터 설정
//   clearCompleted: () => void; // 완료된 할일 모두 삭제
//   getFilteredTodos: () => Todo[]; // 현재 선택된 할일 목록만 반환
// }

// 2 단계 - store 구현(필요시 localStorage 활용)
// create :  store 즉, state 만들기
// get : state 읽기
// set : state 쓰기

// 2 단계 1. localStorage 가 적용 안된버전
const todoState = create<TodoState>()((set, get) => ({
  // state 의 초기상태 값
  todos: [],
  filter: 'all',
  // state 를 다루는 액션의 기능 작성
  addTodo: (text: string) => {
    const newTodo: Todo = {
      id: '',
      text: text,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 기존 할일 목록에 새로운 할일 추가
    set(state => ({ todos: [...state.todos, newTodo] }));
  },
  toggleTodo: (id: string) => {
    set(state => ({
      todos: state.todos.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    }));
  },
  deleteTodo: (id: string) => {
    set(state => ({ todos: state.todos.filter(item => item.id !== id) }));
  },
  updateTodo: (id: string, text: string) => {
    set(state => ({
      todos: state.todos.map(item =>
        item.id === id ? { ...item, text: text, updatedAt: new Date() } : item
      ),
    }));
  },
  setFilter: (filter: 'all' | 'active' | 'completed') => {
    set({ filter });
  },
  clearCompleted: () => {
    set(state => ({ todos: state.todos.filter(item => !item.completed) }));
  },
  getFilteredTodos: () => {
    // 현재 state 를 읽어옴
    const { todos, filter } = get();
    switch (filter) {
      case 'active':
        return todos.filter(item => !item.completed);
      case 'completed':
        return todos.filter(item => item.completed);
      default:
        return todos;
    }
  },
}));

// 2 단계 2. localStorage 가 적용된버전
const todoLocalState = create<TodoState>()(
  persist(
    (set, get) => ({
      // state 의 초기상태 값
      todos: [],
      filter: 'all',
      // state 를 다루는 액션의 기능 작성
      addTodo: (text: string) => {
        const newTodo: Todo = {
          // 고유한 UUID 생성하기
          // https://developer.mozilla.org/ko/docs/Web/API/Window/crypto
          id: crypto.randomUUID(),
          text: text,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // 기존 할일 목록에 새로운 할일 추가
        set(state => ({ todos: [...state.todos, newTodo] }));
      },
      toggleTodo: (id: string) => {
        set(state => ({
          todos: state.todos.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
          ),
        }));
      },
      deleteTodo: (id: string) => {
        set(state => ({ todos: state.todos.filter(item => item.id !== id) }));
      },
      updateTodo: (id: string, text: string) => {
        set(state => ({
          todos: state.todos.map(item =>
            item.id === id
              ? { ...item, text: text, updatedAt: new Date() }
              : item
          ),
        }));
      },
      setFilter: (filter: 'all' | 'active' | 'completed') => {
        set({ filter });
      },
      clearCompleted: () => {
        set(state => ({ todos: state.todos.filter(item => !item.completed) }));
      },
      getFilteredTodos: () => {
        // 현재 state 를 읽어옴
        const { todos, filter } = get();
        switch (filter) {
          case 'active':
            return todos.filter(item => !item.completed);
          case 'completed':
            return todos.filter(item => item.completed);
          default:
            return todos;
        }
      },
    }),
    {
      name: 'todo-storage', // 로컬스토리지에 저장하는 이름(키명)
      // 모두 저장할 이유가 없고 내가 선별해서 저장하고 싶다면?
      // 새로 고침시 filter 는 "all" 이었으면 좋겠다.
      partialize: state => ({ todos: state.todos }),
    }
  )
);

// 3 단계 - custom Hook 정의
export const useTodoStore = () => {
  const {
    todos,
    filter,
    addTodo,
    toggleTodo,
    updateTodo,
    setFilter,
    deleteTodo,
    clearCompleted,
    getFilteredTodos,
  } = todoLocalState();

  return {
    todos,
    filter,
    addTodo,
    toggleTodo,
    updateTodo,
    setFilter,
    deleteTodo,
    clearCompleted,
    getFilteredTodos,
  };
};
