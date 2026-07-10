const APP_PREFIX = "pathway:";

export function collectLocalData(): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(APP_PREFIX)) {
      out[key] = localStorage.getItem(key) ?? "";
    }
  }
  return out;
}

export function restoreLocalData(data: Record<string, string>) {
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
}
