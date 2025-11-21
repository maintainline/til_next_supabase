import { createComment } from '@/apis/comment';
import useProfileData from '@/hooks/queries/useProfileData';
import { QUERY_KEYS } from '@/lib/constants';
import { useSession } from '@/stores/session';
import { Comment, UseMutationCallback } from '@/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateComment(callback?: UseMutationCallback) {
  const queryClient = useQueryClient();
  // author_id 를 이용해서 프로필들도 불러와야 함.
  const session = useSession();
  const { data: profile } = useProfileData(session?.user.id);

  return useMutation({
    mutationFn: createComment,

    // 리턴 받은 성공데이터를 매개변수로 자동으로 받습니다.
    onSuccess: newComment => {
      if (callback?.onSuccess) callback.onSuccess();
      // 캐시 업데이트
      queryClient.setQueryData<Comment[]>(
        QUERY_KEYS.comments.post(newComment.post_id),
        comments => {
          if (!comments) throw new Error('댓글 목록을 찾을 수 없습니다.');
          if (!profile) throw new Error('사용자 정보를 찾을 수 없습니다.');

          // return [{ ...newComment, author: profile }, ...comments];
          // 새로운 댓글을 배열의 뒤에 추가형태 반영
          return [...comments, { ...newComment, author: profile }];
        }
      );
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
