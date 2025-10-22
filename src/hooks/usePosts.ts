// 게시글을 관리하는 React Query 훅

import {
  createPost,
  deletePost,
  fetchPost,
  fetchPosts,
  Post,
  updatePost,
} from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// 게시글 목록을 가져오는 훅
export function usePosts(userId?: number) {
  // useQuery : 정보 가져오기
  return useQuery({
    // 쿼리구분용 Key 생성
    // 사용자 ID가 있으면 포함하여 캐시 키 생성
    // 사용자 ID가 없으면 정해진 캐시 키 생성
    queryKey: userId ? ['posts', 'user', userId] : ['posts'],
    // 쿼리함수 : API 를 사용자 ID에 따라서 호출해줌
    queryFn: () => fetchPosts(userId),
    // 쿼리 개별 옵션
    staleTime: 5 * 60 * 1000, // 5분간은 호출을 막는다. 즉 fresh 유지
    gcTime: 10 * 60 * 1000, // 10분간 캐시를 유지함.
  });
}

// 특정 게시글 정보를 가져오는 훅
export function usePost(id: number) {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: () => fetchPost(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// 새글을 등록하는 훅
export function useCreatePost() {
  // 꼭 알아두자
  // 아래 구문은 React Query의 데이터 저장소에 접근하기 위한 훅
  // 서버에서 가져온 데이터를 관리하는 관리자를 불러옴
  // 내부적으로 useQuery, useMustaion 훅이 관리하느 캐시를 전체 관리하는 훅
  const queryClient = useQueryClient();

  // useMustation :  데이터 생성, 업데이트, 삭제 등..
  return useMutation({
    // 뮤테이션 함수 : API 를 이용한 새 게시글 생성 함수 연결
    mutationFn: createPost,
    // 성공시 실행되는 함수
    onSuccess: newPost => {
      // 게시글 목록 쿼리들을 무효화해서 최신 데이터를 다시 가져오도록 함.
      // 아래 구문은 특정 쿼리 키의 캐시를 무효화 함.
      // React Query 가 자동으로 최신 데이터를 다시 가져오게 하는 함수
      // 지금 캐시에 저장된 posts 가 오래 되었으니, 다시 서버에서 가져와
      queryClient.invalidateQueries({ queryKey: ['posts'] });

      // 새로 생성된 게시글을 캐시에 추가
      // 아래 구문은 서버에서 다시 데이터를 가져오지 않고, 캐시 데이터를 직접 수정함
      // 사용자가 새로고침 하지 않아도 최신 내용이 보여지도록 함.
      queryClient.setQueryData(['posts', newPost.id], newPost);
    },
    // 에러시 실행되는 함수
    onError: error => {
      console.log('글등록 실패했어요.', error);
    },
  });
}

// 글을 수정하는 훅
export function useUpdatePost() {
  const queryClient = useQueryClient();
  // useMutaion: 데이터 생성, 업데이트, 삭제 등..
  return useMutation({
    // 뮤테이션 함수 : API 를 이용한 게시글 업데이트 함수 연결
    // Partial 제네릭은 모든 객체 속성을 Optional 로 변환 즉, ? 를 모두 붙여줌
    /*
    export interface Post {
        id: number;   // 필수
        userId: number; // 필수
        title: string; // 필수
        body: string; // 필수
    }
    */
    // Partial<Post> 적용시
    /*
    export interface Post {
        id?: number;   // 옵션
        userId?: number; // 옵션
        title?: string; // 옵션
        body?: string; // 옵션
    }
    */

    mutationFn: ({ id, post }: { id: number; post: Partial<Post> }) =>
      updatePost(id, post),
    // 성공시
    onSuccess: updatePost => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['posts', updatePost.id] });
      // 게시글 목록 쿼리들도 무효화
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      //  수정된 게시글들을 캐시에 업데이트
      queryClient.setQueryData(['posts', updatePost.id], updatePost);
    },
    // 실패시
    onError: error => {
      console.log('글 수정에 실패했습니다.', error);
    },
  });
}

// 게시글 삭제
export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    // 다음처럼 사용하기 위해서 정의함.
    // const deleteMuation = useDeletePost();
    // deleteMuation.mutate(123)
    mutationFn: deletePost,

    // 아래는 참고사항
    // const deleteMuation = useDeletePost(123);
    // deleteMuation.mutate()
    // mutationFn: () => deletePost(id),

    // 성공시
    // 아래는 기억을 합시다..
    // 첫번째 매개변수 _ 의 의미는 mutaion  의 결과를 말함.
    // _ 의 코딩상 의미는 사용하지 않는 변수이다를 표현함.
    // deletePost 함수 API 는 결과를 리턴하는 것이 없다.
    // 사용하지 않는 리턴 결과임을 표현하기 위해서 _ 를 사용함
    //

    // 아래 첫번째 매개변수 : _ 는 결과값
    // 두번째 매개변수 deletedId 는 deletePost(매개변수) 에 전달한 매개변수를 참조함
    // deleteMuation.mutate(123)

    onSuccess: (_, deletedId) => {
      // 삭제된 게시글 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['posts', deletedId] });
      // 목록갱신을 위해서 캐시를 지움
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    // 실패시
    onError: error => {
      console.log('삭제에 실패했어요.', error);
    },
  });
}
// 게시글과 댓글을 함께 가져오는 훅
export function usePostWithComments(userId?: number) {
  // 먼저 게시글 목록을 가져옴
  const postsQuery = usePosts(userId);
  // 게시글 목록에 성공적으로 로드된 경우에만 댓글을 가져옴
  const commentsQuery = useQuery({
    queryKey: ['posts', 'comments', userId],
    queryFn: async () => {
      if (!postsQuery.data) return [];
      // 모든 게시글의 댓글을 병렬로 가져옴
      const commentsPromises = postsQuery.data.map(post =>
        fetch(
          `https://jsonplaceholder.typicode.com/posts/${post.id}/comments`
        ).then(res => res.json())
      );

      const allCommentes = await Promise.all(commentsPromises);
      return postsQuery.data.map((post, index) => ({
        ...post,
        comments: allCommentes[index],
      }));
    },
    // 게시글 목록이 성공적으로 로드된 경우만 실행
    enabled: postsQuery.isSuccess,
  });

  return {
    ...commentsQuery,
    // 원본 게시글 쿼리 정보도 함께 반환
    postsQuery,
  };
}
