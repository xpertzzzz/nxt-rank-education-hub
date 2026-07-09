import { createServerFn } from "@tanstack/react-start";
import { sql } from "./db";

export type Subject = { id: string; name: string; url: string };
export type ClassData = { classNum: number; label: string; enabled: boolean; subjects: Subject[] };

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

export const loadClasses = createServerFn({ method: "GET" }).handler(async (): Promise<ClassData[]> => {
  try {
    const dbClasses = await sql`SELECT * FROM classes ORDER BY class_num ASC`;
    const dbSubjects = await sql`SELECT * FROM subjects`;
    
    if (dbClasses.length === 0) {
      return defaultClasses;
    }

    return dbClasses.map((c) => ({
      classNum: c.class_num,
      label: c.label,
      enabled: c.enabled,
      subjects: dbSubjects
        .filter((s) => s.class_num === c.class_num)
        .map((s) => ({ id: s.id, name: s.name, url: s.url }))
    }));
  } catch (err) {
    console.error("DB error loading classes", err);
    return defaultClasses;
  }
});

export const saveClasses = createServerFn({ method: "POST" })
  .validator((d: ClassData[]) => d)
  .handler(async ({ data }) => {
    await sql.begin(async (tx) => {
      for (const c of data) {
        await tx`
          INSERT INTO classes (class_num, label, enabled) 
          VALUES (${c.classNum}, ${c.label}, ${c.enabled})
          ON CONFLICT (class_num) DO UPDATE 
          SET label = EXCLUDED.label, enabled = EXCLUDED.enabled
        `;
      }
      
      await tx`DELETE FROM subjects`;
      
      for (const c of data) {
        for (const s of c.subjects) {
          await tx`
            INSERT INTO subjects (id, class_num, name, url)
            VALUES (${s.id}, ${c.classNum}, ${s.name}, ${s.url})
          `;
        }
      }
    });
    return { success: true };
  });

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `subject-${Date.now()}`;
}
