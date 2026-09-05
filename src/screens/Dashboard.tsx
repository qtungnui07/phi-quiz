import { useMemo, useState } from "react";
import { useData, type AdminState } from "../store";
import type { Navigate } from "../types";
import { Icon, NeuButton, NeuCard, ProgressBar, ScreenShell, Stars, Stripe } from "../ui";

type Subject = AdminState["subjects"][number];

/* ------------------------------------------------------------------ */
/* Header                                                               */
/* ------------------------------------------------------------------ */

function HeaderBar({ query, onQueryChange }: { query: string; onQueryChange: (value: string) => void }) {
  return (
    <div className="flex flex-col gap-4 pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full border-[2.5px] border-ink bg-cyan text-lg font-extrabold text-ink shadow-hard-sm">
          M
        </div>
        <div className="min-w-0">
          <p className="truncate font-extrabold leading-tight text-ink">Nguyễn Nhật Minh</p>
          <p className="text-sm text-muted">Học sinh Vàng · Khoa LLCT & PL</p>
        </div>
      </div>

      <div className="flex flex-1 items-center gap-3 lg:max-w-md lg:justify-end">
        <label className="flex flex-1 items-center gap-2 rounded-full border-[2.5px] border-ink bg-surface px-5 py-3 shadow-hard transition-shadow focus-within:shadow-hard">
          <Icon name="search" size={22} className="text-faint" />
          <input
            type="search"
            value={query}
            onChange={event => onQueryChange(event.currentTarget.value)}
            placeholder="Tìm kiếm môn học..."
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-faint"
          />
        </label>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full border-2 border-ink bg-ink px-3 py-2 text-xs font-bold text-surface sm:inline-flex">
          <Icon name="workspace_premium" size={16} filled />
          Cấp 42
        </span>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full border-2 border-ink bg-orange px-3 py-2 text-xs font-bold text-ink shadow-hard-sm sm:inline-flex">
          <Icon name="local_fire_department" size={16} filled />
          14 ngày
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Daily challenge (compact banner)                                     */
/* ------------------------------------------------------------------ */

function DailyChallenge() {
  return (
    <section className="mb-8 flex items-center justify-between gap-4 rounded-3xl border-[2.5px] border-ink bg-yellow px-6 py-5 shadow-hard">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-surface shadow-hard-sm">
          <Icon name="local_fire_department" size={24} filled className="text-orange" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-ink">Thử thách ngày</p>
          <p className="truncate text-sm font-medium text-ink/80">
            Hoàn thành <span className="font-extrabold text-ink">30 câu</span> • nhận 500 XP + 1 huy hiệu
          </p>
        </div>
      </div>
      <div className="hidden items-center gap-3 sm:flex">
        <div className="relative h-4 w-36 overflow-hidden rounded-full border-[2.5px] border-ink bg-surface">
          <div className="absolute inset-y-0 left-0 rounded-full border-r-[2.5px] border-ink bg-orange" style={{ width: "40%" }} />
        </div>
        <span className="text-sm font-extrabold text-ink">12/30</span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Quick mode pills                                                     */
/* ------------------------------------------------------------------ */

function QuickModes({ onNavigate }: { onNavigate: Navigate }) {
  const { activeSubject } = useData();
  const modes: { label: string; icon: string; tone: "cyan" | "yellow" | "green" | "ink"; route: Parameters<Navigate>[0] }[] = [
    { label: "Thi thử ngẫu nhiên", icon: "bolt", tone: "cyan", route: { name: "quiz", variant: "list" } },
    { label: "Làm bài trắc nghiệm", icon: "quiz", tone: "yellow", route: { name: "quiz", variant: "grid" } },
    { label: "Học Flashcard", icon: "style", tone: "green", route: { name: "flashcard", subjectId: activeSubject!.id } },
    { label: "Bảng xếp hạng", icon: "leaderboard", tone: "ink", route: { name: "leaderboard" } },
  ];
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-extrabold uppercase tracking-wider text-faint">Chế độ ôn:</span>
      {modes.map(mode => (
        <button
          key={mode.label}
          type="button"
          onClick={() => onNavigate(mode.route)}
          className={`pressable inline-flex items-center gap-1.5 rounded-full border-[2.5px] border-ink shadow-hard-sm ${tone(mode.tone)}`}
        >
          <Icon name={mode.icon} size={16} filled />
          {mode.label}
        </button>
      ))}
    </div>
  );
}

const tone = (t: "cyan" | "yellow" | "green" | "ink") =>
  t === "cyan" ? "bg-cyan text-ink" : t === "yellow" ? "bg-yellow text-ink" : t === "green" ? "bg-green text-ink" : "bg-ink text-surface";

/* ------------------------------------------------------------------ */
/* Subject card                                                         */
/* ------------------------------------------------------------------ */

function SubjectCard({ subject, onOpen, delay }: { subject: Subject; onOpen: () => void; delay: number }) {
  return (
    <NeuCard className="group item-enter flex cursor-pointer flex-col overflow-hidden" style={{ animationDelay: `${delay}ms` }} press onClick={onOpen}>
      <Stripe color={subject.stripe} />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-extrabold leading-snug text-ink">{subject.name}</h3>
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[2.5px] border-ink ${subject.accent}`}>
            <Icon name={subject.icon} size={24} filled />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs font-bold text-muted">
          <span className="inline-flex items-center gap-1">
            <Icon name="quiz" size={15} />
            {subject.totalQuestions} câu
          </span>
          <span className="inline-flex items-center gap-1">
            <Stars value={subject.rating} size={15} />
            <span>{subject.ratingLabel}</span>
          </span>
          <span className="ml-auto rounded-full border-2 border-ink bg-surface2 px-2 py-0.5 text-[10px] font-extrabold uppercase text-muted">
            {subject.code}
          </span>
        </div>
        <div className="mt-auto flex flex-col gap-2 pt-5">
          <div className="flex items-end justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-faint">Tiến độ</span>
            <span className="text-lg font-extrabold text-ink">{subject.progress}%</span>
          </div>
          <ProgressBar value={subject.progress} color="bg-cyan" />
        </div>
        <NeuButton tone={subject.progress > 0 ? "cyan" : "white"} className="mt-3 w-full" onClick={onOpen}>
          {subject.progress > 0 ? "Tiếp tục học" : "Bắt đầu học"}
          <Icon name="arrow_forward" size={18} />
        </NeuButton>
      </div>
    </NeuCard>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                            */
/* ------------------------------------------------------------------ */

export function Dashboard({ onNavigate }: { onNavigate: Navigate }) {
  const { subjects } = useData();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter(subject => subject.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <ScreenShell>
      <HeaderBar query={query} onQueryChange={setQuery} />

      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink md:text-3xl">Chào bạn, Minh! 👋</h1>
          <p className="mt-1 text-sm text-muted">Chọn một môn học để tiếp tục ôn thi Lý luận chính trị & Pháp luật.</p>
        </div>
        <QuickModes onNavigate={onNavigate} />
      </div>

      <DailyChallenge />

      {/* Subjects — the focus */}
      <section>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="flex items-center gap-2 text-xl font-extrabold text-ink">
            <Icon name="menu_book" size={24} filled className="text-cyan-deep" />
            Học phần của bạn
            <span className="rounded-full border-2 border-ink bg-yellow px-2.5 py-0.5 text-xs font-extrabold text-ink">{filtered.length}</span>
          </h3>
          <button
            type="button"
            onClick={() => onNavigate({ name: "library" })}
            className="pressable text-sm font-extrabold text-cyan-deep underline-offset-4 hover:underline"
          >
            Thư viện
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((subject, index) => (
            <SubjectCard key={subject.id} subject={subject} delay={index * 60} onOpen={() => onNavigate({ name: "subject", subjectId: subject.id })} />
          ))}
        </div>

        {filtered.length === 0 && (
          <NeuCard className="p-10 text-center text-muted">
            <Icon name="search_off" size={40} className="mx-auto mb-3 text-faint" />
            Không tìm thấy môn học nào với từ khóa "{query}".
          </NeuCard>
        )}
      </section>
    </ScreenShell>
  );
}