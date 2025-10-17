import React from 'react';
import '../styles/main.scss';

interface TestComponentProps {
  title: string;
  description?: string;
}

export default function TestComponent({
  title,
  description,
}: TestComponentProps) {
  return (
    <div className='container'>
      <div className='card'>
        <div className='card__header'>
          <h2 className='card__title'>{title}</h2>
        </div>
        <div className='card__content'>
          {description && <p>{description}</p>}
          <p>이 컴포넌트는 SCSS 스타일을 사용합니다!</p>
        </div>
        <div className='card__footer'>
          <button className='btn btn--primary'>Primary Button</button>
          <button className='btn btn--secondary'>Secondary Button</button>
        </div>
      </div>

      <div className='row mt-4'>
        <div className='col col-6'>
          <div className='card'>
            <h3>반응형 그리드</h3>
            <p>모바일에서는 전체 너비를 차지합니다.</p>
          </div>
        </div>
        <div className='col col-6'>
          <div className='card'>
            <h3>SCSS 믹스인</h3>
            <p>@include를 사용한 스타일 재사용</p>
          </div>
        </div>
      </div>
    </div>
  );
}
