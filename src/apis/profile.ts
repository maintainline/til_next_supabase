import supabase from '@/lib/supabase/client';
import { getRandomNickName } from '@/lib/utils';
import { deleteImagesInPath, uploadImage } from './image';

// 1. 회원정보 읽기
// 회원의 ID 를 전달받아서 정보 데이터 반환함.
// 비동기 작업이므로 async 적용
export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

// 2. 사용자 정보 생성하기
export async function createProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, nickname: getRandomNickName() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// 3. 프로필 업데이트
export async function updateProfile({
  userId,
  nickname,
  bio,
  avatarImageFile,
}: {
  userId: string;
  nickname: string;
  bio?: string;
  avatarImageFile?: File;
}) {
  // 1. 기존 아바타 이미지 삭제
  if (avatarImageFile) {
    await deleteImagesInPath(`${userId}/avatar`);
  }

  // 업로드된 url 을 보관할 변수
  let newAvatarUrl: string | null = null;

  // 2. 새로운 아바타 이미지 업로드
  if (avatarImageFile) {
    // 확장자 알아내기
    const fileExtension = avatarImageFile.name.split('.').pop() || 'webp';
    // 업로드 될 이름이 중복되면 안되므로
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;
    // 파일이 업로드 될 경로 생성
    const filePath = `${userId}/avatar/${fileName}`;

    // 실제 파일 업로드
    newAvatarUrl = await uploadImage({
      file: avatarImageFile,
      filePath: filePath,
    });
  }
  // 3. 프로필 테이블 업데이트 작업
  const { data, error } = await supabase
    .from('profiles')
    .update({ nickname, bio, avatar_url: newAvatarUrl })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
