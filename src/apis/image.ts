import { BUCKET_NAME } from '@/lib/constants';
import supabase from '@/lib/supabase/client';

type ImageType = {
  filePath: string;
  file: File;
};

export async function uploadImage({ filePath, file }: ImageType) {
  // 파일을 업로드 함.
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (error) throw error;

  // 업로드된 파일의 URL 을 받아서 Post 에 이미지 목록(배열)에 저장
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  return publicUrl;
}
