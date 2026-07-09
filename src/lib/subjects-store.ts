// Browser-compatible Neon queries via HTTP fetch
// The @neondatabase/serverless package uses HTTP instead of TCP so it works in browsers.

export type Subject = { id: string; name: string; url: string };
export type ClassData = { classNum: number; label: string; enabled: boolean; subjects: Subject[] };

const DB_URL = import.meta.env.VITE_DATABASE_URL as string;

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

// Neon serverless HTTP API endpoint derived from connection string
function getNeonHttpEndpoint() {
  try {
    const url = new URL(DB_URL);
    const host = url.hostname; // e.g. ep-aged-band-xxx.us-east-1.aws.neon.tech
    const user = url.username;
    const pass = url.password;
    const db = url.pathname.replace("/", "");
    return { host, user, pass, db };
  } catch {
    return null;
  }
}

async function neonQuery(sql: string, params: unknown[] = []): Promise<Record<string, unknown>[]> {
  const creds = getNeonHttpEndpoint();
  if (!creds) return [];
  const { host, user, pass, db } = creds;
  const endpoint = `https://${host}/sql`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${pass}`,
      "Neon-Connection-String": DB_URL,
    },
    body: JSON.stringify({ query: sql, params }),
  });
  if (!res.ok) {
    // fallback to local storage on error
    console.warn("Neon HTTP query failed", res.status);
    return [];
  }
  const json = (await res.json()) as { rows: Record<string, unknown>[] };
  return json.rows ?? [];
}

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
  try {
    const dbClasses = await neonQuery("SELECT * FROM classes ORDER BY class_num ASC");
    const dbSubjects = await neonQuery("SELECT * FROM subjects");

    if (dbClasses.length === 0) {
      const cached = loadLocal();
      return cached ?? defaultClasses;
    }

    const result = dbClasses.map((c) => ({
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
  // Save locally first for instant feedback
  saveLocal(data);

  try {
    // Upsert each class
    for (const c of data) {
      await neonQuery(
        "INSERT INTO classes (class_num, label, enabled) VALUES ($1, $2, $3) ON CONFLICT (class_num) DO UPDATE SET label = EXCLUDED.label, enabled = EXCLUDED.enabled",
        [c.classNum, c.label, c.enabled],
      );
    }

    // Replace subjects
    await neonQuery("DELETE FROM subjects", []);
    for (const c of data) {
      for (const s of c.subjects) {
        await neonQuery(
          "INSERT INTO subjects (id, class_num, name, url) VALUES ($1, $2, $3, $4)",
          [s.id, c.classNum, s.name, s.url],
        );
      }
    }
  } catch (err) {
    console.error("DB error saving classes", err);
    // Data already saved to localStorage, so UI stays consistent
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
