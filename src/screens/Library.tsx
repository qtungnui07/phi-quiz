import { useState } from "react";
import { formatNumber, libraryHps } from "../data";
import { useData } from "../store";
import type { Navigate } from "../types";
import { Icon, NeuButton, NeuCard, ProgressBar, ScreenShell, Stripe } from "../ui";

type FilterId = "all" | "studying" | "completed";

const filters: { id: FilterId; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "studying", label: "Đang học" },
  { id: "completed", label: "Đã hoàn thành" },
];

export function Library({ onNavigate }: { onNavigate: Navigate }) {
  const { subjects } = useData();
  const [filter, setFilter] = useState<FilterId>("all");
  const [year, setYear] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const visible = libraryHps.filter(hp => {
    if (filter === "studying" && hp.progress >= 100) return false;
    if (filter === "completed" && hp.progress < 100) return false;
    return true;
  });

  const linkHpToSubject = (code: string) => {
    const match = subjects.find(subject => subject.code === code);
    if (match) onNavigate({ name: "subject", subjectId: match.id });
  };

  return (
    <ScreenShell fluid>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-ink md:text-4xl">Thư viện của bạn</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Quản lý và theo dõi tiến độ học tập của các học phần và bài kiểm tra bạn đã chọn.
          </p>
        </div>
        <NeuButton tone="cyan" className="px-6">
          <Icon name="add" size={20} filled />
          Tạo thư mục mới
        </NeuButton>
      </div>

      {/* Filters */}
      <div className="mb-8 mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 rounded-full border-[2.5px] border-ink bg-surface p-1 shadow-hard">
          {filters.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`px-5 py-2 text-sm font-extrabold transition ${filter === item.id ? "rounded-full bg-yellow text-ink shadow-hard-sm" : "rounded-full text-muted hover:bg-surface2"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-surface px-4 py-2 text-sm font-bold text-ink shadow-hard-sm">
            <Icon name="filter_list" size={18} className="text-muted" />
            <select
              value={year}
              onChange={event => setYear(event.currentTarget.value)}
              className="cursor-pointer bg-transparent outline-none"
            >
              <option value="">Năm học</option>
              <option value="1">Năm 1</option>
              <option value="2">Năm 2</option>
              <option value="3">Năm 3</option>
            </select>
          </label>
          <label className="flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-surface px-4 py-2 text-sm font-bold text-ink shadow-hard-sm">
            <Icon name="tune" size={18} className="text-muted" />
            <select
              value={difficulty}
              onChange={event => setDifficulty(event.currentTarget.value)}
              className="cursor-pointer bg-transparent outline-none"
            >
              <option value="">Độ khó</option>
              <option value="easy">Cơ bản</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Nâng cao</option>
            </select>
          </label>
        </div>
      </div>

      {/* HP cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((hp, index) => (
          <NeuCard key={hp.id} className="item-enter flex cursor-pointer flex-col overflow-hidden" press onClick={() => linkHpToSubject(hp.code)} style={{ animationDelay: `${index * 60}ms` }}>
            <Stripe color={hp.stripe} />
            <div className="flex flex-1 flex-col p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-[2.5px] border-ink bg-cyan/15 shadow-hard-sm">
                  <Icon name={hp.icon} size={26} filled className="text-ink" />
                </div>
                <button type="button" className="text-muted transition hover:text-orange" aria-label={`Tùy chọn ${hp.name}`}>
                  <Icon name="more_horiz" size={22} />
                </button>
              </div>
              <h3 className="text-xl font-extrabold leading-snug text-ink">{hp.name}</h3>
              <p className="mt-1 text-sm font-bold text-faint">Mã HP: {hp.code}</p>
              <div className="mt-auto pt-5">
                <div className="mb-2 flex items-end justify-between">
                  <div className="flex gap-5">
                    <div>
                      <span className="block text-[11px] font-extrabold uppercase tracking-wider text-faint">Chương</span>
                      <span className="text-lg font-extrabold text-ink">{hp.chapters}</span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-extrabold uppercase tracking-wider text-faint">Câu hỏi</span>
                      <span className="text-lg font-extrabold text-ink">{formatNumber(hp.questions)}</span>
                    </div>
                  </div>
                  <span className="text-base font-extrabold text-cyan-deep">{hp.progress}%</span>
                </div>
                <ProgressBar value={hp.progress} color="bg-cyan" />
              </div>
            </div>
          </NeuCard>
        ))}
      </div>

    </ScreenShell>
  );
}
