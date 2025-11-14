'use client';
import FallBack from '../FallBack';
import Loader from '../Loader';
import PostItem from './PostItem';

// intersectionObjser
import { useInfinitePostData } from '@/hooks/queries/useInfinitePostData';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export default function PostFeed() {
  // 무한루프 API 호출 (fetchNextPage 추가)
  const { data, error, isPending, fetchNextPage, isFetchingNextPage } =
    useInfinitePostData();
  // intersectionObserver 레퍼런스
  const { ref, inView } = useInView();
  // 데이터 추가 관리
  useEffect(() => {
    console.log('inView', inView);
    // 데이터를 추가함(fetchNextPage 호출)
    fetchNextPage();
  }, [inView]);

  if (error) return <FallBack />;
  if (isPending) return <Loader />;
  return (
    <div className='flex flex-col gap-10'>
      {/* useinfinite 는 리턴으로 페이지별로 배열로 묶어서 전달함*/}
      {/* map 을 2번 반복함. */}
      {data.pages?.map(page =>
        page.map(post => <PostItem key={post.id} {...post} />)
      )}
      {isFetchingNextPage && <Loader />}
      {/* 웹브라우저 하단 감지용 DOM 요소를 추가 */}
      <div ref={ref}></div>
    </div>
  );
}
