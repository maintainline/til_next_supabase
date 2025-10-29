'use client';
import { useCount } from '@/stores/Count';

const Viewer = () => {
  //seletor 함수
  const count = useCount();
  return <div className='text-4xl font-bold'>{count}</div>;
};

export default Viewer;
