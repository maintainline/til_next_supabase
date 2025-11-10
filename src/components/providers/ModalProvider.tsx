'use client';

import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import PostEditorModal from '../modal/PostEditorModal';

export default function ModalProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {createPortal(
        <PostEditorModal />,
        document.getElementById('modal-root')!
      )}
      {children}
    </>
  );
}
