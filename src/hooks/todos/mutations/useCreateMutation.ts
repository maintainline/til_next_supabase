import { createTodo } from '@/apis/todo';
import { QUERY_KEYS } from '@/lib/constants';
import { Todo } from '@/types/todo-type';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function useCreateMutation() {
  // 1. 전역으로 생성해둔 React Query 의 상태관리를 활용한다.
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onError: error => {
      console.log(error);
    },
    onSuccess: data => {
      // queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todo.all });
      queryClient.setQueryData<Todo[]>(QUERY_KEYS.todo.all, prevTodos => {
        // 반환될 업데이트한 캐시 데이터를 리턴
        if (!prevTodos) return [data];
        return [...prevTodos, data];
      });
    },
  });
}
