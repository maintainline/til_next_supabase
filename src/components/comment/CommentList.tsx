'use client';

import CommentItem from '@/components/comment/CommentItem';
import { useCommentsData } from '@/hooks/queries/useCommentsData';
import FallBack from '../FallBack';
import Loader from '../Loader';

// parent_comment_id  를 이용해서 중첩 배열 구조 만들기
import type { Comment, NestedComment } from '@/types/types';
function toNestedComments(comments: Comment[]): NestedComment[] {
  const result: NestedComment[] = [];
  comments.forEach(comment => {
    if (!comment.parent_comment_id) {
      result.push({ ...comment, children: [] });
    } else {
      // 특정 댓글에 부모가 존재하므로 대댓글
      // 부모에 대한 정보를 찾아냄
      const rootCommentIndex = result.findIndex(
        item => item.id === comment.root_comment_id
      );
      // 실제 부모의 comment 정보
      const parentComment = comments.find(
        item => item.id === comment.parent_comment_id
      );
      if (rootCommentIndex === -1) return;
      if (!parentComment) return;

      result[rootCommentIndex].children.push({
        ...comment,
        children: [],
        parentComment: parentComment,
      });
    }
  });

  return result;
}

export default function CommentList({ postId }: { postId: number }) {
  // useQuery 호출
  const {
    data: comments,
    error: fetchCommentsError,
    isPending: isFetchCommentsPending,
  } = useCommentsData(postId);

  if (fetchCommentsError) return <FallBack />;
  if (isFetchCommentsPending) return <Loader />;

  // 중첩된 댓글 목록 정리
  const nestedComments = toNestedComments(comments || []);

  return (
    <div className='flex flex-col gap-5'>
      {nestedComments.map(comment => (
        <CommentItem key={comment.id} {...comment} />
      ))}
    </div>
  );
}
