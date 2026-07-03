export const BANK_KEY = "pathway:questionBank";
const SEEDED_KEY = "pathway:questionBankSeeded";

export interface Question {
  id: string;
  category: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

const EXAMPLE_QUESTION: Question = {
  id: "example-1",
  category: "General knowledge",
  text: "What is the capital of France?",
  options: ["Paris", "Rome", "Berlin", "Madrid"],
  correctIndex: 0,
  explanation: "Paris has been the capital of France since the 10th century.",
};

export function loadBank(): Question[] {
  try {
    const raw = localStorage.getItem(BANK_KEY);
    if (raw) return JSON.parse(raw);

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
