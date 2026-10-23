export type BlockType = "period" | "moment";

export type SubtitleStyle = "classic" | "minimal" | "serif";
export type BgmKey = "none" | "piano" | "acoustic" | "strings";
export type VoiceKey = "none" | "female-calm" | "male-warm" | "female-bright" | "own";

export interface Photo {
  id: string;
  src: string; // /api/files/<projectId>/<file>  (실제 파일: public/uploads/<projectId>/<file>)
  year?: string;
  people?: string;
  place?: string;
  caption: string;
  order: number;
  /** image-to-video로 만든 짧은 클립 (2차). 있으면 렌더에서 사진 대신 이 클립을 쓴다 */
  motionSrc?: string;
}

export interface Block {
  id: string;
  catalogId: string | null;
  type: BlockType;
  title: string;
  approxYear?: string;
  description: string;
  prompts: string[];
  photos: Photo[];
  /**
   * 이 블록에서 "살아 움직이는 사진"으로 지정한 사진 id (블록당 하나).
   * 1차: 지정만 저장. 2차: image-to-video로 짧은 클립을 만들어 Photo.motionSrc에 저장.
   */
  motionPhotoId?: string | null;
}

export interface StyleOptions {
  subtitle: SubtitleStyle;
  bgm: BgmKey;
  /** 음성 내레이션. 1차에서는 선택값만 저장하고 영상에는 적용하지 않는다 */
  voice?: VoiceKey;
  aspect: "16:9";
}

export interface RenderRecord {
  id: string;
  createdAt: string;
  status: "done" | "failed";
  outputPath?: string;
  error?: string;
}

export interface Project {
  id: string;
  title: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  blocks: Block[];
  style: StyleOptions;
  renders: RenderRecord[];
}

export const MAX_PHOTOS_PER_BLOCK = 5;
/** 사진 한 줄 설명 글자 수 상한 (선택 입력) */
export const PHOTO_CAPTION_MAX = 120;
export const RECOMMENDED_MAX_BLOCKS = 12;

export const DEFAULT_STYLE: StyleOptions = {
  subtitle: "classic",
  bgm: "piano",
  voice: "none",
  aspect: "16:9",
};

export const VOICE_OPTIONS: { key: VoiceKey; label: string; desc: string; available: boolean }[] = [
  { key: "none", label: "없음", desc: "자막으로만 이야기를 전합니다", available: true },
  { key: "female-calm", label: "차분한 여성", desc: "낮고 또박또박한 내레이터 톤", available: false },
  { key: "male-warm", label: "따뜻한 남성", desc: "다큐멘터리 같은 느린 톤", available: false },
  { key: "female-bright", label: "밝은 여성", desc: "가볍고 환한 톤", available: false },
  { key: "own", label: "본인 목소리", desc: "녹음 샘플로 목소리를 만듭니다 (동의 필요)", available: false },
];

export const SUBTITLE_STYLES: { key: SubtitleStyle; label: string; desc: string }[] = [
  { key: "classic", label: "클래식", desc: "하단 중앙, 반투명 띠 위 고딕체" },
  { key: "minimal", label: "미니멀", desc: "좌하단, 띠 없이 그림자만" },
  { key: "serif", label: "명조", desc: "하단 중앙, 명조체로 차분하게" },
];

export const BGM_OPTIONS: { key: BgmKey; label: string; desc: string; file: string | null }[] = [
  { key: "piano", label: "잔잔한 피아노", desc: "기본값. 따뜻한 가족 이야기에 맞습니다", file: "bgm/piano.mp3" },
  { key: "acoustic", label: "어쿠스틱 기타", desc: "밝고 소박한 분위기", file: "bgm/acoustic.mp3" },
  { key: "strings", label: "현악", desc: "서정적이고 묵직한 분위기", file: "bgm/strings.mp3" },
  { key: "none", label: "없음", desc: "배경음악 없이", file: null },
];
