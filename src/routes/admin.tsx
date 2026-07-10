import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Plus, Save, Trash2, ExternalLink, ShieldCheck, ArrowLeft } from "lucide-react";
import { isAuthed, login, logout } from "@/lib/auth";
import {
  loadClasses,
  saveClasses,
  slugify,
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

  useEffect(() => {
    loadClasses().then(setClasses);
  }, []);
  const [activeClass, setActiveClass] = useState(10);
  const [savedFlash, setSavedFlash] = useState(false);

  const current = classes.find((c) => c.classNum === activeClass);
  if (!current) return <div className="p-8">Loading classes...</div>;

  async function update(next: ClassData[]) {
    setClasses(next);
    await saveClasses({ data: next });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  function updateSubject(subjectId: string, patch: Partial<Subject>) {
    update(
      classes.map((c) =>
        c.classNum === activeClass
          ? { ...c, subjects: c.subjects.map((s) => (s.id === subjectId ? { ...s, ...patch } : s)) }
          : c,
      ),
    );
  }

  function deleteSubject(subjectId: string) {
    if (!confirm("Delete this subject?")) return;
    update(
      classes.map((c) =>
        c.classNum === activeClass
          ? { ...c, subjects: c.subjects.filter((s) => s.id !== subjectId) }
          : c,
      ),
    );
  }

  function addSubject(name: string) {
    const id = slugify(name);
    update(
      classes.map((c) =>
        c.classNum === activeClass
          ? { ...c, subjects: [...c.subjects, { id, name: name.trim(), url: "", chapters: [] }] }
          : c,
      ),
    );
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
              Add, edit or remove subjects and Drive links. Changes publish instantly.
            </p>
          </div>
          {savedFlash && (
            <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Saved
            </span>
          )}
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
          <label className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={current.enabled}
              onChange={(e) =>
                update(
                  classes.map((c) =>
                    c.classNum === activeClass ? { ...c, enabled: e.target.checked } : c,
                  ),
                )
              }
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
}: {
  subject: Subject;
  onChange: (p: Partial<Subject>) => void;
  onDelete: () => void;
}) {
  const chapters = subject.chapters || [];

  function addChapter() {
    const newId = `ch-${Date.now()}`;
    onChange({ chapters: [...chapters, { id: newId, name: "", url: "" }] });
  }

  function updateChapter(chId: string, patch: Partial<{ name: string; url: string }>) {
    onChange({
      chapters: chapters.map((c) => (c.id === chId ? { ...c, ...patch } : c)),
    });
  }

  function removeChapter(chId: string) {
    onChange({
      chapters: chapters.filter((c) => c.id !== chId),
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
              onClick={() => removeChapter(ch.id)}
              className="shrink-0 p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"
              title="Remove chapter"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button
          onClick={addChapter}
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

