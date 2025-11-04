'use client';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const TodoEditor = () => {
  const [content, setContent] = useState('');
  const handleAddClick = () => {
    if (content.trim() === '') return;
    setContent('');
  };
  return (
    <div className='flex gap-2'>
      <Input
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder='새로운 할 일을 입력하세요 ...'
      />
      <Button onClick={handleAddClick}>추가</Button>
    </div>
  );
};

export default TodoEditor;
