# SCSS

## 1. 설치

```bash
npm install sass
```

## 2. 기본적인 구조

### 2.1. `src/styles 폴더` 생성

### 2.2. `src/styles/valiables.scss 파일` 생성

- SCSS 변수들의 모음
- 색상, 타이포그래피, 간격, 브레이크 포인트 등

```scss
// SCSS Variables
$primary-color: #3b82f6;
$secondary-color: #64748b;
$success-color: #10b981;
$warning-color: #f59e0b;
$error-color: #ef4444;

// Typography
$font-family-base:
  'Inter',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  Roboto,
  sans-serif;
$font-size-base: 16px;
$font-size-sm: 14px;
$font-size-lg: 18px;
$font-size-xl: 20px;

// Spacing
$spacing-xs: 0.25rem;
$spacing-sm: 0.5rem;
$spacing-md: 1rem;
$spacing-lg: 1.5rem;
$spacing-xl: 2rem;
$spacing-2xl: 3rem;

// Breakpoints
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
$breakpoint-2xl: 1536px;

// Border radius
$border-radius-sm: 0.25rem;
$border-radius-md: 0.375rem;
$border-radius-lg: 0.5rem;
$border-radius-xl: 0.75rem;

// Shadows
$shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
$shadow-md:
  0 4px 6px -1px rgb(0 0 0 / 0.1),
  0 2px 4px -2px rgb(0 0 0 / 0.1);
$shadow-lg:
  0 10px 15px -3px rgb(0 0 0 / 0.1),
  0 4px 6px -4px rgb(0 0 0 / 0.1);
```

### 2.3. `src/styles/mixins.scss 파일` 생성

- 재사용 가능한 믹스인(함수) 들
- `@include 믹스인이름`

```scss
// SCSS Mixins

// Flexbox mixins
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@mixin flex-column {
  display: flex;
  flex-direction: column;
}

// Responsive mixins
@mixin mobile {
  @media (max-width: #{$breakpoint-sm - 1px}) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: #{$breakpoint-sm}) and (max-width: #{$breakpoint-md - 1px}) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: #{$breakpoint-md}) {
    @content;
  }
}

@mixin large-desktop {
  @media (min-width: #{$breakpoint-lg}) {
    @content;
  }
}

// Button mixins
@mixin button-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: $border-radius-md;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: none;
  outline: none;

  &:focus {
    outline: 2px solid $primary-color;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@mixin button-primary {
  @include button-base;
  background-color: $primary-color;
  color: white;

  &:hover:not(:disabled) {
    background-color: darken($primary-color, 10%);
  }
}

@mixin button-secondary {
  @include button-base;
  background-color: transparent;
  color: $primary-color;
  border: 1px solid $primary-color;

  &:hover:not(:disabled) {
    background-color: $primary-color;
    color: white;
  }
}

// Card mixins
@mixin card {
  background-color: white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-md;
  padding: $spacing-lg;
}

// Text mixins
@mixin text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin text-multiline-truncate($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### 2.4. `src/styles/components.scss 파일` 생성

- 컴포넌트 샘플에 적용할 scss 파일

```scss
// SCSS Components
@import 'variables';
@import 'mixins';

// Button Components
.btn {
  @include button-base;
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-base;

  &--primary {
    @include button-primary;
  }

  &--secondary {
    @include button-secondary;
  }

  &--large {
    padding: $spacing-md $spacing-lg;
    font-size: $font-size-lg;
  }

  &--small {
    padding: $spacing-xs $spacing-sm;
    font-size: $font-size-sm;
  }
}

