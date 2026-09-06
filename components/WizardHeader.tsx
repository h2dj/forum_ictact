"use client";

export default function WizardHeader({
  onBack,
  step,
  total,
}: {
  onBack: () => void;
  step?: number;
  total?: number;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <button
        onClick={onBack}
        aria-label="뒤로가기"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-ink/60 transition hover:bg-black/5"
      >
        ‹
      </button>
      {step && total ? (
        <div className="flex flex-1 items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${(step / total) * 100}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-medium tabular-nums text-ink/40">
            {step}/{total}
          </span>
        </div>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}
