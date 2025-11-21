import { deleteComment } from '@/apis/comment';
import { QUERY_KEYS } from '@/lib/constants';
import type { Comment, UseMutationCallback } from '@/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteComment(callback?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,
    
    // 삭제 성공된 리턴 결과를 자동 매개변수로 전달
    onSuccess: deletedComment => {
      if (callback?.onSuccess) callback.onSuccess();

      queryClient.setQueryData<Comment[]>(
        QUERY_KEYS.comments.post(deletedComment.post_id),
        comments => {
          if (!comments)
            throw new Error('댓글이 캐시데이터에 보관되어있지 않습니다.');
          return comments.filter(comment => comment.id !== deletedComment.id);
        }
      );
    },

    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
