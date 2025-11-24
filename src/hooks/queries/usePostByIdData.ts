import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { fetchPostById } from '@/apis/post';
import { useSession } from '@/stores/session';

// 매겨변수의 순서가 중요하므로
export function usePostByIdData({
  postId,
  type,
}: {
  postId: number;
  type: 'FEED' | 'DETAIL';
}) {
  const session = useSession();
  // 사용자 검증
  const userId = session?.user.id;

  return useQuery({
    queryKey: QUERY_KEYS.posts.byId(postId),
    // like 기능 업데이트
    queryFn: () => fetchPostById({ postId: postId, userId: session!.user.id }),
    // 아래 업데이트
    enabled: type === 'FEED' ? false : Boolean(userId),
  });
}
