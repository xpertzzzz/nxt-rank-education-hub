import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GraduationCap } from "lucide-react";

export const Route = createFileRoute("/faculty")({
  component: Faculty,
});

const faculty = [
  {
    name: "Pruthwiraj Behera",
    role: "Founder & Director",
    subject: "Mathematics",
    initials: "PB",
    featured: true,
  },
  { name: "Faculty Member", role: "Senior Educator", subject: "Physical Science", initials: "PS" },
  { name: "Faculty Member", role: "Senior Educator", subject: "Life Science", initials: "LS" },
  { name: "Faculty Member", role: "Language Expert", subject: "English", initials: "EN" },
  { name: "Faculty Member", role: "Language Expert", subject: "Odia", initials: "OD" },
  { name: "Faculty Member", role: "Language Expert", subject: "Hindi & Sanskrit", initials: "HS" },
  { name: "Faculty Member", role: "Senior Educator", subject: "SSC", initials: "SS" },
];

function Faculty() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
            The mentors
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold text-primary sm:text-5xl">
            Meet the faculty
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Subject specialists with a shared philosophy — patient teaching, structured learning,
            and unwavering focus on the next rank.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {faculty.map((f, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-3xl border p-8 shadow-soft transition hover:-translate-y-1 hover:shadow-elegant ${
                f.featured
                  ? "border-gold/50 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground"
                  : "border-border bg-card"
              }`}
            >
              {f.featured && (
                <span className="absolute right-5 top-5 rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-gold-foreground">
                  Founder
                </span>
              )}
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-2xl font-display text-2xl font-bold ${
                  f.featured ? "bg-gold text-gold-foreground" : "bg-primary text-primary-foreground"
                }`}
              >
                {f.initials}
              </div>
              <div className="mt-6">
                <h3
                  className={`font-display text-xl font-bold ${f.featured ? "text-primary-foreground" : "text-primary"}`}
                >
                  {f.name}
                </h3>
                <p
                  className={`mt-1 text-xs uppercase tracking-[0.15em] ${f.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                >
                  {f.role}
                </p>
                <div
                  className={`mt-5 flex items-center gap-2 text-sm font-semibold ${f.featured ? "text-gold" : "text-foreground"}`}
                >
                  <GraduationCap className="h-4 w-4" />
                  {f.subject}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
