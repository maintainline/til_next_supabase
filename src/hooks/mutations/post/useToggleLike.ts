import { useMutation, useQueryClient } from '@tanstack/react-query';
import { togglePostLike } from '@/apis/post';
import { Post, UseMutationCallback } from '@/types/types';
import { QUERY_KEYS } from '@/lib/constants';

export function useTogglePostLike(callback?: UseMutationCallback) {
  // 캐시의 모든 것이 관리 되는 구조
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: togglePostLike,
    // onMutate 에서는 mutate 함수의 매개변수를 받을 수 있다.
    onMutate: async ({ postId }) => {
      // 캐시를 업데이트해서 렌더링 시켜줌.
      // 쿼리를 가져오기 중지 : key 값을 이용함
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.posts.byId(postId),
      });
      // 이전에 값을 보관해줌. 오류 시 복원의 용도로 활용
      const prevPost = queryClient.getQueryData<Post>(
        QUERY_KEYS.posts.byId(postId)
      );
      // 우선 캐시를 마치 원하는 결과가 반영된 것처럼 캐시를 업데이트 한다.
      queryClient.setQueryData<Post>(QUERY_KEYS.posts.byId(postId), post => {
        if (!post) throw new Error(`해당하는 포스트가 존재하지 않습니다.`);
        return {
          ...post,
          isLiked: !post.isLiked,
          like_count: post.isLiked ? post.like_count - 1 : post.like_count + 1,
        };
      });
      // 이전 데이터 복원용
      return { prevPost };
    },

    onSuccess: () => {
      if (callback?.onSuccess) callback.onSuccess();
    },
    onError: (error, _, context) => {
      // 타입 좁히기로 잘 접근해줌
      if (context && context?.prevPost) {
        queryClient.setQueryData<Post>(
          QUERY_KEYS.posts.byId(context.prevPost.id),
          context.prevPost
        );
      }
      if (callback?.onError) callback.onError(error);
    },
  });
}
