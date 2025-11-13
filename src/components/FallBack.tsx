import { TriangleAlertIcon } from 'lucide-react';

export default function FallBack() {
  return (
    <div className='flex flex-col items-center justify-center text-muted-foreground gap-2'>
      <TriangleAlertIcon className='h-6 w-6' />
      <p>오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
    </div>
  );
}
