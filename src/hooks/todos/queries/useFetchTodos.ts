import { fetchTodos } from '@/apis/todo';
import { useQuery } from '@tanstack/react-query';

export function useFetchTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });
}
