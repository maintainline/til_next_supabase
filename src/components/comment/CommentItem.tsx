'use client';
import defaultAvatar from '/public/assets/icons/default-avatar.jpg';
import Image from 'next/image';
import Link from 'next/link';
// 타입만 import
import type { Comment } from '@/types/types';
import { formatTimeAgo } from '@/lib/time';
import { useSession } from '@/stores/session';
import { useState } from 'react';
import CommentEditor from './CommentEditor';
import { useDeleteComment } from '@/hooks/mutations/comment/useDeleteComment';
import { toast } from 'sonner';
import { useOpenAlertModal } from '@/stores/alertModalStore';

export default function CommentItem(props: Comment) {
  const session = useSession();

  // 삭제 mutation
  const { mutate: deleteComment, isPending: isDeleteCommentPending } =
    useDeleteComment({
      onSuccess: () => {},
      onError: error => {
        toast.error('댓글 삭제에 실패하였습니다.', { position: 'top-center' });
      },
    });

  const openAlertModal = useOpenAlertModal();

  const [isEditing, setIsEditing] = useState(false);

  const toggleEditing = () => {
    setIsEditing(prev => !prev);
  };

  const handleDeleteComment = () => {
    openAlertModal({
      title: '댓글 삭제',
      description: '삭제된 댓글은 되돌릴 수 없습니다. 정말 삭제하시겠습니까?',
      onPositive: () => {
        deleteComment(props.id);
      },
      onNegative: () => {
        console.log('취소~');
      },
    });
  };

  const isMine = session?.user.id === props.author.id;

  return (
    <div className={'flex flex-col gap-8  border-b pb-5'}>
      <div className='flex items-start gap-4'>
        <Link href={'#'}>
          <div className='flex h-full flex-col'>
            <Image
              className='h-10 w-10 rounded-full object-cover'
              src={props.author.avatar_url || defaultAvatar}
              width={40}
              height={40}
              alt={props.author.nickname || '회원 이미지'}
            />
          </div>
        </Link>
        <div className='flex w-full flex-col gap-2'>
          <div className='font-bold'>{props.author.nickname}</div>

          {isEditing ? (
            <CommentEditor
              type='EDIT'
              commentId={props.id}
              initialContent={props.content}
              onClose={toggleEditing}
            />
          ) : (
            <div>{props.content}</div>
          )}

          <div className='text-muted-foreground flex justify-between text-sm'>
            <div className='flex items-center gap-2'>
              <div className='cursor-pointer hover:underline'>댓글</div>
              <div className='bg-border h-[13px] w-[2px]'></div>
              <div>{formatTimeAgo(props.created_at)}</div>
            </div>
            <div className='flex items-center gap-2'>
              {isMine && (
                <>
                  <div
                    onClick={toggleEditing}
                    className='cursor-pointer hover:underline'
                  >
                    수정
                  </div>
                  <div className='bg-border h-[13px] w-[2px]'></div>
                  <div
                    className='cursor-pointer hover:underline'
                    onClick={handleDeleteComment}
                  >
                    삭제
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
