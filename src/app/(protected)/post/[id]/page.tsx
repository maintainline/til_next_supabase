interface PostDetailProps {
  params: {
    id: string;
  };
}
function PostDetail({ params }: PostDetailProps) {
  const { id } = params;
  return <div>PostDetail</div>;
}

export default PostDetail;
