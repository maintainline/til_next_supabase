import supabase from '@/lib/supabase/client';
import { getRandomNickName } from '@/lib/utils';

// 1. 회원정보 읽기
// 회원의 ID 를 전달받아서 정보 데이터 반환함.
// 비동기 작업이므로 asyn 적용
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
