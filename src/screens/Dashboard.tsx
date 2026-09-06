import { useEffect, useMemo, useState } from "react";
import { useData, type AdminState } from "../store";
import type { Navigate } from "../types";
import { Icon, NeuButton, NeuCard, ProgressBar, ScreenShell, Stars, Stripe } from "../ui";

type Subject = AdminState["subjects"][number];

const studySlogans = [
  "Sẵn sàng cho buổi ôn hôm nay",
  "Mỗi câu đúng, thêm tự tin",
  "Ôn chắc kiến thức, thi thật tốt",
  "Tiến bộ nhỏ, kết quả lớn",
];

/* ------------------------------------------------------------------ */
/* Header                                                               */
/* ------------------------------------------------------------------ */

function HeaderBar({ query, onQueryChange }: { query: string; onQueryChange: (value: string) => void }) {
  return (
    <header className="flex justify-start xl:justify-end">
      <div className="flex items-center">
        <label className="flex w-full items-center gap-2 rounded-full border-[2.5px] border-ink bg-surface px-4 py-2.5 shadow-hard-sm transition-shadow focus-within:shadow-hard sm:w-72">
          <Icon name="search" size={20} className="shrink-0 text-faint" />
          <input
            type="search"
            value={query}
            onChange={event => onQueryChange(event.currentTarget.value)}
            placeholder="Tìm kiếm môn học..."
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-faint"
          />
        </label>
      </div>
    </header>
  );
}

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
  const [sloganIndex, setSloganIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setSloganIndex(index => (index + 1) % studySlogans.length), 4200);
    return () => window.clearInterval(timer);
  }, []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter(subject => subject.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <ScreenShell>
      <section className="mb-8 pt-8">
        <div className="flex items-start justify-between gap-6 xl:gap-12">
          <div className="max-w-xl">
            <p key={sloganIndex} className="item-enter mb-3 inline-flex items-center gap-1.5 rounded-full bg-surface2 px-3 py-1 text-xs font-extrabold text-muted">
              <Icon name="wb_sunny" size={15} filled className="text-yellow-deep" />
              {studySlogans[sloganIndex]}
            </p>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink md:text-4xl">Chào bạn, Minh! <span className="inline-block origin-bottom-right animate-[wiggle_2.8s_ease-in-out_infinite]">👋</span></h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">Chọn một môn học để tiếp tục ôn thi Lý luận chính trị & Pháp luật.</p>
          </div>
          <HeaderBar query={query} onQueryChange={setQuery} />
        </div>
      </section>


      {/* Subjects — the focus */}
      <section>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="flex items-center gap-2 text-xl font-extrabold text-ink">
            <Icon name="menu_book" size={24} filled className="text-cyan-deep" />
            Học phần của bạn
            <span className="rounded-full border-2 border-ink bg-yellow px-2.5 py-0.5 text-xs font-extrabold text-ink">{filtered.length}</span>
          </h3>
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
