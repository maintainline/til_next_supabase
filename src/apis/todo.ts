import { Todo } from '@/types/todo-type';

// API 함수로 할일 목록 전체 불러들이기 기능
export async function fetchTodos() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL_DEMO}/todos`);
  if (!response.ok) throw new Error('목록을 가져오는데 실패함');
  const todos: Todo[] = await response.json();
  return todos;
}

// API 함수로 1개의 id 를 전달받아서 상세 내용 불러들이기 기능
export async function fetchTodoById(id: number) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL_DEMO}/todos/${id}`
  );
  if (!response.ok) throw new Error('상세데이터가 없습니다.');
  const data: Todo = await response.json();
  return data;
}

// 새로운 할일 등록 API
export async function createTodo(title: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL_DEMO}/todos`,
    {
      method: 'POST',
      body: JSON.stringify({ title }),
    }
  );
  if (!response.ok) throw new Error('Failed to create todo');
  const data: Todo = await response.json();
  return data;
}

// 할일업데이트 API
export async function updateTodo(todo: Partial<Todo> & { id: number }) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL_DEMO}/todos/${todo.id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(todo),
    }
  );
  if (!response.ok) throw new Error('Failed to update todo');
  const data: Todo = await response.json();
  return data;
}
