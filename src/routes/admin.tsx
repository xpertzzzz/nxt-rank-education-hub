import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  LogOut,
  Plus,
  Save,
  Trash2,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { isAuthed, login, logout } from "@/lib/auth";
import {
  loadClasses,
  saveClasses,
  deleteSubjectFromDb,
  createSubjectId,
  type ClassData,
  type Subject,
} from "@/lib/subjects-store";
const logo = { url: "/nxtranklogo.png" };

export const Route = createFileRoute("/admin")({
  component: Admin,
});

function Admin() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthed(isAuthed());
    setReady(true);
  }, []);

  if (!ready) return null;
  return authed ? (
    <Panel
      onLogout={() => {
        logout();
        setAuthed(false);
      }}
    />
  ) : (
    <LoginScreen onLogin={() => setAuthed(true)} />
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-10"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-elegant">
        <div className="flex items-center gap-3">
          <img
            src={logo.url}
            alt="NXT Rank"
            className="h-12 w-12 rounded-full ring-1 ring-border"
          />
          <div>
            <div className="font-display text-lg font-bold text-primary">NXT Rank Admin</div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Secure sign-in
            </div>
          </div>
        </div>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (login(u.trim(), p)) onLogin();
            else setErr("Invalid credentials");
          }}
        >
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Username
            </label>
            <input
              value={u}
              onChange={(e) => setU(e.target.value)}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              value={p}
              onChange={(e) => setP(e.target.value)}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </div>
          {err && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
              {err}
            </div>
          )}
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant hover:opacity-90"
          >
            <ShieldCheck className="h-4 w-4" /> Sign in
          </button>
        </form>

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-3 w-3" /> Back to website
        </Link>
      </div>
    </div>
  );
}

function Panel({ onLogout }: { onLogout: () => void }) {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [activeClass, setActiveClass] = useState(10);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving" | "error">("saved");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const classesRef = useRef<ClassData[]>(classes);
  classesRef.current = classes;

  useEffect(() => {
    loadClasses().then((data) => {
      setClasses(data);
      classesRef.current = data;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const current = classes.find((c) => c.classNum === activeClass);
  if (!current) return <div className="p-8">Loading classes...</div>;

  // Immediate save to DB
  async function saveImmediate(dataToSave: ClassData[]) {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    setSaveStatus("saving");
    try {
      await saveClasses({ data: dataToSave });
      setSaveStatus("saved");
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus("error");
    }
  }

  // Debounced save for text inputs (800ms)
  function scheduleSave(dataToSave: ClassData[]) {
    setSaveStatus("unsaved");
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await saveClasses({ data: dataToSave });
        setSaveStatus("saved");
      } catch (err) {
        console.error("Save error:", err);
        setSaveStatus("error");
      }
    }, 800);
  }

  function updateSubject(subjectId: string, patch: Partial<Subject>) {
    const next = classesRef.current.map((c) =>
      c.classNum === activeClass
        ? { ...c, subjects: c.subjects.map((s) => (s.id === subjectId ? { ...s, ...patch } : s)) }
        : c,
    );
    setClasses(next);
    classesRef.current = next;
    scheduleSave(next);
  }

  async function deleteSubject(subjectId: string) {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    const next = classesRef.current.map((c) =>
      c.classNum === activeClass
        ? { ...c, subjects: c.subjects.filter((s) => s.id !== subjectId) }
        : c,
    );
    setClasses(next);
    classesRef.current = next;
    // Explicitly delete this specific subject from DB so nothing else is touched
    await deleteSubjectFromDb(subjectId);
    await saveImmediate(next);
  }

  async function addSubject(name: string) {
    const id = createSubjectId(activeClass, name);
    const next = classesRef.current.map((c) =>
      c.classNum === activeClass
        ? { ...c, subjects: [...c.subjects, { id, name: name.trim(), url: "", chapters: [] }] }
        : c,
    );
    setClasses(next);
    classesRef.current = next;
    await saveImmediate(next);
  }

  async function toggleClassEnabled(checked: boolean) {
    const next = classesRef.current.map((c) =>
      c.classNum === activeClass ? { ...c, enabled: checked } : c,
    );
    setClasses(next);
    classesRef.current = next;
    await saveImmediate(next);
  }

  function handleAddChapter(subjectId: string) {
    const newId = `ch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const sub = current?.subjects.find((s) => s.id === subjectId);
    const existingChapters = sub?.chapters || [];
    const next = classesRef.current.map((c) =>
      c.classNum === activeClass
        ? {
            ...c,
            subjects: c.subjects.map((s) =>
              s.id === subjectId
                ? { ...s, chapters: [...existingChapters, { id: newId, name: "", url: "" }] }
                : s,
            ),
          }
        : c,
    );
    setClasses(next);
    classesRef.current = next;
    saveImmediate(next);
  }

  function handleRemoveChapter(subjectId: string, chId: string) {
    const sub = current?.subjects.find((s) => s.id === subjectId);
    const existingChapters = sub?.chapters || [];
    const nextChapters = existingChapters.filter((c) => c.id !== chId);
    const next = classesRef.current.map((c) =>
      c.classNum === activeClass
        ? {
            ...c,
            subjects: c.subjects.map((s) =>
              s.id === subjectId ? { ...s, chapters: nextChapters } : s,
            ),
          }
        : c,
    );
    setClasses(next);
    classesRef.current = next;
    saveImmediate(next);
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={logo.url}
              alt="NXT Rank"
              className="h-10 w-10 shrink-0 rounded-full ring-1 ring-border"
            />
            <div className="min-w-0">
              <div className="truncate font-display text-lg font-bold text-primary">
                Admin Console
              </div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                NXT Rank
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/downloads"
              className="hidden rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:border-primary hover:text-primary sm:inline-flex"
            >
              View site
            </Link>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-bold text-primary sm:text-4xl">
              Manage study material
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add, edit or remove subjects and Drive links. Changes publish safely to database.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {saveStatus === "saving" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" /> All saved
              </span>
            )}
            {saveStatus === "unsaved" && (
              <button
                onClick={() => saveImmediate(classesRef.current)}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 transition"
              >
                <Save className="h-3.5 w-3.5" /> Save changes
              </button>
            )}
            {saveStatus === "error" && (
              <button
                onClick={() => saveImmediate(classesRef.current)}
                className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/25 transition"
              >
                <AlertCircle className="h-3.5 w-3.5" /> Save failed (Retry)
              </button>
            )}
          </div>
        </div>

        {/* Class selector */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Class
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {classes.map((c) => (
              <button
                key={c.classNum}
                onClick={() => setActiveClass(c.classNum)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeClass === c.classNum
                    ? "bg-primary text-primary-foreground shadow"
                    : "bg-secondary text-foreground hover:bg-accent"
                }`}
              >
                Class {c.classNum}
                {!c.enabled && (
                  <span className="rounded-full bg-background/20 px-1.5 text-[9px] uppercase tracking-wider">
                    soon
                  </span>
                )}
              </button>
            ))}
          </div>
          <label className="mt-4 flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={current.enabled}
              onChange={(e) => toggleClassEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Publish Class {activeClass} on the website
          </label>
        </div>

        {/* Subjects */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-primary">
                Class {activeClass} subjects
              </h2>
              <p className="text-xs text-muted-foreground">{current.subjects.length} subjects</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {current.subjects.map((s) => (
              <SubjectRow
                key={s.id}
                subject={s}
                onChange={(p) => updateSubject(s.id, p)}
                onDelete={() => deleteSubject(s.id)}
                onAddChapter={() => handleAddChapter(s.id)}
                onRemoveChapter={(chId) => handleRemoveChapter(s.id, chId)}
              />
            ))}
            {current.subjects.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No subjects yet — add one below.
              </div>
            )}
          </div>

          <AddSubjectForm onAdd={addSubject} />
        </div>
      </main>
    </div>
  );
}

