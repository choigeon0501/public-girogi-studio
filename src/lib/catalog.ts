import type { BlockType } from "./types";

export interface CatalogBlock {
  id: string;
  type: BlockType;
  title: string;
  /** 블록 선택 화면에 보여줄 한 줄 */
  hint: string;
  /** 입력 화면의 가이드 질문 */
  prompts: string[];
  /** 기본으로 켜 둘지 */
  defaultOn: boolean;
  /** 자동 정렬용 대략적 인생 위치 (0~100) */
  position: number;
}

/**
 * 고정 블록 카탈로그.
 * - 데이터 구조는 period/moment 동일. 템플릿·톤만 다르다.
 * - 나중에 DB 테이블로 옮기기 쉽도록 배열 상수로 둔다.
 */
export const CATALOG: CatalogBlock[] = [
  // ───── 시기 블록 ─────
  {
    id: "infancy", type: "period", title: "유아기", position: 2, defaultOn: true,
    hint: "태어난 곳, 부모님이 들려준 어린 시절",
    prompts: ["어디에서 태어나셨나요?", "부모님이 자주 들려주신 어릴 적 이야기가 있나요?", "집은 어떤 모습이었나요?"],
  },
  {
    id: "childhood", type: "period", title: "소년기", position: 10, defaultOn: true,
    hint: "초등학교, 동네 친구, 놀던 골목",
    prompts: ["가장 친했던 친구는 누구였나요?", "학교 가는 길은 어땠나요?", "그 시절 가장 좋아하던 놀이는요?"],
  },
  {
    id: "teen", type: "period", title: "청소년기", position: 18, defaultOn: false,
    hint: "중·고등학교, 꿈, 좋아하던 것",
    prompts: ["그때 꿈은 무엇이었나요?", "기억에 남는 선생님이 있나요?", "방과 후엔 무엇을 하셨나요?"],
  },
  {
    id: "youth", type: "period", title: "청년기", position: 26, defaultOn: true,
    hint: "스무 살 무렵, 세상에 처음 나서던 때",
    prompts: ["스무 살의 나는 어떤 사람이었나요?", "그때 가장 하고 싶었던 일은요?"],
  },
  {
    id: "college", type: "period", title: "대학 시절", position: 30, defaultOn: false,
    hint: "전공, 동아리, 캠퍼스의 기억",
    prompts: ["무엇을 공부하셨나요?", "가장 기억에 남는 수업이나 활동은요?"],
  },
  {
    id: "military", type: "period", title: "군 복무", position: 33, defaultOn: false,
    hint: "입대, 전우, 휴가 나오던 날",
    prompts: ["어디에서 복무하셨나요?", "가장 힘들었던 순간과 가장 웃겼던 순간은요?"],
  },
  {
    id: "first-job", type: "period", title: "첫 직장", position: 38, defaultOn: false,
    hint: "첫 출근, 첫 상사, 첫 실수",
    prompts: ["첫 출근 날을 기억하시나요?", "그 일은 어떻게 시작하게 되셨나요?"],
  },
  {
    id: "career", type: "period", title: "직장 생활", position: 45, defaultOn: true,
    hint: "일하며 보낸 긴 세월",
    prompts: ["어떤 일을 하셨나요?", "일하면서 가장 보람 있었던 때는요?", "함께 일한 사람 중 기억나는 분이 있나요?"],
  },
  {
    id: "marriage", type: "period", title: "결혼", position: 50, defaultOn: true,
    hint: "결혼식, 신혼, 둘이 시작한 살림",
    prompts: ["결혼식 날은 어땠나요?", "신혼 시절 살던 집은요?"],
  },
  {
    id: "children", type: "period", title: "자녀", position: 58, defaultOn: true,
    hint: "아이가 태어나고 자라던 시간",
    prompts: ["아이가 태어난 날을 기억하시나요?", "아이를 키우며 가장 기뻤던 순간은요?"],
  },
  {
    id: "midlife", type: "period", title: "중년", position: 70, defaultOn: false,
    hint: "40대, 50대의 나",
    prompts: ["그 시절 가장 큰 고민은 무엇이었나요?", "그때 나를 지탱해 준 것은요?"],
  },
  {
    id: "senior", type: "period", title: "60대 이후", position: 85, defaultOn: false,
    hint: "은퇴, 손주, 새로 시작한 것",
    prompts: ["은퇴 후 하루는 어떻게 보내시나요?", "요즘 가장 즐거운 일은요?"],
  },
  {
    id: "now", type: "period", title: "지금의 나", position: 95, defaultOn: true,
    hint: "오늘의 일상과 생각",
    prompts: ["요즘 어떻게 지내시나요?", "지금 가장 소중한 것은 무엇인가요?"],
  },

  // ───── 순간 블록 ─────
  {
    id: "happiest", type: "moment", title: "가장 행복했던 때", position: 60, defaultOn: true,
    hint: "언제였나요? 그날로 돌아가 본다면",
    prompts: ["언제, 어디서였나요?", "누구와 함께였나요?", "왜 그 순간이 가장 행복했나요?"],
  },
  {
    id: "first-love", type: "moment", title: "첫사랑", position: 22, defaultOn: false,
    hint: "처음 누군가를 좋아했던 기억",
    prompts: ["어떻게 만났나요?", "그 사람의 어떤 점이 좋았나요?"],
  },
  {
    id: "met-spouse", type: "moment", title: "배우자를 처음 만난 날", position: 47, defaultOn: false,
    hint: "첫 만남, 첫인상",
    prompts: ["어디서 처음 만났나요?", "첫인상은 어땠나요?"],
  },
  {
    id: "first-salary", type: "moment", title: "첫 월급", position: 39, defaultOn: false,
    hint: "그 돈으로 무엇을 했나요?",
    prompts: ["첫 월급은 얼마였나요?", "그 돈으로 무엇을 하셨나요?"],
  },
  {
    id: "first-home", type: "moment", title: "처음 내 집", position: 55, defaultOn: false,
    hint: "내 이름으로 된 첫 집",
    prompts: ["어디에 있는 집이었나요?", "이사하던 날 기분은요?"],
  },
  {
    id: "hardest", type: "moment", title: "가장 힘들었던 시기", position: 65, defaultOn: false,
    hint: "그래도 지나온 시간",
    prompts: ["무슨 일이 있었나요?", "어떻게 견디셨나요?", "그 시간이 남긴 것은요?"],
  },
  {
    id: "mentor", type: "moment", title: "인생을 바꾼 사람", position: 35, defaultOn: false,
    hint: "그분이 없었다면",
    prompts: ["그분은 누구인가요?", "어떤 말이나 행동이 나를 바꿨나요?"],
  },
  {
    id: "trip", type: "moment", title: "잊지 못할 여행", position: 62, defaultOn: false,
    hint: "다시 가고 싶은 그곳",
    prompts: ["어디로, 누구와 갔나요?", "가장 기억에 남는 장면은요?"],
  },
  {
    id: "legacy", type: "moment", title: "남기고 싶은 말", position: 99, defaultOn: true,
    hint: "이 영상을 볼 사람에게",
    prompts: ["누구에게 남기고 싶은가요?", "꼭 전하고 싶은 한마디는요?"],
  },
];

export const PERIOD_BLOCKS = CATALOG.filter((b) => b.type === "period");
export const MOMENT_BLOCKS = CATALOG.filter((b) => b.type === "moment");

export function findCatalog(id: string | null): CatalogBlock | undefined {
  if (!id) return undefined;
  return CATALOG.find((b) => b.id === id);
}
