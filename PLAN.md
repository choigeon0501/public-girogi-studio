# 기로기 스튜디오 · 영상 자서전 MVP 계획

작성일: 2026-10-23
상태: 1차 MVP (AI 생성 요소 제외, 고정값 기반)

---

## 1. 한 줄 정의

사용자가 **인생 블록(시기·순간)을 고르고**, 블록마다 **사진 최대 5장과 설명**을 적으면,
고정 템플릿으로 **챕터 구조의 영상 자서전(MP4)** 을 만들어 주는 서비스.

1차에서는 LLM·TTS·이미지 생성·AI 보정을 모두 제외한다.
내레이션은 사용자가 쓴 글이 **자막**으로 들어가고, 음악은 **내장 BGM**에서 고른다.

---

## 2. 사용자 플로우 (4화면 + 결과) — 2026-10-23 구성안 단계 제외

| 단계 | 화면 | 사용자가 하는 일 | 산출물 |
|---|---|---|---|
| 1 | 블록 고르기 | 시기 블록·순간 블록을 켜고 끄기, 직접 블록 추가 | `blocks[]` (type, title, order) |
| 2 | 사진·설명 입력 | 블록별 사진 ≤5장 업로드, 블록 설명 1문단, 사진별 한 줄(시기/인물/장소/설명) | `photos[]`, `description` |
| 3 | 스타일 선택 | 자막 스타일 / 배경음악 / (음성은 1차 제외) | `style` |
| 4 | 미리보기·생성 | 브라우저 미리보기(=구성안 역할) → 렌더 요청 | MP4 |
| 5 | 수정 | 사진·문구 수정 후 재렌더 (횟수 제한은 운영 정책) | MP4 v2… |

> 구성안(글로 보는 장면 목록) 단계는 1차에서 뺐다. 미리보기 플레이어가 그 역할을 한다. 수정 비용이 문제가 되면 다시 넣는다.

### 핵심 원칙
- 수정은 2단계 글에서 하고 미리보기로 확인한다. 렌더 전에 미리보기를 거치는 것이 원칙.
- 기본 블록은 **제안**일 뿐이다. 끄거나 이름을 바꿀 수 있고, 사용자 정의 블록과 동일 구조다.
- 아무것도 고르지 않아도 괜찮은 결과가 나오도록 **기본값**을 둔다 (자막 켬, 잔잔한 BGM).

---

## 3. 블록 카탈로그 (고정값)

두 타입만 존재한다. 데이터 구조는 같고 템플릿·톤만 다르다.

### 시기 블록 `period` — 기간이 있고 사진이 여럿
유아기 · 소년기 · 청소년기 · 청년기 · 대학 시절 · 군 복무 · 첫 직장 · 직장 생활 · 결혼 · 자녀 · 중년 · 60대 이후 · 지금의 나

### 순간 블록 `moment` — 점이고 감정 밀도가 높음
가장 행복했던 때 · 첫사랑 · 배우자를 처음 만난 날 · 첫 월급 · 처음 내 집 · 가장 힘들었던 시기 · 인생을 바꾼 사람 · 잊지 못할 여행 · 남기고 싶은 말

각 블록은 `prompts[]`(가이드 질문 2~3개)를 갖는다. 블록 선택 화면에 첫 질문을 노출해 "고르는 순간 답이 떠오르게" 한다.

카탈로그는 `src/lib/catalog.ts` 한 파일. 나중에 DB 테이블로 옮기기 쉽게 **배열 상수**로 둔다.

---

## 4. 데이터 모델

```ts
Project {
  id, title, ownerName, createdAt, updatedAt,
  blocks: Block[],          // 사용자가 고른 순서대로
  style: StyleOptions,
  renders: RenderRecord[],  // 렌더 이력
}

Block {
  id, catalogId?,            // 카탈로그 기반이면 참조, 커스텀이면 null
  type: 'period' | 'moment',
  title, approxYear?, description,
  photos: Photo[],           // 최대 5
  prompts: string[],
}

Photo {
  id, src,                   // /api/files/<projectId>/<file>
  year?, people?, place?, caption,
  order,
  motionSrc?,                // 2차: image-to-video 클립
}
// Block.motionPhotoId?: 블록당 1장 "살아 움직이는 사진" 지정 (1차: 지정만 저장)

StyleOptions {
  subtitle: 'classic' | 'minimal' | 'serif',
  bgm: 'none' | 'piano' | 'acoustic' | 'strings',
  voice: 'none' | 'female-calm' | 'male-warm' | 'female-bright' | 'own',  // 1차: 선택만 저장
  aspect: '16:9',
}

Scene (파생, 저장하지 않음 — 렌더 직전 Project → Scene[] 변환)
  kind: 'chapter-title' | 'photo' | 'ending'
```

구성안(3단계)은 `description`과 `caption`을 **직접 수정**하는 것으로 처리한다.
별도 "대본" 필드를 두면 원본과 어긋나므로, 1차에서는 원본 = 대본.

---

## 5. 기술 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 웹 | Next.js 16 (App Router) + React 19 + Tailwind 4 | 기존 life-legacy와 동일 스택 |
| 영상 | Remotion 4 (`@remotion/player` 미리보기, `@remotion/renderer` 서버 렌더) | React로 템플릿 작성, JSON props → MP4 |
| 저장 | 파일 시스템 (`data/projects/*.json`, `public/uploads/`) | MVP. 이후 Postgres + S3로 교체 |
| 상태 | 서버 JSON이 단일 진실, 클라이언트는 fetch 후 편집 | 단순성 |
| 렌더 실행 | `npm run render -- <projectId>` CLI + `/api/render` (로컬 동기 실행) | 큐는 2차 |

