import type { BgmKey, SubtitleStyle, VoiceKey } from "./types";

/**
 * 컨셉 카탈로그 (고정값).
 * 컨셉은 영상의 톤·기본 스타일·'AI 정리'가 쓰는 챕터 틀을 정한다.
 */
export interface Concept {
  id: string;
  title: string;
  subtitle: string;
  /** 카드 배경·타이틀 카드 색 */
  palette: { from: string; to: string; ink: string };
  /** 기본 스타일 */
  defaults: { subtitle: SubtitleStyle; bgm: BgmKey; voice: VoiceKey };
  /** 'AI 정리'가 사진을 나눠 담을 챕터 이름 틀 (앞에서부터 사용) */
  chapters: string[];
  /** 제목 후보 틀. {name} 치환 */
  titles: string[];
  /** 분위기 한 줄 */
  mood: string;
  /** 사진 설명 placeholder 예시 */
  hint: string;
}

export const CONCEPTS: Concept[] = [
  {
    id: "first-birthday",
    title: "돌잔치",
    subtitle: "태어나서 첫 생일까지, 열두 달의 기록",
    palette: { from: "#fde9d9", to: "#f6c9b0", ink: "#6b3a22" },
    defaults: { subtitle: "classic", bgm: "piano", voice: "female-bright" },
    chapters: ["세상에 온 날", "처음 웃던 날들", "무럭무럭", "첫 생일을 앞두고", "고마운 사람들"],
    titles: ["{name}의 첫 번째 생일", "{name}, 세상에 온 지 일 년", "열두 달의 {name}"],
    mood: "밝고 포근하게, 웃음소리가 들릴 듯하게",
    hint: "예: 태어난 지 100일 되던 날, 할머니가 처음 안아 주셨어요.",
  },
  {
    id: "wedding",
    title: "결혼 · 프로포즈",
    subtitle: "두 사람이 만나 하나의 이야기가 되기까지",
    palette: { from: "#f7e6ec", to: "#e9c3d0", ink: "#6b2b45" },
    defaults: { subtitle: "serif", bgm: "strings", voice: "male-warm" },
    chapters: ["처음 만난 날", "함께 걸어온 길", "우리가 좋아하는 것들", "약속", "앞으로의 우리"],
    titles: ["{name}, 우리의 이야기", "처음부터 지금까지", "{name}에게"],
    mood: "서정적이고 느리게, 마지막에 벅차오르게",
    hint: "예: 비 오는 날 우산 하나로 걷던 그날, 처음 손을 잡았어요.",
  },
  {
    id: "travel",
    title: "여행",
    subtitle: "떠났던 길, 만났던 풍경, 돌아온 마음",
    palette: { from: "#dff0ee", to: "#b7dcd6", ink: "#1f5a52" },
    defaults: { subtitle: "minimal", bgm: "acoustic", voice: "none" },
    chapters: ["출발", "낯선 거리에서", "그곳의 사람들", "가장 좋았던 순간", "돌아오는 길"],
    titles: ["{name}의 여행", "길 위에서", "{name}, 그 여름의 기록"],
    mood: "가볍고 경쾌하게, 햇살이 느껴지게",
    hint: "예: 새벽 기차를 놓치고 걸어간 길에서 이 풍경을 만났어요.",
  },
  {
    id: "70th",
    title: "칠순 · 팔순 잔치",
    subtitle: "한평생을 담아 드리는 가족의 선물",
    palette: { from: "#f3ead8", to: "#dcc7a1", ink: "#5a4320" },
    defaults: { subtitle: "serif", bgm: "piano", voice: "female-calm" },
    chapters: ["젊은 날", "가정을 이루고", "자식을 키우며", "함께한 세월", "오늘, 그리고 감사"],
    titles: ["{name}의 칠십 년", "고맙습니다, {name}", "{name}, 당신의 계절"],
    mood: "따뜻하고 담담하게, 울컥하지만 밝게 끝나게",
    hint: "예: 1975년 첫 월급으로 어머니께 사 드린 외투를 입고 찍은 사진이에요.",
  },
  {
    id: "anniversary",
    title: "생일 · 기념일",
    subtitle: "한 사람을 축하하는 짧고 환한 영상",
    palette: { from: "#fff3d6", to: "#f7dc9a", ink: "#6a4a08" },
    defaults: { subtitle: "classic", bgm: "acoustic", voice: "female-bright" },
    chapters: ["당신은 이런 사람", "함께한 순간들", "고마운 일들", "축하해요"],
    titles: ["{name}, 생일 축하해요", "{name}에게 보내는 영상 편지", "오늘의 주인공, {name}"],
    mood: "밝고 빠르게, 축하 분위기",
    hint: "예: 작년 생일에 몰래 준비한 케이크, 초를 불기도 전에 웃음이 터졌죠.",
  },
  {
    id: "graduation",
    title: "졸업 · 입학",
    subtitle: "한 시절을 마치고 다음으로 가는 날",
    palette: { from: "#e6ecf7", to: "#c2d0ea", ink: "#263f6b" },
    defaults: { subtitle: "classic", bgm: "piano", voice: "none" },
    chapters: ["시작", "매일의 풍경", "함께한 사람들", "성장", "다음 장으로"],
    titles: ["{name}의 졸업", "{name}, 한 시절의 끝과 시작", "잘 자랐다, {name}"],
    mood: "뿌듯하고 산뜻하게",
    hint: "예: 입학식 날 교문 앞, 긴장한 표정이 지금 보니 귀엽네요.",
  },
  {
    id: "pet",
    title: "반려동물",
    subtitle: "함께 산 나날을 기억하기 위해",
    palette: { from: "#efe9df", to: "#d8cbb5", ink: "#4f3f2a" },
    defaults: { subtitle: "minimal", bgm: "acoustic", voice: "none" },
    chapters: ["처음 만난 날", "우리 집에 익숙해지기", "산책과 낮잠", "가장 사랑스러운 순간", "고마워"],
    titles: ["{name}와 함께한 날들", "{name}", "사랑해, {name}"],
    mood: "포근하고 조용하게",
    hint: "예: 처음 집에 온 날, 구석에서 나오지 않다가 밤에야 무릎에 올라왔어요.",
  },
  {
    id: "memorial",
    title: "추모",
    subtitle: "떠난 분을 기억하는 가족의 영상",
    palette: { from: "#e9e7ee", to: "#c9c5d6", ink: "#3b3550" },
    defaults: { subtitle: "serif", bgm: "strings", voice: "female-calm" },
    chapters: ["그분의 젊은 날", "가족과 함께", "우리가 기억하는 모습", "남겨 주신 것", "고맙습니다"],
    titles: ["{name}을 기억하며", "{name}, 고맙습니다", "{name}의 시간"],
    mood: "차분하고 경건하게, 길게 머물며",
    hint: "예: 매년 명절마다 손수 빚으시던 만두, 이 사진이 마지막 명절이었어요.",
  },
  {
    id: "event",
    title: "행사 · 모임",
    subtitle: "송년회, 워크숍, 동창회의 하루",
    palette: { from: "#e4f0e6", to: "#bcd9c2", ink: "#235233" },
    defaults: { subtitle: "minimal", bgm: "acoustic", voice: "none" },
    chapters: ["모이다", "하이라이트", "사람들", "다음에 또"],
    titles: ["{name}", "{name}, 그날의 기록", "우리의 하루, {name}"],
    mood: "경쾌하고 리듬감 있게",
    hint: "예: 단체 사진 찍기 직전, 누군가 넘어져서 다 같이 웃던 순간.",
  },
  {
    id: "life",
    title: "인생 이야기",
    subtitle: "한 사람의 일대기를 사진으로",
    palette: { from: "#f4efe6", to: "#e0d5c2", ink: "#3b2f24" },
    defaults: { subtitle: "classic", bgm: "piano", voice: "female-calm" },
    chapters: ["어린 시절", "청춘", "일과 가정", "지금의 나", "남기고 싶은 말"],
    titles: ["{name}의 이야기", "{name}, 한 사람의 시간", "나의 이야기"],
    mood: "담담하고 따뜻하게",
    hint: "예: 부산 영도의 골목에서 자랐습니다. 바다가 보이는 언덕이 놀이터였어요.",
  },
];

export function findConcept(id: string | null | undefined) {
  return CONCEPTS.find((c) => c.id === id) ?? null;
}
