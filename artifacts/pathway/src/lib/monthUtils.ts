export interface MonthDay {
  dateKey: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

// Returns a 6x7 grid (42 days) covering the full month plus leading/
// trailing days from adjacent months, so the calendar grid always has
// complete weeks.
export function getMonthGrid(year: number, month: number): MonthDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();

  const gridStart = new Date(year, month, 1 - startWeekday);
  const todayKey = toDateKey(new Date());

  const days: MonthDay[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    const dateKey = toDateKey(date);
    days.push({
      dateKey,
      dayOfMonth: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: dateKey === todayKey,
    });
  }
  return days;
}

// Every calendar date in the month (no leading/trailing days) — used by
// the list view, which only needs real days of the selected month.
export function getMonthDays(year: number, month: number): MonthDay[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = toDateKey(new Date());

  const days: MonthDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateKey = toDateKey(date);
    days.push({
      dateKey,
      dayOfMonth: d,
      isCurrentMonth: true,
      isToday: dateKey === todayKey,
    });
  }
  return days;
}

export function formatDayHeading(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}
