# Next.js 프로젝트 생성

## 1. 프로젝트 생성

```bash
npx create-next-app@latest .
```

## 2. 프로젝트 생성 옵션

```bash
√ Which linter would you like to use? » ESLint
√ Would you like to use Tailwind CSS? ... Yes
√ Would you like your code inside a `src/` directory? ... Yes
√ Would you like to use App Router? (recommended) ... Yes
√ Would you like to use Turbopack? (recommended) ... No
√ Would you like to customize the import alias (`@/*` by default)? ... Yes
√ What import alias would you like configured? ... @/*
```

## 3. Tailwind 환경 설정

- package.json 에서 `tailwind 버전` 확인
- 아래 처럼 버전이 최신 `4.x` 버전 확인

```json
 "tailwindcss": "^4",
```

### 3.1. `postcss.config.mjs` 설정 확인

```mjs
const config = {
  plugins: ['@tailwindcss/postcss'],
};

export default config;
```

### 3.2. `tailwind.config.ts` 파일 생성

- Tailwind 경로 및 Theme 설정, Plugin 추가, Dark Mode, CSS 변수 연결

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  // 1. 컨텐츠 경로: Tailwind가 클래스를 찾을 파일 경로
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 2. 커스텀 색상: CSS 변수와 연결된 색상 정의
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      // 3. 커스텀 폰트: 프로젝트에서 사용할 폰트 패밀리 정의
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  // 4. 플러그인: 추가 기능을 위한 플러그인 배열
  plugins: [],
};

export default config;
```

### 3.3. global.css 설정

- Next.js 의 모든 컴포넌트들이 참조하는 글로벌 css
- `/src/app/global.css` 업데이트
- 반드시 `@import 는 css 첫줄`이여야 함.
- tailwind 4.x 버전이므로 `@import "tailwindcss";`

```css
@import 'tailwindcss';

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

## 4. Prettier 설정

- Prettier 는 코드 포맷터로, 일관된 코드 스타일을 자동으로 유지함.

### 4.1. 설치

- `Prettier - Code formatter 설치` 확장프로그램 필요

```bash
npm install --save-dev prettier
```

### 4.2. `/.prettierrc 파일` 생성

- 포멧팅 규칙 정의 설정

```json
{
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "trailingComma": "es5",
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 80,
  "endOfLine": "lf",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "htmlWhitespaceSensitivity": "css",
  "jsxSingleQuote": true,
  "proseWrap": "preserve",
  "embeddedLanguageFormatting": "auto",
  "singleAttributePerLine": false
}
```

### 4.3. `/.prettierignore 파일` 생성

- 포멧팅에서 제외할 파일들을 명시함.

```txt
# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build outputs
.next/
out/
build/
dist/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Generated files
*.min.js
*.min.css
*.bundle.js
*.bundle.css

# Documentation
CHANGELOG.md
LICENSE
# README.md

# Config files that should not be formatted
*.config.js
*.config.mjs
*.config.ts
```

### 4.4. 명령어로 포멧팅을 한번에 실행하도록 스크립트 작성(선택)

- `package.json`에 Script 추가

```json
"scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "format:staged": "prettier --write --ignore-unknown"
  }
```

## 5. ESLint 설정

- 코드 품질 검사 도구

### 5.1. `eslint.config.mjs` 설정

```mjs
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

// Prettier 플러그인 추가
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    plugins: {
      prettier: eslintPluginPrettier, //  Prettier 플러그인 추가
    },
    rules: {
      ...eslintConfigPrettier.rules, //  Prettier와 충돌하는 ESLint 규칙 비활성화
      'prettier/prettier': ['warn', { endOfLine: 'auto' }], //  Prettier 스타일을 강제 적용 (오류 발생 시 ESLint에서 표시)
      '@typescript-eslint/no-unused-vars': 'warn', //  기존 TypeScript 규칙 유지
      '@typescript-eslint/no-explicit-any': 'off', //  any 타입 사용 허용
    },
  },
];

export default eslintConfig;
```

### 5.2. Prettier 와 ESLint 통합 설정

- ESLint 와 Prettier 충돌 하지 않도록 설정

```bash
npm install --save-dev eslint-config-prettier
npm install --save-dev eslint-plugin-prettier
```

## 6. VSCode 설정 관리

- `/.vscode 폴더` 생성
- `/.vscode/settings.json` 파일 생성

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

# shadcn/ui 사용

- https://ui.shadcn.com

## 1. 설치

```bash
npx shadcn@latest init
```

## 2. 버튼 사용해 보기

- https://ui.shadcn.com/docs/components/button

### 2.1. 버튼 설치

```bash
npx shadcn@latest add button
```

### 2.2. 활용하기

- `src/components/ButtonTest.tsx 파일` 생성

```tsx
import { Button } from './ui/button';

const ButtonTest = () => {
  return (
    <div>
      <Button>Click me</Button>
      <Button variant='outline'>Click me</Button>
      <Button variant='destructive'>Click me</Button>
      <Button variant='secondary'>Click me</Button>
      <Button variant='ghost'>Click me</Button>
      <Button variant='link'>Click me</Button>
    </div>
  );
};

export default ButtonTest;
```

- `src/app/page.tsx`

```tsx
import ButtonTest from '@/components/ButtonTest';

export default function Home() {
  return (
    <div>
      <ButtonTest />
    </div>
  );
}
```
