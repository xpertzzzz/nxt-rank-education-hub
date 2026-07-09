import { useEffect, useState } from "react";
import { Play } from "lucide-react";

type Video = { id: string; title: string; thumbnail: string; published: string };

const CHANNEL_HANDLE = "nxt-rank";
const CHANNEL_URL = `https://www.youtube.com/@${CHANNEL_HANDLE}`;

async function fetchLatestVideos(): Promise<Video[]> {
  // Resolve channel ID from the channel page HTML, then read the public RSS feed.
  const pageRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(CHANNEL_URL)}`);
  const html = await pageRes.text();
  const m = html.match(/"channelId":"(UC[\w-]{20,})"/) || html.match(/channel\/(UC[\w-]{20,})/);
  if (!m) throw new Error("no channel id");
  const channelId = m[1];
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const feedRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`);
  const xml = await feedRes.text();
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  const entries = Array.from(doc.getElementsByTagName("entry")).slice(0, 4);
  return entries.map((e) => {
    const id = e.getElementsByTagName("yt:videoId")[0]?.textContent || "";
    const title = e.getElementsByTagName("title")[0]?.textContent || "";
    const published = e.getElementsByTagName("published")[0]?.textContent || "";
    return { id, title, published, thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
  });
}

export function YoutubeLatest() {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchLatestVideos()
      .then((v) => !cancelled && setVideos(v))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Watch & learn</span>
          <h2 className="mt-2 font-display text-3xl font-bold text-primary sm:text-4xl">Latest from our YouTube</h2>
          <p className="mt-2 text-sm text-muted-foreground">Fresh lectures, tips and rank-boosting sessions.</p>
        </div>
        <a
          href={CHANNEL_URL}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground shadow-sm transition hover:border-primary hover:text-primary sm:text-sm"
        >
          Visit channel →
        </a>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {(videos ?? Array.from({ length: 4 }).map((_, i) => ({ id: `sk-${i}`, title: "", thumbnail: "", published: "" }))).map((v, i) => {
          if (!videos) {
            return <div key={i} className="aspect-video animate-pulse rounded-2xl bg-muted" />;
          }
          return (
            <a
              key={v.id}
              href={`https://www.youtube.com/watch?v=${v.id}`}
              target="_blank"
              rel="noreferrer"
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img src={v.thumbnail} alt={v.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center bg-primary/0 transition group-hover:bg-primary/30">
                  <div className="rounded-full bg-background/95 p-3 shadow-lg opacity-0 transition group-hover:opacity-100">
                    <Play className="h-5 w-5 fill-primary text-primary" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">{v.title}</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {new Date(v.published).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {error && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Couldn't load videos right now. <a className="text-primary underline" href={CHANNEL_URL} target="_blank" rel="noreferrer">Open the channel</a>.
        </p>
      )}
    </section>
  );
}
