'use client';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Todo } from '@/apis/todo-type';
import { useUpdateTodoMutation } from '@/hooks/todos/mutations/useUpdateTodoMutation';

export default function TodoItem({ id, title, completed, userId }: Todo) {
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
