// Todo 를 등록하는 함수 : API 즉, 백엔드 연동용 함수
export async function createTodo({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  const response = await fetch(`서버_URL/api/todos`, {
    method: 'POST',
    body: JSON.stringify({ title: title, content: content }),
  });

  if (!response.ok) throw new Error('할일 등록에 실패');

  const data = await response.json();

  return data;
}
