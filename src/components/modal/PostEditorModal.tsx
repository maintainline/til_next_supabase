'use client';
import { ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePostEditorModal } from '@/stores/postEditorModalStore';
import { useEffect, useRef, useState } from 'react';

export default function PostEditorModal() {
  const { isOpen, close } = usePostEditorModal();
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // 자동 포커스 및 초기화
  useEffect(() => {
    if (!isOpen) return;
    textareaRef.current?.focus();
    // 내용 비우기
    setContent('');
  }, [isOpen]);

  const handleCloseModal = () => {
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className='max-h-[90vh]'>
        <DialogTitle>포스트 작성</DialogTitle>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          className='max-h-125 min-h-25 focus:outline-none'
          placeholder='새로운 글을 등록해주세요.'
        />
        <Button variant='outline' className='cursor-pointer'>
          <ImageIcon /> 이미지 추가
        </Button>
        <Button className='cursor-pointer'>저장</Button>
      </DialogContent>
    </Dialog>
  );
}
