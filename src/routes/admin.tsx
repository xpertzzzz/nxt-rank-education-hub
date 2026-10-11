import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  CheckCircle2,
  X,
  BookOpen,
  Sparkles,
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
      className="flex min-h-screen items-center justify-center px-4 py-10 bg-slate-50"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl">
        <div className="flex items-center gap-3">
          <img
            src={logo.url}
            alt="NXT Rank"
            className="h-12 w-12 rounded-full ring-2 ring-primary/10 shadow-sm"
          />
          <div>
            <div className="font-display text-lg font-bold text-primary">NXT Rank Admin</div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Study Material Console
            </div>
          </div>
        </div>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (login(u.trim(), p)) onLogin();
            else setErr("Invalid username or password");
          }}
        >
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Username
            </label>
            <input
              value={u}
              onChange={(e) => setU(e.target.value)}
              placeholder="admin"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Password
            </label>
            <input
              type="password"
              value={p}
              onChange={(e) => setP(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>
          {err && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs font-semibold text-destructive">
              {err}
            </div>
          )}
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-95 transition cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4" /> Sign In to Admin
          </button>
        </form>

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to website
        </Link>
      </div>
    </div>
  );
}

type PopupState = {
  isOpen: boolean;
  type: "success" | "error";
  title: string;
  message: string;
};

