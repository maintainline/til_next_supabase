// 쿼리키 팩토링 상수
export const QUERY_KEYS = {
  // 프로필 useQuery 키 생성 및 관리
  profile: {
    all: ['profile'],
    list: ['profile', 'list'],
    byId: (userId: string) => ['profile', 'byId', userId],
  },
  // 포스트 useQuery 키 생성 및 관리
  posts: {
    all: ['posts'],
    list: ['posts', 'list'],
    byId: (postId: number) => ['posts', 'byId', postId],
    // 추가됨
    userList: (userId: string) => ['posts', 'userList', userId],
  },
};

// 버킷 이름 : Supabase Storage 저장소
export const BUCKET_NAME = 'uploads';
