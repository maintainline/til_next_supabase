import { updateTodo } from '@/apis/todo';
import { Todo } from '@/apis/todo-type';
import { QUERY_KEYS } from '@/lib/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateTodoMutation() {
  // 1.전역 접근용 변수
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTodo,
    // mutate 함수가 실행 되는 시점에 작성
    onMutate: updatedTodo => {
      // 캐시 데이터를 업데이트 기능 작성
      // 2. 데이터 일부만 수정함.
      queryClient.setQueryData<Todo[]>(QUERY_KEYS.todo.list, prevTodos => {
        if (!prevTodos) return [];
        return prevTodos.map(todo =>
          todo.id === updatedTodo.id ? { ...todo, ...updatedTodo } : todo
        );
      });
    },
  });
}