function SubjectRow({
  subject,
  onChange,
  onDelete,
  onAddChapter,
  onRemoveChapter,
}: {
  subject: Subject;
  onChange: (p: Partial<Subject>) => void;
  onDelete: () => void;
  onAddChapter: () => void;
  onRemoveChapter: (chId: string) => void;
}) {
  const chapters = subject.chapters || [];

  function updateChapter(chId: string, patch: Partial<{ name: string; url: string }>) {
    onChange({
      chapters: chapters.map((c) => (c.id === chId ? { ...c, ...patch } : c)),
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-background p-4">
      {/* Subject Header */}
      <div className="flex items-center gap-3">
        <input
          value={subject.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Subject name (e.g. Mathematics)"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20 font-semibold"
        />
        <button
          onClick={onDelete}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" /> Remove Subject
        </button>
      </div>

      {/* Chapters List */}
      <div className="pl-4 sm:pl-8 space-y-3 border-l-2 border-border/50">
        {chapters.map((ch, idx) => (
          <div key={ch.id} className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground w-6">
              #{idx + 1}
            </span>
            <input
              value={ch.name}
              onChange={(e) => updateChapter(ch.id, { name: e.target.value })}
              placeholder="Chapter name"
              className="flex-1 min-w-[120px] rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
            <div className="flex flex-1 min-w-[200px] items-center gap-2">
              <input
                value={ch.url}
                onChange={(e) => updateChapter(ch.id, { url: e.target.value })}
                placeholder="Google Drive PDF link"
                className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
              {ch.url && (
                <a
                  href={ch.url}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-lg border border-border p-1.5 text-muted-foreground hover:text-primary"
                  title="Open link"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            <button
              onClick={() => onRemoveChapter(ch.id)}
              className="shrink-0 p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"
              title="Remove chapter"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button
          onClick={onAddChapter}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 mt-1"
        >
          <Plus className="h-3.5 w-3.5" /> Add Chapter
        </button>
      </div>
    </div>
  );
}

function AddSubjectForm({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAdd(name);
        setName("");
      }}
      className="mt-6 rounded-xl border border-dashed border-border bg-secondary/30 p-4"
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Add new subject
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Subject name (e.g. Science)"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> Add & publish
        </button>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Save className="h-3 w-3" /> Changes are saved automatically and appear live on the site.
      </p>
    </form>
  );
}


