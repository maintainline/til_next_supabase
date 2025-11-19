import CommentItem from '@/components/comment/CommentItem';

export default function CommentList() {
  return (
    <div className='flex flex-col gap-5'>
      <CommentItem />
      <CommentItem />
      <CommentItem />
    </div>
  );
}
