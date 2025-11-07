import { updateTodo } from '@/apis/todo';
import { Todo } from '@/apis/todo-type';
import { QUERY_KEYS } from '@/lib/constants';
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTodo,
    onMutate: async updatedTodo => {
      // 요청취소 기능 구현
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.todo.list });

      // 원본데이트를 보관함.
      const originTodos = queryClient.getQueryData<Todo[]>(
        QUERY_KEYS.todo.list
      );

      // 낙관적 업데이트 진행함.
      queryClient.setQueryData<Todo[]>(QUERY_KEYS.todo.list, prevTodos => {
        if (!prevTodos) return [];
        return prevTodos.map(todo =>
          todo.id === updatedTodo.id ? { ...todo, ...updatedTodo } : todo
        );
      });

      // 원상복구할 데이터를 리턴해 준다.
      return { originTodos };
    },
    // 에러가 발생함
    onError: (error, valiable, context) => {
      console.log(error);
      if (context?.originTodos) {
        queryClient.setQueryData<Todo[]>(
          QUERY_KEYS.todo.list,
          context.originTodos
        );
      }
      return { error };
    },
    // 요청이 완료됨
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todo.list });
    },
  });
}

