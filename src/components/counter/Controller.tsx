'use client';
import { useDecrement, useIncrement } from '@/stores/Count';
import { Button } from '../ui/button';

const Controller = () => {
  // selector 함수 활용
  const increment = useIncrement();
  const decrement = useDecrement();

  return (
    <div>
      <Button onClick={decrement}>Decrement</Button>
      <Button onClick={increment}>Increment</Button>
    </div>
  );
};

export default Controller;
