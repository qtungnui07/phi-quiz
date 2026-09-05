import { useState } from "react";
import { useData, type AdminState } from "../store";
import { Icon, NeuButton, ProgressBar, ScreenShell } from "../ui";

type Flashcard = AdminState["flashcards"][number];

type Rating = "unlearned" | "learning" | "known";

const ratingConfig: { id: Rating; label: string; icon: string; className: string }[] = [
  { id: "unlearned", label: "Chưa thuộc", icon: "replay", className: "bg-orange text-ink" },
  { id: "learning", label: "Đang học", icon: "school", className: "bg-yellow text-ink" },
  { id: "known", label: "Đã thuộc", icon: "check_circle", className: "bg-green text-ink" },
];

function CardFace({
  tag,
  bgClass,
  stripClass,
  title,
  bullets,
  isFlipped,
  flipHint,
}: {
  tag: string;
  bgClass: string;
  stripClass: string;
  title: string;
  bullets?: string[];
  isFlipped: boolean;
  flipHint?: string;
}) {
  return (
    <div
      className={[
        "absolute inset-0 flex flex-col overflow-hidden rounded-3xl border-[2.5px] border-ink",
        "backface-hidden",
        isFlipped ? "rotate-y-180" : "",
        bgClass,
      ].join(" ")}
    >
      <div className={`h-4 w-full border-b-[2.5px] border-ink ${stripClass}`} />
      <div className="flex flex-1 flex-col p-6 md:p-10">
        <span className="w-max rounded-full border-[2.5px] border-ink bg-surface2 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-muted">
          {tag}
        </span>
        <div className="flex flex-1 flex-col justify-center">
          <h3 className="text-center text-xl font-extrabold leading-snug text-ink md:text-2xl">{title}</h3>
          {flipHint && <p className="mt-4 text-center text-sm font-medium italic text-muted">{flipHint}</p>}
          {bullets && (
            <ul className="mt-5 flex flex-col gap-3">
              {bullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-2 rounded-2xl border-2 border-ink bg-surface p-3 text-sm font-bold text-ink shadow-hard-sm">
                  <Icon name="check_circle" size={18} filled className="mt-0.5 shrink-0 text-green" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function Flashcards({ onBack, subjectId }: { onBack: () => void; subjectId: string }) {
  void subjectId;
  const { flashcards, activeSubject } = useData();
  const subject = activeSubject;
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<string, Rating>>({});

  const card: Flashcard = flashcards[index]!;
  const total = flashcards.length;
  const ratedCount = Object.keys(ratings).length;
  const knownCount = flashcards.filter(item => ratings[item.id] === "known").length;
  const learningCount = flashcards.filter(item => ratings[item.id] === "learning").length;
  const unlearnedCount = flashcards.filter(item => ratings[item.id] === "unlearned").length;

  const next = () => {
    setFlipped(false);
    setIndex(previous => (previous + 1) % total);
  };

  const previous = () => {
    setFlipped(false);
    setIndex(previous => (previous - 1 + total) % total);
  };

  const rate = (rating: Rating) => {
    setRatings(previous => ({ ...previous, [card.id]: rating }));
    next();
  };

  const progress = Math.round(((index + 1) / total) * 100);

  return (
    <ScreenShell className="flex max-w-4xl flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="pressable inline-flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-surface px-5 py-2.5 text-sm font-bold text-ink shadow-hard"
        >
          <Icon name="arrow_back" size={20} />
          <span className="hidden md:inline">Quay lại</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-[2.5px] border-ink bg-cyan">
            <Icon name="style" size={24} filled className="text-ink" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-ink">{subject?.name ?? "Triết học Mác - Lênin"}</h2>
            <p className="text-sm text-muted">Chương 1: Khái luận về Triết học Mác - Lênin</p>
          </div>
        </div>
        <div className="rounded-2xl border-[2.5px] border-ink bg-surface2 px-4 py-2">
          <span className="text-sm font-extrabold text-ink">Thẻ {index + 1}/{total}</span>
          <div className="mt-2 h-2 w-24 overflow-hidden rounded-full border-[2px] border-ink bg-surface">
            <div className="h-full border-r-[2.5px] border-ink bg-cyan" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Flip card */}
      <div className="perspective-1000 relative h-[480px] w-full cursor-pointer md:h-[500px]" onClick={() => setFlipped(previous => !previous)}>
        <div className={`preserve-3d relative h-full w-full rounded-3xl shadow-hard transition-transform duration-700 ${flipped ? "rotate-y-180" : ""}`}>
          <CardFace
            tag="Câu hỏi"
            bgClass="bg-surface"
            stripClass="bg-cyan"
            title={card.front}
            isFlipped={false}
            flipHint="Chạm vào thẻ để lật"
          />
          <CardFace tag="Trả lời" bgClass="bg-cyan/15" stripClass="bg-cyan-deep" title={card.back} bullets={card.bullets} isFlipped={true} />
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <NeuButton tone="white" className="px-6" onClick={previous}>
          <Icon name="arrow_back" size={20} />
          <span className="hidden md:inline">Quay lại</span>
        </NeuButton>
        <NeuButton tone="yellow" className="px-8" onClick={() => setFlipped(previous => !previous)}>
          <Icon name="flip" size={20} />
          Lật thẻ
        </NeuButton>
        <NeuButton tone="cyan" className="px-6" onClick={next}>
          <span className="hidden md:inline">Kế tiếp</span>
          <Icon name="arrow_forward" size={20} />
        </NeuButton>
      </div>

      {/* Rating */}
      <div className="mx-auto mt-8 w-full max-w-2xl rounded-3xl border-[2.5px] border-ink bg-surface p-5 shadow-hard">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-extrabold uppercase tracking-wider text-faint">Đánh giá mức độ thuộc</span>
          <span className="text-xs font-bold text-muted">{ratedCount}/{total} thẻ đã đánh giá</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {ratingConfig.map(config => (
            <NeuButton key={config.id} tone="white" className={`px-4 ${config.className}`} onClick={() => rate(config.id)}>
              <Icon name={config.icon} size={18} filled />
              {config.label}
            </NeuButton>
          ))}
        </div>
      </div>

      <p className="mt-5 text-center text-xs font-bold text-muted">
        {knownCount} thẻ đã thuộc • {learningCount} thẻ đang học • {unlearnedCount} thẻ chưa thuộc
      </p>
    </ScreenShell>
  );
}