import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Download,
  GraduationCap,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { YoutubeLatest } from "@/components/youtube-latest";
const logo = { url: "/nxtranklogo.png" };

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "NXT Rank — Premium Academic Coaching" },
      {
        name: "description",
        content:
          "Guiding students to the next rank. Expert faculty, curated notes, and PDF study material for Class 1–12.",
      },
      {
        name: "keywords",
        content:
          "NXT Rank, Academic Coaching, Study Material, Class 1-12, PDF Notes, Pruthwiraj Behera",
      },
      { name: "author", content: "NXT Rank Institute" },
      { property: "og:title", content: "NXT Rank — Premium Academic Coaching" },
      {
        property: "og:description",
        content:
          "Guiding students to the next rank. Expert faculty, curated notes, and PDF study material for Class 1–12.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -left-32 top-40 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Premium academic coaching
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] text-primary sm:text-5xl lg:text-6xl">
              Rise beyond scores. <br />
              <span className="text-gradient-gold">Reach the next rank.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              NXT Rank is a modern coaching institute founded by{" "}
              <strong className="text-foreground">Pruthwiraj Behera</strong>, blending disciplined
              mentorship with clear, curated study material — engineered to help every student find
              their winning rhythm.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/downloads"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:opacity-90"
              >
                <Download className="h-4 w-4" />
                Download study notes
              </Link>
              <Link
                to="/faculty"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur transition hover:border-primary hover:text-primary"
              >
                Meet the faculty
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
              {[
                { k: "1500+", v: "Students mentored" },
                { k: "12", v: "Classes covered" },
                { k: "95%", v: "Pass with distinction" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-display text-2xl font-bold text-primary sm:text-3xl">
                    {s.k}
                  </dt>
                  <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/10 to-gold/20 blur-2xl" />
            <div className="relative rounded-[2rem] border border-border bg-card p-8 shadow-elegant sm:p-10">
              <div className="flex items-center gap-4">
                <img
                  src={logo.url}
                  alt="NXT Rank"
                  className="h-16 w-16 rounded-full ring-2 ring-gold/40"
                />
                <div>
                  <div className="font-display text-xl font-bold text-primary">
                    NXT Rank Institute
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Est. by Pruthwiraj Behera
                  </div>
                </div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  { icon: BookOpen, t: "Curated notes", d: "Chapter-wise PDFs." },
                  { icon: Users, t: "Expert faculty", d: "Trained mentors." },
                  { icon: Trophy, t: "Rank focus", d: "Result-driven." },
                  { icon: GraduationCap, t: "1–12 support", d: "Full journey." },
                ].map((f) => (
                  <div
                    key={f.t}
                    className="rounded-2xl border border-border/70 bg-secondary/40 p-4"
                  >
                    <f.icon className="h-5 w-5 text-gold" />
                    <div className="mt-3 text-sm font-semibold text-foreground">{f.t}</div>
                    <div className="text-xs text-muted-foreground">{f.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Why NXT Rank
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold text-primary sm:text-4xl">
            A calm, premium learning environment — engineered for outcomes.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              t: "Concept-first teaching",
              d: "Every topic is broken into the smallest teachable idea — no memorising, only understanding.",
            },
            {
              t: "Personalised mentorship",
              d: "Small batches so each student gets attention, targeted doubt-clearing and weekly progress checks.",
            },
            {
              t: "Downloadable material",
              d: "Chapter-wise, exam-oriented PDFs available anytime. Study on any device, offline.",
            },
          ].map((f, i) => (
            <div
              key={f.t}
              className="group rounded-2xl border border-border bg-card p-8 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground font-display text-lg font-bold">
                {i + 1}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <YoutubeLatest />

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-14 text-center shadow-elegant sm:px-14">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/30 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-primary-glow/40 blur-3xl" />
          <h2 className="relative font-display text-3xl font-bold text-primary-foreground sm:text-4xl">
            Ready to prepare like a topper?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
            Get instant access to curated Class 10 study material and stay ahead of the syllabus.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/downloads"
              className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-primary shadow hover:opacity-90"
            >
              <Download className="h-4 w-4" /> Download PDFs
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
