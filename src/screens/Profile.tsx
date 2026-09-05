import { formatNumber, profile } from "../data";
import type { Navigate } from "../types";
import { Icon, NeuCard, ProgressBar, ScreenShell } from "../ui";

export function Profile({ onNavigate }: { onNavigate: Navigate }) {
  void onNavigate;

  const barColor = (score: number) => (score >= 80 ? "bg-green" : score >= 60 ? "bg-yellow-deep" : "bg-orange");

  return (
    <ScreenShell>
      {/* Header card */}
      <section className="relative flex flex-col items-center gap-6 overflow-hidden rounded-3xl border-[2.5px] border-ink bg-yellow-deep/60 p-8 shadow-hard-xl md:flex-row">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
        <div className="z-10 flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[2.5px] border-ink bg-cyan text-4xl font-extrabold text-ink shadow-hard-lg">
          M
        </div>
        <div className="z-10 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-ink">{profile.name}</h1>
          <p className="mt-1 text-muted">Sinh viên khoa An toàn Thông tin</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-surface px-4 py-2 text-xs font-extrabold text-ink shadow-hard-sm">
              <Icon name="workspace_premium" size={16} filled className="text-yellow-deep" />
              {profile.role}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-extrabold text-surface shadow-hard-sm">
              <Icon name="bar_chart" size={16} filled />
              Cấp {profile.level}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-orange px-4 py-2 text-xs font-extrabold text-ink shadow-hard-sm">
              <Icon name="local_fire_department" size={16} filled />
              {profile.streak} ngày streak
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <NeuCard className="p-5" fill="bg-surface" press>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-faint">Tổng điểm</span>
            <Icon name="stars" size={20} filled className="text-cyan-deep" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-ink">{formatNumber(profile.totalPoints)}</div>
        </NeuCard>
        <NeuCard className="p-5" fill="bg-surface" press>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-faint">Chuỗi ngày</span>
            <Icon name="local_fire_department" size={20} filled className="text-orange" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-ink">{profile.streak}</div>
        </NeuCard>
        <NeuCard className="p-5" fill="bg-surface" press>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-faint">Tỷ lệ đúng</span>
            <Icon name="check_circle" size={20} filled className="text-green" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-ink">{profile.accuracy}%</div>
        </NeuCard>
        <NeuCard className="p-5" fill="bg-surface" press>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-faint">Thời gian học</span>
            <Icon name="schedule" size={20} filled className="text-yellow-deep" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-ink">{profile.hours}</div>
        </NeuCard>
      </section>

      <div className="mt-8 grid grid-cols-12 gap-6">
        {/* Chapter performance */}
        <section className="col-span-12 lg:col-span-7">
          <NeuCard className="flex h-full flex-col p-6">
            <div className="mb-5 flex items-center justify-between border-b-[2.5px] border-ink pb-4">
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink">
                <Icon name="bar_chart" size={22} filled className="text-cyan-deep" />
                Điểm mạnh / yếu theo chương
              </h2>
              <span className="rounded-full border-2 border-ink bg-surface2 px-3 py-1 text-xs font-extrabold text-muted">Triết học Mác - Lênin</span>
            </div>
            <div className="flex flex-1 flex-col justify-center gap-5">
              {profile.chapters.map((chapter, index) => (
                <div key={chapter.name} className="item-enter" style={{ animationDelay: `${index * 60}ms` }}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-bold text-ink">{chapter.name}</span>
                    <span className={`shrink-0 text-sm font-extrabold ${chapter.score >= 80 ? "text-green-deep" : chapter.score >= 60 ? "text-yellow-deep" : "text-orange"}`}>
                      {chapter.score}/{chapter.maxScore}
                    </span>
                  </div>
                  <ProgressBar
                    value={(chapter.score / chapter.maxScore) * 100}
                    color={barColor(chapter.score)}
                    trackClassName="h-3"
                  />
                </div>
              ))}
            </div>
          </NeuCard>
        </section>

        {/* Exam history */}
        <section className="col-span-12 lg:col-span-5">
          <NeuCard className="flex h-full flex-col p-6">
            <div className="mb-5 flex items-center justify-between border-b-[2.5px] border-ink pb-4">
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink">
                <Icon name="history_edu" size={22} filled className="text-orange" />
                Lịch sử bài thi
              </h2>
              <span className="text-xs font-bold text-muted">{profile.examHistory.length} bài gần nhất</span>
            </div>
            <div className="flex flex-1 flex-col gap-3">
              {profile.examHistory.map((exam, index) => (
                <div
                  key={exam.id}
                  className="item-enter group flex items-center gap-3 rounded-2xl border-[2.5px] border-ink bg-surface2/60 p-3 transition hover:bg-surface2"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink text-sm font-extrabold text-ink ${
                      exam.result ? "bg-green" : "bg-orange"
                    }`}
                  >
                    {exam.score.split("/")[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h5 className="truncate text-sm font-extrabold text-ink">{exam.title}</h5>
                    <p className="truncate text-xs font-medium text-muted">{exam.subject}</p>
                    <p className="text-[10px] font-bold text-faint">{exam.date}</p>
                  </div>
                  <Icon name="chevron_right" size={20} className="shrink-0 text-faint" />
                </div>
              ))}
            </div>
          </NeuCard>
        </section>
      </div>

      {/* Badges */}
      <section className="mt-8">
        <NeuCard className="p-6">
          <div className="mb-5 flex items-center justify-between border-b-[2.5px] border-ink pb-4">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink">
              <Icon name="emoji_events" size={22} filled className="text-yellow-deep" />
              Huy hiệu thành tích
            </h2>
            <span className="text-xs font-bold text-muted">
              {profile.badges.filter(badge => badge.earned).length}/{profile.badges.length} đã đạt
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {profile.badges.map((badge, index) => (
              <div
                key={badge.id}
                className={`item-enter flex flex-col items-center gap-2 rounded-2xl border-[2.5px] border-ink p-4 text-center ${
                  badge.earned ? "shadow-hard-sm" : "bg-surface2 opacity-60"
                } ${badge.color}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative">
                  <Icon name={badge.icon} size={36} filled={badge.earned} className={badge.earned ? "text-ink" : "text-faint"} />
                  {!badge.earned && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink bg-surface text-[10px] font-extrabold text-muted">
                      <Icon name="lock" size={10} />
                    </span>
                  )}
                </div>
                <span className="text-xs font-extrabold text-ink">{badge.label}</span>
              </div>
            ))}
          </div>
        </NeuCard>
      </section>
    </ScreenShell>
  );
}