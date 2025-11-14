'use client';
import { useOpenEditPostModal } from '@/stores/postEditorModalStore';
import { PostEntity } from '@/types/types';
import { Button } from '../ui/button';

export function EditPostItemButton(props: PostEntity) {
  // modal 을 재활용함
  const openPostEditorModal = useOpenEditPostModal();

  const handleClick = () => {
    // 추가인지, 편집인지 구분이 필요함.
    openPostEditorModal({
      postId: props.id,
      content: props.content,
      imageUrls: props.image_urls,
    });
  };
  return (
    <Button onClick={handleClick} className='cursor-pointer' variant={'ghost'}>
      수정
    </Button>
  );
}
