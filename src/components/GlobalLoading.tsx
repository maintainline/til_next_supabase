import React from 'react';
import Image from 'next/image';
export const GlobalLoading = () => {
  return (
    <div className='bg-muted flex h-[100vh] w-[100vw] flex-col items-center justify-center'>
      <div className='mb-15 flex animate-bounce items-center gap-4'>
        <Image
          src={'/assets/logo.png'}
          alt='SNS'
          className='w-10'
          width={40}
          height={40}
        />
        <div className='text-2xl font-bold'>SNS 서비스</div>
      </div>
    </div>
  );
};