function Panel({ onLogout }: { onLogout: () => void }) {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [activeClass, setActiveClass] = useState(10);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    loadClasses().then((data) => {
      setClasses(data);
      setLoading(false);
    });
  }, []);

  // Warn before closing tab if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const current = classes.find((c) => c.classNum === activeClass);

  // Manual save triggered ONLY by the Save Button
  async function handleSave() {
    setSaving(true);
    try {
      await saveClasses({ data: classes });
      setHasUnsavedChanges(false);
      setPopup({
        isOpen: true,
        type: "success",
        title: "Saved Successfully! 🎉",
        message: `All subjects, chapters, and Google Drive links for Class ${activeClass} and other classes have been updated and are live on the website.`,
      });
    } catch (err: any) {
      console.error("Save error:", err);
      setPopup({
        isOpen: true,
        type: "error",
        title: "Save Failed",
        message:
          err?.message ||
          "Could not save changes to the database. Please check your connection and try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  function updateSubject(subjectId: string, patch: Partial<Subject>) {
    setClasses((prev) =>
      prev.map((c) =>
        c.classNum === activeClass
          ? {
              ...c,
              subjects: c.subjects.map((s) => (s.id === subjectId ? { ...s, ...patch } : s)),
            }
          : c,
      ),
    );
    setHasUnsavedChanges(true);
  }

  async function deleteSubject(subjectId: string, subjectName: string) {
    if (!confirm(`Are you sure you want to delete "${subjectName || "this subject"}"? Remember to click Save Changes to publish.`)) {
      return;
    }
    // Delete explicitly from database
    await deleteSubjectFromDb(subjectId);
    setClasses((prev) =>
      prev.map((c) =>
        c.classNum === activeClass
          ? { ...c, subjects: c.subjects.filter((s) => s.id !== subjectId) }
          : c,
      ),
    );
    setHasUnsavedChanges(true);
  }

  function addSubject(name: string) {
    const id = createSubjectId(activeClass, name);
    setClasses((prev) =>
      prev.map((c) =>
        c.classNum === activeClass
          ? { ...c, subjects: [...c.subjects, { id, name: name.trim(), url: "", chapters: [] }] }
          : c,
      ),
    );
    setHasUnsavedChanges(true);
  }

  function toggleClassEnabled(checked: boolean) {
    setClasses((prev) =>
      prev.map((c) => (c.classNum === activeClass ? { ...c, enabled: checked } : c)),
    );
    setHasUnsavedChanges(true);
  }

  function handleAddChapter(subjectId: string) {
    const newId = `ch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setClasses((prev) =>
      prev.map((c) => {
        if (c.classNum !== activeClass) return c;
        return {
          ...c,
          subjects: c.subjects.map((s) => {
            if (s.id !== subjectId) return s;
            const existing = s.chapters || [];
            return {
              ...s,
              chapters: [...existing, { id: newId, name: "", url: "" }],
            };
          }),
        };
      }),
    );
    setHasUnsavedChanges(true);
  }

  function handleRemoveChapter(subjectId: string, chId: string) {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.classNum !== activeClass) return c;
        return {
          ...c,
          subjects: c.subjects.map((s) => {
            if (s.id !== subjectId) return s;
            const existing = s.chapters || [];
            return {
              ...s,
              chapters: existing.filter((ch) => ch.id !== chId),
            };
          }),
        };
      }),
    );
    setHasUnsavedChanges(true);
  }

  function handleUpdateChapter(
    subjectId: string,
    chId: string,
    patch: Partial<{ name: string; url: string }>,
  ) {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.classNum !== activeClass) return c;
        return {
          ...c,
          subjects: c.subjects.map((s) => {
            if (s.id !== subjectId) return s;
            const existing = s.chapters || [];
            return {
              ...s,
              chapters: existing.map((ch) => (ch.id === chId ? { ...ch, ...patch } : ch)),
            };
          }),
        };
      }),
    );
    setHasUnsavedChanges(true);
  }

  if (loading || !current) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm font-semibold text-slate-600">Loading study materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={logo.url}
              alt="NXT Rank"
              className="h-9 w-9 shrink-0 rounded-full ring-1 ring-slate-200 shadow-xs"
            />
            <div className="min-w-0">
              <div className="truncate font-display text-base sm:text-lg font-bold text-primary">
                NXT Rank Admin
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 truncate">
                Study Material & PDF Hub
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Top Save Button (Desktop) */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`hidden sm:inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold shadow-sm transition cursor-pointer ${
                hasUnsavedChanges
                  ? "bg-primary text-primary-foreground hover:opacity-90 shadow-md ring-2 ring-primary/20 animate-pulse"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <Save className="h-3.5 w-3.5" /> Save Changes
                  <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[9px] font-bold">
                    UNSAVED
                  </span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> All Saved
                </>
              )}
            </button>

            <Link
              to="/downloads"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition shadow-2xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View Site</span>
            </Link>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:text-destructive hover:border-destructive/30 transition shadow-2xs cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner with Title and Save Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                <Sparkles className="h-3 w-3" /> Material Console
              </span>
              {hasUnsavedChanges ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                  Unsaved Changes
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                  <Check className="h-3 w-3" /> Up to Date
                </span>
              )}
            </div>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Manage Study Materials & PDFs
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">
              Add subjects, create chapters, and paste Google Drive links. Click{" "}
              <strong className="text-slate-800">Save Changes</strong> to publish live to the website.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold shadow-md transition cursor-pointer ${
                hasUnsavedChanges
                  ? "bg-primary text-primary-foreground hover:opacity-90 ring-4 ring-primary/10"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving to Database...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                  {hasUnsavedChanges && (
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                      Pending
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Class Selector Bar */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Class:
            </span>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <input
                type="checkbox"
                checked={current.enabled}
                onChange={(e) => toggleClassEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              Publish Class {activeClass} on Website
            </label>
          </div>

          {/* Swipeable / scrollable chip list on mobile */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {classes.map((c) => {
              const isActive = activeClass === c.classNum;
              return (
                <button
                  key={c.classNum}
                  onClick={() => setActiveClass(c.classNum)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition shadow-2xs cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  <span>Class {c.classNum}</span>
                  {!c.enabled && (
                    <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[9px] uppercase tracking-wider font-bold">
                      soon
                    </span>
                  )}
                  {c.subjects.length > 0 && (
                    <span
                      className={`rounded-full px-1.5 text-[10px] font-bold ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {c.subjects.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subjects & Chapter Editor Section */}
        <div className="mt-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Class {activeClass} Subjects ({current.subjects.length})
              </h2>
              <p className="text-xs text-slate-500">
                Manage subject names, chapter titles, and Google Drive download links.
              </p>
            </div>
          </div>

          {/* Subject Rows */}
          {current.subjects.map((s, idx) => (
            <SubjectCard
              key={s.id}
              index={idx + 1}
              subject={s}
              onUpdateSubject={(patch) => updateSubject(s.id, patch)}
              onDeleteSubject={() => deleteSubject(s.id, s.name)}
              onAddChapter={() => handleAddChapter(s.id)}
              onUpdateChapter={(chId, patch) => handleUpdateChapter(s.id, chId, patch)}
              onRemoveChapter={(chId) => handleRemoveChapter(s.id, chId)}
            />
          ))}

          {current.subjects.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
              <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-3 font-display text-base font-bold text-slate-800">
                No subjects in Class {activeClass} yet
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Add your first subject below (e.g. Mathematics, Science, English) and start attaching chapter PDFs.
              </p>
            </div>
          )}

          {/* Add Subject Card */}
          <AddSubjectBox onAdd={addSubject} activeClass={activeClass} />
        </div>
      </main>

      {/* Mobile Sticky Save Bar */}
      {hasUnsavedChanges && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur p-3 shadow-xl animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            <div className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Unsaved changes!
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:opacity-90 transition cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation / Status Modal Popup */}
      {popup.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setPopup((p) => ({ ...p, isOpen: false }))}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {popup.type === "success" ? (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold text-slate-900">
                  {popup.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{popup.message}</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
                  <button
                    onClick={() => setPopup((p) => ({ ...p, isOpen: false }))}
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-800 transition cursor-pointer"
                  >
                    Done
                  </button>
                  <Link
                    to="/downloads"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    View on Website <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold text-slate-900">
                  {popup.title}
                </h3>
                <p className="mt-2 text-sm text-rose-600/90 leading-relaxed">{popup.message}</p>
                <div className="mt-6 flex gap-2.5 justify-center">
                  <button
                    onClick={() => {
                      setPopup((p) => ({ ...p, isOpen: false }));
                      handleSave();
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-rose-700 transition cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setPopup((p) => ({ ...p, isOpen: false }))}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SubjectCard({
  index,
  subject,
  onUpdateSubject,
  onDeleteSubject,
  onAddChapter,
  onUpdateChapter,
  onRemoveChapter,
}: {
  index: number;
  subject: Subject;
  onUpdateSubject: (patch: Partial<Subject>) => void;
  onDeleteSubject: () => void;
  onAddChapter: () => void;
  onUpdateChapter: (chId: string, patch: Partial<{ name: string; url: string }>) => void;
  onRemoveChapter: (chId: string) => void;
}) {
  const chapters = subject.chapters || [];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs transition hover:border-slate-300">
      {/* Subject Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
            #{index}
          </div>
          <div className="flex-1 min-w-0">
            <input
              value={subject.name}
              onChange={(e) => onUpdateSubject({ name: e.target.value })}
              placeholder="Subject Name (e.g. Mathematics, Science)"
              className="w-full rounded-xl border border-transparent hover:border-slate-200 focus:border-primary bg-transparent px-3 py-1.5 text-base sm:text-lg font-bold text-slate-900 outline-none focus:bg-slate-50 transition"
            />
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {chapters.length} {chapters.length === 1 ? "Chapter" : "Chapters"}
          </span>
          <button
            onClick={onDeleteSubject}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition cursor-pointer"
            title="Delete this entire subject"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Delete Subject</span>
          </button>
        </div>
      </div>

      {/* Chapters List */}
      <div className="mt-4 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Chapters & PDF Drive Links:</span>
          <span className="text-[11px] text-slate-400 font-normal">
            Paste Google Drive links for each chapter
          </span>
        </div>

        {chapters.map((ch, idx) => (
          <div
            key={ch.id}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl border border-slate-200/90 bg-slate-50/60 p-2.5 sm:p-3 transition hover:bg-slate-50"
          >
            {/* Chapter Index Badge */}
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-2xs">
                {idx + 1}
              </span>
              <span className="sm:hidden text-xs font-bold text-slate-500">Chapter details</span>
            </div>

            {/* Chapter Name Input */}
            <div className="relative flex-1 min-w-[150px]">
              <input
                value={ch.name}
                onChange={(e) => onUpdateChapter(ch.id, { name: e.target.value })}
                placeholder="Chapter name (e.g. Chapter 1: Chemical Reactions)"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 placeholder:text-slate-400 shadow-2xs"
              />
            </div>

            {/* Chapter URL Input */}
            <div className="relative flex-1 min-w-[200px] flex items-center gap-1.5">
              <div className="relative flex-1">
                <input
                  value={ch.url}
                  onChange={(e) => onUpdateChapter(ch.id, { url: e.target.value })}
                  placeholder="Google Drive link (https://drive.google.com/...)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-800 placeholder:text-slate-400 shadow-2xs"
                />
              </div>

              {ch.url && (
                <a
                  href={ch.url}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:text-primary hover:border-primary transition shadow-2xs"
                  title="Open and test Drive link"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}

              <button
                onClick={() => onRemoveChapter(ch.id)}
                className="shrink-0 rounded-xl border border-slate-200 bg-white p-2 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition shadow-2xs cursor-pointer"
                title="Remove chapter"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {chapters.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center text-xs text-slate-500">
            No chapters added yet for {subject.name || "this subject"}. Click below to add Chapter 1.
          </div>
        )}

        {/* Add Chapter Button */}
        <button
          onClick={onAddChapter}
          className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/5 hover:border-primary transition shadow-2xs mt-1 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> Add Chapter & PDF Link
        </button>
      </div>
    </div>
  );
}

function AddSubjectBox({
  onAdd,
  activeClass,
}: {
  onAdd: (name: string) => void;
  activeClass: number;
}) {
  const [name, setName] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAdd(name.trim());
        setName("");
      }}
      className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-6 shadow-xs"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Plus className="h-4 w-4" />
        </span>
        <div className="font-display text-base font-bold text-slate-900">
          Add New Subject to Class {activeClass}
        </div>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row gap-2.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter subject name (e.g. Physical Science, English, Mathematics)"
          className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder:text-slate-400 transition"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-primary px-6 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 disabled:opacity-40 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Subject
        </button>
      </div>

      <p className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5">
        <Save className="h-3.5 w-3.5 text-slate-400" />
        Note: When you are done adding subjects and chapter links, click{" "}
        <strong className="text-slate-700">Save Changes</strong> above to publish them live.
      </p>
    </form>
  );
}
