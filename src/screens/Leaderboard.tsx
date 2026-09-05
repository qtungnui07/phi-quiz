import { useState } from "react";
import { formatNumber, leaderboard, myRank, podium, type LeaderEntry } from "../data";
import type { Navigate } from "../types";
import { Icon, NeuButton, NeuCard, ScreenShell } from "../ui";

function rankColor(rank: number): string {
  if (rank === 1) return "bg-yellow";
  if (rank === 2) return "bg-surface3";
  return "bg-cyan";
}

function podiumHeight(rank: number): string {
  if (rank === 1) return "h-[220px]";
  if (rank === 2) return "h-[170px]";
  return "h-[140px]";
}

function PodiumBlock({ entry }: { entry: LeaderEntry }) {
  const color = rankColor(entry.rank);
  return (
    <div className={`relative flex flex-col items-center ${entry.rank === 2 ? "translate-y-10" : entry.rank === 3 ? "translate-y-16" : ""} z-10`}>
      {entry.rank === 1 && (
        <span className="absolute -top-9 z-20 text-5xl" aria-hidden>
          🏆
        </span>
      )}
      <div className="relative mb-4">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full border-[2.5px] border-ink text-xl font-extrabold text-ink shadow-hard-sm md:h-24 md:w-24 md:text-2xl ${
            entry.rank === 1 ? "bg-cyan" : entry.rank === 2 ? "bg-yellow-deep" : "bg-surface3"
          }`}
        >
          {entry.initials}
        </div>
        <div className={`absolute -bottom-3 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-ink text-sm font-extrabold text-ink shadow-hard-sm ${color}`}>
          {entry.rank}
        </div>
      </div>
      <div className={`relative w-full overflow-hidden rounded-t-2xl border-[2.5px] border-b-0 border-ink pt-7 ${podiumHeight(entry.rank)} ${color}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/10 to-transparent" />
        <div className="relative flex flex-col items-center px-3">
          {entry.title && (
            <span className="mb-1 hidden rounded-full border-2 border-ink bg-surface px-3 py-0.5 text-[10px] font-extrabold text-ink shadow-hard-sm md:inline-block">
              {entry.title}
            </span>
          )}
          <h3 className="w-full truncate px-1 text-center text-lg font-extrabold text-ink">{entry.name}</h3>
          <p className="mb-2 text-sm font-bold text-ink/70">Lv. {entry.level}</p>
          <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-surface px-3 py-1 text-sm font-extrabold text-ink shadow-hard-sm">
            <Icon name="local_fire_department" size={16} filled className="text-orange" />
            {formatNumber(entry.points)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function Leaderboard({ onNavigate }: { onNavigate: Navigate }) {
  const [range, setRange] = useState<"week" | "all">("week");

  return (
    <ScreenShell fluid>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-[2.5px] border-ink pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-ink">Bảng Xếp Hạng</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Những bộ não sắc bén nhất của PhiQuiz hội tụ tại đây. Đua top, giành huy hiệu và khẳng định đẳng cấp!
          </p>
        </div>
        <div className="flex rounded-full border-[2.5px] border-ink bg-surface p-1 shadow-hard">
          <button
            type="button"
            onClick={() => setRange("week")}
            className={`rounded-full px-5 py-2 text-sm font-extrabold transition ${range === "week" ? "bg-yellow text-ink shadow-hard-sm" : "text-muted hover:bg-surface2"}`}
          >
            Tuần này
          </button>
          <button
            type="button"
            onClick={() => setRange("all")}
            className={`rounded-full px-5 py-2 text-sm font-extrabold transition ${range === "all" ? "bg-yellow text-ink shadow-hard-sm" : "text-muted hover:bg-surface2"}`}
          >
            Tất cả thời gian
          </button>
        </div>
      </div>

      {/* Podium */}
      <div className="mb-10 flex items-end justify-center gap-4 pt-10 md:gap-6">
        {([2, 1, 3] as const).map(rank => {
          const entry = podium.find(item => item.rank === rank)!;
          return <PodiumBlock key={entry.rank} entry={entry} />;
        })}
      </div>

      {/* List header */}
      <div className="mx-auto mb-2 flex w-full max-w-4xl items-center justify-between border-b-[2.5px] border-ink px-6 py-2">
        <span className="w-10 text-center text-sm font-extrabold text-faint">Hạng</span>
        <span className="flex-1 text-left text-sm font-extrabold text-faint">Người chơi</span>
        <span className="w-20 text-center text-sm font-extrabold text-faint md:w-24">Cấp độ</span>
        <span className="hidden w-24 text-center text-sm font-extrabold text-faint md:block">Chuỗi</span>
        <span className="w-24 text-right text-sm font-extrabold text-faint">Điểm</span>
      </div>

      {/* List */}
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
        {leaderboard.map((entry, index) => (
          <NeuCard
            key={entry.rank}
            className="item-enter flex cursor-pointer items-center gap-3 p-4 md:gap-4"
            fill={index === (range === "week" ? 0 : -1) ? "bg-cyan/10" : "bg-surface"}
            press
            shadow="shadow-hard"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="w-8 text-center text-lg font-extrabold text-ink md:w-10">{entry.rank}</span>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-ink text-sm font-extrabold text-ink ${entry.color}`}>
                {entry.initials}
              </div>
              <div className="min-w-0">
                <h4 className="truncate text-base font-extrabold text-ink">{entry.name}</h4>
                {entry.title && (
                  <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-yellow-deep/40 px-2 py-0.5 text-[10px] font-extrabold uppercase text-ink">
                    <Icon name="bolt" size={12} filled />
                    {entry.title}
                  </span>
                )}
              </div>
            </div>
            <span className="w-20 text-center text-sm font-bold text-ink md:w-24">Lv. {entry.level}</span>
            <div className="hidden w-24 justify-center md:flex">
              <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-surface2 px-2 py-1 text-xs font-extrabold text-ink">
                <Icon name="calendar_month" size={14} filled className="text-yellow-deep" />
                {entry.streak}
              </span>
            </div>
            <span className="w-24 text-right text-lg font-extrabold text-ink">{formatNumber(entry.points)}</span>
          </NeuCard>
        ))}
      </div>

      {/* My rank bar */}
      <div className="fixed inset-x-4 bottom-24 z-40 md:inset-x-auto md:left-1/2 md:w-[720px] md:-translate-x-1/2 lg:bottom-8 lg:left-[calc(50%+8rem)]">
        <div className="item-enter flex items-center justify-between gap-4 rounded-3xl border-[2.5px] border-ink bg-ink p-4 px-6 shadow-hard-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-yellow text-2xl font-extrabold text-ink shadow-hard-sm">
              {myRank.rank}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-surface">Thứ hạng của bạn</h3>
              <p className="text-sm text-surface/70">
                Cố lên! Chỉ còn <strong className="text-yellow">{formatNumber(myRank.nextTarget)}</strong> điểm nữa để lọt vào top 20.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-surface/70">Tổng điểm</span>
              <span className="text-xl font-extrabold text-yellow">{formatNumber(myRank.points)}</span>
            </div>
            <NeuButton tone="yellow" size="sm" className="whitespace-nowrap px-5 py-2.5" onClick={() => onNavigate({ name: "quiz", variant: "grid" })}>
              <Icon name="play_arrow" size={18} filled />
              Chơi ngay
            </NeuButton>
          </div>
        </div>
      </div>

      <div className="h-24" />
    </ScreenShell>
  );
}