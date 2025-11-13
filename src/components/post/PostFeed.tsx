'use client';
import { usePostsData } from '@/hooks/queries/usePostsData';
import FallBack from '../FallBack';
import Loader from '../Loader';
import PostItem from './PostItem';

export default function PostFeed() {
  const { data, error, isPending } = usePostsData();
  if (error) return <FallBack />;
  if (isPending) return <Loader />;
  return (
    <div className='flex flex-col gap-10'>
      {data?.map(post => (
        <PostItem key={post.id} {...post} />
      ))}
    </div>
  );
}
