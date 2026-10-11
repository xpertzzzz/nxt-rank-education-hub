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

/**
 * Normalizes user-entered URLs (especially Google Drive links).
 * Strips whitespace, adds https:// if protocol is omitted to avoid 404 relative routes.
 */
export function formatDownloadUrl(url?: string): string {
  if (!url) return "";
  let trimmed = url.trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
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

// Module-level schema check flag so we don't spam ALTER TABLE locks on every query
let schemaEnsured = false;
async function ensureSchema(sql: any) {
  if (schemaEnsured || !sql) return;
  try {
    await sql`ALTER TABLE subjects ADD COLUMN IF NOT EXISTS chapters JSONB DEFAULT '[]'::jsonb`;
    schemaEnsured = true;
  } catch {
    // If it fails or is already up-to-date, mark true so queries aren't blocked by DDL lock attempts
    schemaEnsured = true;
  }
}

// --- Public API ---

export async function loadClasses(): Promise<ClassData[]> {
  const sql = getSql();
  if (!sql) {
    console.warn("No DATABASE_URL — using localStorage fallback");
    return loadLocal() ?? defaultClasses;
  }

  // Attempt query with 1 retry in case Neon serverless compute was suspended and warming up
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await ensureSchema(sql);

      const dbClasses = await sql`SELECT * FROM classes ORDER BY class_num ASC`;
      const dbSubjects = await sql`SELECT * FROM subjects`;

      if (dbClasses.length === 0 && dbSubjects.length === 0) {
        const cached = loadLocal();
        return cached ?? defaultClasses;
      }

      const classesMap = new Map<number, { class_num: number; label: string; enabled: boolean }>();
      for (const c of dbClasses) {
        classesMap.set(Number(c.class_num), c as { class_num: number; label: string; enabled: boolean });
      }

      const result: ClassData[] = defaultClasses.map((def) => {
        const c = classesMap.get(def.classNum);
        const classNum = def.classNum;
        const label = c ? (c.label as string) : def.label;
        const enabled = c ? Boolean(c.enabled) : def.enabled;
        const subjects = dbSubjects
          .filter((s) => Number(s.class_num) === classNum)
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
              id: String(s.id),
              name: String(s.name || ""),
              url: formatDownloadUrl(s.url as string),
              chapters: (Array.isArray(chapters) ? chapters : []).map((ch) => ({
                id: String(ch.id || ""),
                name: String(ch.name || ""),
                url: formatDownloadUrl(ch.url),
              })),
            };
          });
        return { classNum, label, enabled, subjects };
      });

      saveLocal(result);
      return result;
    } catch (err) {
      console.error(`DB error loading classes (attempt ${attempt}/2)`, err);
      if (attempt < 2) {
        // Wait 700ms for Neon compute warm-up before retry
        await new Promise((r) => setTimeout(r, 700));
      }
    }
  }

  const cached = loadLocal();
  return cached ?? defaultClasses;
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
    await ensureSchema(sql);

    // Upsert each class configuration
    for (const c of data) {
      await sql`
        INSERT INTO classes (class_num, label, enabled)
        VALUES (${c.classNum}, ${c.label}, ${c.enabled})
        ON CONFLICT (class_num) DO UPDATE
          SET label = EXCLUDED.label, enabled = EXCLUDED.enabled
      `;
    }

    // Collect all valid subject IDs present in incoming data
    const validSubjectIds = new Set<string>();
    const savedClassNums = new Set<number>();

    for (const c of data) {
      savedClassNums.add(c.classNum);
      for (const s of c.subjects) {
        if (s.id) validSubjectIds.add(s.id);
      }
    }

    // Synchronize subject deletions: remove DB subjects belonging to these classes that no longer exist in data
    try {
      const existingSubjects = await sql`SELECT id, class_num FROM subjects`;
      for (const row of existingSubjects) {
        const id = String(row.id);
        const classNum = Number(row.class_num);
        if (savedClassNums.has(classNum) && !validSubjectIds.has(id)) {
          await sql`DELETE FROM subjects WHERE id = ${id}`.catch(() => {});
        }
      }
    } catch (err) {
      console.warn("Could not prune deleted subjects from DB:", err);
    }

    // Upsert each subject safely
    for (const c of data) {
      for (const s of c.subjects) {
        const cleanChapters = (s.chapters || []).map((ch) => ({
          id: String(ch.id || ""),
          name: String(ch.name || "").trim(),
          url: formatDownloadUrl(ch.url),
        }));
        const chaptersJson = JSON.stringify(cleanChapters);
        const cleanSubjectUrl = formatDownloadUrl(s.url);

        await sql`DELETE FROM subjects WHERE id = ${s.id}`.catch(() => {});
        await sql`
          INSERT INTO subjects (id, class_num, name, url, chapters)
          VALUES (${s.id}, ${c.classNum}, ${s.name.trim()}, ${cleanSubjectUrl}, ${chaptersJson}::jsonb)
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
