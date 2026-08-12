import { useEffect, useMemo, useState, type ReactNode } from "react";
import "./index.css";

type ImportedQuestion = {
  id?: string;
  question: string;
  answers: string[];
  correctAnswers: number[];
  explanation?: string;
};

type StoredQuestion = ImportedQuestion & {
  key: string;
};

type QuizQuestion = ImportedQuestion & {
  key: string;
  sourceKey: string;
  subjectId: string;
  unitId: string;
  unitName: string;
};

type GradingMode = "instant" | "deferred";
type Screen = "setup" | "quiz" | "results" | "missed";
type QuizMode = "normal" | "missed";
type ThemeId =
  | "paper"
  | "catppuccin-mocha"
  | "shades-of-purple"
  | "monokai-classic"
  | "solarized-dark"
  | "dracula"
  | "nord-dark"
  | "gruvbox-dark"
  | "tokyo-night";

type MissedRecord = {
  key: string;
  sourceKey: string;
  unitId: string;
  unitName: string;
  question: string;
  answers: string[];
  correctAnswers: number[];
  explanation?: string;
  missCount: number;
  lastMissedAt: string;
};

type AnsweredRecord = {
  key: string;
  sourceKey: string;
  unitId: string;
  unitName: string;
  question: string;
  answers: string[];
  correctAnswers: number[];
  selectedAnswers: number[];
  attemptCount: number;
  correctCount: number;
  lastAnsweredAt: string;
  lastCorrect: boolean;
};

type SubjectProgress = {
  missed: Record<string, MissedRecord>;
  answered: Record<string, AnsweredRecord>;
};

type Unit = {
  id: string;
  name: string;
  sourceFileName: string;
  questions: StoredQuestion[];
  createdAt: string;
  updatedAt: string;
};

type Subject = {
  id: string;
  name: string;
  units: Unit[];
  progress: SubjectProgress;
  createdAt: string;
  updatedAt: string;
};

type Library = {
  subjects: Subject[];
  activeSubjectId?: string;
  activeUnitId?: string;
};

type AiSettings = {
  baseUrl: string;
  model: string;
  apiKey: string;
};

type AiState = {
  loading: boolean;
  error?: string;
  response?: string;
};

type UnitSelection = {
  selected: boolean;
  count: number;
};

type AnswerMap = Record<string, number[]>;
type FeedbackMap = Record<string, boolean>;
type AiStateMap = Record<string, AiState>;

const libraryStorageKey = "quiz-machine:library-v1";
const legacyMissedStorageKey = "quiz-machine:missed-questions";
const legacyAnsweredStorageKey = "quiz-machine:answered-questions";
const aiSettingsStorageKey = "quiz-machine:ai-settings";
const themeStorageKey = "quiz-machine:theme";

const themes: ReadonlyArray<{ id: ThemeId; name: string }> = [
  { id: "paper", name: "Paper" },
  { id: "catppuccin-mocha", name: "Catppuccin Mocha" },
  { id: "shades-of-purple", name: "Shades of Purple" },
  { id: "monokai-classic", name: "Monokai Classic" },
  { id: "solarized-dark", name: "Solarized Dark" },
  { id: "dracula", name: "Dracula" },
  { id: "nord-dark", name: "Nord Dark" },
  { id: "gruvbox-dark", name: "Gruvbox Dark Medium" },
  { id: "tokyo-night", name: "Tokyo Night" },
];

const themeIds = new Set<ThemeId>(themes.map(theme => theme.id));

const defaultAiSettings: AiSettings = {
  baseUrl: "https://api.openai.com/v1",
  model: "",
  apiKey: "",
};

const sampleJson = `[
  {
    "question": "Which are prime numbers?",
    "answers": ["2", "4", "5", "9"],
    "correctAnswers": [0, 2],
    "explanation": "2 and 5 are prime numbers."
  }
]`;

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function createQuestionKey(question: ImportedQuestion) {
  if (question.id?.trim()) {
    return question.id.trim();
  }

  const source = `${question.question}|${question.answers.join("|")}|${question.correctAnswers.join(",")}`;
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  }

  return `generated-${hash.toString(36)}`;
}

function scopedQuestionKey(subjectId: string, unitId: string, questionKey: string) {
  return `${subjectId}:${unitId}:${questionKey}`;
}

function normalizeIndexes(indexes: number[]) {
  return [...indexes].sort((left, right) => left - right);
}

function areAnswersCorrect(selected: number[] | undefined, correctAnswers: number[]) {
  if (!selected || selected.length !== correctAnswers.length) {
    return false;
  }

  const normalizedSelected = normalizeIndexes(selected);
  const normalizedCorrect = normalizeIndexes(correctAnswers);
  return normalizedSelected.every((answer, index) => answer === normalizedCorrect[index]);
}

function shuffleQuestions<T>(questions: T[]) {
  const copy = [...questions];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex]!, copy[index]!];
  }
  return copy;
}

function readStorageMap<T>(key: string): Record<string, T> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed as Record<string, T>;
  } catch {
    return {};
  }
}

function createEmptySubject(name = "General"): Subject {
  const now = new Date().toISOString();
  return {
    id: createId("subject"),
    name,
    units: [],
    progress: { missed: {}, answered: {} },
    createdAt: now,
    updatedAt: now,
  };
}

function coerceSubject(value: unknown): Subject | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const candidate = value as Partial<Subject>;
  if (typeof candidate.id !== "string" || typeof candidate.name !== "string") {
    return undefined;
  }

  const units = Array.isArray(candidate.units)
    ? candidate.units.flatMap(unit => {
        if (!unit || typeof unit !== "object" || Array.isArray(unit)) {
          return [];
        }
        const candidateUnit = unit as Partial<Unit>;
        if (typeof candidateUnit.id !== "string" || typeof candidateUnit.name !== "string" || !Array.isArray(candidateUnit.questions)) {
          return [];
        }
        return [
          {
            id: candidateUnit.id,
            name: candidateUnit.name,
            sourceFileName: typeof candidateUnit.sourceFileName === "string" ? candidateUnit.sourceFileName : "",
            questions: candidateUnit.questions.filter(Boolean) as StoredQuestion[],
            createdAt: typeof candidateUnit.createdAt === "string" ? candidateUnit.createdAt : new Date().toISOString(),
            updatedAt: typeof candidateUnit.updatedAt === "string" ? candidateUnit.updatedAt : new Date().toISOString(),
          },
        ];
      })
    : [];

  return {
    id: candidate.id,
    name: candidate.name,
    units,
    progress: {
      missed: candidate.progress?.missed && typeof candidate.progress.missed === "object" ? candidate.progress.missed : {},
      answered: candidate.progress?.answered && typeof candidate.progress.answered === "object" ? candidate.progress.answered : {},
    },
    createdAt: typeof candidate.createdAt === "string" ? candidate.createdAt : new Date().toISOString(),
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : new Date().toISOString(),
  };
}

