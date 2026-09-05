import { useEffect, useMemo, useState, type ReactNode } from "react";
import { formatNumber, leaderboard, podium } from "../data";
import { ACCENT_PRESETS, useData, type FlashcardInput, type QuestionInput, type SubjectInput } from "../store";
import { Icon, NeuButton, NeuCard, ScreenShell } from "../ui";

const ADMIN_PIN = "1234";
const AUTH_KEY = "phiquiz:admin-auth";

/* ------------------------------------------------------------------ */
/* Small helpers                                                        */
/* ------------------------------------------------------------------ */

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-extrabold uppercase tracking-wider text-faint">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-2xl border-[2.5px] border-ink bg-surface px-3.5 py-2.5 text-sm font-semibold text-ink outline-none transition focus:shadow-hard-sm";

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} resize-y ${props.className ?? ""}`} />;
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} cursor-pointer ${props.className ?? ""}`} />;
}

function RowActions({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) {
  return (
    <div className="flex shrink-0 gap-2">
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="pressable rounded-full border-2 border-ink bg-yellow px-3 py-1.5 text-xs font-extrabold text-ink shadow-hard-sm"
        >
          <Icon name="edit" size={14} /> Sửa
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="pressable rounded-full border-2 border-ink bg-orange px-3 py-1.5 text-xs font-extrabold text-ink shadow-hard-sm"
        >
          <Icon name="delete" size={14} /> Xóa
        </button>
      )}
    </div>
  );
}

function EmptyBox({ children }: { children: ReactNode }) {
  return (
    <NeuCard className="p-10 text-center text-muted">
      <Icon name="inbox" size={40} className="mx-auto mb-3 text-faint" />
      {children}
    </NeuCard>
  );
}

/* ------------------------------------------------------------------ */
/* Subject form                                                         */
/* ------------------------------------------------------------------ */

const emptySubjectForm: SubjectInput & { id?: string } = {
  name: "",
  code: "",
  icon: "menu_book",
  totalQuestions: 100,
  progress: 0,
  rating: 4.5,
  accent: ACCENT_PRESETS[0]!.accent,
  stripe: ACCENT_PRESETS[0]!.stripe,
};

const ICON_CHOICES = ["menu_book", "flag", "history_edu", "gavel", "account_balance", "groups", "psychology", "school", "public", "functions"];

