import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { fetchPosts } from '@/apis/post';
import { useSession } from '@/stores/session';
const PAGE_SIZE = 5;

//  authorId?: string 포스트의 작성자 아이디 매개변수 전달
export function useInfinitePostData(authorId?: string) {
  const queryClient = useQueryClient();

  //  like 추가 적용 : 사용자 정보
  const session = useSession();

  return useInfiniteQuery({
    // 보관하고 있는 캐시가 같이 업데이트
    // 구분해 주자.
    // queryKey: QUERY_KEYS.posts.list,

    queryKey: !authorId
      ? QUERY_KEYS.posts.list
      : QUERY_KEYS.posts.userList(authorId),

    queryFn: async ({ pageParam }) => {
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
