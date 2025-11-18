import PostFeed from '@/components/post/PostFeed';
import ProfileInfo from '@/components/profile/ProfileInfo';
import { redirect } from 'next/navigation';

interface ProfileDetailProps {
  params: {
    id: string;
  };
}

async function ProfileDetail({ params }: ProfileDetailProps) {
  const { id } = await params;

  // id 파라메터를 검증
  if (!id || id.trim() === '') {
    redirect('/');
  }

  return (
    <div className='flex flex-col gap-10'>
      {/* 사용자 정보 출력 */}
      <ProfileInfo userId={id} />
      <div className='border-b' />
      {/* 사용자 포스트 리스트 출력 */}
      <PostFeed authorId={id} />
    </div>
  );
}

export default ProfileDetail;
