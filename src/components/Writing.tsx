import { forwardRef } from "react";
import { parsePosts } from "../lib/posts";
import { Link, up } from "../lib/router";
import { ArrowLeft } from "./icons";
import { useClock } from "./useClock";

interface WritingProps {
  open: boolean;
  /** The selected post from /writing/<slug>; the newest post when missing or unknown. */
  slug?: string;
}

export const posts = parsePosts(import.meta.glob<string>("../posts/*.md", { query: "?raw", import: "default", eager: true }));

/** The posts screen: the selected post and the full list. */
export const Writing = forwardRef<HTMLButtonElement, WritingProps>(function Writing({ open, slug }, backRef) {
  const time = useClock();
  const post = posts.find((p) => p.slug === slug) ?? posts[0];
  return (
    <div className="layer layer-writing" inert={!open}>
      <header className="bar">
        <div className="bar-mark">BB</div>
        <button ref={backRef} type="button" className="bar-action" onClick={() => up("/menu")}>
          <ArrowLeft />
          <span>Back to menu</span>
        </button>
        <div className="bar-meta">
          <span>{time}</span>
        </div>
      </header>

      <main className="play-grid">
        <article className="cell play-stage play-list" aria-labelledby="post-h">
          {post && (
            <>
              <p className="label">{post.date}</p>
              <h2 id="post-h" className="bio">{post.title}</h2>
              {post.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </>
          )}
        </article>

        <nav className="cell play-stage play-list" aria-label="Posts">
          <div className="rows rows-ink">
            {posts.map((p) => (
              <Link
                key={p.slug}
                className="row row-post"
                href={`/writing/${p.slug}`}
                replace
                aria-current={p === post ? "page" : undefined}
              >
                <span className="label post-date">{p.date}</span>
                <span>{p.title}</span>
              </Link>
            ))}
          </div>
        </nav>
      </main>
    </div>
  );
});
