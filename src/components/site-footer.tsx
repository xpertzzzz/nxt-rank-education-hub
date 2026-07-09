import { Link } from "@tanstack/react-router";
import logo from "@/assets/nxt-rank-logo.jpg.asset.json";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo.url} alt="NXT Rank" className="h-10 w-10 rounded-full ring-1 ring-border" />
            <span className="font-display text-lg font-bold text-primary">NXT Rank</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            A premium academic institute guiding students to the next rank — with clarity, discipline, and modern pedagogy.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">Founder & Director — Pruthwiraj Behera</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/faculty" className="hover:text-primary">Faculty</Link></li>
            <li><Link to="/downloads" className="hover:text-primary">PDF Downloads</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Connect</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><a href="https://www.youtube.com/@nxt-rank" target="_blank" rel="noreferrer" className="hover:text-primary">YouTube — @nxt-rank</a></li>
            <li><Link to="/admin" className="hover:text-primary">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          © {new Date().getFullYear()} NXT Rank. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
