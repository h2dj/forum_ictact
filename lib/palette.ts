// 포스트잇 카드 색상 팔레트. Tailwind가 클래스를 정적으로 인식할 수 있도록
// 조합 문자열을 미리 다 적어둡니다(동적 템플릿 문자열 금지).
export const CARD_STYLES: Record<
  string,
  { bg: string; border: string; chip: string; text: string; dot: string }
> = {
  rose: {
    bg: "bg-rose-50",
    border: "border-rose-200/80",
    chip: "bg-rose-100 text-rose-700",
    text: "text-rose-900",
    dot: "bg-rose-400",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200/80",
    chip: "bg-amber-100 text-amber-700",
    text: "text-amber-900",
    dot: "bg-amber-400",
  },
  sky: {
    bg: "bg-sky-50",
    border: "border-sky-200/80",
    chip: "bg-sky-100 text-sky-700",
    text: "text-sky-900",
    dot: "bg-sky-400",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200/80",
    chip: "bg-emerald-100 text-emerald-700",
    text: "text-emerald-900",
    dot: "bg-emerald-400",
  },
  violet: {
    bg: "bg-violet-50",
    border: "border-violet-200/80",
    chip: "bg-violet-100 text-violet-700",
    text: "text-violet-900",
    dot: "bg-violet-400",
  },
  fuchsia: {
    bg: "bg-fuchsia-50",
    border: "border-fuchsia-200/80",
    chip: "bg-fuchsia-100 text-fuchsia-700",
    text: "text-fuchsia-900",
    dot: "bg-fuchsia-400",
  },
};

export const PALETTE_KEYS = Object.keys(CARD_STYLES);

export function paletteFor(index: number) {
  const key = PALETTE_KEYS[index % PALETTE_KEYS.length];
  return CARD_STYLES[key];
}
