import ParticipateFlow from "@/components/ParticipateFlow";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step: stepParam } = await searchParams;
  const step = stepParam === "board" ? "board" : "intro";
  return <ParticipateFlow initialStep={step} />;
}
