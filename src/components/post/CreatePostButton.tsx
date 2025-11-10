'use client';
import { useOpenPostEditorModal } from '@/stores/postEditorModalStore';
import { PlusCircle } from 'lucide-react';

export function CreatePostButton() {
  const openPostEditorModal = useOpenPostEditorModal();
  return (
    <div
      onClick={openPostEditorModal}
      className='bg-muted text-muted-foreground cursor-pointer rounded-xl px-6 py-4'
    >
      <div className='flex items-center justify-between'>
        <div>새글을 등록하세요.</div>
        <PlusCircle className='h-5 w-5' />
      </div>
    </div>
  );
}
