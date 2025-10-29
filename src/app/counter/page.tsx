import Controller from '@/components/counter/Controller';
import Viewer from '@/components/counter/Viewer';

function CounterPage() {
  return (
    <div>
      <h1 className='text-2xl font-bold'>Counter</h1>
      <Viewer />
      <Controller />
    </div>
  );
}

export default CounterPage;
