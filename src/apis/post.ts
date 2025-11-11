import supabase from '@/lib/supabase/client';

// 1. 글 등록
export async function createPost(content: string) {
  const { data, error } = await supabase.from('posts').insert({ content });
  if (error) throw error;
  return data;
}
