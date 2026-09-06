"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import WizardHeader from "./WizardHeader";
import { EMOTIONS, MAIN_BOARDS, EXTRA_BOARDS, getBoard } from "@/lib/boards";
import { ApiBoard } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const MAX_LEN = 300;

type Step = "intro" | "board" | "emotion" | "text" | "done";

export default function ParticipateFlow({ initialStep = "intro" }: { initialStep?: Step }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialStep);
  const [boardId, setBoardId] = useState<string | null>(null);
  const [emotionId, setEmotionId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [nickname, setNickname] = useState("");
  const [showExtra, setShowExtra] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const { data } = useSWR<{ boards: ApiBoard[] }>("/api/boards", fetcher, {
    refreshInterval: 6000,
  });
  const boards = data?.boards;
  const countFor = (id: string) => boards?.find((b) => b.id === id)?.count ?? 0;
  const selectedBoard = boardId ? getBoard(boardId) : undefined;

  function pickBoard(id: string) {
    setBoardId(id);
    setStep("emotion");
  }

  async function submit() {
    if (!boardId || !text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId, emotionId, text: text.trim(), nickname: nickname.trim() || null }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "잠시 후 다시 시도해주세요.");
        return;
      }
      setPending(!!json.pending);
      setStep("done");
    } catch {
      setError("네트워크 오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetAll() {
    setBoardId(null);
    setEmotionId(null);
    setText("");
    setNickname("");
    setPending(false);
    setError(null);
    setStep("intro");
  }

  const charCount = text.length;

  if (step === "intro") {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-10 pt-8">
        <div className="mb-8 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-[12px] font-medium text-brand-600">
            ✨ 일상을 바꾸는 작은 이야기
          </span>
          <Link href="/board" className="text-[12px] font-medium text-ink/40 hover:text-ink/70">
            게시판 보기 →
          </Link>
        </div>

        <h1 className="text-[32px] font-extrabold leading-tight text-ink">
          오늘의 디지털 수다 <span className="align-middle">💬</span>
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink/60">
          IT와 공익활동에 대한 여러분의 생각을 들려주세요.
          <br />
          다른 사람의 이야기를 먼저 구경해도 좋아요.
        </p>

        <button
          onClick={() => setStep("board")}
          className="mt-7 flex items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-4 text-[16px] font-bold text-white shadow-pop transition active:scale-[0.98]"
        >
          ✨ 내 경험 붙이기
        </button>

        <div className="relative my-9 flex h-24 items-center justify-center">
          <div className="animate-float-y absolute left-6 h-16 w-16 rounded-full bg-rose-200/70" />
          <div className="animate-float-y absolute right-8 h-20 w-20 rounded-full bg-sky-200/70" style={{ animationDelay: "1s" }} />
          <div className="animate-float-y absolute h-14 w-14 rounded-full bg-amber-200/70" style={{ animationDelay: "2s" }} />
          <span className="relative rounded-full bg-white/90 px-4 py-2 text-[13px] font-semibold text-ink/60 shadow-note">
            같이 이야기해요! 💛
          </span>
        </div>

        <h2 className="mb-3 text-[15px] font-bold text-ink/80">지금 어떤 이야기가 올라오고 있나요?</h2>
        <div className="grid grid-cols-3 gap-2">
          {MAIN_BOARDS.map((b) => (
            <button
              key={b.id}
              onClick={() => pickBoard(b.id)}
              className="flex flex-col items-center gap-1 rounded-2xl border border-black/[0.06] bg-white px-2 py-4 text-center shadow-note transition hover:-translate-y-0.5"
            >
              <span className="text-2xl">{b.emoji}</span>
              <span className="text-[12.5px] font-semibold leading-tight text-ink/80">{b.title}</span>
              <span className="text-[11px] text-ink/40">{countFor(b.id)}개의 이야기</span>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-[13px] italic text-ink/40">
          &ldquo;당신의 이야기가 더 나은 변화를 만듭니다.&rdquo;
        </p>

        <div className="mt-auto pt-8 text-center">
          <Link href="/admin" className="text-[11px] text-ink/25 hover:text-ink/50">
            운영자 페이지
          </Link>
        </div>
      </div>
    );
  }

  if (step === "board") {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-10 pt-6">
        <WizardHeader onBack={() => setStep("intro")} />
        <h1 className="text-[24px] font-extrabold text-ink">어떤 이야기를 나눌까요?</h1>
        <p className="mt-1.5 text-[14px] text-ink/50">가장 가까운 주제를 골라주세요.</p>

        <div className="mt-6 flex flex-col gap-3">
          {MAIN_BOARDS.map((b) => (
            <button
              key={b.id}
              onClick={() => pickBoard(b.id)}
              className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 text-left shadow-note transition hover:-translate-y-0.5"
            >
              <span className="text-2xl">{b.emoji}</span>
              <span className="flex-1">
                <span className="block text-[15px] font-bold text-ink">{b.title}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-ink/50">{b.question}</span>
              </span>
              <span className="text-ink/25">›</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowExtra((v) => !v)}
          className="mt-5 text-center text-[13px] font-medium text-brand-600 hover:text-brand-700"
        >
          {showExtra ? "다른 질문 접기 ▲" : "다른 질문도 볼래요 (3개 더보기) ▼"}
        </button>

        {showExtra && (
          <div className="mt-3 flex flex-col gap-2.5">
            {EXTRA_BOARDS.map((b) => (
              <button
                key={b.id}
                onClick={() => pickBoard(b.id)}
                className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white/70 p-3.5 text-left shadow-note transition hover:-translate-y-0.5"
              >
                <span className="text-xl">{b.emoji}</span>
                <span className="flex-1 text-[13.5px] leading-snug text-ink/70">{b.question}</span>
                <span className="text-ink/25">›</span>
              </button>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-[12.5px] text-ink/40">
          정답은 없어요. 지금 떠오르는 이야기를 골라주세요. 🙂
        </p>
      </div>
    );
  }

  if (step === "emotion" && selectedBoard) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-10 pt-6">
        <WizardHeader onBack={() => setStep("board")} step={2} total={4} />
        <h1 className="text-[24px] font-extrabold text-ink">지금, 어떤 마음인가요?</h1>
        <p className="mt-1.5 text-[14px] text-ink/50">가장 가까운 감정을 선택해주세요.</p>

        <div className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1.5 text-[12.5px] font-medium text-ink/55">
          {selectedBoard.emoji} {selectedBoard.title}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {EMOTIONS.map((e) => (
            <button
              key={e.id}
              onClick={() => {
                setEmotionId(e.id);
                setStep("text");
              }}
              className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 text-left shadow-note transition hover:-translate-y-0.5"
            >
              <span className="text-2xl">{e.emoji}</span>
              <span className="text-[15px] font-bold text-ink">{e.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setEmotionId(null);
            setStep("text");
          }}
          className="mt-5 text-center text-[13px] font-medium text-ink/40 hover:text-ink/60"
        >
          감정 선택은 건너뛸게요 →
        </button>
      </div>
    );
  }

  if (step === "text" && selectedBoard) {
    const emotion = EMOTIONS.find((e) => e.id === emotionId);
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-10 pt-6">
        <WizardHeader onBack={() => setStep("emotion")} step={3} total={4} />
        <h1 className="text-[24px] font-extrabold text-ink">왜 그렇게 느꼈나요?</h1>
        <p className="mt-1.5 text-[14px] text-ink/50">한마디만 남겨주세요.</p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.04] px-3 py-1.5 text-[12.5px] font-medium text-ink/55">
            {selectedBoard.emoji} {selectedBoard.title}
          </span>
          {emotion && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.04] px-3 py-1.5 text-[12.5px] font-medium text-ink/55">
              {emotion.emoji} {emotion.label}
            </span>
          )}
        </div>

        <div className="relative mt-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
            placeholder="예) 행사 신청이 너무 복잡해서 몇 번을 포기했어요. 접근이 조금 더 쉬웠으면 좋겠어요!"
            rows={6}
            className="w-full resize-none rounded-2xl border border-black/[0.08] bg-white p-4 text-[15px] leading-relaxed text-ink shadow-note outline-none focus:border-brand-300"
          />
          <span className="absolute bottom-3 right-4 text-[12px] tabular-nums text-ink/30">
            {charCount} / {MAX_LEN}
          </span>
        </div>

        <label className="mt-4 block text-[13px] font-medium text-ink/60">닉네임 (선택)</label>
        <div className="relative mt-1.5">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 20))}
            placeholder="예) 햇살지기"
            className="w-full rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-[14px] text-ink shadow-note outline-none focus:border-brand-300"
          />
          {nickname && (
            <button
              onClick={() => setNickname("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink/60"
              aria-label="닉네임 지우기"
            >
              ✕
            </button>
          )}
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-ink/40">
          이름은 남기지 않아도 됩니다. 사람·단체를 특정할 수 있는 정보는 적지 않아도 괜찮아요.
        </p>

        {selectedBoard.requiresApproval && (
          <p className="mt-2 text-[12px] leading-relaxed text-amber-600">
            이 보드는 운영자 확인 후 게시판에 공개돼요. 조금만 기다려주세요!
          </p>
        )}

        {error && <p className="mt-3 text-[13px] text-rose-500">{error}</p>}

        <p className="mt-6 text-center text-[12.5px] text-ink/40">
          정답은 없어요. 지금 느끼는 그대로를 선택해 주세요. 💙
        </p>

        <button
          onClick={submit}
          disabled={!text.trim() || submitting}
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-4 text-[16px] font-bold text-white shadow-pop transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "붙이는 중..." : "포스트잇 붙이기 →"}
        </button>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl">{pending ? "🕊️" : "🎉"}</div>
        <h1 className="mt-5 text-[22px] font-extrabold text-ink">
          {pending ? "이야기가 도착했어요!" : "포스트잇을 붙였어요!"}
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink/55">
          {pending
            ? "운영자 확인 후 게시판에 공개될 거예요. 소중한 이야기를 나눠주셔서 고마워요."
            : "다른 사람들의 이야기도 구경하고, 공감되는 글엔 하트를 눌러보세요."}
        </p>

        <div className="mt-8 flex w-full flex-col gap-3">
          <button
            onClick={() => router.push("/board")}
            className="rounded-2xl bg-ink px-6 py-4 text-[15px] font-bold text-white shadow-pop"
          >
            게시판 구경하기 →
          </button>
          <button
            onClick={resetAll}
            className="rounded-2xl border border-black/10 bg-white px-6 py-4 text-[15px] font-bold text-ink/70"
          >
            다시 한마디 남기기
          </button>
        </div>
      </div>
    );
  }

  return null;
}
