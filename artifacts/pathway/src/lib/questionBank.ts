export const BANK_KEY = "pathway:questionBank";
const SEEDED_KEY = "pathway:questionBankSeeded";
const QUIZZES_KEY = "pathway:quizzes";

export const UNCATEGORIZED_QUIZ_ID = "uncategorized";

export interface Quiz {
  id: string;
  name: string;
  createdAt: number;
}

export interface Question {
  id: string;
  quizId: string;
  category: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

const EXAMPLE_QUESTION: Question = {
  id: "example-1",
  quizId: UNCATEGORIZED_QUIZ_ID,
  category: "General knowledge",
  text: "What is the capital of France?",
  options: ["Paris", "Rome", "Berlin", "Madrid"],
  correctIndex: 0,
  explanation: "Paris has been the capital of France since the 10th century.",
};

function createDefaultQuiz(): Quiz {
  return {
    id: UNCATEGORIZED_QUIZ_ID,
    name: "Uncategorized",
    createdAt: Date.now(),
  };
}

// ─── Quizzes ──────────────────────────────────────────────────────────────

export function loadQuizzes(): Quiz[] {
  try {
    const raw = localStorage.getItem(QUIZZES_KEY);
    if (raw) {
      const parsed: Quiz[] = JSON.parse(raw);
      if (parsed.some((q) => q.id === UNCATEGORIZED_QUIZ_ID)) return parsed;
      return [createDefaultQuiz(), ...parsed];
    }
    const seeded = [createDefaultQuiz()];
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(seeded));
    return seeded;
  } catch {
    return [createDefaultQuiz()];
  }
}

export function saveQuizzes(quizzes: Quiz[]) {
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
}

export function createQuiz(name: string): Quiz {
  const quizzes = loadQuizzes();
  const quiz: Quiz = {
    id: "quiz-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    name: name.trim() || "Untitled quiz",
    createdAt: Date.now(),
  };
  quizzes.push(quiz);
  saveQuizzes(quizzes);
  return quiz;
}

export function renameQuiz(quizId: string, newName: string) {
  const quizzes = loadQuizzes();
  const quiz = quizzes.find((q) => q.id === quizId);
  if (quiz) {
    quiz.name = newName.trim() || quiz.name;
    saveQuizzes(quizzes);
  }
}

export function deleteQuiz(quizId: string) {
  if (quizId === UNCATEGORIZED_QUIZ_ID) return;
  saveQuizzes(loadQuizzes().filter((q) => q.id !== quizId));
  const bank = loadBank().map((q) =>
    q.quizId === quizId ? { ...q, quizId: UNCATEGORIZED_QUIZ_ID } : q
  );
  saveBank(bank);
}

// ─── Questions ────────────────────────────────────────────────────────────

export function loadBank(): Question[] {
  try {
    const raw = localStorage.getItem(BANK_KEY);
    if (raw) {
      const parsed: Question[] = JSON.parse(raw);
      const migrated = parsed.map((q) =>
        q.quizId ? q : { ...q, quizId: UNCATEGORIZED_QUIZ_ID }
      );
      if (migrated.some((q, i) => q.quizId !== parsed[i]?.quizId)) {
        saveBank(migrated);
      }
      return migrated;
    }

    if (!localStorage.getItem(SEEDED_KEY)) {
      localStorage.setItem(SEEDED_KEY, "1");
      const seeded = [EXAMPLE_QUESTION];
      localStorage.setItem(BANK_KEY, JSON.stringify(seeded));
      return seeded;
    }

    return [];
  } catch {
    return [];
  }
}

export function saveBank(bank: Question[]) {
  localStorage.setItem(BANK_KEY, JSON.stringify(bank));
}

export function getQuestionsForQuiz(quizId: string): Question[] {
  return loadBank().filter((q) => q.quizId === quizId);
}