function SubjectPanel({ onClose, initialId }: { onClose: () => void; initialId?: string }) {
  const { subjects, addSubject, updateSubject } = useData();
  const initial = subjects.find(item => item.id === initialId);
  const [editingId, setEditingId] = useState<string | undefined>(initialId);
  const [form, setForm] = useState<SubjectInput>(() =>
    initial
      ? {
          name: initial.name,
          code: initial.code,
          icon: initial.icon,
          totalQuestions: initial.totalQuestions,
          progress: initial.progress,
          rating: initial.rating,
          accent: initial.accent,
          stripe: initial.stripe,
        }
      : emptySubjectForm,
  );

  const save = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      updateSubject(editingId, form);
    } else {
      addSubject(form);
    }
    onClose();
  };

  const set = <K extends keyof SubjectInput>(key: K, value: SubjectInput[K]) => setForm(previous => ({ ...previous, [key]: value }));

  return (
    <NeuCard className="flex flex-col gap-4 p-6" fill="bg-surface2">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-lg font-extrabold text-ink">
          <Icon name="add" size={20} filled />
          {editingId ? "Sửa môn học" : "Thêm môn học mới"}
        </h4>
        {onClose && (
          <button type="button" onClick={onClose} className="pressable rounded-full border-2 border-ink bg-surface p-2 text-ink shadow-hard-sm">
            <Icon name="close" size={18} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Tên môn học">
          <TextInput value={form.name} onChange={event => set("name", event.currentTarget.value)} placeholder="VD: Triết học Mác - Lênin" />
        </Field>
        <Field label="Mã học phần">
          <TextInput value={form.code} onChange={event => set("code", event.currentTarget.value)} placeholder="VD: GENE1001" />
        </Field>
        <Field label="Icon">
          <div className="flex flex-wrap gap-2">
            {ICON_CHOICES.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => set("icon", icon)}
                className={`pressable flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-ink ${form.icon === icon ? "bg-yellow shadow-hard-sm" : "bg-surface"}`}
              >
                <Icon name={icon} size={22} />
              </button>
            ))}
          </div>
        </Field>
        <Field label="Màu chủ đạo">
          <div className="flex flex-wrap gap-2">
            {ACCENT_PRESETS.map(preset => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  set("accent", preset.accent);
                  set("stripe", preset.stripe);
                }}
                className={`pressable flex items-center gap-2 rounded-full border-2 border-ink px-3 py-2 text-xs font-extrabold ${preset.accent} ${
                  form.accent === preset.accent ? "shadow-hard-sm" : ""
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Tổng câu hỏi">
          <TextInput type="number" min={0} value={form.totalQuestions} onChange={event => set("totalQuestions", Number(event.currentTarget.value) || 0)} />
        </Field>
        <Field label="Tiến độ (%)">
          <TextInput type="number" min={0} max={100} value={form.progress} onChange={event => set("progress", Math.max(0, Math.min(100, Number(event.currentTarget.value) || 0)))} />
        </Field>
        <Field label="Đánh giá (sao)">
          <TextInput type="number" min={0} max={5} step={0.1} value={form.rating} onChange={event => set("rating", Math.max(0, Math.min(5, Number(event.currentTarget.value) || 0)))} />
        </Field>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 border-t-2 border-dashed border-ink pt-4">
        <span className="text-xs font-bold text-muted">
          {editingId ? "Cập nhật thông tin môn học." : 'Môn mới sẽ có 3 chương mẫu (trạng thái "Khóa").'}
        </span>
        <div className="flex gap-2">
          <NeuButton tone="white" size="sm" onClick={onClose}>
            Hủy
          </NeuButton>
          <NeuButton tone="cyan" size="sm" onClick={save} disabled={!form.name.trim()}>
            <Icon name="save" size={16} />
            {editingId ? "Lưu thay đổi" : "Thêm môn"}
          </NeuButton>
        </div>
      </div>
    </NeuCard>
  );
}

/* ------------------------------------------------------------------ */
/* Question form                                                        */
/* ------------------------------------------------------------------ */

type QuestionFormState = QuestionInput & { id?: string };

function questionFormFrom(question?: QuestionInput & { id?: string }): QuestionFormState {
  if (question) {
    return {
      id: question.id,
      chapterId: question.chapterId,
      field: question.field,
      question: question.question,
      answers: question.answers.length >= 2 ? question.answers : ["", "", "", ""],
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      hints: question.hints,
    };
  }
  return { chapterId: "c1", field: "Chủ nghĩa duy vật biện chứng", question: "", answers: ["", "", "", ""], correctIndex: 0, explanation: "", hints: [] };
}

function QuestionPanel({ onClose }: { onClose: () => void }) {
  const { quizPool, activeSubject, addQuestion, updateQuestion, deleteQuestion } = useData();
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [form, setForm] = useState<QuestionFormState>(() => questionFormFrom());
  const [showForm, setShowForm] = useState(false);
  const [answerSearch, setAnswerSearch] = useState("");

  const filtered = useMemo(() => {
    const q = answerSearch.trim().toLowerCase();
    if (!q) return quizPool;
    return quizPool.filter(item => item.question.toLowerCase().includes(q));
  }, [quizPool, answerSearch]);

  const openEdit = (id: string) => {
    const question = quizPool.find(item => item.id === id);
    if (!question) return;
    const correctIndex = question.correctAnswers[0] ?? 0;
    setEditingId(id);
    setForm(questionFormFrom({
      id: question.id,
      chapterId: question.chapterId,
      field: question.field,
      question: question.question,
      answers: question.answers,
      correctIndex,
      explanation: question.explanation ?? "",
      hints: question.hints ?? [],
    }));
    setShowForm(true);
  };

  const save = () => {
    if (!form.question.trim() || form.answers.filter(answer => answer.trim()).length < 2) return;
    if (editingId) {
      updateQuestion(editingId, form);
    } else {
      addQuestion(form);
    }
    setEditingId(undefined);
    setForm(questionFormFrom());
    setShowForm(false);
  };

  const setAnswer = (index: number, value: string) =>
    setForm(previous => {
      const answers = [...previous.answers];
      answers[index] = value;
      return { ...previous, answers };
    });

  const setHints = (value: string) => setForm(previous => ({ ...previous, hints: value.split("\n").filter(Boolean) }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-surface px-4 py-2 shadow-hard-sm">
          <Icon name="search" size={18} className="text-faint" />
          <input
            value={answerSearch}
            onChange={event => setAnswerSearch(event.currentTarget.value)}
            placeholder="Tìm câu hỏi..."
            className="min-w-0 bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-faint"
          />
        </label>
        <NeuButton tone="cyan" size="sm" onClick={() => { setEditingId(undefined); setForm(questionFormFrom()); setShowForm(v => !v); }}>
          <Icon name="add" size={16} filled />
          {showForm && !editingId ? "Đóng" : "Thêm câu hỏi"}
        </NeuButton>
      </div>

      {showForm && (
        <NeuCard className="flex flex-col gap-4 p-6" fill="bg-surface2">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-lg font-extrabold text-ink">
              <Icon name="quiz" size={20} filled />
              {editingId ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}
            </h4>
            <button type="button" onClick={() => setShowForm(false)} className="pressable rounded-full border-2 border-ink bg-surface p-2 text-ink shadow-hard-sm">
              <Icon name="close" size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Chương">
              <Select value={form.chapterId} onChange={event => setForm(previous => ({ ...previous, chapterId: event.currentTarget.value }))}>
                {(activeSubject?.chapters ?? []).map(chapter => (
                  <option key={chapter.id} value={chapter.id}>
                    Chương {chapter.index}: {chapter.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Lĩnh vực / chủ đề">
              <TextInput value={form.field} onChange={event => setForm(previous => ({ ...previous, field: event.currentTarget.value }))} placeholder="VD: Chủ nghĩa duy vật biện chứng" />
            </Field>
          </div>

          <Field label="Nội dung câu hỏi">
            <TextArea value={form.question} onChange={event => setForm(previous => ({ ...previous, question: event.currentTarget.value }))} rows={2} placeholder="Nhập nội dung câu hỏi..." />
          </Field>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {form.answers.map((answer, index) => (
              <Field key={index} label={`Phương án ${String.fromCharCode(65 + index)}`}>
                <div className="flex items-center gap-2">
                  <TextInput
                    value={answer}
                    onChange={event => setAnswer(index, event.currentTarget.value)}
                    placeholder={`Đáp án ${String.fromCharCode(65 + index)}`}
                  />
                  <button
                    type="button"
                    onClick={() => setForm(previous => ({ ...previous, correctIndex: index }))}
                    className={`shrink-0 rounded-full border-2 border-ink px-3 py-2.5 text-xs font-extrabold ${form.correctIndex === index ? "bg-green text-ink shadow-hard-sm" : "bg-surface text-muted"}`}
                    title="Chọn làm đáp án đúng"
                  >
                    ✓
                  </button>
                </div>
              </Field>
            ))}
          </div>

          <Field label="Giải thích">
            <TextArea value={form.explanation} onChange={event => setForm(previous => ({ ...previous, explanation: event.currentTarget.value }))} rows={3} placeholder="Giải thích chi tiết đáp án..." />
          </Field>

          <Field label="Gợi ý (mỗi dòng một gợi ý)">
            <TextArea value={form.hints.join("\n")} onChange={event => setHints(event.currentTarget.value)} rows={2} placeholder="Gợi ý 1\nGợi ý 2" />
          </Field>

          <div className="flex justify-end gap-2 border-t-2 border-dashed border-ink pt-4">
            <NeuButton tone="white" size="sm" onClick={() => setShowForm(false)}>
              Hủy
            </NeuButton>
            <NeuButton tone="cyan" size="sm" onClick={save} disabled={!form.question.trim() || form.answers.filter(answer => answer.trim()).length < 2}>
              <Icon name="save" size={16} />
              {editingId ? "Lưu câu hỏi" : "Thêm câu hỏi"}
            </NeuButton>
          </div>
        </NeuCard>
      )}

      {filtered.length === 0 ? (
        <EmptyBox>Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.</EmptyBox>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((question, index) => {
            const correct = question.correctAnswers[0] ?? 0;
            return (
              <NeuCard key={question.id} fill="bg-surface" className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-xs font-extrabold uppercase tracking-wider text-faint">
                      #{index + 1} • {question.field}
                    </p>
                    <p className="text-sm font-bold text-ink">{question.question}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {question.answers.map((answer, answerIndex) => (
                        <span
                          key={answerIndex}
                          className={`rounded-full border-2 border-ink px-2.5 py-1 text-[11px] font-bold ${
                            answerIndex === correct ? "bg-green text-ink" : "bg-surface2 text-muted"
                          }`}
                        >
                          {String.fromCharCode(65 + answerIndex)}. {answer}
                        </span>
                      ))}
                    </div>
                  </div>
                  <RowActions
                    onEdit={() => openEdit(question.id)}
                    onDelete={() => {
                      if (window.confirm(`Xóa câu hỏi: "${question.question.slice(0, 60)}..."?`)) {
                        deleteQuestion(question.id);
                      }
                    }}
                  />
                </div>
              </NeuCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Flashcard form                                                       */
/* ------------------------------------------------------------------ */

function FlashcardPanel({ onClose }: { onClose: () => void }) {
  const { flashcards, addFlashcard, updateFlashcard, deleteFlashcard } = useData();
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FlashcardInput>({ front: "", back: "", bullets: [] });

  const openEdit = (id: string) => {
    const card = flashcards.find(item => item.id === id);
    if (!card) return;
    setEditingId(id);
    setForm({ front: card.front, back: card.back, bullets: card.bullets });
    setShowForm(true);
  };

  const save = () => {
    if (!form.front.trim()) return;
    if (editingId) {
      updateFlashcard(editingId, form);
    } else {
      addFlashcard(form);
    }
    setEditingId(undefined);
    setForm({ front: "", back: "", bullets: [] });
    setShowForm(false);
  };

  void onClose;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-extrabold text-muted">{flashcards.length} thẻ flashcard</span>
        <NeuButton tone="cyan" size="sm" onClick={() => { setEditingId(undefined); setForm({ front: "", back: "", bullets: [] }); setShowForm(v => !v); }}>
          <Icon name="add" size={16} filled />
          {showForm && !editingId ? "Đóng" : "Thêm thẻ"}
        </NeuButton>
      </div>

      {showForm && (
        <NeuCard className="flex flex-col gap-4 p-6" fill="bg-surface2">
          <h4 className="flex items-center gap-2 text-lg font-extrabold text-ink">
            <Icon name="style" size={20} filled />
            {editingId ? "Sửa thẻ flashcard" : "Thêm thẻ flashcard"}
          </h4>
          <Field label="Mặt trước (Câu hỏi / Khái niệm)">
            <TextArea value={form.front} onChange={event => setForm(previous => ({ ...previous, front: event.currentTarget.value }))} rows={2} />
          </Field>
          <Field label="Mặt sau (Đáp án / Định nghĩa)">
            <TextArea value={form.back} onChange={event => setForm(previous => ({ ...previous, back: event.currentTarget.value }))} rows={3} />
          </Field>
          <Field label="Gạch đầu dòng (mỗi dòng một ý)">
            <TextArea
              value={form.bullets.join("\n")}
              onChange={event => setForm(previous => ({ ...previous, bullets: event.currentTarget.value.split("\n") }))}
              rows={3}
            />
          </Field>
          <div className="flex justify-end gap-2 border-t-2 border-dashed border-ink pt-4">
            <NeuButton tone="white" size="sm" onClick={() => setShowForm(false)}>
              Hủy
            </NeuButton>
            <NeuButton tone="cyan" size="sm" onClick={save} disabled={!form.front.trim()}>
              <Icon name="save" size={16} />
              {editingId ? "Lưu thẻ" : "Thêm thẻ"}
            </NeuButton>
          </div>
        </NeuCard>
      )}

      {flashcards.length === 0 ? (
        <EmptyBox>Chưa có thẻ flashcard nào.</EmptyBox>
      ) : (
        <div className="flex flex-col gap-3">
          {flashcards.map((card, index) => (
            <NeuCard key={card.id} fill="bg-surface" className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs font-extrabold uppercase tracking-wider text-faint">Thẻ {index + 1}</p>
                  <p className="text-sm font-bold text-ink">{card.front}</p>
                  <p className="mt-1 line-clamp-2 text-xs font-medium text-muted">{card.back}</p>
                </div>
                <RowActions
                  onEdit={() => openEdit(card.id)}
                  onDelete={() => {
                    if (window.confirm(`Xóa thẻ flashcard "${card.front.slice(0, 60)}..."?`)) {
                      deleteFlashcard(card.id);
                    }
                  }}
                />
              </div>
            </NeuCard>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Users table                                                          */
/* ------------------------------------------------------------------ */

function UsersPanel() {
  const users = useMemo(() => {
    const all = [...podium, ...leaderboard];
    return [...all].sort((a, b) => b.points - a.points);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="mb-1 flex items-center justify-between px-2">
        <span className="text-sm font-extrabold text-muted">{users.length} thành viên</span>
        <span className="text-xs font-bold text-faint">Dữ liệu bảng xếp hạng</span>
      </div>
      {users.map(user => (
        <NeuCard key={`${user.rank}`} fill="bg-surface" className="flex items-center gap-4 p-4">
          <span className="w-8 text-center text-lg font-extrabold text-ink">#{user.rank}</span>
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink text-sm font-extrabold text-ink ${user.color}`}>
            {user.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-ink">{user.name}</p>
            <p className="text-xs font-bold text-muted">Lv. {user.level}</p>
          </div>
          <span className="hidden w-24 md:block">
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-surface2 px-2 py-1 text-xs font-extrabold text-ink">
              <Icon name="local_fire_department" size={14} filled className="text-orange" />
              {user.streak}
            </span>
          </span>
          <span className="text-right text-base font-extrabold text-ink">{formatNumber(user.points)}</span>
        </NeuCard>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tailscale 403 Forbidden Shield Screen                              */
/* ------------------------------------------------------------------ */

function AccessDenied({ status, onExit }: { status: { ip?: string; network?: string; message?: string }; onExit: () => void }) {
  return (
    <div className="mx-auto flex min-h-[65vh] w-full max-w-lg items-center justify-center py-8">
      <NeuCard className="w-full p-8 text-center" fill="bg-surface" shadow="shadow-hard-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border-[2.5px] border-ink bg-orange shadow-hard-lg">
          <Icon name="shield" size={42} filled className="text-ink animate-pulse" />
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-orange px-3.5 py-1 text-xs font-extrabold text-ink shadow-hard-sm">
          <Icon name="lock" size={14} /> 403 FORBIDDEN · TAILSCALE ONLY
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-ink md:text-3xl">Truy Cập Bị Giới Hạn</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Trang quản trị này được bảo mật và <strong>chỉ cho phép truy cập qua mạng nội bộ Tailscale (100.64.0.0/10)</strong>. Mọi kết nối đi qua Cloudflare Tunnel hoặc Internet công khai đều bị từ chối để bảo vệ ngân hàng đề thi.
        </p>

        <div className="mt-6 flex flex-col gap-2 rounded-2xl border-[2px] border-dashed border-ink bg-surface2 p-4 text-left text-xs">
          <div className="flex justify-between font-bold text-ink">
            <span>IP phát hiện:</span>
            <span className="font-mono text-orange font-extrabold">{status.ip || "Public IP"}</span>
          </div>
          <div className="flex justify-between font-bold text-ink">
            <span>Môi trường mạng:</span>
            <span className="font-mono text-muted">{status.network || "Public Tunnel / Reverse Proxy"}</span>
          </div>
          <div className="flex justify-between font-bold text-ink">
            <span>Trạng thái bảo mật:</span>
            <span className="font-bold text-orange">Bị chặn (Access Denied)</span>
          </div>
        </div>

        <NeuButton tone="ink" size="lg" className="mt-6 w-full" onClick={onExit}>
          <Icon name="arrow_back" size={20} />
          Quay lại Trang chủ
        </NeuButton>
      </NeuCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Login gate                                                           */
/* ------------------------------------------------------------------ */

function LoginGate({ onSuccess, networkInfo }: { onSuccess: () => void; networkInfo?: string }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const submit = () => {
    if (pin === ADMIN_PIN) {
      try {
        sessionStorage.setItem(AUTH_KEY, "1");
      } catch {
        // Non-persistent session is fine.
      }
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center">
      <NeuCard className="w-full p-8 text-center" shadow="shadow-hard-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border-[2.5px] border-ink bg-yellow shadow-hard-lg">
          <Icon name="admin_panel_settings" size={40} filled className="text-ink" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-ink">Quản trị PhiQuiz</h1>
        <p className="mt-1 text-sm text-muted">Nhập mã PIN để truy cập bảng điều khiển quản trị.</p>
        
        {networkInfo && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-cyan/20 px-3 py-1 text-xs font-extrabold text-cyan-deep">
            <Icon name="verified_user" size={14} filled />
            {networkInfo}
          </div>
        )}

        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={event => {
            setPin(event.currentTarget.value);
            setError(false);
          }}
          onKeyDown={event => {
            if (event.key === "Enter") submit();
          }}
          placeholder="Mã PIN"
          className="mt-6 w-full rounded-full border-[2.5px] border-ink bg-surface px-5 py-3 text-center text-xl font-extrabold tracking-[0.5em] text-ink outline-none shadow-hard focus:shadow-hard-lg placeholder:tracking-normal placeholder:text-faint"
        />
        {error && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-bold text-orange">
            <Icon name="error" size={16} filled />
            Sai mã PIN rồi. Thử lại nhé!
          </p>
        )}

        <NeuButton tone="cyan" size="lg" className="mt-6 w-full" onClick={submit}>
          <Icon name="lock_open" size={20} filled />
          Đăng nhập
        </NeuButton>
        <p className="mt-4 text-xs font-bold text-faint">Mã PIN demo: <span className="text-ink">1234</span></p>
      </NeuCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Admin screen                                                         */
/* ------------------------------------------------------------------ */

type AdminTab = "subjects" | "questions" | "flashcards" | "users";

export function AdminScreen({ onExit }: { onExit: () => void }) {
  const { subjects, quizPool, flashcards, deleteSubject, resetAll } = useData();
  const [accessState, setAccessState] = useState<{ loading: boolean; allowed: boolean; ip?: string; network?: string; message?: string }>({
    loading: true,
    allowed: true,
  });

  const [authed, setAuthed] = useState(() => {
    try {
      return sessionStorage.getItem(AUTH_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [tab, setTab] = useState<AdminTab>("subjects");
  const [subjectFormOpen, setSubjectFormOpen] = useState(false);
  const [subjectFormId, setSubjectFormId] = useState<string | undefined>(undefined);

  // Check Tailscale / Local access status from server
  useEffect(() => {
    fetch("/api/admin/status")
      .then(res => res.json())
      .then(data => {
        setAccessState({
          loading: false,
          allowed: data?.allowed ?? true,
          ip: data?.ip,
          network: data?.network,
          message: data?.message,
        });
      })
      .catch(() => {
        // In static or offline environments, allow by default
        setAccessState({ loading: false, allowed: true });
      });
  }, []);

  const tabs: { id: AdminTab; label: string; icon: string; count: number }[] = [
    { id: "subjects", label: "Môn học", icon: "menu_book", count: subjects.length },
    { id: "questions", label: "Câu hỏi", icon: "quiz", count: quizPool.length },
    { id: "flashcards", label: "Flashcard", icon: "style", count: flashcards.length },
    { id: "users", label: "Người dùng", icon: "group", count: podium.length + leaderboard.length },
  ];

  const logout = () => {
    try {
      sessionStorage.removeItem(AUTH_KEY);
    } catch {
      // Ignore.
    }
    setAuthed(false);
  };

  if (!accessState.loading && !accessState.allowed) {
    return (
      <ScreenShell fluid>
        <AccessDenied status={accessState} onExit={onExit} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell fluid>
      {!authed ? (
        <LoginGate onSuccess={() => setAuthed(true)} networkInfo={accessState.network ? `Mạng: ${accessState.network} (${accessState.ip})` : undefined} />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="flex items-center gap-2 text-3xl font-extrabold text-ink">
                  <Icon name="admin_panel_settings" size={30} filled className="text-cyan-deep" />
                  Quản trị PhiQuiz
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-green px-3 py-0.5 text-xs font-extrabold text-ink shadow-hard-sm">
                  <Icon name="vpn_lock" size={14} />
                  Tailscale Protected
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">Quản lý môn học, ngân hàng câu hỏi và nội dung ôn thi qua kết nối bảo mật.</p>
            </div>
            <div className="flex gap-2">
              <NeuButton tone="white" size="sm" onClick={() => { if (window.confirm("Khôi phục toàn bộ dữ liệu mẫu ban đầu? Mọi thay đổi sẽ bị xóa.")) resetAll(); }}>
                <Icon name="restore" size={16} />
                Đặt lại dữ liệu
              </NeuButton>
              <NeuButton tone="ink" size="sm" onClick={() => onExit && onExit()}>
                <Icon name="arrow_back" size={16} />
                Về app
              </NeuButton>
              <NeuButton tone="orange" size="sm" onClick={logout}>
                <Icon name="logout" size={16} />
                Đăng xuất
              </NeuButton>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Môn học", value: subjects.length, icon: "menu_book", color: "bg-cyan" },
              { label: "Câu hỏi", value: quizPool.length, icon: "quiz", color: "bg-yellow" },
              { label: "Flashcard", value: flashcards.length, icon: "style", color: "bg-green" },
              { label: "Người dùng", value: podium.length + leaderboard.length, icon: "group", color: "bg-orange" },
            ].map(stat => (
              <NeuCard key={stat.label} className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-faint">{stat.label}</span>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-ink ${stat.color}`}>
                    <Icon name={stat.icon} size={20} filled />
                  </span>
                </div>
                <div className="mt-2 text-3xl font-extrabold text-ink">{stat.value}</div>
              </NeuCard>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 rounded-full border-[2.5px] border-ink bg-surface p-1 shadow-hard w-max">
            {tabs.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold transition ${
                  tab === item.id ? "bg-ink text-surface shadow-hard-sm" : "text-muted hover:bg-surface2"
                }`}
              >
                <Icon name={item.icon} size={16} filled={tab === item.id} />
                {item.label}
                <span className={`rounded-full border-2 border-ink px-1.5 text-[10px] ${tab === item.id ? "bg-yellow text-ink" : "bg-surface2 text-muted"}`}>
                  {item.count}
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          {tab === "subjects" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-muted">{subjects.length} môn học</span>
                <NeuButton
                  tone="cyan"
                  size="sm"
                  onClick={() => {
                    setSubjectFormId(undefined);
                    setSubjectFormOpen(v => !v);
                  }}
                >
                  <Icon name="add" size={16} filled />
                  {subjectFormOpen && !subjectFormId ? "Đóng" : "Thêm môn học"}
                </NeuButton>
              </div>
              {subjectFormOpen && (
                <SubjectPanel key={subjectFormId ?? "new"} initialId={subjectFormId} onClose={() => setSubjectFormOpen(false)} />
              )}
              {subjects.length === 0 ? (
                <EmptyBox>Chưa có môn học nào. Hãy thêm môn đầu tiên.</EmptyBox>
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {subjects.map(subject => (
                    <NeuCard key={subject.id} className="flex flex-col gap-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[2.5px] border-ink ${subject.accent}`}>
                            <Icon name={subject.icon} size={22} filled />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-extrabold text-ink">{subject.name}</h3>
                            <p className="text-xs font-bold text-faint">
                              {subject.code} • {subject.totalQuestions} câu • ★ {subject.ratingLabel}
                            </p>
                          </div>
                        </div>
                        <RowActions
                          onEdit={() => {
                            setSubjectFormId(subject.id);
                            setSubjectFormOpen(true);
                          }}
                          onDelete={() => {
                            if (window.confirm(`Xóa môn học "${subject.name}"?`)) deleteSubject(subject.id);
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-3 flex-1 overflow-hidden rounded-full border-2 border-ink bg-surface2">
                          <div className="h-full border-r-2 border-ink bg-cyan" style={{ width: `${subject.progress}%` }} />
                        </div>
                        <span className="text-sm font-extrabold text-ink">{subject.progress}%</span>
                      </div>
                      <p className="text-xs font-bold text-muted">
                        {subject.chapters.filter(chapter => chapter.status !== "locked").length}/{subject.chapters.length} chương đang mở
                      </p>
                    </NeuCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "questions" && <QuestionPanel onClose={() => {}} />}
          {tab === "flashcards" && <FlashcardPanel onClose={() => {}} />}
          {tab === "users" && <UsersPanel />}
        </div>
      )}
    </ScreenShell>
  );
}