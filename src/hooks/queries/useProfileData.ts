import { createProfile, fetchProfile } from '@/apis/profile';
import { QUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import type { PostgrestError } from '@supabase/supabase-js';
import { useSession } from '@/stores/session';

export default function useProfileData(userId?: string) {
  // 나의 정보 확인
  const session = useSession();
  // 나의 계정인지를 검사
  const isMine = userId === session?.user.id;

  return useQuery({
    queryKey: QUERY_KEYS.profile.byId(userId!),
    queryFn: async () => {
      try {
        const profile = await fetchProfile(userId!);
        return profile;
      } catch (error) {
        // 에러코드 파악으로 처리함
        if (isMine && (error as PostgrestError).code === 'PGRST116') {
          // 기본 사용자 생성
          return await createProfile(userId!);
        }
        throw error;
      }
    },
    enabled: !!userId,
  });
}
