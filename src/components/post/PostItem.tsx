'use client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { usePostByIdData } from '@/hooks/queries/usePostByIdData';
import { formatTimeAgo } from '@/lib/time';
import { useSession } from '@/stores/session';
import { MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import FallBack from '../FallBack';
import Loader from '../Loader';
import DeletePostButton from './DeletePostButton';
import { EditPostItemButton } from './EditPostItemButton';
import LikeButton from './LikeButtion';
import defaultAvatar from '/public/assets/icons/default-avatar.jpg';

export default function PostItem({
  postId,
  type,
}: {
  postId: number;
  type: 'FEED' | 'DETAIL';
}) {
  const session = useSession();
  const userId = session?.user.id;
  const {
    data: post,
    isPending,
    error,
    // } = usePostByIdData({ postId, type: 'FEED' });
    // type 을 외부로 부터 전달 받도록 구성
  } = usePostByIdData({ postId, type: type });
  if (isPending) return <Loader />;
  if (error) return <FallBack />;

  const isMine = userId === post.author.id;

  return (
    <div
      className={`flex flex-col gap-4  pb-8 ${type === 'FEED' && 'border-b'}`}
    >
      <div className='flex justify-between'>
        <div className='flex items-start gap-4'>
          {/* 사용자 페이지 이동하기 */}
          <Link href={`/profile/${post.author.id}`}>
            <Image
              src={post.author.avatar_url || defaultAvatar}
              alt={`${post.author.nickname}의 프로필 이미지`}
              className='h-10 w-10 rounded-full object-cover'
              width={40}
              height={40}
            />
          </Link>

          <div>
            <div className='font-bold hover:underline'>
              <Link href={`/profile/${post.author.id}`}>
                {post.author.nickname}
              </Link>
            </div>
            <div className='text-muted-foreground text-sm'>
              {formatTimeAgo(post.created_at)}

              {/* {new Date(post.created_at).toLocaleString()} */}
            </div>
          </div>
        </div>

        {/* 1-2. 수정/삭제 버튼 */}
        <div className='text-muted-foreground flex text-sm'>
          {isMine && (
            <>
              <EditPostItemButton {...post} />
              <DeletePostButton id={post.id} />
            </>
          )}
        </div>
      </div>

      <div className='flex cursor-pointer flex-col gap-5'>
        {type === 'FEED' ? (
          <Link href={`/post/${post.id}`}>
            <div className='line-clamp-2 break-words whitespace-pre-wrap'>
              {post.content}
            </div>
          </Link>
        ) : (
          <div className='break-words whitespace-pre-wrap'>{post.content}</div>
        )}

        {/* 2-2. 이미지 캐러셀 */}
        <Carousel>
          <CarouselContent>
            {post.image_urls?.map((url, index) => (
              <CarouselItem className={`basis-3/5`} key={index}>
                <div className='overflow-hidden rounded-xl'>
                  <img
                    src={url}
                    className='h-full max-h-[350px] w-full object-cover'
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* 3. 좋아요, 댓글 버튼 */}
      <div className='flex gap-2'>
        {/* 3-1. 좋아요 버튼 */}
        <LikeButton
          id={post.id}
          likeCount={post.like_count}
          isLiked={post.isLiked}
        />

        {/* 3-2. 댓글 버튼 */}
        <Link href={`/post/${post.id}`}>
          <div className='hover:bg-muted flex cursor-pointer items-center gap-2 rounded-xl border-1 p-2 px-4 text-sm'>
            <MessageCircle className='h-4 w-4' />
            <span>댓글 달기</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
