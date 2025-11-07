'use client';
import { useUpdateTodoMutation } from '@/hooks/todos/mutations/useUpdateTodoMutation';
import { useTodoDataById } from '@/hooks/todos/queries/useTodoDataById';
import Link from 'next/link';
import { Button } from '../ui/button';

export default function TodoItem({ id }: { id: number }) {
  // 개선된 코드 시작================================
  // 캐시된 데이터를 활용한다. ('List' 매개변수 추가)
  const { data: todo } = useTodoDataById(id, 'LIST');
  if (!todo) throw new Error('현재 Todo가 없어요');
  // 원하는 자료를 캐시로 부터 가져온다.
  const { completed, title } = todo;
  // 개선된 코드 종료================================

  // hook 활용하기
  const { mutate: updateTodo } = useUpdateTodoMutation();

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // console.log(e.target.checked);
    updateTodo({ id, completed: !completed });
  };

  const handleDeleteClick = () => {};

  return (
    <div className='flex items-center justify-between border p-2'>
      {/* 링크걸기 */}

      <div className='flex gap-5'>
        <input
          type={'checkbox'}
          checked={completed}
          onChange={handleCheckboxChange}
        />
        <Link href={`/todo-detail/${id}`}>{title}</Link>
      </div>

      <Button onClick={handleDeleteClick} variant={'destructive'}>
        삭제
      </Button>
    </div>
  );
}
