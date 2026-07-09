import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Compass, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
const logo = { url: "/nxtranklogo.png" };

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About — NXT Rank" },
      { name: "description", content: "NXT Rank, founded by Pruthwiraj Behera, is a premium coaching institute focused on disciplined mentorship and result-driven learning for Class 1–12." },
      { property: "og:title", content: "About — NXT Rank" },
      { property: "og:description", content: "Founded by Pruthwiraj Behera. Discipline, clarity, and results." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

function About() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Our story</span>
          <h1 className="mt-3 font-display text-4xl font-bold text-primary sm:text-5xl">
            Built on discipline. <br className="hidden sm:block" />
            <span className="text-gradient-gold">Driven by results.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            NXT Rank is a modern coaching institute committed to raising the standard of school education — combining clear teaching, focused mentorship and disciplined practice.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 rounded-3xl border border-border bg-card p-8 shadow-elegant sm:p-12 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center">
          <div className="mx-auto flex flex-col items-center text-center lg:mx-0">
            <img src={logo.url} alt="Pruthwiraj Behera" className="h-40 w-40 rounded-full object-cover shadow-gold ring-4 ring-gold/40" />
            <div className="mt-5 font-display text-xl font-bold text-primary">Pruthwiraj Behera</div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Founder & Director</div>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-primary sm:text-3xl">A message from the founder</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              "I started NXT Rank with one belief — that every student deserves the clarity, structure and mentorship that turns effort into rank. We combine the warmth of a classroom with the precision of a training academy, so students not only learn, but rise. Welcome to NXT Rank."
            </p>
            <p className="mt-4 text-sm font-semibold text-foreground">— Pruthwiraj Behera</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { icon: Compass, t: "Our mission", d: "To guide every learner toward their highest possible rank through structured, values-driven coaching." },
            { icon: Sparkles, t: "Our vision", d: "To be the region's most trusted premium academy — recognised for quality, integrity and consistent results." },
            { icon: ShieldCheck, t: "Our promise", d: "Honest teaching, disciplined practice and study material you can actually rely on." },
            { icon: HeartHandshake, t: "Our approach", d: "Small batches, personal mentorship, and modern digital resources — the way learning should feel in 2026." },
          ].map((v) => (
            <div key={v.t} className="rounded-2xl border border-border bg-card p-8 shadow-soft">
              <v.icon className="h-6 w-6 text-gold" />
              <h3 className="mt-4 font-display text-xl font-bold text-primary">{v.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
