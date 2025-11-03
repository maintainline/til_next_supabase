import { createTodo } from '@/apis/create-todo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const useCrateTodo = () => {
  // 전체 useQuery 로 만든 캐시와
  // 전체 useMutation 으로 만든 캐시를 관리하는 저장소 참조
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createTodo,
    // 요청이 시작 될때 실행됨.
    onMutate: () => {
      console.log('요청 시작');
    },
    // 요청이 성공했을때 실행됨
    // 자동으로 성공된 데이터를 매개변수로 전달을 해줌.
    onSuccess: newTodo => {
      console.log('요청 성공');
      // 데이터 새로읽기 좋은 자리
      //window.location.reload();

      // 아래는 데이터 전체를 모두 가지고 오므로 부하가 발생할 소지가 있다
      // queryKey: ['todos'] : 가지고 있던 데이터를 갱신해줘
      // queryClient.invalidateQueries({ queryKey: ['todos'] });

      // 캐시에 직접 데이터를 추가해주는 방식
      queryClient.setQueryData<
        { id: string; title: string; description: string }[]
      >(['todo'].todo.list, prevTodos => {
        if (!prevTodos) return [newTodo];
        return [...prevTodos, newTodo];
      });
    },
    // 요청이 실패했을때 실행됨
    // error 에는 에러가 자동으로 매개변수로 전달됨.
    onError: error => {
      console.log('요청 에러', error);
    },
    // 요청이 완료되었을 때 실행됨
    onSettled: () => {
      console.log('요청 완료');
    },
  });
};

// 외부로 훅 내보내기
export default useCrateTodo;