function createLibraryFromLegacy(): Library {
  const legacyMissed = readStorageMap<Omit<MissedRecord, "sourceKey" | "unitId" | "unitName">>(legacyMissedStorageKey);
  const legacyAnswered = readStorageMap<Omit<AnsweredRecord, "sourceKey" | "unitId" | "unitName">>(legacyAnsweredStorageKey);
  const hasLegacy = Object.keys(legacyMissed).length > 0 || Object.keys(legacyAnswered).length > 0;
  const subject = createEmptySubject(hasLegacy ? "Legacy" : "General");

  if (!hasLegacy) {
    return { subjects: [subject], activeSubjectId: subject.id };
  }

  const now = new Date().toISOString();
  const unit: Unit = {
    id: createId("unit"),
    name: "Imported history",
    sourceFileName: "legacy-history",
    questions: [],
    createdAt: now,
    updatedAt: now,
  };
  const progress: SubjectProgress = { missed: {}, answered: {} };
  const storedQuestions = new Map<string, StoredQuestion>();

  const rememberQuestion = (record: { key: string; question: string; answers: string[]; correctAnswers: number[]; explanation?: string }) => {
    const sourceKey = record.key;
    storedQuestions.set(sourceKey, {
      key: sourceKey,
      question: record.question,
      answers: record.answers,
      correctAnswers: record.correctAnswers,
      explanation: record.explanation,
    });
    return scopedQuestionKey(subject.id, unit.id, sourceKey);
  };

  Object.values(legacyMissed).forEach(record => {
    const key = rememberQuestion(record);
    progress.missed[key] = {
      ...record,
      key,
      sourceKey: record.key,
      unitId: unit.id,
      unitName: unit.name,
    };
  });

  Object.values(legacyAnswered).forEach(record => {
    const key = rememberQuestion(record);
    progress.answered[key] = {
      ...record,
      key,
      sourceKey: record.key,
      unitId: unit.id,
      unitName: unit.name,
    };
  });

  unit.questions = Array.from(storedQuestions.values());
  subject.units = [unit];
  subject.progress = progress;
  return { subjects: [subject], activeSubjectId: subject.id, activeUnitId: unit.id };
}

function readLibrary(): Library {
  try {
    const raw = localStorage.getItem(libraryStorageKey);
    if (!raw) {
      const migrated = createLibraryFromLegacy();
      localStorage.setItem(libraryStorageKey, JSON.stringify(migrated));
      return migrated;
    }

    const parsed = JSON.parse(raw) as Partial<Library>;
    const subjects = Array.isArray(parsed.subjects) ? parsed.subjects.flatMap(subject => coerceSubject(subject) ?? []) : [];
    if (subjects.length === 0) {
      const migrated = createLibraryFromLegacy();
      localStorage.setItem(libraryStorageKey, JSON.stringify(migrated));
      return migrated;
    }

    const activeSubjectId = subjects.some(subject => subject.id === parsed.activeSubjectId) ? parsed.activeSubjectId : subjects[0]!.id;
    const activeSubject = subjects.find(subject => subject.id === activeSubjectId) ?? subjects[0]!;
    const activeUnitId = activeSubject.units.some(unit => unit.id === parsed.activeUnitId) ? parsed.activeUnitId : activeSubject.units[0]?.id;
    return { subjects, activeSubjectId, activeUnitId };
  } catch {
    const migrated = createLibraryFromLegacy();
    localStorage.setItem(libraryStorageKey, JSON.stringify(migrated));
    return migrated;
  }
}

function readAiSettings(): AiSettings {
  try {
    const raw = localStorage.getItem(aiSettingsStorageKey);
    if (!raw) {
      return defaultAiSettings;
    }

    const parsed = JSON.parse(raw) as Partial<AiSettings>;
    return {
      baseUrl: typeof parsed.baseUrl === "string" && parsed.baseUrl.trim() ? parsed.baseUrl.trim() : defaultAiSettings.baseUrl,
      model: typeof parsed.model === "string" ? parsed.model : "",
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
    };
  } catch {
    return defaultAiSettings;
  }
}

function readTheme(): ThemeId {
  try {
    const storedTheme = localStorage.getItem(themeStorageKey);
    return storedTheme && themeIds.has(storedTheme as ThemeId) ? (storedTheme as ThemeId) : "paper";
  } catch {
    return "paper";
  }
}

function validateQuestions(value: unknown) {
  const errors: string[] = [];

  if (!Array.isArray(value)) {
    return { questions: [], errors: ["The JSON file must contain an array of question objects."] };
  }

  const questions = value.flatMap((item, index): StoredQuestion[] => {
    const label = `Question ${index + 1}`;
    const startErrorCount = errors.length;
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push(`${label} must be an object.`);
      return [];
    }

    const candidate = item as Partial<ImportedQuestion>;
    if (typeof candidate.question !== "string" || !candidate.question.trim()) {
      errors.push(`${label} needs a non-empty question.`);
    }

    if (!Array.isArray(candidate.answers) || candidate.answers.length < 2) {
      errors.push(`${label} needs at least 2 answers.`);
    } else {
      candidate.answers.forEach((answer, answerIndex) => {
        if (typeof answer !== "string" || !answer.trim()) {
          errors.push(`${label} answer ${answerIndex + 1} must be a non-empty string.`);
        }
      });
    }

    if (!Array.isArray(candidate.correctAnswers) || candidate.correctAnswers.length === 0) {
      errors.push(`${label} needs at least 1 correct answer index.`);
    } else if (Array.isArray(candidate.answers)) {
      const seen = new Set<number>();
      candidate.correctAnswers.forEach((answer, answerIndex) => {
        if (!Number.isInteger(answer)) {
          errors.push(`${label} correctAnswers[${answerIndex}] must be an integer.`);
          return;
        }

        if (answer < 0 || answer >= candidate.answers!.length) {
          errors.push(`${label} correctAnswers[${answerIndex}] is outside the answers array.`);
        }

        if (seen.has(answer)) {
          errors.push(`${label} repeats correct answer index ${answer}.`);
        }
        seen.add(answer);
      });
    }

    if (candidate.id !== undefined && typeof candidate.id !== "string") {
      errors.push(`${label} id must be a string when provided.`);
    }

    if (candidate.explanation !== undefined && typeof candidate.explanation !== "string") {
      errors.push(`${label} explanation must be a string when provided.`);
    }

    if (errors.length > startErrorCount) {
      return [];
    }

    const importedQuestion: ImportedQuestion = {
      id: candidate.id?.trim() || undefined,
      question: candidate.question!.trim(),
      answers: candidate.answers!.map(answer => answer.trim()),
      correctAnswers: normalizeIndexes(candidate.correctAnswers!),
      explanation: candidate.explanation?.trim() || undefined,
    };

    return [{ ...importedQuestion, key: createQuestionKey(importedQuestion) }];
  });

  return { questions, errors };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable;
}

function labelAnswers(question: QuizQuestion | MissedRecord | AnsweredRecord, indexes: number[] | undefined) {
  return indexes?.map(index => question.answers[index]).filter(Boolean).join(", ") || "No answer";
}

