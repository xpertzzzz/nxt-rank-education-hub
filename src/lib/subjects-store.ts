export type Subject = { id: string; name: string; url: string };
export type ClassData = { classNum: number; label: string; enabled: boolean; subjects: Subject[] };

const STORAGE_KEY = "nxt-rank:classes:v1";

const defaultSubjectsFor10: Subject[] = [
  { id: "life-science", name: "Life Science", url: "" },
  { id: "physical-science", name: "Physical Science", url: "" },
  { id: "odia", name: "Odia", url: "" },
  { id: "english", name: "English", url: "" },
  { id: "math", name: "Math", url: "" },
  { id: "ssc", name: "SSC", url: "" },
  { id: "hindi", name: "Hindi", url: "" },
  { id: "sanskrit", name: "Sanskrit", url: "" },
];

export const defaultClasses: ClassData[] = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1;
  const isTen = n === 10;
  return {
    classNum: n,
    label: `Class ${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`,
    enabled: isTen,
    subjects: isTen ? defaultSubjectsFor10 : [],
  };
});

export function loadClasses(): ClassData[] {
  if (typeof window === "undefined") return defaultClasses;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultClasses;
    const parsed = JSON.parse(raw) as ClassData[];
    if (!Array.isArray(parsed) || parsed.length !== 12) return defaultClasses;
    return parsed;
  } catch {
    return defaultClasses;
  }
}

export function saveClasses(classes: ClassData[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
  window.dispatchEvent(new Event("nxt-rank:classes-updated"));
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `subject-${Date.now()}`;
}
