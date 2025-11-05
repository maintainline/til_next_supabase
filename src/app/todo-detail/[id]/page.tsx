import TodoDetail from '@/components/todo/TodoDetail';

type TodoDetailPage = {
  params: Promise<{ id: number }>;
};
export default async function TodoDetailPage({ params }: TodoDetailPage) {
  const { id } = await params;
  return <TodoDetail id={id} />;
}
