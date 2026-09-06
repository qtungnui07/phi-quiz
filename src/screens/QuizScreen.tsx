import { useCallback, useEffect, useMemo, useState } from "react";
import { useData, type AdminState } from "../store";
import type { QuizVariant } from "../types";
import { Icon, NeuButton, NeuCard, ProgressBar } from "../ui";

type QuizQuestion = AdminState["quizPool"][number];

const LETTERS = ["A", "B", "C", "D"];
const QUIZ_SIZE = 20;
const QUIZ_DURATION = 15 * 60;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex]!, copy[index]!];
  }
  return copy;
}

function buildQuestions(pool: QuizQuestion[]): QuizQuestion[] {
  return shuffle(pool).slice(0, QUIZ_SIZE);
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Quiz screen                                                          */
/* ------------------------------------------------------------------ */

export function QuizScreen({
  initialVariant,
  onExit,
}: {
  initialVariant: QuizVariant;
  onExit: () => void;
}) {
  const { quizPool, activeSubject } = useData();
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => buildQuestions(quizPool));
  const [variant, setVariant] = useState<QuizVariant>(initialVariant);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [hintsShown, setHintsShown] = useState<Record<string, number>>({});
  const [seconds, setSeconds] = useState(QUIZ_DURATION);
  const [finished, setFinished] = useState(false);
  const [finishNow, setFinishNow] = useState(false);

  const currentQuestion = questions[current];
  const answeredSet = useMemo(() => new Set(Object.keys(answers)), [answers]);
  const answeredCount = answeredSet.size;

  const submit = useCallback(() => {
    setFinished(true);
  }, []);

  /* Timer */
  useEffect(() => {
    if (finished) return;
    const id = window.setInterval(() => setSeconds(previous => previous - 1), 1000);
    return () => window.clearInterval(id);
  }, [finished]);

  useEffect(() => {
    if (seconds <= 0 && !finished) {
      submit();
    }
  }, [seconds, finished, submit]);

  const score = useMemo(() => {
    if (!finished) return 0;
    return questions.reduce(
      (sum, question, index) =>
        sum + (answers[question.id] === question.correctAnswers[0] ? 1 : 0),
      0,
    );
  }, [finished, questions, answers]);

  /* 'finishNow' triggers submit from the Nộp bài button */
  useEffect(() => {
    if (finishNow) {
      setFinished(true);
      setFinishNow(false);
    }
  }, [finishNow]);

  if (!currentQuestion) {
    return null;
  }

  const total = questions.length;
  const explanationVisible = revealed[currentQuestion.id] ?? false;
  const hintsCount = hintsShown[currentQuestion.id] ?? 0;

  const selectAnswer = (index: number) => {
    if (finished) return;
    setAnswers(previous => ({ ...previous, [currentQuestion.id]: index }));
  };

  const revealHint = () => {
    setHintsShown(previous => ({
      ...previous,
      [currentQuestion.id]: (previous[currentQuestion.id] ?? 0) + 1,
    }));
  };

  const toggleExplanation = () => {
    setRevealed(previous => ({ ...previous, [currentQuestion.id]: !(previous[currentQuestion.id] ?? false) }));
  };

  const next = () => {
    if (current < total - 1) {
      setCurrent(current + 1);
    } else {
      submit();
    }
  };

  const previous = () => {
    if (current > 0) setCurrent(current - 1);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (finished) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;

      const answerIndex = Number(event.key) - 1;
      if (answerIndex >= 0 && answerIndex < Math.min(currentQuestion.answers.length, 4)) {
        event.preventDefault();
        selectAnswer(answerIndex);
        return;
      }

      if (event.key === "Enter" && answers[currentQuestion.id] !== undefined) {
        event.preventDefault();
        next();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        previous();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [answers, current, currentQuestion, finished, total]);

  const restart = () => {
    setQuestions(buildQuestions(quizPool));
    setCurrent(0);
    setAnswers({});
    setRevealed({});
    setHintsShown({});
    setSeconds(QUIZ_DURATION);
    setFinished(false);
    setFinishNow(false);
  };

  /* ---------- Results view ---------- */
  if (finished) {
    const correct = score;
    const wrong = questions.length - correct;
    const percent = Math.round((correct / total) * 100);
    const message =
      percent >= 90
        ? "Xuất sắc! Bạn đã sẵn sàng cho kỳ thi."
        : percent >= 70
          ? "Rất tốt! Tiếp tục luyện thêm vài vòng nữa."
          : percent >= 50
            ? "Khá ổn! Hãy xem lại phần giải thích để cải thiện."
            : "Cần ôn lại nhiều hơn nhé. Cố gắng lên!";

    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
        <NeuCard className="item-enter p-8 text-center" shadow="shadow-hard-xl">
          <div className="mx-auto flex h-32 w-32 flex-col items-center justify-center rounded-full border-[2.5px] border-ink bg-yellow shadow-hard-lg">
            <span className="text-3xl font-extrabold text-ink">
              {correct}/{total}
            </span>
            <span className="text-sm font-bold text-ink/70">điểm</span>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-ink">{message}</h1>
          <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-4">
            <div className="rounded-2xl border-[2.5px] border-ink bg-green p-4">
              <div className="text-2xl font-extrabold text-ink">{correct}</div>
              <div className="text-xs font-bold text-ink/70">Đúng</div>
            </div>
            <div className="rounded-2xl border-[2.5px] border-ink bg-orange p-4">
              <div className="text-2xl font-extrabold text-ink">{wrong}</div>
              <div className="text-xs font-bold text-ink/70">Sai</div>
            </div>
            <div className="rounded-2xl border-[2.5px] border-ink bg-surface2 p-4">
              <div className="text-2xl font-extrabold text-ink">{answeredSet.size}</div>
              <div className="text-xs font-bold text-ink/70">Đã làm</div>
            </div>
          </div>
          <div className="mx-auto mt-4 max-w-md">
            <div className="mb-2 flex justify-between text-xs font-bold text-muted">
              <span>Tỷ lệ đúng</span>
              <span>{percent}%</span>
            </div>
            <ProgressBar value={percent} color={percent >= 70 ? "bg-green" : percent >= 50 ? "bg-yellow-deep" : "bg-orange"} />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <NeuButton tone="yellow" onClick={restart}>
              <Icon name="refresh" size={20} />
              Làm lại
            </NeuButton>
            <NeuButton tone="white" onClick={onExit}>
              <Icon name="home" size={20} />
              Về trang chủ
            </NeuButton>
          </div>
        </NeuCard>

        <h2 className="mt-10 text-xl font-extrabold text-ink">Xem lại đáp án</h2>
        <div className="mt-4 flex flex-col gap-3">
          {questions.map((question, index) => {
            const selected = answers[question.id];
            const isCorrect = selected === question.correctAnswers[0];
            return (
              <details key={question.id} className="group rounded-2xl border-[2.5px] border-ink bg-surface p-4 shadow-hard">
                <summary className="flex cursor-pointer list-none items-start gap-3 [&::-webkit-details-marker]:hidden [&::marker]:content-none">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink text-sm font-extrabold ${
                      isCorrect ? "bg-green text-ink" : "bg-orange text-ink"
                    }`}
                  >
                    <Icon name={isCorrect ? "check" : "close"} size={16} filled />
                  </span>
                  <span className="flex-1 text-sm font-bold text-ink">
                    <span className="mr-2 text-faint">Câu {index + 1}.</span>
                    {question.question}
                  </span>
                </summary>
                <div className="mt-3 rounded-xl border-2 border-dashed border-ink bg-surface2 p-3 text-sm">
                  <p className="font-bold text-ink">
                    Đáp án đúng: <span className="text-green-deep">{question.answers[question.correctAnswers[0]!]}</span>
                  </p>
                  <p className="mt-2 text-muted">{question.explanation}</p>
                </div>
              </details>
            );
          })}
        </div>
      </main>
    );
  }

  /* ---------- Quiz view ---------- */
  const lettersBox = (label: string, active: boolean) => (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink font-extrabold transition ${
        active ? "bg-ink text-surface" : "bg-surface2 text-ink"
      }`}
    >
      {label}
    </span>
  );

  const optionClasses = (index: number) => {
    const selected = answers[currentQuestion.id];
    const correct = currentQuestion.correctAnswers[0];
    const isSelected = selected === index;
    const isCorrectOption = index === correct;

    if (explanationVisible) {
      if (isCorrectOption) return "bg-green text-ink";
      if (isSelected && !isCorrectOption) return "bg-orange text-ink";
      return "bg-surface text-muted opacity-70";
    }
    if (isSelected) return "bg-cyan text-ink";
    return "bg-surface text-ink";
  };

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <button type="button" onClick={onExit} className="pressable inline-flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-surface px-4 py-2 text-sm font-bold text-ink shadow-hard">
          <Icon name="close" size={18} />
          <span className="hidden md:inline">Tạm dừng & Thoát</span>
        </button>
        <div className="flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-surface p-1 shadow-hard">
          <button
            type="button"
            onClick={() => setVariant("grid")}
            className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition ${variant === "grid" ? "bg-ink text-surface" : "text-muted"}`}
          >
            Lưới 2 cột
          </button>
          <button
            type="button"
            onClick={() => setVariant("list")}
            className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition ${variant === "list" ? "bg-ink text-surface" : "text-muted"}`}
          >
            Hàng ngang
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col gap-6 lg:flex-row">
        {/* Main quiz card */}
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-3xl border-[2.5px] border-ink bg-surface2 p-5 shadow-hard lg:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-yellow/15 blur-3xl" />

          {/* Header: counter + timer */}
          <div className="relative z-10 flex items-center justify-between border-b-[2.5px] border-ink pb-5">
            <div className="flex items-center gap-2">
              <NeuButton tone="white" size="sm" className="!px-3" onClick={previous} disabled={current === 0} title="Câu trước">
                <Icon name="arrow_back" size={18} />
              </NeuButton>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-[2.5px] border-ink bg-yellow shadow-hard-sm">
                <span className="text-lg font-extrabold text-ink">
                  {(current + 1).toString().padStart(2, "0")}
                </span>
              </div>
              <span className="text-sm font-extrabold uppercase tracking-widest text-muted">/ {total}</span>
              <NeuButton tone="white" size="sm" className="!px-3" onClick={next} disabled={current === total - 1} title="Câu tiếp theo">
                <Icon name="arrow_forward" size={18} />
              </NeuButton>
            </div>
            <div className="flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-surface px-4 py-2 shadow-hard-sm">
              <Icon name="timer" size={20} filled className={seconds < 180 ? "animate-pulse text-orange" : "text-orange"} />
              <span className={`font-mono text-sm font-extrabold ${seconds < 180 ? "text-orange" : "text-ink"}`}>{formatTime(Math.max(0, seconds))}</span>
            </div>
          </div>

          {/* Mobile progress strip */}
          <div className="relative z-10 mt-4 overflow-x-auto lg:hidden">
            <div className="flex w-max gap-2">
              {questions.map((question, index) => {
                const isAnswered = answers[question.id] !== undefined;
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setCurrent(index)}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink text-xs font-extrabold ${
                      index === current ? "bg-cyan text-ink" : isAnswered ? "bg-green text-ink" : "bg-surface text-muted"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question content */}
          <div className="relative z-10 flex flex-1 flex-col justify-center py-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-max rounded-full border-2 border-ink/30 bg-cyan/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-cyan-deep">
                  {currentQuestion.field}
                </span>
                <span className="rounded-full border-2 border-ink bg-surface2 px-3 py-1 text-[11px] font-bold text-muted">
                  {activeSubject?.chapters.find(chapter => chapter.id === currentQuestion.chapterId)?.name ?? "Triết học Mác - Lênin"}
                </span>
              </div>
              <h2 className="text-xl font-extrabold leading-snug text-ink md:text-2xl">{currentQuestion.question}</h2>
            </div>

            {/* Options */}
            <div className={`mt-6 grid gap-4 ${variant === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
              {currentQuestion.answers.map((answer, index) => {
                const active = answers[currentQuestion.id] === index;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectAnswer(index)}
                    className={`pressable group flex items-center gap-4 rounded-2xl border-[2.5px] border-ink p-4 text-left shadow-hard ${optionClasses(index)}`}
                  >
                    {lettersBox(LETTERS[index] ?? "", active || (explanationVisible && index === currentQuestion.correctAnswers[0]))}
                    <span className="text-sm font-bold leading-snug ">{answer}</span>
                  </button>
                );
              })}
            </div>

            {/* Hints */}
            {hintsCount > 0 && (
              <div className="mt-5 flex flex-col gap-2 rounded-2xl border-2 border-dashed border-ink bg-cyan/10 p-4">
                {Array.from({ length: hintsCount }).map((_, index) => (
                  <p key={index} className="flex items-start gap-2 text-sm font-bold text-ink">
                    <Icon name="lightbulb" size={18} filled className="mt-0.5 shrink-0 text-yellow-deep" />
                    {currentQuestion.hints[index] ?? "Hãy đọc kỹ lại câu hỏi và loại trừ phương án sai."}
                  </p>
                ))}
              </div>
            )}

            {/* Explanation */}
            {explanationVisible && (
              <div className="mt-5 rounded-2xl border-[2.5px] border-ink bg-surface p-5 shadow-hard-sm">
                <div className="mb-2 flex items-center gap-2">
                  <Icon name="school" size={20} filled className="text-cyan-deep" />
                  <span className="text-sm font-extrabold uppercase tracking-wider text-ink">Giải thích chi tiết</span>
                </div>
                <p className="mb-3 text-sm font-bold text-green-deep">
                  Đáp án {LETTERS[currentQuestion.correctAnswers[0]!]}: {currentQuestion.answers[currentQuestion.correctAnswers[0]!]}
                </p>
                <p className="text-sm leading-relaxed text-muted">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="relative z-10 mt-auto flex flex-wrap items-center justify-between gap-3 border-t-[2.5px] border-ink pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <NeuButton
                tone="white"
                size="sm"
                className="px-5"
                disabled={hintsCount >= (currentQuestion.hints.length || 1)}
                onClick={revealHint}
                title="Gợi ý"
              >
                <Icon name="lightbulb" size={18} className="text-yellow-deep" />
                Gợi ý {currentQuestion.hints.length - hintsCount > 0 ? `(${currentQuestion.hints.length - hintsCount})` : ""}
              </NeuButton>
              <NeuButton tone="soft" size="sm" className="px-5" onClick={toggleExplanation}>
                <Icon name={explanationVisible ? "visibility_off" : "visibility"} size={18} className="text-cyan-deep" />
                {explanationVisible ? "Ẩn giải thích" : "Xem giải thích"}
              </NeuButton>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs font-bold text-muted md:inline">
                {answeredCount}/{total} câu đã làm
              </span>
              {current === total - 1 ? (
                <NeuButton tone="orange" onClick={submit}>
                  Nộp bài
                  <Icon name="flag" size={18} filled />
                </NeuButton>
              ) : (
                <NeuButton tone="cyan" onClick={next}>
                  Câu tiếp theo
                  <Icon name="arrow_forward" size={18} />
                </NeuButton>
              )}
            </div>
          </div>
        </div>

        {/* Progress sidebar (desktop) */}
        <aside className="hidden w-[320px] shrink-0 flex-col overflow-hidden rounded-3xl border-[2.5px] border-ink bg-surface shadow-hard lg:flex">
          <div className="relative overflow-hidden border-b-[2.5px] border-ink bg-yellow p-6">
            <Icon name="star" size={90} className="pointer-events-none absolute -right-2 -top-2 rotate-12 opacity-20" filled />
            <h3 className="relative z-10 text-lg font-extrabold text-ink">Tiến độ</h3>
            <p className="relative z-10 mt-1 text-sm font-medium text-ink/70">Hoàn thành {answeredCount}/{total} câu</p>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-3 text-xs font-extrabold uppercase tracking-wider text-faint">Danh sách câu hỏi</div>
            <div className="grid grid-cols-6 gap-2">
              {questions.map((question, index) => {
                const isAnswered = answers[question.id] !== undefined;
                const isCurrent = index === current;
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setCurrent(index)}
                    className={`flex aspect-square items-center justify-center rounded-full border-2 border-ink text-xs font-extrabold transition ${
                      isCurrent
                        ? "animate-pulse bg-cyan text-ink shadow-hard-sm"
                        : isAnswered
                          ? "bg-green text-ink"
                          : "bg-surface2 text-muted hover:bg-cyan/30"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex flex-col gap-2 border-t-2 border-ink pt-4 text-xs font-bold text-muted">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-2 border-ink bg-cyan" /> Đang xem
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-2 border-ink bg-green" /> Đã làm
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-2 border-ink bg-surface2" /> Chưa làm
              </span>
            </div>
          </div>
          <div className="flex justify-center border-t-[2.5px] border-ink bg-surface2 p-4">
            <button type="button" onClick={onExit} className="text-sm font-extrabold text-orange underline decoration-2 underline-offset-4 transition hover:text-ink">
              Tạm dừng & Thoát
            </button>
          </div>
        </aside>
      </div>

      {/* Side count */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-muted">
        <Icon name="track_changes" size={16} className="text-cyan-deep" />
        {activeSubject?.name ?? "PhiQuiz"} • Câu {current + 1}/{total}
      </div>
    </main>
  );
}
