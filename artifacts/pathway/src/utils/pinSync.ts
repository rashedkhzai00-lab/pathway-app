import { collectLocalData, restoreLocalData } from "./localBackup";

const API_BASE = "";

async function post(path: string, body: object) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { error?: string };
  if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
  return json;
}

export function checkPinAvailable(pin: string) {
  return post("/api/pin/check", { pin }) as Promise<{ available: boolean }>;
}

export async function createPinSave(pin: string) {
  const data = collectLocalData();
  return post("/api/pin/create", { pin, data });
}

export async function updatePinSave(pin: string) {
  const data = collectLocalData();
  return post("/api/pin/save", { pin, data });
}

export async function restorePinSave(pin: string) {
  const result = (await post("/api/pin/restore", { pin })) as {
    data: Record<string, string>;
    updatedAt: number;
  };
  restoreLocalData(result.data);
  return result;
}

export function deletePinSave(pin: string) {
  return post("/api/pin/delete", { pin });
}
