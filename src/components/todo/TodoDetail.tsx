'use client';

import { useTodoDataById } from '@/hooks/todos/queries/useTodoDataById';

const TodoDetail = ({ id }: { id: number }) => {
  const { data, isLoading, error } = useTodoDataById(id);

  if (isLoading) return <div>로딩중...</div>;
  if (error) return <div>에러입니다. {error.message}</div>;
  if (!data) return <div>자료가 없어요</div>;

  return <div>TodoDetail : {data.title}</div>;
};

export default TodoDetail;
