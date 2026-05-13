const STORAGE_KEY = "compare.productIds";
const MAX_COMPARE = 3;

export function readCompareIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);
  } catch {
    return [];
  }
}

export function writeCompareIds(ids: number[]): void {
  if (typeof window === "undefined") return;
  const unique = Array.from(new Set(ids)).slice(0, MAX_COMPARE);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
}

export function toggleCompareId(ids: number[], id: number): number[] {
  if (!Number.isFinite(id) || id <= 0) return ids;
  if (ids.includes(id)) {
    return ids.filter((item) => item !== id);
  }
  if (ids.length >= MAX_COMPARE) {
    return ids;
  }
  return [...ids, id];
}

export function canAddCompare(ids: number[]): boolean {
  return ids.length < MAX_COMPARE;
}

export function getMaxCompare(): number {
  return MAX_COMPARE;
}

export function clearCompareIds(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
