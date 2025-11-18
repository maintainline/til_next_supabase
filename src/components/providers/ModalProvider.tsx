'use client';
import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import PostEditorModal from '../modal/PostEditorModal';
import AleartModal from '../modal/AlertModal';
import ProfileEditorModal from '../profile/ProfileEditorModal';

export default function ModalProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {createPortal(
        <>
          <PostEditorModal />
          <AleartModal />
          <ProfileEditorModal />
        </>,
        document.getElementById('modal-root')!
      )}
      {children}
    </>
  );
}
