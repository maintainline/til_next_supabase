'use client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateComment } from '@/hooks/mutations/comment/useCreateComment';
import { useUpdateComment } from '@/hooks/mutations/comment/useUpdateComment';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// 출력상태 구분 타입 정의
type CreateMode = {
  type: 'CREATE';
  postId: number;
};
type EditMode = {
  type: 'EDIT';
  commentId: number;
  initialContent: string;
  onClose: () => void;
};

type Props = CreateMode | EditMode;

export default function CommentEditor(props: Props) {
  //  mutation create 활용
  const { mutate: createComment, isPending: isCreateCommentPending } =
    useCreateComment({
      onSuccess: () => {
        setContent('');
      },
      onError: error => {
        toast.error('댓글 추가에 실패하였습니다.', { position: 'top-center' });
      },
    });
  //  mutation update 활용
  const { mutate: updateComment, isPending: isUpdateCommentPending } =
    useUpdateComment({
      onSuccess: () => {
        (props as EditMode).onClose();
      },
      onError: error => {
        toast.error('댓글 수정에 실패하였습니다.', { position: 'top-center' });
      },
    });

  const [content, setContent] = useState('');

  // 초기에 EDIT 이라면 내용 출력
  useEffect(() => {
    if (props.type === 'EDIT') {
      setContent(props.initialContent);
    }
  }, []);

  const handleSaveComment = () => {
    if (content.trim() === '') return;

    if (props.type === 'CREATE') {
      createComment({ postId: props.postId, content });
    } else {
      // update 실행
      updateComment({ id: props.commentId, content });
    }
  };

  const isPending = isCreateCommentPending || isUpdateCommentPending;

  return (
    <div className='flex flex-col gap-2'>
      <Textarea
        disabled={isPending}
        value={content}
        onChange={e => setContent(e.target.value)}
      />

      <div className='flex justify-end gap-2'>
        {props.type === 'EDIT' && (
          <Button onClick={() => (props as EditMode).onClose()}>취소</Button>
        )}

        <Button disabled={isPending} onClick={handleSaveComment}>
          {props.type === 'CREATE' ? '작성' : '수정'}
        </Button>
      </div>
    </div>
  );
}
