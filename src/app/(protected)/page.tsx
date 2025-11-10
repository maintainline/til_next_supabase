import { CreatePostButton } from '@/components/post/CreatePostButton';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className='flex flex-col gap-10'>
      <CreatePostButton />
    </div>
  );
}
