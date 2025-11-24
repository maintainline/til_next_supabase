
## 3. 성능 최적화

### 3.1. Sitemap 타입 에러 수정
- `src/app/sitemap.ts`에서 `lastModified` 속성에 `null` 값이 들어갈 수 있는 문제를 해결했습니다.
- `created_at`이 `null`일 경우 `undefined`로 처리하여 타입 안정성을 확보했습니다.

### 3.2. 이미지 최적화 (`PostItem.tsx`)
- 기존 `img` 태그를 Next.js의 `Image` 컴포넌트로 교체했습니다.
- `fill`, `sizes`, `priority` 속성을 사용하여 이미지 로딩 성능을 개선하고 레이아웃 시프트를 방지했습니다.
- 반응형 사이즈(`sizes`)를 적용하여 디바이스 크기에 맞는 최적의 이미지를 로드하도록 설정했습니다.