### 왜 AI 영상 생성이 아닌 템플릿인가
- 사용자의 **실제 사진**이 주인공이다.
- 생성 영상은 얼굴 왜곡·없던 인물 생성 위험이 있어 자서전엔 부적합하다.
- 템플릿은 결정론적이라 수정이 예측 가능하고 비용이 거의 없다.

---

## 6. 영상 템플릿 구조

```
[인트로]  제목 · 이름 · 날짜          3s
[챕터]    타이틀 카드(블록명 · 연도)   2.5s
          사진 1~5장 켄번스 + 자막     각 5s  (설명 길이에 따라 4~7s)
[막간]    순간 블록: 어두운 배경, 느린 줌, 자막 중앙  (period와 템플릿 다름)
[엔딩]    "남기고 싶은 말" 또는 고정 문구   4s
```

- 자막 = 사진 `caption`, 없으면 블록 `description`의 해당 문장.
- BGM은 전체에 깔고 막간에서 볼륨 -6dB.
- 30fps, 1920×1080.

---

## 7. 디렉터리

```
girogi-studio/
├── PLAN.md
├── README.md
├── package.json
├── next.config.ts · tsconfig.json · postcss.config.mjs
├── remotion.config.ts
├── data/projects/            # JSON 저장 (git 제외)
├── public/
│   ├── uploads/              # 업로드 사진 (git 제외)
│   └── bgm/                  # 내장 BGM (피아노/어쿠스틱/스트링)
├── src/
│   ├── app/
│   │   ├── page.tsx                      # 프로젝트 목록·새로 만들기
│   │   ├── p/[id]/step/[n]/page.tsx      # 위자드 1~5
│   │   └── api/
│   │       ├── projects/route.ts         # GET 목록 / POST 생성
│   │       ├── projects/[id]/route.ts    # GET / PUT
│   │       ├── upload/route.ts           # POST 사진
│   │       └── render/route.ts           # POST 렌더
│   ├── components/wizard/                # 각 단계 UI
│   ├── lib/
│   │   ├── catalog.ts                    # 블록 카탈로그 (고정값)
│   │   ├── types.ts
│   │   ├── store.ts                      # 파일 기반 저장소
│   │   └── scenes.ts                     # Project → Scene[] 변환 (단일 소스)
│   └── remotion/
│       ├── Root.tsx                      # Composition 등록
│       ├── Autobiography.tsx             # 메인 컴포지션
│       ├── scenes/                       # Intro / ChapterTitle / PhotoScene / Interlude / Ending
│       └── index.ts                      # registerRoot
└── scripts/render.ts                     # CLI 렌더
```

---

## 8. 구현 단계

### Phase 1 — 이번 작업 범위 ✅
1. 스캐폴딩, 카탈로그, 타입, 파일 저장소
2. 위자드 5화면 (블록 선택 → 입력 → 구성안 → 스타일 → 미리보기)
3. Remotion 템플릿 1종 (period/moment 변형 포함)
4. CLI 렌더 + API 렌더
5. 타입체크·빌드 통과

### Phase 2 — 사전모집 피드백 후
- 사용자 인증 + Postgres + S3
- 렌더 큐(BullMQ) + 진행률 표시
- 블록별 부분 재렌더 → 이어붙이기 (수정 비용 절감)
- 자막 스타일·BGM 샘플 미리듣기 UI 개선
- 관리자 화면(접수 사진 매칭, 렌더 재시도)

### Phase 3 — AI 요소 (각각 토글로 추가)
- TTS 내레이션 (한국어: Clova/타입캐스트/ElevenLabs 비교)
- 사진 보정·컬러화 (Real-ESRGAN, GFPGAN, DDColor) — 원본과 구분 표시 필수
- 사진 없는 블록용 **풍경형** 생성 이미지 (인물 제외, "AI 생성" 표기)
- **살아 움직이는 사진** (image-to-video): 블록당 1장, 사용자가 2단계에서 지정 → 업로드 직후 백그라운드로 5초 클립 생성 → `Photo.motionSrc` 저장 → 렌더에서 켄번스 대신 클립 재생. 실패 시 켄번스로 fallback. 후보: Kling API / Runway / 오픈소스. 프롬프트는 "subtle motion, keep composition" 고정. 결과를 사용자가 끌 수 있는 토글 필요
- LLM 문장 다듬기 (사용자 원문 밖 사실 추가 금지)
- 본인 음성 복제 (동의서 필수)

---

## 9. 열어둔 결정

- 블록 수 상한: 12개 권장 (영상 5~8분). 상한을 강제할지 안내만 할지.
- 순간 블록 사진 상한: 5장 → 2장으로 줄일지 (막간은 짧아야 리듬이 산다).
- 수정 횟수 정책: "렌더 1회 = 수정 1회"로 셀지, 스타일 변경은 제외할지.
- 자막 폰트: 가독성 좋은 한글 무료 폰트(프리텐다드/나눔명조) 중 선택.

---

## 10. 실행

```bash
npm install
npm run dev            # http://localhost:3002
npm run remotion       # Remotion Studio (템플릿 디자인 확인)
npm run render -- <projectId>   # out/<projectId>.mp4
```
