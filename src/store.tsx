import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { flashcards as seedFlashcards, quizPool as seedQuizPool, subjects as seedSubjects, type Flashcard, type QuizQuestion, type Subject } from "./data";

const STORAGE_KEY = "phiquiz:admin-data:v1";

/* ------------------------------------------------------------------ */
/* Input types                                                          */
/* ------------------------------------------------------------------ */

export type SubjectInput = {
  name: string;
  code: string;
  icon: string;
  totalQuestions: number;
  progress: number;
  rating: number;
  accent: string;
  stripe: string;
};

export type QuestionInput = {
  chapterId: string;
  field: string;
  question: string;
  answers: string[];
  correctIndex: number;
  explanation: string;
  hints: string[];
};

export type FlashcardInput = {
  front: string;
  back: string;
  bullets: string[];
};

export type AdminState = {
  subjects: Subject[];
  quizPool: QuizQuestion[];
  flashcards: Flashcard[];
  activeSubject: Subject | undefined;
};

export type AdminActions = {
  addSubject: (input: SubjectInput) => void;
  updateSubject: (id: string, patch: Partial<SubjectInput>) => void;
  deleteSubject: (id: string) => void;
  addQuestion: (input: QuestionInput) => void;
  updateQuestion: (id: string, input: QuestionInput) => void;
  deleteQuestion: (id: string) => void;
  addFlashcard: (input: FlashcardInput) => void;
  updateFlashcard: (id: string, input: FlashcardInput) => void;
  deleteFlashcard: (id: string) => void;
  resetAll: () => void;
};

type DataContextValue = AdminState & AdminActions;

const makeId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

function seed(): AdminState {
  return {
    subjects: seedSubjects.map(subject => ({ ...subject, chapters: subject.chapters.map(chapter => ({ ...chapter })) })),
    quizPool: seedQuizPool.map(question => ({ ...question })),
    flashcards: seedFlashcards.map(card => ({ ...card, bullets: [...card.bullets] })),
    activeSubject: undefined,
  };
}

function load(): AdminState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AdminState>;
      if (parsed && Array.isArray(parsed.subjects) && Array.isArray(parsed.quizPool) && Array.isArray(parsed.flashcards)) {
        const stored: AdminState = {
          subjects: parsed.subjects,
          quizPool: parsed.quizPool,
          flashcards: parsed.flashcards,
          activeSubject: undefined,
        };
        return stored;
      }
    }
  } catch {
    // Ignore corrupt storage and fall through to seeding.
  }
  return seed();
}

const placeholderChapters = (subjectId: string): Subject["chapters"] => [
  { id: `${subjectId}-ch1`, index: 1, name: "Chương 1", description: "Nội dung chương 1 (đang được cập nhật).", status: "locked", doneCount: 0, totalCount: 30, score: 0, color: "bg-cyan" },
  { id: `${subjectId}-ch2`, index: 2, name: "Chương 2", description: "Nội dung chương 2 (đang được cập nhật).", status: "locked", doneCount: 0, totalCount: 30, score: 0, color: "bg-cyan" },
  { id: `${subjectId}-ch3`, index: 3, name: "Chương 3", description: "Nội dung chương 3 (đang được cập nhật).", status: "locked", doneCount: 0, totalCount: 30, score: 0, color: "bg-cyan" },
];

function buildSubject(input: SubjectInput): Subject {
  const id = makeId("subject");
  const now = new Date().toISOString();
  return {
    id,
    name: input.name,
    code: input.code,
    icon: input.icon,
    description: `Môn học ${input.name} thuộc chương trình Lý luận chính trị & Pháp luật.`,
    totalQuestions: input.totalQuestions,
    progress: input.progress,
    rating: input.rating,
    ratingLabel: input.rating.toFixed(1),
    action: input.progress > 0 ? "Tiếp tục học" : "Bắt đầu học",
    accent: input.accent,
    stripe: input.stripe,
    chapters: placeholderChapters(id),
    createdAt: now,
  } as Subject;
}

