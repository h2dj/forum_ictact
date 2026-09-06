// 보드(질문) 정의 — 기획안 4장 "질문(보드) 설계" 참고
// 메인 질문 3개 + 추가 질문 3개 구조를 그대로 반영합니다.

export type BoardId = "tough" | "good" | "wish" | "community" | "courage" | "moment";

export interface BoardDef {
  id: BoardId;
  kind: "main" | "extra";
  emoji: string;
  title: string;
  question: string;
  /** 카드/버튼에 쓰이는 보드 강조색 (라이트/다크 공통 토큰) */
  accent: string;
  /**
   * true면 새 글이 즉시 공개되지 않고 운영자 승인 후 게시판에 노출됩니다.
   * 여기 값은 최초 기본값일 뿐이며, 실제로는 관리자 페이지(/admin)에서
   * 보드별로 언제든 켜고 끌 수 있습니다. 어떤 보드를 승인제로 할지는 행사
   * 운영진 협의 후 결정해 관리자 페이지에서 설정하세요.
   */
  requiresApproval: boolean;
}

export const BOARDS: BoardDef[] = [
  {
    id: "tough",
    kind: "main",
    emoji: "😵",
    title: "좀 힘들었어요",
    question: '디지털 때문에 "왜 이렇게까지 해야 해?" 싶었던 순간이 있었나요?',
    accent: "rose",
    requiresApproval: false,
  },
  {
    id: "good",
    kind: "main",
    emoji: "✨",
    title: "이건 좋았어요",
    question: "기술 덕분에 일이 쉬워지거나 가능해진 순간이 있었나요?",
    accent: "amber",
    requiresApproval: false,
  },
  {
    id: "wish",
    kind: "main",
    emoji: "💭",
    title: "이랬으면 좋겠어요",
    question: "기술 걱정이 없다면 내가 해보고 싶은 활동은 무엇인가요?",
    accent: "sky",
    requiresApproval: false,
  },
  {
    id: "community",
    kind: "extra",
    emoji: "🌱",
    title: "우리 지역·단체엔",
    question: "우리 지역사회나 단체가 기술을 더 잘 활용하려면 무엇이 필요할까요?",
    accent: "emerald",
    requiresApproval: false,
  },
  {
    id: "courage",
    kind: "extra",
    emoji: "🤝",
    title: "이런 도움이 있다면",
    question: "디지털이 어렵다고 느끼는 사람에게 어떤 도움이나 용기가 있으면 좋을까요?",
    accent: "violet",
    requiresApproval: false,
  },
  {
    id: "moment",
    kind: "extra",
    emoji: "⚡",
    title: "신기했던 순간",
    question: "요즘 디지털 기술을 쓰며 '신기했다', '재밌었다', '화났다'고 느낀 순간이 있었나요?",
    accent: "fuchsia",
    requiresApproval: false,
  },
];

export const MAIN_BOARDS = BOARDS.filter((b) => b.kind === "main");
export const EXTRA_BOARDS = BOARDS.filter((b) => b.kind === "extra");

export function getBoard(id: string): BoardDef | undefined {
  return BOARDS.find((b) => b.id === id);
}

export interface EmotionDef {
  id: string;
  emoji: string;
  label: string;
}

export const EMOTIONS: EmotionDef[] = [
  { id: "tired", emoji: "😵", label: "지친다" },
  { id: "unsure", emoji: "🤔", label: "잘 모르겠다" },
  { id: "good", emoji: "👍", label: "잘 활용한다" },
  { id: "hopeful", emoji: "✨", label: "가능성을 느낀다" },
  { id: "annoyed", emoji: "😡", label: "불편하다" },
];

export interface ReactionDef {
  id: "heart" | "idea" | "surprise";
  emoji: string;
  label: string;
}

export const REACTIONS: ReactionDef[] = [
  { id: "heart", emoji: "❤️", label: "공감해요" },
  { id: "idea", emoji: "💡", label: "나도 이런 생각" },
  { id: "surprise", emoji: "😮", label: "처음 생각해봤어요" },
];

// 카드 배경은 보드가 아니라 순서에 따라 돌아가며 씁니다.
// (기획안 11장: 여러 색을 쓰되 특정 색 중심으로 쏠리지 않도록)
export const CARD_PALETTE = ["rose", "amber", "sky", "emerald", "violet", "fuchsia"] as const;
