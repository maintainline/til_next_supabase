import supabase from '@/lib/supabase/client';
// 1. 댓글 추가하기
export async function createComment({
  postId,
  content,
  parentCommentId,
  rootCommentId,
}: {
  postId: number;
  content: string;
  parentCommentId?: number;
  rootCommentId?: number;
}) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      content: content,
      parent_comment_id: parentCommentId,
      root_comment_id: rootCommentId,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// 2. 댓글조회
export async function fetchComments(postId: number) {
  const { data, error } = await supabase
    .from('comments')
    .select('*, author: profiles!author_id(*)')
    .eq('post_id', postId)
    // .order('created_at', { ascending: false }); //  최신순
    .order('created_at', { ascending: true }); // 오래된 순
  if (error) throw error;
  return data;
}

// 3. 댓글 업데이트
export async function updateComment({
  id,
  content,
  parentCommentId,
}: {
  id: number;
  content: string;
  parentCommentId?: number;
}) {
  const { data, error } = await supabase
    .from('comments')
    .update({ content })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// 4. 댓글 삭제하기
export async function deleteComment(id: number) {
  const { data, error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
