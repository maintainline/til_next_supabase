'use client';

import CommentItem from '@/components/comment/CommentItem';
import { useCommentsData } from '@/hooks/queries/useCommentsData';
import FallBack from '../FallBack';
import Loader from '../Loader';

export default function CommentList({ postId }: { postId: number }) {
  // useQuery 호출
  const {
    data: comments,
    error: fetchCommentsError,
    isPending: isFetchCommentsPending,
  } = useCommentsData(postId);

  if (fetchCommentsError) return <FallBack />;
  if (isFetchCommentsPending) return <Loader />;

  return (
    <div className='flex flex-col gap-5'>
      {comments?.map(comment => (
        <CommentItem key={comment.id} {...comment} />
      ))}
    </div>
  );
}
