'use client';
import Link from 'next/link';
import { Button } from '../ui/button';

export default function TodoItem({
  id,
  content,
}: {
  id: number;
  content: string;
}) {
  const handleDeleteClick = () => {};

  return (
    <div className='flex items-center justify-between border p-2'>
      {/* 링크걸기 */}
      <Link href={`/todo-detail/${id}`}>{content}</Link>

      <Button onClick={handleDeleteClick} variant={'destructive'}>
        삭제
      </Button>
    </div>
  );
}
