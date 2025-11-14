'use client';
import { ImageIcon, XIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePostEdiotorModal } from '@/stores/postEditorModalStore';
import { useEffect, useRef, useState } from 'react';
import { useCreatePost } from '@/hooks/mutations/post/useCreatePost';
import { toast } from 'sonner';
import { Carousel, CarouselContent, CarouselItem } from '../ui/carousel';
import Image from 'next/image';
import { useSession } from '@/stores/session';
import { useOpenAlertModal } from '@/stores/alertModalStore';
import { useUpdatePost } from '@/hooks/mutations/post/useUpdatePost';

type ImageFile = {
  file: File;
  previewUrl: string;
};

export default function PostEditorModal() {
  // 사용자 정보 받아오기
  const session = useSession();
  // 경고창
  const openAlertModal = useOpenAlertModal();
  const postEditorModalStore = usePostEdiotorModal();

  // 글등록 mutation 을 사용함.
  const { mutate: createPost, isPending: isCreatePostPending } = useCreatePost({
    onSuccess: () => {
      postEditorModalStore.actions.close();
    },
    onError: error => {
      toast.error('포스트 생성에 실패했습니다.', {
        position: 'top-center',
      });
    },
  });

  // 글수정 mutation 을 사용함.
  const { mutate: updatePost, isPending: isUpdatePostPending } = useUpdatePost({
    onSuccess: () => {
      postEditorModalStore.actions.close();
    },
    onError: error => {
      toast.error('포스트 수정에 실패했습니다.', {
        position: 'top-center',
      });
    },
  });

  // post 에 저장할 내용
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 이미지 Input 태그 참조
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 이미지 미리보기 내용들
  const [images, setImages] = useState<ImageFile[]>([]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // 자동포커스 및 내용 초기화
  useEffect(() => {
    if (!postEditorModalStore.isOpen) {
      images.forEach(img => {
        URL.revokeObjectURL(img.previewUrl);
      });
      return;
    }
    if (postEditorModalStore.type === 'CREATE') {
      // 생성이므로 값을 비워둠
      setContent('');
      setImages([]);
    } else {
      // 수정 모드에서는 내용이 나와야 합니다.
      setContent(postEditorModalStore.content);
      setImages([]);
    }

    textareaRef.current?.focus();
  }, [postEditorModalStore.isOpen]);

  const handleCloseModal = () => {
    if (content !== '' || images.length !== 0) {
      // 안내창을 띄워서 확인후 닫기 실행처리
      openAlertModal({
        title: '포스트 작성이 완료되지 않았습니다.',
        description: '화면에서 나가면 작성중이던 내용이 사라집니다.',
        onPositive: () => {
          postEditorModalStore.actions.close();
        },
        onNegative: () => {
          console.log('취소 확인');
        },
      });
      return;
    }
    postEditorModalStore.actions.close();
  };

  // 실제 포스트 등록 또는 편집 하기
  // 이름만 바꿈
  // const handleCreatePost = () => {

  const handleSavePost = () => {
    if (content.trim() === '') return;
    if (!postEditorModalStore.isOpen) return;

    if (postEditorModalStore.type === 'CREATE') {
      // 새글 생성
      createPost({
        content: content,
        userId: session!.user.id,
        // 파일만 추출해 주기
        images: images.map(item => item.file),
      });
    } else {
      // 수정 상태
      if (content === postEditorModalStore.content) return;
      updatePost({
        id: postEditorModalStore.postId,
        content: content,
      });
    }
  };

  // 이미지들이 선택되었을 때 실행할 핸들러
  const handleSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // 객체로 부터 배열 만드는 Array.from
      const files = Array.from(e.target.files);
      files.forEach(file => {
        setImages(prev => [
          ...prev,
          { file, previewUrl: URL.createObjectURL(file) },
        ]);
      });
    }
    // 초기화 시킴
    e.target.value = '';
  };

  // 이미지가 제거될 때 실행될 핸들러
  const handleDeleteImage = (img: ImageFile) => {
    setImages(prevImg =>
      prevImg.filter(item => item.previewUrl != img.previewUrl)
    );
    // 웹브라우저 캐시 메모리 지우기
    URL.revokeObjectURL(img.previewUrl);
  };

  // 글 수정 또는 새글 작성시 로딩 처리
  const isPending = isCreatePostPending || isUpdatePostPending;

  return (
    <Dialog open={postEditorModalStore.isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className='max-h-[90vh]'>
        <DialogTitle>포스트 작성</DialogTitle>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          disabled={isPending}
          className='max-h-125 min-h-25 focus:outline-none'
          placeholder='새로운 글을 등록해주세요.'
        />

        {/* 이미지 선택 Input 태그 숨김 */}
        <input
          onChange={handleSelectImages}
          ref={fileInputRef}
          type='file'
          accept='image/*'
          multiple
          className='hidden'
        />

        {/* 편집모드일 때 보여지는 부분 */}
        {postEditorModalStore.isOpen &&
          postEditorModalStore.type === 'EDIT' && (
            <Carousel>
              <CarouselContent>
                {postEditorModalStore.imageUrls?.map(url => (
                  <CarouselItem key={url} className='basis-2/5'>
                    <div className='relative w-full h-48'>
                      <Image
                        src={url}
                        alt='이미지 미리보기'
                        fill
                        unoptimized
                        className='rounded-sm object-cover'
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          )}

        {/* 포스트 생성시 활용 */}
        {images.length > 0 && (
          <Carousel>
            <CarouselContent>
              {images.map((img, index) => (
                <CarouselItem key={index} className='basis-2/5'>
                  <div className='relative w-full h-48'>
                    <Image
                      src={img.previewUrl}
                      alt='이미지 미리보기'
                      fill
                      unoptimized
                      className='rounded-sm object-cover'
                    />
                    {/* 삭제 아이콘 및 기능 추가 */}
                    <div
                      onClick={() => handleDeleteImage(img)}
                      className='absolute top-0 right-0 m-1 cursor-pointer rounded-full bg-black/30 p-1'
                    >
                      <XIcon className='w-4 h-4 text-white' />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}

        {/* 편집 상태에서는 이미지 추가 안함 */}
        {postEditorModalStore.isOpen &&
          postEditorModalStore.type === 'CREATE' && (
            <Button
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
              variant='outline'
              className='cursor-pointer'
            >
              <ImageIcon /> 이미지 추가
            </Button>
          )}

        <Button
          disabled={isPending}
          onClick={handleSavePost}
          className='cursor-pointer'
        >
          저장
        </Button>
      </DialogContent>
    </Dialog>
  );
}
