import { updateProfile } from '@/apis/profile';
import { QUERY_KEYS } from '@/lib/constants';
import { Post, ProfileEntity, UseMutationCallback } from '@/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateProfile(callback?: UseMutationCallback) {
  // 서버의 상태
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,

    // 결과값이 매개변수에 담겨짐
    onSuccess: updatedProfile => {
      if (callback?.onSuccess) callback.onSuccess();

      // 캐시를 업데이트 해줌 : 리랜더링
      queryClient.setQueryData<ProfileEntity>(
        QUERY_KEYS.profile.byId(updatedProfile.id),
        updatedProfile
      );
      // 추가로 postItem 의 avatar 이미지도 캐시변경 해야함.
      // 피드/디테일 게시글 캐시에 남아있는 작성자 정보도 동시에 갱신한다.
      queryClient
        .getQueryCache()
        .findAll({ queryKey: QUERY_KEYS.posts.all })
        .forEach(query => {
          if (query.queryKey[1] !== 'byId') return;
          const cachedPost = query.state.data as Post | undefined;
          if (!cachedPost || cachedPost.author.id !== updatedProfile.id) return;

          queryClient.setQueryData<Post>(query.queryKey, {
            ...cachedPost,
            author: {
              ...cachedPost.author,
              ...updatedProfile,
            },
          });
        });
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
