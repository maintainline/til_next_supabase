// React Query 와  Zustand 통합 훅

import { fetchPost, fetchUser } from '@/lib/api';
import { useQueryStore } from '@/stores/queryStore';
import { useQuery } from '@tanstack/react-query';

// 선택된 사용자 정보를 가져오는 훅
export function useSelectedUser() {
  // 사용자 정보를 Zustand 로 관리
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
  // 게시글 정보를 Zustand 로 관리
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
  const { setSelectedUserId, selectedUserId } = useQueryStore();
  // 선택된 사용자 정보를 가져오는 훅
  const selectedUserQuery = useSelectedUser();
  return {
    //상태
    selectedUserId,
    selectedUser: selectedUserQuery.data,
    isLoading: selectedUserQuery.isLoading,
    error: selectedUserQuery.error,
    // 내일 진행
  };
}

// 게시글 선택 기능을 제공하는 훅
export function usePostSelection() {}

// 업데이트를 위한 훅
export function useOptimisticUpdate() {}

// 쿼리 프리패치를 위한 훅
export function usePrefetchQuery() {}

// React Query 와 Zustand 상태 동기화 훅
export function useQuerySync() {}
