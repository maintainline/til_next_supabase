import { BUCKET_NAME } from '@/lib/constants';
import supabase from '@/lib/supabase/client';

type ImageType = {
  filePath: string;
  file: File;
};

export async function uploadImage({ filePath, file }: ImageType) {
  // 파일을 업로드함.
  const { data, error } = await supabase.storage
    .from(`${BUCKET_NAME}`)
    .upload(filePath, file);

  if (error) throw error;

  // 업로드 된 파일의 URL 을 받아서 Post 에 이미지 목록(배열)에 저장
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
  return publicUrl;
}

// 특정 경로 밑에 있는 모든 이미지를 지우는 기능
export async function deleteImagesInPath(path: string) {
  const { data: files, error: fetchFilesError } = await supabase.storage
    .from(BUCKET_NAME)
    .list(path);

  // 안전하게 업데이트 처리함
  if (!files || files.length === 0) {
    return;
  }

  if (fetchFilesError) throw fetchFilesError;

  const { error: removeError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(files.map(file => `${path}/${file.name}`));

  if (removeError) throw removeError;
}
