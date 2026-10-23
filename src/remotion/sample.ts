import type { Project } from "@/lib/types";

/** Remotion Studio에서 템플릿을 확인하기 위한 예시 데이터 */
export const SAMPLE_PROJECT: Project = {
  id: "sample",
  title: "나의 이야기",
  ownerName: "김영희",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  style: { subtitle: "classic", bgm: "none", aspect: "16:9" },
  renders: [],
  blocks: [
    {
      id: "b1",
      catalogId: "childhood",
      type: "period",
      title: "소년기",
      approxYear: "1960년대",
      description: "부산 영도의 작은 골목에서 자랐습니다. 바다가 보이는 언덕이 우리 놀이터였습니다.",
      prompts: [],
      photos: [],
    },
    {
      id: "b2",
      catalogId: "happiest",
      type: "moment",
      title: "가장 행복했던 때",
      approxYear: "1989",
      description: "첫째가 태어나던 날, 병원 복도에서 들은 울음소리를 아직도 기억합니다.",
      prompts: [],
      photos: [],
    },
    {
      id: "b3",
      catalogId: "legacy",
      type: "moment",
      title: "남기고 싶은 말",
      description: "얘들아, 엄마는 너희가 있어서 행복했다.",
      prompts: [],
      photos: [],
    },
  ],
};
