import supabase from '@/lib/supabase/client';
import { UpdatePostEntity } from '@/types/types';
import { uploadImage } from './image';
import { Qwigley } from 'next/font/google';

// 1. 글 등록
export async function createPost(content: string) {
  const { data, error } = await supabase
    .from('posts')
    .insert({ content })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 2. 이미지와 함께 글 등록
type PostImageType = {
  userId: string;
  content: string;
  images: File[];
};

export async function createPostWithImages({
  userId,
  content,
  images,
}: PostImageType) {
  // 단계 1. 포스트 생성
  const post = await createPost(content);
  // 단계 2. 이미지 파일들이 있는지 검사함
  if (images.length === 0) return post;

  // 단계 3. 이미지 파일들이 존재한다면
  try {
    // 파일을 업로드하는 것은 병렬로 진행함.
    // imageUrls : 업로드된 URL 목록들을 리턴 받음
    const imageUrls = await Promise.all(
      // images 파일 배열에서 하나씩 업로드를 병렬로 진행
      images.map(file => {
        // 1. 확장자를 추출함.
        const fileExtension = file.name.split('.').pop() || 'webp';
        // 2. 고유한 이름을 생성
        const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;
        // 3. 파일의 업로드할 경로를 만들어 냄
        const filePath = `${userId}/${post.id}/${fileName}`;
        // 4. 파일 업로드 함.
        return uploadImage({ filePath, file });
      })
    );

    // 단계 4. 포스트를 업데이트 해줌. (업로드된 이미지들의 URL 을 기록해줘야함.)
    // 별도의 함수로 추출
    const updatePosts = updatePost({ image_urls: imageUrls, id: post.id });
    return updatePosts;
  } catch (error) {
    // 에러가 발생하면 포스트를 삭제해야함.
    // 별도의 함수로 추출
    await deletePost(post.id);
    throw error;
  }
}

// 3. 이미지 여러개 등록 이후에 포스트 업데이트 함수
export async function updatePost(post: UpdatePostEntity & { id: number }) {
  const { data, error } = await supabase
    .from('posts')
    .update(post)
    .eq('id', post.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// 4. 업로드 오류시 처리 함.
export async function deletePost(id: number) {
  const { data, error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // 삭제된 아이템
  return data;
}

// 5. 포스트 목록 조회 : like 관련내용도 가져옴
export async function fetchPosts({
  from,
  to,
  userId,
  authorId, // 추가됨
}: {
  from: number;
  to: number;
  userId: string;
  authorId?: string; // 추가됨
}) {
  // authorId 가 있다면 추가적으로 Query 추가
  const request = supabase
    .from('posts')
    .select('*, author: profiles!author_id(*), myLiked: likes!post_id(*)')
    .eq('myLiked.user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  // 추가됨
  if (authorId) request.eq('author_id', authorId);

  // 추가됨 await주의
  const { data, error } = await request;

  if (error) throw error;
  return data.map(post => ({
    ...post,
    isLiked: post.myLiked && post.myLiked.length > 0,
  }));
}

// 6. 포스트 하나 조회
export async function fetchPostById({
  postId,
  userId,
}: {
  postId: number;
  userId: string;
}) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, author: profiles!author_id(*), myLiked: likes!post_id(*)')
    .eq('myLiked.user_id', userId)
    .eq('id', postId)
    .single();
  if (error) throw error;
  return {
    ...data,
    isLiked: data.myLiked && data.myLiked.length > 0,
  };
}

// 7. 좋아요 토글
export async function togglePostLike({
  postId,
  userId,
}: {
  postId: number;
  userId: string;
}) {
  const { data, error } = await supabase.rpc('toggle_post_like', {
    p_post_id: postId,
    p_user_id: userId,
  });
  if (error) throw error;
  return data;
}
