import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Lock } from "lucide-react";
const logo = { url: "/nxtranklogo.png" };

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/faculty", label: "Faculty" },
  { to: "/downloads", label: "PDF Downloads" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img
            src={logo.url}
            alt="NXT Rank"
            className="h-11 w-11 shrink-0 rounded-full ring-1 ring-border"
          />
          <div className="min-w-0">
            <div className="truncate font-display text-lg font-bold leading-none text-primary">
              NXT Rank
            </div>
            <div className="mt-1 truncate text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Excellence in Learning
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-accent hover:text-foreground"
              activeProps={{
                className:
                  "rounded-full px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground",
              }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="https://nxtrank.vercel.app/admin"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Admin"
            className="rounded-full p-2 text-muted-foreground/50 transition hover:text-muted-foreground"
          >
            <Lock className="h-4 w-4" />
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-full border border-border p-2 md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent"
                activeProps={{
                  className:
                    "rounded-lg px-3 py-2 text-sm font-semibold bg-primary text-primary-foreground",
                }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
