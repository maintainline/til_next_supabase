import { updateTodo } from '@/apis/todo';
import { QUERY_KEYS } from '@/lib/constants';
import { Todo } from '@/types/todo-type';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTodo,
    onMutate: async updatedTodo => {
      // 하나만 업데이트 하기
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.todo.detail(updatedTodo.id.toString()),
      });
      const prevTodo = queryClient.getQueryData<Todo>(
        QUERY_KEYS.todo.detail(updatedTodo.id.toString())
      );
      // 업데이트 된 데이터만 반영해줌
      queryClient.setQueryData<Todo>(
        QUERY_KEYS.todo.detail(updatedTodo.id.toString()),
        prevTodo => {
          if (!prevTodo) return;
          return { ...prevTodo, ...updatedTodo };
        }
      );

      return { prevTodo };
    },
    // 에러가 발생함
    onError: (error, valiable, context) => {
      if (context?.prevTodo) {
        queryClient.setQueryData<Todo>(
          QUERY_KEYS.todo.detail(context.prevTodo.id.toString()),
          context.prevTodo
        );
      }
      return { error };
    },
  });
}
