// React Query 와  Zustand 통합 훅

import { fetchPost, fetchPosts, fetchUser } from '@/lib/api';
import { useQueryStore } from '@/stores/queryStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { error } from 'console';

// 선택된 사용자 정보를 가져오는 훅
export function useSelectedUser() {
  // 사용자 정보를 zustand 로 관리
  const { selectedUserId } = useQueryStore();

  return useQuery({
    queryKey: ['users', selectedUserId],
    queryFn: () => fetchUser(selectedUserId!),
    enabled: !!selectedUserId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// 선택된 게시글 정보를 가져오는 훅
export function useSelectedPost() {
  // 게시글 정보를 zustand 로 관리
  const { selectedPostId } = useQueryStore();

  return useQuery({
    queryKey: ['posts', selectedPostId],
    queryFn: () => fetchPost(selectedPostId!),
    enabled: !!selectedPostId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// 사용자 선택 기능을 제공하는 훅
export function useUserSelection() {
  const { selectedUserId, setSelectedUserId } = useQueryStore();
  // 선택된 사용자 정보를 가져오는 훅
  const selectdUserQuery = useSelectedUser();
  return {
    // 상태
    selectedUserId,
    selectedUser: selectdUserQuery.data, // 사용자 데이터
    isLoading: selectdUserQuery.isLoading, // 로딩 상태
    error: selectdUserQuery.error, // 에러 상태

    // 액션들
    selectUser: (userId: number) => setSelectedUserId(userId),
    clearSelection: () => setSelectedUserId(null),

    // 쿼리 정보
    query: selectdUserQuery,
  };
}

// 쿼리 프리패치를 위한 훅
// - 사용자가 특정 데이터를 필요로 할 것이라고 예상해서
// - 미리 데이터를 가져와서 캐시에 저장하는 프리패치 기능용 훅
export function usePrefetchQuery() {
  // React Query 의 전역 캐시(useQuery, useMutation) 를 관리함.
  const queryClient = useQueryClient();
  return {
    // 프리패치할 것들
    // 1. 사용자 정보를 미리 캐시에 보관함
    prefetchUser: (userId: number) => {
      queryClient.prefetchQuery({
        queryKey: ['users', userId],
        queryFn: () => fetchUser(userId),
        staleTime: 5 * 60 * 1000, // 5분 statle 상태
      });
    },
    // 2. 사용자의 게시글을 미리 캐시에 보관함.
    prefetchUserPosts: (userId: number) => {
      queryClient.prefetchQuery({
        queryKey: ['posts', 'user', userId],
        queryFn: () => fetchPosts(userId),
        staleTime: 2 * 60 * 1000, // 2분 statle 상태
      });
    },

    // 3. 게시글 정보 프리패치
    prefetchPost: (postId: number) => {
      queryClient.prefetchQuery({
        queryKey: ['posts', postId],
        queryFn: () => fetchPost(postId),
        staleTime: 5 * 60 * 1000,
      });
    },
  };
}
