// 할일을 관리하는 React Query 훅

import { fetchTodos, Todo } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { error } from 'console';

// 할일 목록 가져오기 훅
export function useTodos(userId?: number) {
  return useQuery({
    queryKey: userId ? ['todos', 'user', userId] : ['todos'],
    queryFn: () => fetchTodos(userId),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// 완료 상태로 할일을 필터링 하는 훅
export function useTodaysByStatus(userId?: number, completed?: boolean) {
  return useQuery({
    queryKey: ['todos', 'user', userId, 'status', completed],
    queryFn: async () => {
      const todos = await fetchTodos(userId);
      // 완료 상태가 지정된 경우 필터링
      // complted === true :  완료
      // complted === false :  미완료
      // complted === undefiend :  모두다
      if (completed !== undefined) {
        return todos.filter(todo => todo.completed === completed);
      }
      return todos;
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
// 할일 통계 정보를 가져오는 훅
export function useTodoStats(userId?: number) {
  const todosQuery = useTodos(userId);

  return {
    ...todosQuery,
    // 통계 데이터 계산
    data: todosQuery.data
      ? {
          total: todosQuery.data.length,
          completed: todosQuery.data.filter(todo => todo.completed).length,
          pending: todosQuery.data.filter(todo => !todo.completed).length,
          completionRate:
            todosQuery.data.length > 0
              ? (todosQuery.data.filter(todo => todo.completed).length /
                  todosQuery.data.length) *
                100
              : 0,
        }
      : undefined,
  };
}

// 새 할일 생성하는 뮤테이션 훅
export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (todo: Omit<Todo, 'id'>) => {
      // 실제 API 테스트 못하므로 데모용으로
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ...todo, id: Math.random() * 1000 };
    },
    onSuccess: newTodo => {
      // 할일 목록 쿼리들을 무효화
      queryClient.invalidateQueries({ queryKey: ['todos'] });

      // 새로 생성된 할일을 캐시에 추가
      queryClient.setQueryData(['todos', newTodo.id], newTodo);
    },
    onError: error => {
      console.log('할일 생성에 실패했어요.', error);
    },
  });
}

// 할일을 수정하는 뮤테이션 훅
export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<Todo>;
    }) => {
      // 실제 API 테스트 못하므로 데모용으로
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id, ...updates };
    },
    onSuccess: updatedTodo => {
      // 해당 할일 쿼리를 무효화
      queryClient.invalidateQueries({ queryKey: ['todos', updatedTodo.id] });
      // 할일 목록 쿼리들도 무효화
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      // 수정된 할일을 캐시에 업데이트
      queryClient.setQueryData(['todos', updatedTodo.id], updatedTodo);
    },
    onError: error => {
      console.log('업데이트에 실패했습니다.', error);
    },
  });
}

// 할일 삭제하는 뮤테이션 훅
export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      // 실제 API 테스트 못하므로 데모용으로
      await new Promise(resolve => setTimeout(resolve, 300));
      return id;
    },
    onSuccess: deletedId => {
      // 해당 할일 쿼리를 무효화
      queryClient.invalidateQueries({ queryKey: ['todos', deletedId] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: error => {
      console.log('삭제에 실패했습니다.', error);
    },
  });
}

// 할일 토글 뮤테이션 훅
export function useToggleTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      // 실제 API 테스트 못하므로 데모용으로
      await new Promise(resolve => setTimeout(resolve, 300));

      // 현재 할일 정보를 가져와서 상태를 토글
      // 아래 내용 즉, getQueryData 의 용도를 파악해 두자.
      // - api 호출 없이 React Query 의 캐시데이터를 직접 가져오는 방법
      const currentTodos = queryClient.getQueryData<Todo[]>(['todos']);
      const todo = currentTodos?.find(item => item.id === id);

      if (!todo) {
        throw new Error('없는 Todo 입니다.');
      }
      return {
        ...todo,
        completed: !todo.completed,
      };
    },
    onSuccess: toggledTodo => {
      // 해당 할일 쿼리를 무효화
      queryClient.invalidateQueries({ queryKey: ['todos', toggledTodo.id] });
      // 할일 목록 쿼리를 무효화
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      // 토글된 할일을 캐시에 업데이트
      queryClient.setQueryData(['todos', toggledTodo.id], toggledTodo);
    },
    onError: error => {
      console.log('토글에 실패했습니다.', error);
    },
  });
}
