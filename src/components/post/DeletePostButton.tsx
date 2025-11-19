import { Button } from '@/components/ui/button';
import { useDeletePost } from '@/hooks/mutations/post/useDeletePost';
import { useOpenAlertModal } from '@/stores/alertModalStore';
import { redirect, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function DeletePostButton({ id }: { id: number }) {
  const openAlertModal = useOpenAlertModal();

  // Next.js의 navigation 사용
  const router = useRouter();

  const { mutate: deletePost, isPending: isDeletePostPending } = useDeletePost({
    onSuccess: () => {
      // 현재 웹 브라우저의  URI 를 읽어들이고
      // 만약 경로에 /post/아이디가 있다면
      // 상세페이지로 판단하고 `/`경로로 이동함
      const pathName = window.location.pathname;
      if (pathName.includes(`/post/${id}`)) {
        // redirect('/');
        router.push('/');
      }
    },
    onError: error => {
      toast.error('포스트 삭제에 실패하였습니다.', {
        position: 'top-center',
      });
    },
  });

  const handleDeleteClick = () => {
    openAlertModal({
      title: '게시글 삭제',
      description: '삭제된 포스트는 되돌릴 수 없습니다. 정말 삭제하시겠습니까?',
      onPositive: () => {
        // 포스트 삭제 요청
        deletePost(id);
      },
    });
  };
  return (
    <Button
      disabled={isDeletePostPending}
      className='cursor-pointer'
      variant={'ghost'}
      onClick={handleDeleteClick}
    >
      삭제
    </Button>
  );
}
