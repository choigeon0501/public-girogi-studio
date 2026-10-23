# 기로기 스튜디오 · 사진으로 만드는 이야기 영상

**현재 메인 흐름 (체험판 껍데기, DB·AI 없음)** — `/`
컨셉 선택 → 사진 최대 30장(움직이는 사진 5장, 사진마다 설명, 드래그 순서) → 자막·음악·음성 → AI 정리(규칙 기반 구성안) → 영상 추출(진행 화면 + 미리보기)

- 모든 상태는 브라우저 localStorage(`girogi:studio`)에만 저장됩니다. 서버 API를 호출하지 않습니다.
- `src/lib/concepts.ts` 컨셉 카탈로그, `src/lib/studio.ts` 상태, `src/lib/studioPlan.ts` 'AI 정리' 규칙, `src/components/studio/*` 화면.
- 나중에 실제 AI를 붙일 자리: `buildOutline()` 하나. 출력 형태(Outline)만 지키면 화면은 그대로.

**이전 흐름 (블록 기반 영상 자서전)** — `/autobiography` 에 남겨 두었습니다. 파일 저장소·MP4 렌더 포함. 전체 계획은 [PLAN.md](./PLAN.md).

## 실행

```bash
npm install
npm run dev                      # http://localhost:3002
```

| 명령 | 설명 |
|---|---|
| `npm run dev` | 웹 (위자드 5단계) |
| `npm run remotion` | Remotion Studio — 영상 템플릿을 예시 데이터로 확인 |
| `npm run render -- <projectId>` | CLI 렌더 → `out/<projectId>_<renderId>.mp4` |
| `npm run typecheck` | 타입 검사 |

## 흐름

1. `/` 에서 새 자서전 만들기 → 기본 블록이 채워진 프로젝트 생성
2. **블록 고르기** — 시기/순간 블록 켜고 끄기, 직접 추가, 순서·이름·시기 편집
3. **사진·이야기** — 블록당 사진 ≤5장, 이야기 1문단, 사진별 한 줄
4. **구성안 확인** — 영상과 동일한 장면 순서·자막을 글로 보고 수정
5. **스타일** — 자막 3종, 배경음악 4종(파일은 `public/bgm/`에 직접 추가)
6. **영상 만들기** — 브라우저 미리보기(Remotion Player) → MP4 렌더 → 다운로드

## 구조

- `src/lib/catalog.ts` — 블록 카탈로그(고정값). 여기만 고치면 블록이 늘어난다.
- `src/lib/scenes.ts` — `Project → Scene[]`. 구성안 화면과 영상이 같은 함수를 쓴다.
- `src/remotion/` — 영상 템플릿. `npm run remotion`으로 디자인 확인.
- `src/lib/store.ts` — 파일 저장소(`data/projects/*.json`, `public/uploads/`). 2차에서 DB/S3로 교체.
- `src/app/api/` — projects / upload / render.

## 알아둘 것

- 렌더는 1차에서 **동기 실행**입니다. 사진 수에 따라 수 분 걸립니다. 2차에서 큐로 옮깁니다.
- 배경음악 파일이 없으면 자동으로 무음으로 렌더됩니다.
- 한글 폰트는 시스템 폰트를 씁니다(Pretendard/Apple SD Gothic Neo/나눔명조). 서버 렌더 환경에 폰트가 없으면 `@remotion/google-fonts`로 교체하세요.

## Vercel에 올리기

### A. 체험판(데모) — 설정 없음
그냥 Import → Deploy 하면 됩니다. Blob 토큰이 없으면 **데모 모드**가 자동으로 켜져서
프로젝트·사진이 **보는 사람의 브라우저(localStorage)에만** 저장됩니다. 서버 저장소가 필요 없고, 플로우 전체와 미리보기가 동작합니다.
(사진은 브라우저에서 긴 변 1280px로 줄여 저장. 브라우저 저장 한도 약 5MB → 사진 30~40장 정도)

### B. 서버 저장 (Blob)

Vercel 서버리스에는 파일을 쓸 수 없으므로 저장소를 **Vercel Blob**으로 바꿔 동작합니다. MP4 서버 렌더는 비활성(미리보기 플레이어는 동작).

1. GitHub 저장소를 Vercel에 Import (Framework: Next.js, 기본 설정 그대로)
2. 프로젝트 → **Storage → Create → Blob** 으로 Blob 스토어 하나 연결  
   → `BLOB_READ_WRITE_TOKEN` 환경변수가 자동으로 들어가고, 앱이 이를 감지해 Blob 저장소를 씁니다
3. Redeploy

로컬 개발은 토큰이 없으면 자동으로 파일 저장소(`data/`, `public/uploads/`)를 씁니다.
로컬에서도 Blob을 쓰려면 `vercel env pull .env.local` 로 토큰을 받아오면 됩니다.

| 환경 | 저장소 | MP4 렌더 |
|---|---|---|
| 로컬 / 일반 서버 | 파일 | 가능 |
| Vercel | Blob | 불가 (미리보기만) |
