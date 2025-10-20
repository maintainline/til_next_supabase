# SCSS 설치 및 테스트

## 1. 설치

```bash
npm install sass
```

## 2. Next.js 설정 업데이트

- `next.config.ts` 업데이트

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: ['./src/styles'],
  },
};

export default nextConfig;
```

## 3. SCSS 파일 구조 생성

### 3.1. `/src/styles 폴더` 생성

- 파일들은 `_를 활용해서 css 파일이 생성되지 않도록` 함.

### 3.2. `/src/styles/_variables.scss` 생성

- 색상, 간격, breakpoint 변수들 배치

```scss
// SCSS Mixins
@use 'variables' as *;

// Media queries
@mixin mobile {
  @media (max-width: #{$mobile - 1px}) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: #{$tablet}) and (max-width: #{$desktop - 1px}) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: #{$desktop}) {
    @content;
  }
}

@mixin large-desktop {
  @media (min-width: #{$large-desktop}) {
    @content;
  }
}

// Flexbox utilities
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

// Button styles

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
}

@mixin button-primary {
  @include button-base;
  background-color: $primary-color;
  color: white;

  &:hover {
    background-color: darken($primary-color, 10%);
  }
}

@mixin button-secondary {
  @include button-base;
  background-color: transparent;
  color: $primary-color;
  border: 1px solid $primary-color;

  &:hover {
    background-color: $primary-color;
    color: white;
  }
}

// Card styles
@mixin card {
  background: white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-md;
  padding: $spacing-lg;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

// Text utilities
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

### 3.3. `/src/styles/_mixins.scss` 생성

- 마치 함수처럼 재활용을 위한 내용
- 버튼, 카드, 반응형 등의 믹스인 내용
- scss 의 import 방식이 변화됨(`@import 가 Deprecated 됨` - 구식 버전)
- scss 의 import 방식이 변화됨(`@use 가 추천됨` - 최신 버전)

```scss
@use 'variables' as *;

// 반응형 믹스인
@mixin mobile {
  @media (max-width: #{$mobile - 1px}) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: #{$tablet}) and (max-width: #{$desktop - 1px}) {
    @content;
  }
}

// Flexbox 유틸리티
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

// 버튼 스타일
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
}

@mixin button-primary {
  @include button-base;
  background-color: $primary-color;
  color: white;

  &:hover {
    background-color: darken($primary-color, 10%);
  }
}

// 카드 스타일
@mixin card {
  background: white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-md;
  padding: $spacing-lg;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
```

### 3.4. `/src/app/globals.scss 파일` 생성

- 전역 스타일

```scss
// Import SCSS variables and mixins
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

@use 'tailwindcss';

@plugin "tailwindcss-animate";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## 4. SCSS 적용

- `/src/app/layout.tsx` 업데이트

```tsx
import './globals.scss';
```

### 4.1. SCSS 테스트 파일

- `/src/components/SCSSTest.tsx 파일` 생성

```tsx
import styles from './SCSSTest.module.scss';

export default function SCSSTest() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>SCSS 테스트 컴포넌트</h2>
      <p className={styles.description}>
        이 컴포넌트는 SCSS 모듈을 사용하여 스타일링됩니다.
      </p>
      <div className={styles.buttonGroup}>
        <button className={styles.primaryButton}>Primary Button</button>
        <button className={styles.secondaryButton}>Secondary Button</button>
      </div>
      <div className={styles.card}>
        <h3>SCSS 카드</h3>
        <p>이 카드는 SCSS 믹스인을 사용하여 스타일링되었습니다.</p>
      </div>
    </div>
  );
}
```

- `/src/components/SCSSTest.module.scss 파일` 생성

```scss
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.container {
  padding: $spacing-lg;
  max-width: 800px;
  margin: 0 auto;

  @include mobile {
    padding: $spacing-md;
  }
}

.title {
  color: $primary-color;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: $spacing-md;

  @include mobile {
    font-size: 1.5rem;
  }
}

.description {
  color: $text-color;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: $spacing-lg;
}

.buttonGroup {
  @include flex-center;
  gap: $spacing-md;
  margin-bottom: $spacing-xl;

  @include mobile {
    @include flex-column;
    gap: $spacing-sm;
  }
}

.primaryButton {
  @include button-primary;
  padding: $spacing-sm $spacing-lg;
}

.secondaryButton {
  @include button-secondary;
  padding: $spacing-sm $spacing-lg;
}

.card {
  @include card;

  h3 {
    color: $primary-color;
    margin-bottom: $spacing-sm;
    font-size: 1.25rem;
  }

  p {
    color: $text-color;
    line-height: 1.6;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
    transition: all 0.2s ease-in-out;
  }
}
```

### 4.2. 컴포넌트 출력 테스트

- `/src/app/page.tsx` 업데이트

```tsx
import ButtonTest from '@/components/ButtonTest';
import SCSSTest from '@/components/SCSSTest';

export default function Home() {
  return (
    <div>
      <ButtonTest />
      <SCSSTest />
    </div>
  );
}
```
