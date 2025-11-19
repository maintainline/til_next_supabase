'use client';
import Loader from '../Loader';
import PostItem from './PostItem';

import { useInfinitePostData } from '@/hooks/queries/useInfinitePostData';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import FallBack from '../FallBack';

export default function PostFeed({ authorId }: { authorId?: string }) {
  const { data, error, isPending, fetchNextPage, isFetchingNextPage } =
    useInfinitePostData(authorId);

  const { ref, inView } = useInView();
  useEffect(() => {
    console.log('inView', inView);
    fetchNextPage();
  }, [inView]);

  if (error) return <FallBack />;
  if (isPending) return <Loader />;
  return (
    <div className='flex flex-col gap-10'>
      {data?.pages.map(page =>
        page.map(postId => (
          <PostItem key={postId} postId={postId} type={'FEED'} />
        ))
      )}
      {isFetchingNextPage && <Loader />}
      <div ref={ref}></div>
    </div>
  );
}
