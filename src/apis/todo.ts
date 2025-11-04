import { Todo } from './todo-type';

// API 함수로 할일 목록 전체 불러들이기 기능
export async function fetchTodos() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL_DEMO}/todos`);
  if (!response.ok) throw new Error('목록을 가져오는데 실패함');
  const todos: Todo[] = await response.json();
  return todos;
}
