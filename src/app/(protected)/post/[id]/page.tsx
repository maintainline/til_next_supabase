import CommentEditor from '@/components/comment/CommentEditor';
import CommentList from '@/components/comment/CommentList';
import PostItem from '@/components/post/PostItem';
import { redirect } from 'next/navigation';

interface PostDetailProps {
  params: {
    id: string;
  };
}
async function PostDetail({ params }: PostDetailProps) {
  const { id } = await params;
  if (!id || id.trim() === '') {
    redirect('/');
  }
  return (
    <div className='flex flex-col gap-5'>
      <PostItem postId={Number(id)} type={'DETAIL'} />
      <div className='text-xl font-bold'>댓글</div>
      <CommentEditor />
      <CommentList />
    </div>
  );
}

export default PostDetail;