function renderInlineMarkdown(text: string) {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={`${token}-${match.index}`}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<code key={`${token}-${match.index}`}>{token.slice(1, -1)}</code>);
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function RichText({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/).map(block => block.trim()).filter(Boolean);

  return (
    <div className="rich-text">
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n").map(line => line.trim()).filter(Boolean);
        const heading = block.match(/^(#{1,3})\s+(.+)$/);
        const bulletLines = lines.filter(line => /^[-*]\s+/.test(line));
        const numberedLines = lines.filter(line => /^\d+[.)]\s+/.test(line));

        if (heading) {
          const HeadingTag = heading[1].length === 1 ? "h3" : "h4";
          return <HeadingTag key={blockIndex}>{renderInlineMarkdown(heading[2])}</HeadingTag>;
        }

        if (bulletLines.length === lines.length) {
          return (
            <ul key={blockIndex}>
              {bulletLines.map((line, lineIndex) => (
                <li key={lineIndex}>{renderInlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        if (numberedLines.length === lines.length) {
          return (
            <ol key={blockIndex}>
              {numberedLines.map((line, lineIndex) => (
                <li key={lineIndex}>{renderInlineMarkdown(line.replace(/^\d+[.)]\s+/, ""))}</li>
              ))}
            </ol>
          );
        }

        return <p key={blockIndex}>{renderInlineMarkdown(lines.join(" "))}</p>;
      })}
    </div>
  );
}

export function App() {
  const [library, setLibrary] = useState<Library>(() => readLibrary());
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [subjectDraft, setSubjectDraft] = useState("");
  const [unitDraft, setUnitDraft] = useState("");
  const [unitSelections, setUnitSelections] = useState<Record<string, UnitSelection>>({});
  const [gradingMode, setGradingMode] = useState<GradingMode>("instant");
  const [omitAnswered, setOmitAnswered] = useState(false);
  const [screen, setScreen] = useState<Screen>("setup");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizMode, setQuizMode] = useState<QuizMode>("normal");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [feedback, setFeedback] = useState<FeedbackMap>({});
  const [answerFocus, setAnswerFocus] = useState<Record<string, number>>({});
  const [recordedMisses, setRecordedMisses] = useState<Record<string, boolean>>({});
  const [recordedAnswers, setRecordedAnswers] = useState<Record<string, boolean>>({});
  const [removeCorrectMissed, setRemoveCorrectMissed] = useState(false);
  const [aiSettings, setAiSettings] = useState<AiSettings>(() => readAiSettings());
  const [aiDraft, setAiDraft] = useState<AiSettings>(() => readAiSettings());
  const [aiStatus, setAiStatus] = useState("");
  const [aiStates, setAiStates] = useState<AiStateMap>({});
  const [theme, setTheme] = useState<ThemeId>(() => readTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(themeStorageKey, theme);
    } catch {
      // The selected theme still applies for this session when storage is unavailable.
    }
  }, [theme]);

  const activeSubject = useMemo(
    () => library.subjects.find(subject => subject.id === library.activeSubjectId) ?? library.subjects[0],
    [library.activeSubjectId, library.subjects],
  );
  const activeUnit = activeSubject?.units.find(unit => unit.id === library.activeUnitId) ?? activeSubject?.units[0];
  const currentQuestion = quizQuestions[currentIndex];
  const answeredQuestions = activeSubject?.progress.answered ?? {};
  const missedQuestions = activeSubject?.progress.missed ?? {};
  const missedList = useMemo(
    () => Object.values(missedQuestions).sort((left, right) => Date.parse(right.lastMissedAt) - Date.parse(left.lastMissedAt)),
    [missedQuestions],
  );
  const answeredList = useMemo(
    () => Object.values(answeredQuestions).sort((left, right) => Date.parse(right.lastAnsweredAt) - Date.parse(left.lastAnsweredAt)),
    [answeredQuestions],
  );
  const selectedCount = quizQuestions.filter(question => (answers[question.key]?.length ?? 0) > 0).length;
  const quizComplete = quizQuestions.length > 0 && quizQuestions.every(question => feedback[question.key] !== undefined);
  const score = useMemo(
    () => quizQuestions.filter(question => areAnswersCorrect(answers[question.key], question.correctAnswers)).length,
    [answers, quizQuestions],
  );
  const currentFocusedAnswer = currentQuestion ? answerFocus[currentQuestion.key] ?? 0 : 0;

  const unitsWithQuestions = activeSubject?.units.filter(unit => unit.questions.length > 0) ?? [];
  const selectedQuizTotal = unitsWithQuestions.reduce((total, unit) => {
    const selection = unitSelections[unit.id];
    if (!selection?.selected) {
      return total;
    }
    return total + Math.min(selection.count, getAvailableQuestionsForUnit(unit).length);
  }, 0);

  function persistLibrary(nextLibrary: Library) {
    setLibrary(nextLibrary);
    localStorage.setItem(libraryStorageKey, JSON.stringify(nextLibrary));
  }

  function updateLibrary(updater: (previous: Library) => Library) {
    setLibrary(previous => {
      const next = updater(previous);
      localStorage.setItem(libraryStorageKey, JSON.stringify(next));
      return next;
    });
  }

  function updateActiveSubject(updater: (subject: Subject) => Subject) {
    updateLibrary(previous => {
      const subjectId = previous.activeSubjectId ?? previous.subjects[0]?.id;
      return {
        ...previous,
        subjects: previous.subjects.map(subject => (subject.id === subjectId ? updater(subject) : subject)),
      };
    });
  }

  function getQuestionForQuiz(unit: Unit, question: StoredQuestion): QuizQuestion {
    return {
      ...question,
      key: scopedQuestionKey(activeSubject!.id, unit.id, question.key),
      sourceKey: question.key,
      subjectId: activeSubject!.id,
      unitId: unit.id,
      unitName: unit.name,
    };
  }

  function getAvailableQuestionsForUnit(unit: Unit) {
    if (!activeSubject) {
      return [];
    }

    return unit.questions
      .map(question => getQuestionForQuiz(unit, question))
      .filter(question => !omitAnswered || !answeredQuestions[question.key]);
  }

  const addSubject = () => {
    const name = subjectDraft.trim();
    if (!name) {
      return;
    }

    const subject = createEmptySubject(name);
    persistLibrary({
      subjects: [...library.subjects, subject],
      activeSubjectId: subject.id,
      activeUnitId: undefined,
    });
    setSubjectDraft("");
    setImportErrors([]);
    setUnitSelections({});
    setScreen("setup");
  };

  const renameSubject = () => {
    if (!activeSubject) {
      return;
    }

    const name = window.prompt("Subject name", activeSubject.name)?.trim();
    if (!name) {
      return;
    }

    updateActiveSubject(subject => ({ ...subject, name, updatedAt: new Date().toISOString() }));
  };

  const deleteSubject = () => {
    if (!activeSubject || library.subjects.length <= 1) {
      return;
    }

    if (!window.confirm(`Delete "${activeSubject.name}" and all of its units and history?`)) {
      return;
    }

    const subjects = library.subjects.filter(subject => subject.id !== activeSubject.id);
    persistLibrary({
      subjects,
      activeSubjectId: subjects[0]?.id,
      activeUnitId: subjects[0]?.units[0]?.id,
    });
    setUnitSelections({});
  };

  const addUnit = () => {
    if (!activeSubject) {
      return;
    }

    const name = unitDraft.trim();
    if (!name) {
      return;
    }

    const now = new Date().toISOString();
    const unit: Unit = {
      id: createId("unit"),
      name,
      sourceFileName: "",
      questions: [],
      createdAt: now,
      updatedAt: now,
    };

    updateLibrary(previous => ({
      ...previous,
      activeUnitId: unit.id,
      subjects: previous.subjects.map(subject =>
        subject.id === activeSubject.id
          ? { ...subject, units: [...subject.units, unit], updatedAt: now }
          : subject,
      ),
    }));
    setUnitDraft("");
    setImportErrors([]);
  };

  const renameUnit = (unit: Unit) => {
    const name = window.prompt("Unit name", unit.name)?.trim();
    if (!name) {
      return;
    }

    const now = new Date().toISOString();
    updateActiveSubject(subject => ({
      ...subject,
      units: subject.units.map(currentUnit => (currentUnit.id === unit.id ? { ...currentUnit, name, updatedAt: now } : currentUnit)),
      progress: {
        missed: Object.fromEntries(
          Object.entries(subject.progress.missed).map(([key, record]) => [key, record.unitId === unit.id ? { ...record, unitName: name } : record]),
        ),
        answered: Object.fromEntries(
          Object.entries(subject.progress.answered).map(([key, record]) => [key, record.unitId === unit.id ? { ...record, unitName: name } : record]),
        ),
      },
      updatedAt: now,
    }));
  };

  const deleteUnit = (unit: Unit) => {
    if (!window.confirm(`Delete "${unit.name}" and its saved progress?`)) {
      return;
    }

    updateLibrary(previous => {
      const nextSubjects = previous.subjects.map(subject => {
        if (subject.id !== activeSubject?.id) {
          return subject;
        }

        const missed = { ...subject.progress.missed };
        const answered = { ...subject.progress.answered };
        Object.keys(missed).forEach(key => {
          if (missed[key]?.unitId === unit.id) {
            delete missed[key];
          }
        });
        Object.keys(answered).forEach(key => {
          if (answered[key]?.unitId === unit.id) {
            delete answered[key];
          }
        });

        return {
          ...subject,
          units: subject.units.filter(currentUnit => currentUnit.id !== unit.id),
          progress: { missed, answered },
          updatedAt: new Date().toISOString(),
        };
      });
      const nextSubject = nextSubjects.find(subject => subject.id === previous.activeSubjectId) ?? nextSubjects[0];
      return {
        ...previous,
        subjects: nextSubjects,
        activeUnitId: nextSubject?.units.find(currentUnit => currentUnit.id !== unit.id)?.id ?? nextSubject?.units[0]?.id,
      };
    });
    setUnitSelections(previous => {
      const next = { ...previous };
      delete next[unit.id];
      return next;
    });
  };

  const handleFileImport = async (file: File | undefined) => {
    setImportErrors([]);
    if (!file || !activeSubject || !activeUnit) {
      return;
    }

    if (activeUnit.questions.length > 0 && !window.confirm(`Replace the question file for "${activeUnit.name}"? Existing unit progress will be kept by matching question IDs.`)) {
      return;
    }

    try {
      const parsed = JSON.parse(await file.text());
      const result = validateQuestions(parsed);
      if (result.errors.length > 0) {
        setImportErrors(result.errors);
        return;
      }

      const now = new Date().toISOString();
      updateActiveSubject(subject => ({
        ...subject,
        units: subject.units.map(unit =>
          unit.id === activeUnit.id
            ? {
                ...unit,
                sourceFileName: file.name,
                questions: result.questions,
                updatedAt: now,
              }
            : unit,
        ),
        updatedAt: now,
      }));

      setUnitSelections(previous => ({
        ...previous,
        [activeUnit.id]: { selected: true, count: Math.min(10, result.questions.length) },
      }));
      setScreen("setup");
    } catch (error) {
      setImportErrors([`Could not read JSON: ${error instanceof Error ? error.message : String(error)}`]);
    }
  };

  const setUnitSelection = (unit: Unit, patch: Partial<UnitSelection>) => {
    const availableCount = getAvailableQuestionsForUnit(unit).length;
    setUnitSelections(previous => {
      const current = previous[unit.id] ?? { selected: false, count: Math.min(10, Math.max(1, availableCount)) };
      const nextCount = Math.min(Math.max(1, patch.count ?? current.count), Math.max(1, availableCount));
      return {
        ...previous,
        [unit.id]: {
          selected: patch.selected ?? current.selected,
          count: nextCount,
        },
      };
    });
  };

  const saveSubjectProgress = (updater: (progress: SubjectProgress) => SubjectProgress) => {
    updateActiveSubject(subject => ({ ...subject, progress: updater(subject.progress), updatedAt: new Date().toISOString() }));
  };

  const recordAnswered = (question: QuizQuestion, selectedAnswers: number[], isCorrect: boolean, answeredAt: string) => {
    if (selectedAnswers.length === 0 || recordedAnswers[question.key]) {
      return;
    }

    saveSubjectProgress(progress => {
      const previousRecord = progress.answered[question.key];
      return {
        ...progress,
        answered: {
          ...progress.answered,
          [question.key]: {
            key: question.key,
            sourceKey: question.sourceKey,
            unitId: question.unitId,
            unitName: question.unitName,
            question: question.question,
            answers: question.answers,
            correctAnswers: question.correctAnswers,
            selectedAnswers,
            attemptCount: (previousRecord?.attemptCount ?? 0) + 1,
            correctCount: (previousRecord?.correctCount ?? 0) + (isCorrect ? 1 : 0),
            lastAnsweredAt: answeredAt,
            lastCorrect: isCorrect,
          },
        },
      };
    });
    setRecordedAnswers(previous => ({ ...previous, [question.key]: true }));
  };

  const recordMiss = (question: QuizQuestion, missedAt: string) => {
    if (recordedMisses[question.key]) {
      return;
    }

    saveSubjectProgress(progress => {
      const previousRecord = progress.missed[question.key];
      return {
        ...progress,
        missed: {
          ...progress.missed,
          [question.key]: {
            key: question.key,
            sourceKey: question.sourceKey,
            unitId: question.unitId,
            unitName: question.unitName,
            question: question.question,
            answers: question.answers,
            correctAnswers: question.correctAnswers,
            explanation: question.explanation,
            missCount: (previousRecord?.missCount ?? 0) + 1,
            lastMissedAt: missedAt,
          },
        },
      };
    });
    setRecordedMisses(previous => ({ ...previous, [question.key]: true }));
  };

  const removeFromMissed = (questionKey: string) => {
    saveSubjectProgress(progress => {
      if (!progress.missed[questionKey]) {
        return progress;
      }

      const missed = { ...progress.missed };
      delete missed[questionKey];
      return { ...progress, missed };
    });
  };

  const gradeQuestion = (question: QuizQuestion) => {
    const selectedAnswers = answers[question.key] ?? [];
    const isCorrect = areAnswersCorrect(selectedAnswers, question.correctAnswers);
    const now = new Date().toISOString();

    setFeedback(previousState => ({ ...previousState, [question.key]: isCorrect }));
    recordAnswered(question, selectedAnswers, isCorrect, now);
    if (!isCorrect) {
      recordMiss(question, now);
    } else if (quizMode === "missed" && removeCorrectMissed) {
      removeFromMissed(question.key);
    }
  };

  const prepareQuiz = (selected: QuizQuestion[], mode: QuizMode) => {
    setQuizQuestions(selected);
    setQuizMode(mode);
    setCurrentIndex(0);
    setAnswers({});
    setFeedback({});
    setAnswerFocus(Object.fromEntries(selected.map(question => [question.key, 0])));
    setRecordedMisses({});
    setRecordedAnswers({});
    setAiStates({});
    setScreen("quiz");
  };

  const startQuiz = () => {
    const selected = unitsWithQuestions.flatMap(unit => {
      const selection = unitSelections[unit.id];
      if (!selection?.selected) {
        return [];
      }

      const available = getAvailableQuestionsForUnit(unit);
      return shuffleQuestions(available).slice(0, Math.min(selection.count, available.length));
    });

    prepareQuiz(shuffleQuestions(selected), "normal");
  };

  const startMissedQuiz = () => {
    const missedAsQuestions = missedList.map(
      (question): QuizQuestion => ({
        key: question.key,
        sourceKey: question.sourceKey,
        subjectId: activeSubject!.id,
        unitId: question.unitId,
        unitName: question.unitName,
        question: question.question,
        answers: question.answers,
        correctAnswers: question.correctAnswers,
        explanation: question.explanation,
      }),
    );
    prepareQuiz(shuffleQuestions(missedAsQuestions), "missed");
  };

  const finishQuiz = () => {
    const nextFeedback: FeedbackMap = {};
    const nextRecordedMisses: Record<string, boolean> = {};
    const nextRecordedAnswers: Record<string, boolean> = {};
    const nextResolvedMisses: Record<string, boolean> = {};
    const now = new Date().toISOString();

    quizQuestions.forEach(question => {
      const selectedAnswers = answers[question.key] ?? [];
      const isCorrect = areAnswersCorrect(selectedAnswers, question.correctAnswers);
      nextFeedback[question.key] = isCorrect;

      if (selectedAnswers.length > 0 && !recordedAnswers[question.key]) {
        nextRecordedAnswers[question.key] = true;
      }
      if (!isCorrect && !recordedMisses[question.key]) {
        nextRecordedMisses[question.key] = true;
      } else if (isCorrect && quizMode === "missed" && removeCorrectMissed) {
        nextResolvedMisses[question.key] = true;
      }
    });

    saveSubjectProgress(progress => {
      const missed = { ...progress.missed };
      const answered = { ...progress.answered };

      quizQuestions.forEach(question => {
        const selectedAnswers = answers[question.key] ?? [];
        const isCorrect = areAnswersCorrect(selectedAnswers, question.correctAnswers);

        if (nextRecordedAnswers[question.key]) {
          const previousRecord = answered[question.key];
          answered[question.key] = {
            key: question.key,
            sourceKey: question.sourceKey,
            unitId: question.unitId,
            unitName: question.unitName,
            question: question.question,
            answers: question.answers,
            correctAnswers: question.correctAnswers,
            selectedAnswers,
            attemptCount: (previousRecord?.attemptCount ?? 0) + 1,
            correctCount: (previousRecord?.correctCount ?? 0) + (isCorrect ? 1 : 0),
            lastAnsweredAt: now,
            lastCorrect: isCorrect,
          };
        }

        if (nextRecordedMisses[question.key]) {
          const previousRecord = missed[question.key];
          missed[question.key] = {
            key: question.key,
            sourceKey: question.sourceKey,
            unitId: question.unitId,
            unitName: question.unitName,
            question: question.question,
            answers: question.answers,
            correctAnswers: question.correctAnswers,
            explanation: question.explanation,
            missCount: (previousRecord?.missCount ?? 0) + 1,
            lastMissedAt: now,
          };
        }

        if (nextResolvedMisses[question.key]) {
          delete missed[question.key];
        }
      });

      return { missed, answered };
    });

    setRecordedAnswers(previous => ({ ...previous, ...nextRecordedAnswers }));
    setRecordedMisses(previous => ({ ...previous, ...nextRecordedMisses }));
    setFeedback(nextFeedback);
    setScreen("results");
  };

  const toggleAnswer = (question: QuizQuestion, answerIndex: number) => {
    if (feedback[question.key] !== undefined) {
      return;
    }

    const isMultiple = question.correctAnswers.length > 1;
    const previous = answers[question.key] ?? [];
    const nextAnswers = isMultiple
      ? previous.includes(answerIndex)
        ? previous.filter(answer => answer !== answerIndex)
        : [...previous, answerIndex]
      : [answerIndex];

    setAnswerFocus(previousState => ({ ...previousState, [question.key]: answerIndex }));
    setAnswers(previousState => ({ ...previousState, [question.key]: normalizeIndexes(nextAnswers) }));
  };

  const saveAiSettings = () => {
    const next = {
      baseUrl: aiDraft.baseUrl.trim().replace(/\/$/, "") || defaultAiSettings.baseUrl,
      model: aiDraft.model.trim(),
      apiKey: aiDraft.apiKey.trim(),
    };
    setAiSettings(next);
    setAiDraft(next);
    localStorage.setItem(aiSettingsStorageKey, JSON.stringify(next));
    setAiStatus("AI settings saved locally.");
  };

  const clearAiSettings = () => {
    setAiSettings(defaultAiSettings);
    setAiDraft(defaultAiSettings);
    localStorage.removeItem(aiSettingsStorageKey);
    setAiStatus("AI settings cleared.");
  };

  const askAi = async (question: QuizQuestion) => {
    if (!aiSettings.model || !aiSettings.apiKey) {
      setAiStates(previous => ({
        ...previous,
        [question.key]: { loading: false, error: "Add an AI model and API key in setup first." },
      }));
      return;
    }

    const selectedAnswers = answers[question.key] ?? [];
    const isCorrect = areAnswersCorrect(selectedAnswers, question.correctAnswers);
    const endpoint = `${aiSettings.baseUrl.replace(/\/$/, "")}/chat/completions`;

    setAiStates(previous => ({ ...previous, [question.key]: { loading: true } }));

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aiSettings.apiKey}`,
        },
        body: JSON.stringify({
          model: aiSettings.model,
          messages: [
            {
              role: "system",
              content:
                "You explain quiz answers clearly and concisely. Use markdown with short headings and bullet lists. Explain why the selected answer is right or wrong, why incorrect options are wrong, and why each correct option is correct.",
            },
            {
              role: "user",
              content: JSON.stringify(
                {
                  unit: question.unitName,
                  question: question.question,
                  answers: question.answers.map((answer, index) => ({ index, answer })),
                  selectedAnswers,
                  selectedAnswerText: selectedAnswers.map(index => question.answers[index]),
                  correctAnswers: question.correctAnswers,
                  correctAnswerText: question.correctAnswers.map(index => question.answers[index]),
                  wasCorrect: isCorrect,
                  builtInExplanation: question.explanation,
                },
                null,
                2,
              ),
            },
          ],
          temperature: 0.2,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || `AI request failed with ${response.status}.`);
      }

      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) {
        throw new Error("AI response did not include message content.");
      }

      setAiStates(previous => ({ ...previous, [question.key]: { loading: false, response: content.trim() } }));
    } catch (error) {
      setAiStates(previous => ({
        ...previous,
        [question.key]: { loading: false, error: error instanceof Error ? error.message : String(error) },
      }));
    }
  };

  const clearMissedHistory = () => {
    saveSubjectProgress(progress => ({ ...progress, missed: {} }));
  };

  const clearAnsweredHistory = () => {
    saveSubjectProgress(progress => ({ ...progress, answered: {} }));
  };

  useEffect(() => {
    if (!activeSubject) {
      return;
    }

    setUnitSelections(previous => {
      const next: Record<string, UnitSelection> = {};
      activeSubject.units.forEach(unit => {
        const available = getAvailableQuestionsForUnit(unit).length;
        const existing = previous[unit.id];
        next[unit.id] = {
          selected: existing?.selected ?? false,
          count: Math.min(Math.max(1, existing?.count ?? Math.min(10, Math.max(1, available))), Math.max(1, available)),
        };
      });
      return next;
    });
  }, [activeSubject?.id, activeSubject?.units.length, omitAnswered, answeredList.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (screen !== "quiz" || !currentQuestion || isEditableTarget(event.target)) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setCurrentIndex(previous => Math.max(0, previous - 1));
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setCurrentIndex(previous => Math.min(quizQuestions.length - 1, previous + 1));
        return;
      }

      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        const direction = event.key === "ArrowUp" ? -1 : 1;
        setAnswerFocus(previous => {
          const current = previous[currentQuestion.key] ?? 0;
          const next = (current + direction + currentQuestion.answers.length) % currentQuestion.answers.length;
          return { ...previous, [currentQuestion.key]: next };
        });
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const isGraded = feedback[currentQuestion.key] !== undefined;
        if (isGraded) {
          return;
        }

        const focusedAnswer = answerFocus[currentQuestion.key] ?? 0;
        const hasSelection = (answers[currentQuestion.key]?.length ?? 0) > 0;
        const focusedAlreadySelected = answers[currentQuestion.key]?.includes(focusedAnswer) ?? false;

        if (gradingMode === "instant" && hasSelection && focusedAlreadySelected) {
          gradeQuestion(currentQuestion);
          return;
        }

        toggleAnswer(currentQuestion, focusedAnswer);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [answerFocus, answers, currentQuestion, feedback, gradingMode, quizQuestions.length, screen]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Local quiz machine</p>
          <h1 className="truncate text-xl font-bold leading-tight sm:text-2xl">Quiz workspace</h1>
        </div>
        <nav className="flex shrink-0 flex-wrap gap-2">
            <button className="nav-button" type="button" aria-pressed={screen === "setup"} onClick={() => setScreen("setup")}>
              Setup
            </button>
            <button className="nav-button" type="button" aria-pressed={screen === "missed"} onClick={() => setScreen("missed")}>
              Missed ({missedList.length})
            </button>
        </nav>
      </header>

      <div className="app-body">
        {activeSubject && (
          <aside className="subject-sidebar" aria-label="Subjects">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="sidebar-kicker">Library</p>
                <h2 className="text-lg font-bold">Subjects</h2>
              </div>
              <span className="count-badge">{library.subjects.length}</span>
            </div>

            <div className="subject-list" role="list">
              {library.subjects.map(subject => {
                const questionCount = subject.units.reduce((sum, unit) => sum + unit.questions.length, 0);
                const isActive = subject.id === activeSubject.id;
                return (
                  <button
                    className="subject-item"
                    type="button"
                    role="listitem"
                    aria-pressed={isActive}
                    key={subject.id}
                    onClick={() => {
                      persistLibrary({ ...library, activeSubjectId: subject.id, activeUnitId: subject.units[0]?.id });
                      setUnitSelections({});
                    }}
                  >
                    <span className="truncate font-semibold">{subject.name}</span>
                    <span className="subject-meta">{subject.units.length} units · {questionCount} questions</span>
                  </button>
                );
              })}
            </div>

            <div className="sidebar-actions">
              <div className="flex gap-2">
                <input
                  className="input min-w-0"
                  type="text"
                  aria-label="New subject name"
                  placeholder="New subject"
                  value={subjectDraft}
                  onChange={event => setSubjectDraft(event.currentTarget.value)}
                  onKeyDown={event => {
                    if (event.key === "Enter") addSubject();
                  }}
                />
                <button className="primary-button shrink-0" type="button" onClick={addSubject}>
                  Add
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="secondary-button" type="button" onClick={renameSubject}>
                  Rename
                </button>
                <button className="secondary-button" type="button" disabled={library.subjects.length <= 1} onClick={deleteSubject}>
                  Delete
                </button>
              </div>
            </div>

            <div className="subject-summary">
              <p className="truncate font-bold">{activeSubject.name}</p>
              <div className="summary-grid">
                <span><strong>{answeredList.length}</strong> answered</span>
                <span><strong>{missedList.length}</strong> missed</span>
              </div>
              <button className="text-button" type="button" disabled={answeredList.length === 0} onClick={clearAnsweredHistory}>
                Reset answered history
              </button>
            </div>
          </aside>
        )}

        <div className="workspace">

        {screen === "setup" && activeSubject && (
          <section className="setup-grid">
            <div className="panel min-h-0">
              <div className="flex flex-col gap-2">
                <h2 className="section-title">Units</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Manage question files for {activeSubject.name}.</p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  className="input"
                  type="text"
                  placeholder="New unit name"
                  value={unitDraft}
                  onChange={event => setUnitDraft(event.currentTarget.value)}
                />
                <button className="primary-button shrink-0" type="button" onClick={addUnit}>
                  Add
                </button>
              </div>

              {activeSubject.units.length > 0 ? (
                <div className="compact-scroll grid gap-2">
                  {activeSubject.units.map(unit => {
                    const answeredCount = Object.values(answeredQuestions).filter(record => record.unitId === unit.id).length;
                    const missedCount = Object.values(missedQuestions).filter(record => record.unitId === unit.id).length;
                    const isActive = activeUnit?.id === unit.id;
                    return (
                      <article className={`result-card ${isActive ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]" : ""}`} key={unit.id}>
                        <div className="flex items-start justify-between gap-3">
                          <label className="flex cursor-pointer items-start gap-3">
                            <input
                              type="radio"
                              name="active-unit"
                              checked={isActive}
                              onChange={() => persistLibrary({ ...library, activeUnitId: unit.id })}
                            />
                            <span>
                              <span className="block font-semibold">{unit.name}</span>
                              <span className="block text-xs text-[var(--color-text-muted)]">
                                {unit.questions.length} questions · {answeredCount} answered · {missedCount} missed
                              </span>
                              {unit.sourceFileName && <span className="block truncate text-xs text-[var(--color-text-muted)]">{unit.sourceFileName}</span>}
                            </span>
                          </label>
                          <div className="flex shrink-0 gap-1">
                            <button className="icon-button" type="button" title="Rename unit" aria-label={`Rename ${unit.name}`} onClick={() => renameUnit(unit)}>
                              Rename
                            </button>
                            <button className="icon-button" type="button" title="Delete unit" aria-label={`Delete ${unit.name}`} onClick={() => deleteUnit(unit)}>
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="empty-state">Create a unit before uploading questions.</p>
              )}

              <label className={`file-drop ${!activeUnit ? "cursor-not-allowed opacity-60" : ""}`}>
                <input
                  type="file"
                  accept="application/json,.json"
                  className="sr-only"
                  disabled={!activeUnit}
                  onChange={event => void handleFileImport(event.currentTarget.files?.[0])}
                />
                <span className="text-base font-semibold">{activeUnit ? `Upload JSON for ${activeUnit.name}` : "Choose a unit first"}</span>
                <span className="text-sm text-[var(--color-text-faint)]">{activeUnit?.sourceFileName || "No file imported for this unit"}</span>
              </label>

              {importErrors.length > 0 && (
                <div className="rounded-md border border-[var(--color-danger)] bg-[var(--color-danger-bg)] p-4 text-sm text-[var(--color-danger-text)]">
                  <p className="font-semibold">Import failed</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {importErrors.map(error => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="panel min-h-0">
              <div className="flex flex-col gap-2">
                <h2 className="section-title">Quiz Setup</h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Select units from {activeSubject.name} and choose how many questions to draw from each unit.
                </p>
              </div>

              <div className="compact-scroll grid gap-2">
                {unitsWithQuestions.length === 0 ? (
                  <p className="empty-state">Upload questions into at least one unit to create a quiz.</p>
                ) : (
                  unitsWithQuestions.map(unit => {
                    const available = getAvailableQuestionsForUnit(unit);
                    const selection = unitSelections[unit.id] ?? { selected: false, count: Math.min(10, Math.max(1, available.length)) };
                    return (
                      <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-raised)] p-3" key={unit.id}>
                        <div className="grid gap-2 sm:grid-cols-[1fr_110px] sm:items-center">
                          <label className="flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selection.selected}
                              disabled={available.length === 0}
                              onChange={event => setUnitSelection(unit, { selected: event.currentTarget.checked })}
                            />
                            <span>
                              <span className="block font-semibold">{unit.name}</span>
                              <span className="block text-sm text-[var(--color-text-muted)]">
                                {available.length} available of {unit.questions.length} total
                              </span>
                            </span>
                          </label>
                          <label className="grid gap-1">
                            <span className="field-label">Questions</span>
                            <input
                              className="input"
                              type="number"
                              min="1"
                              max={Math.max(1, available.length)}
                              value={selection.count}
                              disabled={!selection.selected || available.length === 0}
                              onChange={event => setUnitSelection(unit, { count: Number(event.currentTarget.value) })}
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <label className="choice-row">
                <input type="checkbox" checked={omitAnswered} onChange={event => setOmitAnswered(event.currentTarget.checked)} />
                <span>Omit answered questions</span>
              </label>

              <fieldset className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <legend className="field-label">Grading mode</legend>
                <label className="choice-row">
                  <input type="radio" name="grading-mode" checked={gradingMode === "instant"} onChange={() => setGradingMode("instant")} />
                  <span>Grade after each answer</span>
                </label>
                <label className="choice-row">
                  <input type="radio" name="grading-mode" checked={gradingMode === "deferred"} onChange={() => setGradingMode("deferred")} />
                  <span>Grade after final submit</span>
                </label>
              </fieldset>

              <div className="flex flex-wrap items-center gap-3">
                <button className="primary-button" type="button" disabled={selectedQuizTotal === 0} onClick={startQuiz}>
                  Start quiz
                </button>
                <span className="text-sm font-semibold text-[var(--color-text-muted)]">{selectedQuizTotal} questions selected</span>
              </div>
              {unitsWithQuestions.length > 0 && selectedQuizTotal === 0 && (
                <p className="text-sm font-semibold text-[var(--color-danger-text)]">Select at least one unit with available questions.</p>
              )}
            </div>

            <details className="settings-panel setup-span">
              <summary>
                <span><strong>Appearance</strong> <small>Theme and color palette</small></span>
              </summary>
              <div className="settings-content">
                <label className="grid max-w-sm gap-2">
                  <span className="field-label">Theme</span>
                  <select
                    className="input"
                    value={theme}
                    onChange={event => setTheme(event.currentTarget.value as ThemeId)}
                  >
                    {themes.map(option => (
                      <option key={option.id} value={option.id}>{option.name}</option>
                    ))}
                  </select>
                </label>
                <p className="text-sm text-[var(--color-text-muted)]">The selected theme applies everywhere and is saved in this browser.</p>
              </div>
            </details>

            <details className="settings-panel setup-span">
              <summary>
                <span><strong>AI explanations</strong> <small>Optional endpoint settings</small></span>
              </summary>
              <div className="settings-content">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Browser settings are stored locally. Use this only on a machine where localStorage is acceptable for your API key.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-[1fr_0.7fr_1fr]">
                <label className="grid gap-2">
                  <span className="field-label">Base URL</span>
                  <input
                    className="input"
                    type="url"
                    value={aiDraft.baseUrl}
                    onChange={event => {
                      const baseUrl = event.currentTarget.value;
                      setAiDraft(previous => ({ ...previous, baseUrl }));
                    }}
                  />
                </label>
                <label className="grid gap-2">
                  <span className="field-label">Model</span>
                  <input
                    className="input"
                    type="text"
                    placeholder="your-model-name"
                    value={aiDraft.model}
                    onChange={event => {
                      const model = event.currentTarget.value;
                      setAiDraft(previous => ({ ...previous, model }));
                    }}
                  />
                </label>
                <label className="grid gap-2">
                  <span className="field-label">API key</span>
                  <input
                    className="input"
                    type="password"
                    placeholder="Stored in this browser"
                    value={aiDraft.apiKey}
                    onChange={event => {
                      const apiKey = event.currentTarget.value;
                      setAiDraft(previous => ({ ...previous, apiKey }));
                    }}
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button className="primary-button" type="button" onClick={saveAiSettings}>
                  Save AI settings
                </button>
                <button className="secondary-button" type="button" onClick={clearAiSettings}>
                  Clear AI settings
                </button>
                {aiStatus && <span className="text-sm font-semibold text-[var(--color-accent)]">{aiStatus}</span>}
              </div>
              </div>
            </details>
          </section>
        )}

        {screen === "quiz" && currentQuestion && (
          <>
            <div className="keyboard-guide" aria-label="Keyboard controls">
              <span>Left/Right: question</span>
              <span>Up/Down: answer focus</span>
              <span>Enter: select or check</span>
            </div>

            <section className="panel">
              <div className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-faint)]">
                    Question {currentIndex + 1} of {quizQuestions.length} · {currentQuestion.unitName}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold leading-tight">{currentQuestion.question}</h2>
                </div>
                <p className="rounded-md bg-[var(--color-accent-soft)] px-3 py-2 text-sm font-semibold text-[var(--color-accent)]">
                  Selected {selectedCount}/{quizQuestions.length}
                </p>
              </div>

              <div className="grid gap-3">
                {currentQuestion.answers.map((answer, answerIndex) => {
                  const isSelected = answers[currentQuestion.key]?.includes(answerIndex) ?? false;
                  const isCorrectAnswer = currentQuestion.correctAnswers.includes(answerIndex);
                  const isGraded = feedback[currentQuestion.key] !== undefined;
                  const isFocused = currentFocusedAnswer === answerIndex;

                  return (
                    <label
                      className={`answer-row ${isFocused ? "answer-row-focused" : ""} ${isSelected ? "answer-row-selected" : ""} ${
                        isGraded && isCorrectAnswer ? "answer-row-correct" : ""
                      } ${isGraded && isSelected && !isCorrectAnswer ? "answer-row-wrong" : ""}`}
                      key={`${currentQuestion.key}-${answer}`}
                    >
                      <input
                        type={currentQuestion.correctAnswers.length > 1 ? "checkbox" : "radio"}
                        name={currentQuestion.key}
                        checked={isSelected}
                        disabled={isGraded}
                        onFocus={() => setAnswerFocus(previous => ({ ...previous, [currentQuestion.key]: answerIndex }))}
                        onChange={() => toggleAnswer(currentQuestion, answerIndex)}
                      />
                      <span>{answer}</span>
                    </label>
                  );
                })}
              </div>

              {feedback[currentQuestion.key] !== undefined && (
                <div className="grid gap-4">
                  <div className={`rounded-md border p-4 ${feedback[currentQuestion.key] ? "border-[var(--color-success)] bg-[var(--color-success-bg)] text-[var(--color-success-text)]" : "border-[var(--color-danger)] bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]"}`}>
                    <p className="font-semibold">{feedback[currentQuestion.key] ? "Correct" : "Not quite"}</p>
                    <p className="mt-1 text-sm">Correct answer: {labelAnswers(currentQuestion, currentQuestion.correctAnswers)}</p>
                    {currentQuestion.explanation && <p className="mt-2 text-sm">{currentQuestion.explanation}</p>}
                  </div>

                  <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-raised)] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">AI explanation</p>
                        <p className="text-sm text-[var(--color-text-muted)]">Ask your configured OpenAI-compatible endpoint to explain this answer.</p>
                      </div>
                      <button className="secondary-button" type="button" disabled={aiStates[currentQuestion.key]?.loading} onClick={() => void askAi(currentQuestion)}>
                        {aiStates[currentQuestion.key]?.loading ? "Asking..." : "Ask AI"}
                      </button>
                    </div>
                    {aiStates[currentQuestion.key]?.error && <p className="mt-3 rounded-md border border-[var(--color-danger)] bg-[var(--color-danger-bg)] p-3 text-sm text-[var(--color-danger-text)]">{aiStates[currentQuestion.key]?.error}</p>}
                    {aiStates[currentQuestion.key]?.response && (
                      <div className="mt-3 rounded-md bg-[var(--color-subtle)] p-4 text-[var(--color-text-soft)]">
                        <RichText content={aiStates[currentQuestion.key]!.response!} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                  <button className="secondary-button" type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)}>
                    Previous
                  </button>
                  <button className="secondary-button" type="button" disabled={currentIndex === quizQuestions.length - 1} onClick={() => setCurrentIndex(currentIndex + 1)}>
                    Next
                  </button>
                </div>
                <div className="flex gap-2">
                  {gradingMode === "instant" && feedback[currentQuestion.key] === undefined && (
                    <button className="primary-button" type="button" disabled={(answers[currentQuestion.key]?.length ?? 0) === 0} onClick={() => gradeQuestion(currentQuestion)}>
                      Check answer
                    </button>
                  )}
                  {gradingMode === "instant" && quizComplete && (
                    <button className="primary-button" type="button" onClick={() => setScreen("results")}>
                      View results
                    </button>
                  )}
                  {gradingMode === "deferred" && (
                    <button className="primary-button" type="button" onClick={finishQuiz}>
                      Submit quiz
                    </button>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {screen === "results" && (
          <section className="panel">
            <div className="flex flex-col gap-2 border-b border-[var(--color-border)] pb-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Results</p>
              <h2 className="text-3xl font-bold">
                {score}/{quizQuestions.length} correct
              </h2>
            </div>

            <div className="grid gap-4">
              {quizQuestions.map((question, index) => {
                const isCorrect = areAnswersCorrect(answers[question.key], question.correctAnswers);

                return (
                  <article className="result-card" key={question.key}>
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text-faint)]">{question.unitName}</p>
                        <h3 className="text-lg font-semibold">
                          {index + 1}. {question.question}
                        </h3>
                      </div>
                      <span className={isCorrect ? "status-pill status-correct" : "status-pill status-wrong"}>{isCorrect ? "Correct" : "Missed"}</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">Your answer: {labelAnswers(question, answers[question.key])}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Correct answer: {labelAnswers(question, question.correctAnswers)}</p>
                    {question.explanation && <p className="text-sm text-[var(--color-text-soft)]">{question.explanation}</p>}
                  </article>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="primary-button" type="button" disabled={selectedQuizTotal === 0} onClick={startQuiz}>
                Start new quiz
              </button>
              <button className="secondary-button" type="button" onClick={() => setScreen("missed")}>
                Review missed
              </button>
            </div>
          </section>
        )}

        {screen === "missed" && (
          <section className="panel">
            <div className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Missed questions</p>
                <h2 className="mt-1 text-2xl font-bold">
                  {missedList.length} saved for {activeSubject?.name ?? "this subject"}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="primary-button" type="button" disabled={missedList.length === 0} onClick={startMissedQuiz}>
                  Practice missed
                </button>
                <button className="secondary-button" type="button" disabled={missedList.length === 0} onClick={clearMissedHistory}>
                  Clear history
                </button>
              </div>
            </div>

            <label className="choice-row">
              <input type="checkbox" checked={removeCorrectMissed} onChange={event => setRemoveCorrectMissed(event.currentTarget.checked)} />
              <span>Remove correctly answered questions while practicing missed</span>
            </label>

            {missedList.length === 0 ? (
              <p className="rounded-md border border-[var(--color-border)] bg-[var(--color-raised)] p-5 text-[var(--color-text-muted)]">No missed questions yet.</p>
            ) : (
              <div className="grid gap-4">
                {missedList.map(question => (
                  <article className="result-card" key={question.key}>
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text-faint)]">{question.unitName}</p>
                        <h3 className="text-lg font-semibold">{question.question}</h3>
                      </div>
                      <span className="status-pill bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]">Missed {question.missCount}x</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">Correct answer: {labelAnswers(question, question.correctAnswers)}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Last missed: {formatDate(question.lastMissedAt)}</p>
                    {question.explanation && <p className="text-sm text-[var(--color-text-soft)]">{question.explanation}</p>}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {screen === "setup" && (
          <details className="settings-panel">
            <summary><strong>Example JSON shape</strong></summary>
            <pre className="mt-3 overflow-auto rounded-md bg-[var(--color-code-bg)] p-4 text-xs text-[var(--color-code-text)]">{sampleJson}</pre>
          </details>
        )}
        </div>
      </div>
    </main>
  );
}

export default App;
