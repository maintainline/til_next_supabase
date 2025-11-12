'use client';

import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import PostEditorModal from '../modal/PostEditorModal';
import AleartModal from '../modal/AlertModal';

export default function ModalProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {createPortal(
        <>
          <PostEditorModal />
          <AleartModal />
        </>,
        document.getElementById('modal-root')!
      )}
      {children}
    </>
  );
}
