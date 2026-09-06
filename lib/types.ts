export interface ApiPost {
  id: string;
  board_id: string;
  emotion_id: string | null;
  text: string;
  nickname: string | null;
  status: "published" | "pending" | "hidden";
  created_at: number;
  reaction_heart: number;
  reaction_idea: number;
  reaction_surprise: number;
}

export interface ApiBoard {
  id: string;
  kind: "main" | "extra";
  emoji: string;
  title: string;
  question: string;
  accent: string;
  count: number;
  requiresApproval: boolean;
}
