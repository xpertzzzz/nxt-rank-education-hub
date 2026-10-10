import { useEffect, useState } from "react";
import { Play } from "lucide-react";

type Video = { id: string; title: string; thumbnail: string; published: string };

const CHANNEL_HANDLE = "nxt-rank";
const CHANNEL_ID = "UCym6sjV5B-6nUaxlV1ZjqbQ";
const CHANNEL_URL = `https://www.youtube.com/@${CHANNEL_HANDLE}`;

// Real videos from NXT RANK so the UI loads instantly without stuck skeleton loaders
const FALLBACK_VIDEOS: Video[] = [
  {
    id: "3j3wWCHzJww",
    title: "Class 10 Board Exam | LAST 90 DAYS Strategy | 90 Days Complete Preparation Plan | BSE Odisha",
    thumbnail: "https://i.ytimg.com/vi/3j3wWCHzJww/hqdefault.jpg",
    published: new Date().toISOString(),
  },
  {
    id: "zq5mrCe3Uzg",
    title: "Divisibility Test Tricks in 30 Minutes 🔥 | Adarsha & Navodaya Entrance",
    thumbnail: "https://i.ytimg.com/vi/zq5mrCe3Uzg/hqdefault.jpg",
    published: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "9k_LaCX7QM0",
    title: "ଅଷ୍ଟମ Half Yearly ଗଣିତ ପ୍ରଶ୍ନ ଉତ୍ତର | Class 8 Maths Important Questions | Half Yearly Exam",
    thumbnail: "https://i.ytimg.com/vi/9k_LaCX7QM0/hqdefault.jpg",
    published: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "fSrIaOFaShk",
    title: "ଦଶମ Half Yearly | ମାନବ ଚକ୍ଷୁ ଓ ବର୍ଣ୍ଣଜଗତ | 5 Minutes One Shot 🔥 | BSE Odisha Class 10",
    thumbnail: "https://i.ytimg.com/vi/fSrIaOFaShk/hqdefault.jpg",
    published: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
];

async function fetchLatestVideos(): Promise<Video[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;

    const feedRes = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!feedRes.ok) throw new Error("Proxy error");
    const feedJson = (await feedRes.json()) as { contents: string };
    const xml = feedJson.contents ?? "";

    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
    if (entries.length === 0) throw new Error("No entries");

    return entries.slice(0, 4).map((e) => {
      const idMatch = e.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
      const titleMatch = e.match(/<title>(.*?)<\/title>/);
      const pubMatch = e.match(/<published>(.*?)<\/published>/);
      const id = idMatch ? idMatch[1] : "";
      return {
        id,
        title: titleMatch ? titleMatch[1].replace(/&amp;/g, "&") : "",
        published: pubMatch ? pubMatch[1] : "",
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      };
    });
  } catch {
    return FALLBACK_VIDEOS;
  }
}

export function YoutubeLatest() {
  const [videos, setVideos] = useState<Video[]>(FALLBACK_VIDEOS);

  useEffect(() => {
    let cancelled = false;
    fetchLatestVideos().then((v) => {
      if (!cancelled && v && v.length > 0) {
        setVideos(v);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Watch & learn
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold text-primary sm:text-4xl">
            Latest from our YouTube
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Fresh lectures, tips and rank-boosting sessions.
          </p>
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
        {videos.map((v) => (
          <a
            key={v.id}
            href={`https://www.youtube.com/watch?v=${v.id}`}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
          >
            <div className="relative aspect-video overflow-hidden bg-muted">
              <img
                src={v.thumbnail}
                alt={v.title}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-primary/0 transition group-hover:bg-primary/30">
                <div className="rounded-full bg-background/95 p-3 shadow-lg opacity-0 transition group-hover:opacity-100">
                  <Play className="h-5 w-5 fill-primary text-primary" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">
                {v.title}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                {new Date(v.published).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

