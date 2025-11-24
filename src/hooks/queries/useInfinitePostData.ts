import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { fetchPosts } from '@/apis/post';
import { useSession } from '@/stores/session';
const PAGE_SIZE = 5;

//  authorId?: string 포스트의 작성자 아이디 매개변수 전달
export function useInfinitePostData(authorId?: string) {
  const queryClient = useQueryClient();

  // 세션이 준비 되었는지 파악한다.
  const session = useSession();
  const userId = session?.user.id;

  return useInfiniteQuery({
    // queryKey: QUERY_KEYS.posts.list,
    queryKey: !authorId
      ? QUERY_KEYS.posts.list
      : QUERY_KEYS.posts.userList(authorId),

    enabled: Boolean(userId), // 사용자 아이디에 대한 유무

    queryFn: async ({ pageParam }) => {
      if (!userId) throw new Error('사용자 정보가 없습니다.');

      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // authorId 포스트 작성자의 아이디도 전달
      const posts = await fetchPosts({
        from,
        to,
        userId: session!.user.id,
        authorId,
      });

      posts.forEach(post => {
        queryClient.setQueryData(QUERY_KEYS.posts.byId(post.id), post);
      });

      return posts.map(post => post.id);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
    staleTime: Infinity,
  });
}
