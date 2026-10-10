// Uses @neondatabase/serverless for browser-compatible HTTP queries to Neon DB
import { neon } from "@neondatabase/serverless";

export type Chapter = { id: string; name: string; url: string };
export type Subject = { id: string; name: string; url: string; chapters: Chapter[] };
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
    // Add the chapters column dynamically if it doesn't exist
    await sql`ALTER TABLE subjects ADD COLUMN IF NOT EXISTS chapters JSONB DEFAULT '[]'::jsonb`.catch(() => {});

    const dbClasses = await sql`SELECT * FROM classes ORDER BY class_num ASC`;
    const dbSubjects = await sql`SELECT * FROM subjects`;

    if (dbClasses.length === 0 && dbSubjects.length === 0) {
      const cached = loadLocal();
      return cached ?? defaultClasses;
    }

    const classesMap = new Map<number, { class_num: number; label: string; enabled: boolean }>();
    for (const c of dbClasses) {
      classesMap.set(c.class_num as number, c as { class_num: number; label: string; enabled: boolean });
    }

    const result: ClassData[] = defaultClasses.map((def) => {
      const c = classesMap.get(def.classNum);
      const classNum = def.classNum;
      const label = c ? (c.label as string) : def.label;
      const enabled = c ? (c.enabled as boolean) : def.enabled;
      const subjects = dbSubjects
        .filter((s) => s.class_num === classNum)
        .map((s) => {
          let chapters: Chapter[] = [];
          if (Array.isArray(s.chapters)) {
            chapters = s.chapters;
          } else if (typeof s.chapters === "string") {
            try {
              chapters = JSON.parse(s.chapters);
            } catch {
              chapters = [];
            }
          }
          return {
            id: s.id as string,
            name: s.name as string,
            url: (s.url as string) || "",
            chapters,
          };
        });
      return { classNum, label, enabled, subjects };
    });

    saveLocal(result);
    return result;
  } catch (err) {
    console.error("DB error loading classes", err);
    const cached = loadLocal();
    return cached ?? defaultClasses;
  }
}

export async function deleteSubjectFromDb(subjectId: string): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  try {
    await sql`DELETE FROM subjects WHERE id = ${subjectId}`;
  } catch (err) {
    console.error("DB error deleting subject", err);
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
    // Add the chapters column dynamically if it doesn't exist just in case
    await sql`ALTER TABLE subjects ADD COLUMN IF NOT EXISTS chapters JSONB DEFAULT '[]'::jsonb`.catch(() => {});

    // Upsert each class
    for (const c of data) {
      await sql`
        INSERT INTO classes (class_num, label, enabled)
        VALUES (${c.classNum}, ${c.label}, ${c.enabled})
        ON CONFLICT (class_num) DO UPDATE
          SET label = EXCLUDED.label, enabled = EXCLUDED.enabled
      `;
    }

    // Upsert subjects safely WITHOUT deleting the whole table!
    for (const c of data) {
      for (const s of c.subjects) {
        const chaptersJson = JSON.stringify(s.chapters || []);
        await sql`
          INSERT INTO subjects (id, class_num, name, url, chapters)
          VALUES (${s.id}, ${c.classNum}, ${s.name}, ${s.url || ''}, ${chaptersJson}::jsonb)
          ON CONFLICT (id) DO UPDATE
            SET class_num = EXCLUDED.class_num,
                name = EXCLUDED.name,
                url = EXCLUDED.url,
                chapters = EXCLUDED.chapters
        `;
      }
    }
  } catch (err) {
    console.error("DB error saving classes", err);
    throw err;
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

export function createSubjectId(classNum: number, name: string): string {
  const slug = slugify(name);
  return `c${classNum}-${slug}-${Date.now().toString(36)}`;
}
