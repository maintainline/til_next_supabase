import { CreatePostButton } from '@/components/post/CreatePostButton';
import PostFeed from '@/components/post/PostFeed';

export default function Home() {
  return (
    <div className='flex flex-col gap-10'>
      <CreatePostButton />
      <PostFeed />
    </div>
  );
}
