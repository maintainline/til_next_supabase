import { updateProfile } from '@/apis/profile';
import { QUERY_KEYS } from '@/lib/constants';
import { ProfileEntity, UseMutationCallback } from '@/types/types';
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
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
