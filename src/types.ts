export type QuizVariant = "grid" | "list";

export type Route =
  | { name: "home" }
  | { name: "library" }
  | { name: "subject"; subjectId: string }
  | { name: "quiz"; variant: QuizVariant }
  | { name: "flashcard"; subjectId: string }
  | { name: "profile" }
  | { name: "admin" };

export type Navigate = (route: Route) => void;