// Card Component
.card {
  @include card;

  &__header {
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-md;
    border-bottom: 1px solid #e5e7eb;
  }

  &__title {
    font-size: $font-size-xl;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  &__content {
    color: #6b7280;
    line-height: 1.6;
  }

  &__footer {
    margin-top: $spacing-md;
    padding-top: $spacing-md;
    border-top: 1px solid #e5e7eb;
    @include flex-between;
  }
}

// Form Components
.form-group {
  margin-bottom: $spacing-md;

  &__label {
    display: block;
    margin-bottom: $spacing-xs;
    font-weight: 500;
    color: #374151;
  }

  &__input {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    border: 1px solid #d1d5db;
    border-radius: $border-radius-md;
    font-size: $font-size-base;
    transition: border-color 0.2s ease-in-out;

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    &--error {
      border-color: $error-color;
    }
  }

  &__error {
    margin-top: $spacing-xs;
    color: $error-color;
    font-size: $font-size-sm;
  }
}

// Navigation Component
.nav {
  @include flex-between;
  padding: $spacing-md 0;
  border-bottom: 1px solid #e5e7eb;

  &__brand {
    font-size: $font-size-xl;
    font-weight: 700;
    color: $primary-color;
    text-decoration: none;
  }

  &__menu {
    @include flex-center;
    gap: $spacing-lg;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__link {
    color: #6b7280;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease-in-out;

    &:hover {
      color: $primary-color;
    }

    &--active {
      color: $primary-color;
    }
  }
}

// Responsive adjustments
@include mobile {
  .nav {
    flex-direction: column;
    gap: $spacing-md;

    &__menu {
      flex-direction: column;
      gap: $spacing-sm;
    }
  }

  .card {
    padding: $spacing-md;
  }
}
```

### 2.5. `src/styles/main.scss 파일` 생성

- 메인 scss 파일

```scss
// Main SCSS file
@import 'variables';
@import 'mixins';
@import 'components';

// Global styles
* {
  box-sizing: border-box;
}

html {
  font-size: $font-size-base;
  line-height: 1.6;
}

body {
  font-family: $font-family-base;
  color: #1f2937;
  background-color: #f9fafb;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// Typography
h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0 0 $spacing-md 0;
  font-weight: 600;
  line-height: 1.2;
}

h1 {
  font-size: 2.5rem;

  @include mobile {
    font-size: 2rem;
  }
}

h2 {
  font-size: 2rem;

  @include mobile {
    font-size: 1.75rem;
  }
}

h3 {
  font-size: 1.5rem;
}

h4 {
  font-size: 1.25rem;
}

h5 {
  font-size: 1.125rem;
}

h6 {
  font-size: 1rem;
}

p {
  margin: 0 0 $spacing-md 0;
}

a {
  color: $primary-color;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

// Utility classes
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-md;

  @include mobile {
    padding: 0 $spacing-sm;
  }
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.mb-0 {
  margin-bottom: 0;
}
.mb-1 {
  margin-bottom: $spacing-xs;
}
.mb-2 {
  margin-bottom: $spacing-sm;
}
.mb-3 {
  margin-bottom: $spacing-md;
}
.mb-4 {
  margin-bottom: $spacing-lg;
}
.mb-5 {
  margin-bottom: $spacing-xl;
}

.mt-0 {
  margin-top: 0;
}
.mt-1 {
  margin-top: $spacing-xs;
}
.mt-2 {
  margin-top: $spacing-sm;
}
.mt-3 {
  margin-top: $spacing-md;
}
.mt-4 {
  margin-top: $spacing-lg;
}
.mt-5 {
  margin-top: $spacing-xl;
}

.p-0 {
  padding: 0;
}
.p-1 {
  padding: $spacing-xs;
}
.p-2 {
  padding: $spacing-sm;
}
.p-3 {
  padding: $spacing-md;
}
.p-4 {
  padding: $spacing-lg;
}
.p-5 {
  padding: $spacing-xl;
}

// Grid system
.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -#{$spacing-sm};
}

.col {
  flex: 1;
  padding: 0 $spacing-sm;

  &-1 {
    flex: 0 0 8.333333%;
  }
  &-2 {
    flex: 0 0 16.666667%;
  }
  &-3 {
    flex: 0 0 25%;
  }
  &-4 {
    flex: 0 0 33.333333%;
  }
  &-6 {
    flex: 0 0 50%;
  }
  &-8 {
    flex: 0 0 66.666667%;
  }
  &-9 {
    flex: 0 0 75%;
  }
  &-12 {
    flex: 0 0 100%;
  }
}

@include mobile {
  .col {
    flex: 0 0 100%;
    margin-bottom: $spacing-md;
  }
}
```

## 3. `src/app/global.scss 파일` 생성

- 글로벌 스타일 : global.css 에서 변환함

```scss
@import '../styles/main.scss';
@import 'tailwindcss';

/* 기본 스타일 */
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html {
  scroll-behavior: smooth;
  overflow-x: hidden;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans), system-ui, sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

## 4. SCSS 테스트해 보기

- `src/components/TestComponent.tsx 파일 생성`

```tsx
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
```

- `src/app/layout.tsx` 변경

```tsx
import './globals.scss'; // 변경
```
