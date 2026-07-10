import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, FileText, Lock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { loadClasses, type ClassData } from "@/lib/subjects-store";

export const Route = createFileRoute("/downloads")({
  component: Downloads,
});

function Downloads() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [activeClass, setActiveClass] = useState(10);

  useEffect(() => {
    loadClasses().then(setClasses);
  }, []);

  const current = classes.find((c) => c.classNum === activeClass);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
            Study material
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold text-primary sm:text-5xl">
            PDF Downloads
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Choose your class and download chapter-wise notes prepared by NXT Rank faculty.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Select a class
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-12">
            {classes.map((c) => {
              const active = c.classNum === activeClass;
              const enabled = c.enabled;
              return (
                <button
                  key={c.classNum}
                  onClick={() => enabled && setActiveClass(c.classNum)}
                  disabled={!enabled}
                  className={`relative rounded-2xl px-2 py-4 text-center transition ${
                    active
                      ? "bg-primary text-primary-foreground shadow-elegant"
                      : enabled
                        ? "bg-secondary text-foreground hover:bg-accent"
                        : "cursor-not-allowed bg-muted/40 text-muted-foreground/50"
                  }`}
                >
                  <div className="font-display text-lg font-bold">{c.classNum}</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wider">Class</div>
                  {!enabled && <Lock className="absolute right-1.5 top-1.5 h-3 w-3" />}
                  {enabled && !active && (
                    <span className="absolute -top-1.5 right-1.5 rounded-full bg-gold px-1.5 text-[9px] font-bold text-gold-foreground">
                      NEW
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {current && !current.enabled ? (
          <div className="rounded-3xl border border-dashed border-border bg-secondary/30 p-14 text-center">
            <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
            <h2 className="mt-4 font-display text-2xl font-bold text-primary">Coming soon</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Study material for this class will be published shortly.
            </p>
          </div>
        ) : current ? (
          <>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
              <div className="min-w-0">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                  Available now
                </span>
                <h2 className="mt-1 font-display text-3xl font-bold text-primary sm:text-4xl">
                  {current.label} Subjects
                </h2>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {current.subjects.length} subjects
              </span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {current.subjects.map((s) => {
                const hasLink = Boolean(s.url);
                return (
                  <div
                    key={s.id}
                    className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        PDF
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-lg font-bold text-foreground">
                      {s.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Chapter-wise notes & practice
                    </p>
                    <div className="mt-6 flex flex-col gap-2">
                      {s.chapters && s.chapters.length > 0 ? (
                        s.chapters.map((ch, idx) => (
                          <div key={ch.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-secondary/50 border border-border/50">
                            <span className="text-sm font-medium truncate flex-1" title={ch.name || `Chapter ${idx + 1}`}>
                              {ch.name || `Chapter ${idx + 1}`}
                            </span>
                            {ch.url ? (
                              <a
                                href={ch.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </a>
                            ) : (
                              <span className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-muted/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground border border-dashed border-border">
                                <Lock className="h-3 w-3" />
                                Soon
                              </span>
                            )}
                          </div>
                        ))
                      ) : s.url ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                        >
                          <Download className="h-4 w-4" />
                          Download PDF
                        </a>
                      ) : (
                        <button
                          disabled
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-dashed border-border bg-muted/40 px-4 py-2.5 text-sm font-semibold text-muted-foreground"
                        >
                          <Lock className="h-4 w-4" />
                          Material coming soon
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {current.subjects.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-border bg-secondary/30 p-10 text-center text-sm text-muted-foreground">
                  No subjects added yet.
                </div>
              )}
            </div>
          </>
        ) : null}
      </section>

      <SiteFooter />
    </div>
  );
}
