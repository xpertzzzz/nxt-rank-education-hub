// Uses @neondatabase/serverless for browser-compatible HTTP queries to Neon DB
import { neon } from "@neondatabase/serverless";

export type Subject = { id: string; name: string; url: string };
export type ClassData = { classNum: number; label: string; enabled: boolean; subjects: Subject[] };

const DB_URL = import.meta.env.VITE_DATABASE_URL as string;

function getSql() {
  if (!DB_URL) return null;
  try {
    return neon(DB_URL);
  } catch {
    return null;
  }
}

export const defaultClasses: ClassData[] = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1;
  const isTen = n === 10;
  return {
    classNum: n,
    label: `Class ${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`,
    enabled: isTen,
    subjects: [],
  };
});

// --- Local storage cache ---
const LS_KEY = "nxt-rank:classes";

function saveLocal(classes: ClassData[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(classes));
  } catch {}
}

function loadLocal(): ClassData[] | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as ClassData[];
  } catch {}
  return null;
}

// --- Public API ---

export async function loadClasses(): Promise<ClassData[]> {
  const sql = getSql();
  if (!sql) {
    console.warn("No DATABASE_URL — using localStorage fallback");
    return loadLocal() ?? defaultClasses;
  }

  try {
    const dbClasses = await sql`SELECT * FROM classes ORDER BY class_num ASC`;
    const dbSubjects = await sql`SELECT * FROM subjects`;

    if (dbClasses.length === 0) {
      const cached = loadLocal();
      return cached ?? defaultClasses;
    }

    const result: ClassData[] = dbClasses.map((c) => ({
      classNum: c.class_num as number,
      label: c.label as string,
      enabled: c.enabled as boolean,
      subjects: dbSubjects
        .filter((s) => s.class_num === c.class_num)
        .map((s) => ({ id: s.id as string, name: s.name as string, url: s.url as string })),
    }));

    saveLocal(result);
    return result;
  } catch (err) {
    console.error("DB error loading classes", err);
    const cached = loadLocal();
    return cached ?? defaultClasses;
  }
}

export async function saveClasses({ data }: { data: ClassData[] }): Promise<void> {
  // Save locally first for instant UI feedback
  saveLocal(data);

  const sql = getSql();
  if (!sql) {
    console.warn("No DATABASE_URL — data saved to localStorage only");
    return;
  }

  try {
    // Upsert each class
    for (const c of data) {
      await sql`
        INSERT INTO classes (class_num, label, enabled)
        VALUES (${c.classNum}, ${c.label}, ${c.enabled})
        ON CONFLICT (class_num) DO UPDATE
          SET label = EXCLUDED.label, enabled = EXCLUDED.enabled
      `;
    }

    // Replace all subjects atomically
    await sql`DELETE FROM subjects`;
    for (const c of data) {
      for (const s of c.subjects) {
        await sql`
          INSERT INTO subjects (id, class_num, name, url)
          VALUES (${s.id}, ${c.classNum}, ${s.name}, ${s.url})
        `;
      }
    }
  } catch (err) {
    console.error("DB error saving classes", err);
    // Data already in localStorage so UI is consistent
  }
}

export function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `subject-${Date.now()}`
  );
}
