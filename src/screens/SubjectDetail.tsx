import { useData, type AdminState } from "../store";
import type { Navigate } from "../types";
import { BackButton, Icon, NeuButton, NeuCard, ProgressBar, ScreenShell, Stripe } from "../ui";

type Subject = AdminState["subjects"][number];

function ChapterRow({ subject, chapter }: { subject: Subject; chapter: Subject["chapters"][number] }) {
  const progress = chapter.totalCount > 0 ? Math.round((chapter.doneCount / chapter.totalCount) * 100) : 0;
  const locked = chapter.status === "locked";

  if (locked) {
    return (
      <div className="cursor-not-allowed rounded-3xl border-[2.5px] border-ink bg-surface2 p-6 opacity-80 shadow-hard">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-surface text-lg font-extrabold text-muted shadow-hard-sm">
            {chapter.index}
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-lg font-extrabold text-muted">{chapter.name}</h3>
              <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-surface3 px-3 py-1 text-xs font-extrabold text-muted">
                <Icon name="lock" size={14} />
                Khóa
              </span>
            </div>
            <p className="mb-4 text-sm text-muted">{chapter.description}</p>
            <div className="flex items-center gap-4 opacity-50">
              <span className="flex items-center gap-1.5 text-xs font-bold text-muted">
                <Icon name="quiz" size={16} />
                {chapter.doneCount}/{chapter.totalCount} câu hỏi
              </span>
              <span className="ml-auto">
                <ProgressBar value={0} color="bg-cyan" className="w-24" />
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusColor = chapter.status === "completed" ? "bg-surface2 text-ink" : "bg-cyan text-ink";
  return (
    <div className="group item-enter relative cursor-pointer overflow-hidden rounded-3xl border-[2.5px] border-ink bg-surface p-6 shadow-hard transition-all hover:-translate-y-0.5 hover:shadow-hard-lg">
      {chapter.status === "studying" && <div className={`absolute inset-y-0 left-0 w-2 border-r-[2.5px] border-ink ${chapter.color}`} />}
      {chapter.status === "completed" && (
        <Icon name="check_circle" size={140} className="pointer-events-none absolute -right-5 -top-5 rotate-12 text-cyan/10" filled />
      )}
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[2.5px] border-ink text-lg font-extrabold text-ink shadow-hard-sm ${
            chapter.status === "completed" ? "bg-yellow" : "bg-cyan"
          }`}
        >
          {chapter.index}
        </div>
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-lg font-extrabold text-ink">{chapter.name}</h3>
            <span className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 text-xs font-extrabold ${statusColor}`}>
              {chapter.status === "studying" && <span className="h-2 w-2 animate-pulse rounded-full bg-ink" />}
              {chapter.status === "completed" ? "Hoàn thành" : "Đang học"}
            </span>
          </div>
          <p className="mb-4 text-sm text-muted">{chapter.description}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-muted">
              <Icon name="quiz" size={16} />
              {chapter.doneCount}/{chapter.totalCount} câu
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
              <Icon name="star" size={16} filled className="text-yellow-deep" />
              Điểm: {chapter.score.toFixed(1)}
            </span>
            <span className="ml-auto">
              <ProgressBar value={progress} color="bg-cyan" className="w-24" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SubjectDetail({ subjectId, onBack, onNavigate }: { subjectId: string; onBack: () => void; onNavigate: Navigate }) {
  const { subjects } = useData();
  const subject = subjects.find(item => item.id === subjectId) ?? subjects[0]!;

  return (
    <ScreenShell className="relative">
      <div className="pointer-events-none absolute -top-20 -left-24 h-72 w-72 rounded-full bg-cyan/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-yellow/10 blur-3xl" />

      <div className="mb-6 flex items-center gap-4">
        <BackButton onClick={onBack} />
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-yellow-deep/60 px-3 py-1 text-xs font-extrabold text-ink shadow-hard-sm">
          <Icon name="school" size={16} filled />
          Môn Đại Cương
        </span>
      </div>

      {/* Header */}
      <NeuCard className="relative mb-8 overflow-hidden p-6 shadow-hard-lg md:p-8" fill="bg-surface" shadow="shadow-hard-lg">
        <Stripe color="bg-cyan" />
        <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-extrabold leading-tight text-ink md:text-4xl">{subject.name}</h1>
            <p className="mt-2 text-muted">{subject.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border-2 border-ink bg-surface2 px-3 py-1 text-xs font-bold text-ink">Mã HP: {subject.code}</span>
              <span className="rounded-full border-2 border-ink bg-surface2 px-3 py-1 text-xs font-bold text-ink">{subject.totalQuestions} câu hỏi</span>
            </div>
          </div>

          <div className="w-full shrink-0 gap-4 lg:w-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col rounded-2xl border-[2.5px] border-ink bg-orange p-4 text-center shadow-hard-sm">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink/80">Điểm cao nhất</span>
                <span className="mt-1 text-3xl font-extrabold text-ink">9.5</span>
              </div>
              <div className="flex flex-col rounded-2xl border-[2.5px] border-ink bg-cyan p-4 text-center shadow-hard-sm">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink/80">Câu đúng</span>
                <span className="mt-1 text-3xl font-extrabold text-ink">120</span>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 rounded-2xl border-[2.5px] border-ink bg-surface2 p-4 shadow-hard-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-ink">Tiến độ chung</span>
                <span className="text-lg font-extrabold text-cyan-deep">{subject.progress}%</span>
              </div>
              <ProgressBar value={subject.progress} color="bg-cyan" />
            </div>
          </div>
        </div>
      </NeuCard>

      <div className="grid grid-cols-12 gap-6">
        {/* Chapters */}
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-8">
          <h2 className="flex items-center gap-3 text-xl font-extrabold text-ink">
            <span className="h-3 w-3 rounded-full border-2 border-ink bg-yellow-deep" />
            Nội dung học phần
          </h2>
          <div className="flex flex-col gap-4">
            {subject.chapters.map(chapter => (
              <ChapterRow key={chapter.id} subject={subject} chapter={chapter} />
            ))}
          </div>
        </div>

        {/* Sidebar actions */}
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-4">
          <NeuCard fill="bg-yellow-deep/60" className="relative overflow-hidden p-6">
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/20 blur-xl" />
            <h3 className="text-lg font-extrabold text-ink">Sẵn sàng chưa?</h3>
            <p className="mb-5 mt-1 text-sm font-medium text-ink/80">
              Tiếp tục phần luyện tập của bạn ở <strong className="text-ink">Chương 2</strong>.
            </p>
            <NeuButton
              tone="cyan"
              size="lg"
              className="w-full uppercase tracking-widest"
              onClick={() => onNavigate({ name: "quiz", variant: "grid" })}
            >
              Bắt đầu ôn luyện
              <Icon name="arrow_forward" size={20} filled />
            </NeuButton>
          </NeuCard>

          <NeuCard className="flex flex-col gap-4 p-6">
            <h3 className="text-base font-extrabold text-ink">Chọn phương thức ôn</h3>
            <NeuButton tone="white" className="w-full justify-start px-5" onClick={() => onNavigate({ name: "quiz", variant: "grid" })}>
              <Icon name="quiz" size={20} filled />
              Làm bài trắc nghiệm
            </NeuButton>
            <NeuButton tone="yellow" className="w-full justify-start px-5" onClick={() => onNavigate({ name: "flashcard", subjectId: subject.id })}>
              <Icon name="style" size={20} filled />
              Học Flashcard
            </NeuButton>
            <NeuButton tone="cyan" className="w-full justify-start px-5" onClick={() => onNavigate({ name: "quiz", variant: "list" })}>
              <Icon name="casino" size={20} filled />
              Thi thử ngẫu nhiên
            </NeuButton>
          </NeuCard>

          <NeuCard className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3 border-b-2 border-dashed border-ink pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-cyan">
                <Icon name="timer" size={20} filled className="text-ink" />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-faint">Thời gian đã học</div>
                <div className="text-lg font-extrabold text-ink">12h 45m</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-orange">
                <Icon name="trending_up" size={20} filled className="text-ink" />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-faint">Tỷ lệ chính xác</div>
                <div className="text-lg font-extrabold text-ink">82%</div>
              </div>
            </div>
          </NeuCard>
        </div>
      </div>
    </ScreenShell>
  );
}