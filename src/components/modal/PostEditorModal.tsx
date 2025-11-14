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

type ImageFile = {
  file: File;
  previewUrl: string;
};

export default function PostEditorModal() {
  // 사용자 정보 받아오기
  const session = useSession();

  // 경고창
  const openAlertModal = useOpenAlertModal();

  const { isOpen, close } = usePostEdiotorModal();
  // 글등록 mutation 을 사용함.
  const { mutate: createPost, isPending: isCreatePostPending } = useCreatePost({
    onSuccess: () => {
      close();
    },
    onError: error => {
      toast.error('포스트 생성에 실패했습니다.', {
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
    if (!isOpen) return;

    // 웹브라우저의 캐시에 저장된 이미지 리셋
    images.forEach(img => {
      // 메모리 상에서 제거
      URL.revokeObjectURL(img.previewUrl);
    });

    textareaRef.current?.focus();
    setContent('');
    setImages([]);
  }, [isOpen]);

  const handleCloseModal = () => {
    if (content !== '' || images.length !== 0) {
      // 안내창을 띄워서 확인후 닫기 실행처리
      openAlertModal({
        title: '포스트 작성이 완료되지 않았습니다.',
        description: '화면에서 나가면 작성중이던 내용이 사라집니다.',
        onPositive: () => {
          close();
        },
        onNegative: () => {
          console.log('취소 확인');
        },
      });
      return;
    }
    close();
  };

  // 실제 포스트 등록하기
  const handleCreatePost = () => {
    if (content.trim() === '') return;
    // createPost(content);
    createPost({
      content: content,
      userId: session!.user.id,
      // 파일만 추출해 주기
      images: images.map(item => item.file),
    });
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

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className='max-h-[90vh]'>
        <DialogTitle>포스트 작성</DialogTitle>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          disabled={isCreatePostPending}
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

        {/* 이미지 미리보기 슬라이드 */}
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

        <Button
          onClick={() => fileInputRef.current?.click()}
          variant='outline'
          className='cursor-pointer'
        >
          <ImageIcon /> 이미지 추가
        </Button>

        <Button
          disabled={isCreatePostPending}
          onClick={handleCreatePost}
          className='cursor-pointer'
        >
          저장
        </Button>
      </DialogContent>
    </Dialog>
  );
}
