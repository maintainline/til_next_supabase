// 쿼리키 팩토링 상수
export const QUERY_KEYS = {
  // 프로필 useQuery 키 생성 및 관리
  profile: {
    all: ['profile'],
    list: ['profile', 'list'],
    byId: (userId: string) => ['profile', 'byId', userId],
  },
};

// 버킷이름 : supabase Storage 저장소
export const BUCKET_NAME = 'uploads';