function buildQuestion(input: QuestionInput): QuizQuestion {
  return {
    id: makeId("q"),
    chapterId: input.chapterId,
    field: input.field,
    question: input.question.trim(),
    answers: input.answers.map(answer => answer.trim()).filter(Boolean),
    correctAnswers: [Math.min(Math.max(input.correctIndex, 0), Math.max(input.answers.length - 1, 0))],
    explanation: input.explanation.trim(),
    hints: input.hints.map(hint => hint.trim()).filter(Boolean),
  };
}

function buildFlashcard(input: FlashcardInput): Flashcard {
  return {
    id: makeId("f"),
    front: input.front.trim(),
    back: input.back.trim(),
    bullets: input.bullets.map(bullet => bullet.trim()).filter(Boolean),
  };
}

/* ------------------------------------------------------------------ */
/* Context + Provider                                                   */
/* ------------------------------------------------------------------ */

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ subjects: state.subjects, quizPool: state.quizPool, flashcards: state.flashcards }));
    } catch {
      // Storage unavailable; state still works for the session.
    }
  }, [state.subjects, state.quizPool, state.flashcards]);

  const activeSubject = useMemo(
    () => state.subjects.find(subject => subject.id === "triet-hoc") ?? state.subjects[0],
    [state.subjects],
  );

  const actions = useMemo<AdminActions>(() => {
    const addSubject = (input: SubjectInput) =>
      setState(previous => ({ ...previous, subjects: [...previous.subjects, buildSubject(input)] }));

    const updateSubject = (id: string, patch: Partial<SubjectInput>) =>
      setState(previous => ({
        ...previous,
        subjects: previous.subjects.map(subject =>
          subject.id === id
            ? {
                ...subject,
                ...patch,
                ratingLabel: patch.rating !== undefined ? patch.rating.toFixed(1) : subject.ratingLabel,
                action: patch.progress !== undefined ? (patch.progress > 0 ? "Tiếp tục học" : "Bắt đầu học") : subject.action,
              }
            : subject,
        ),
      }));

    const deleteSubject = (id: string) =>
      setState(previous => {
        if (previous.subjects.length <= 1) {
          return previous;
        }
        return { ...previous, subjects: previous.subjects.filter(subject => subject.id !== id) };
      });

    const addQuestion = (input: QuestionInput) =>
      setState(previous => ({ ...previous, quizPool: [...previous.quizPool, buildQuestion(input)] }));

    const updateQuestion = (id: string, input: QuestionInput) =>
      setState(previous => ({
        ...previous,
        quizPool: previous.quizPool.map(question => (question.id === id ? { ...question, ...buildQuestion(input) } : question)),
      }));

    const deleteQuestion = (id: string) =>
      setState(previous => ({ ...previous, quizPool: previous.quizPool.filter(question => question.id !== id) }));

    const addFlashcard = (input: FlashcardInput) =>
      setState(previous => ({ ...previous, flashcards: [...previous.flashcards, buildFlashcard(input)] }));

    const updateFlashcard = (id: string, input: FlashcardInput) =>
      setState(previous => ({
        ...previous,
        flashcards: previous.flashcards.map(card => (card.id === id ? { ...card, ...buildFlashcard(input) } : card)),
      }));

    const deleteFlashcard = (id: string) =>
      setState(previous => ({ ...previous, flashcards: previous.flashcards.filter(card => card.id !== id) }));

    const resetAll = () => setState(seed());

    return { addSubject, updateSubject, deleteSubject, addQuestion, updateQuestion, deleteQuestion, addFlashcard, updateFlashcard, deleteFlashcard, resetAll };
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({ ...state, activeSubject, ...actions }),
    [state, activeSubject, actions],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

export const ACCENT_PRESETS: { label: string; accent: string; stripe: string }[] = [
  { label: "Xanh cyan", accent: "bg-cyan text-ink", stripe: "bg-cyan" },
  { label: "Cam", accent: "bg-orange text-ink", stripe: "bg-orange" },
  { label: "Vàng", accent: "bg-yellow-deep text-ink", stripe: "bg-yellow-deep" },
  { label: "Xanh lá", accent: "bg-green text-ink", stripe: "bg-green" },
  { label: "Đen", accent: "bg-ink text-surface", stripe: "bg-ink" },
];