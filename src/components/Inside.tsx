import { forwardRef, type RefObject } from "react";
import { Link } from "../lib/router";
import { PondWindow, usePondPad } from "../pond/react";
import { ArrowLeft } from "./icons";
import { projects } from "./Play";
import { useClock } from "./useClock";

interface InsideProps {
  open: boolean;
  pondActive: boolean;
  onLeave: () => void;
  padRef: RefObject<HTMLButtonElement | null>;
  onBrowse: () => void;
}

const links = [
  { label: "GitHub", detail: "brian-brow", href: "https://github.com/brian-brow" },
  { label: "X / Twitter", detail: "@[HANDLE]", href: "#" },
  { label: "LinkedIn", detail: "[NAME]", href: "#" },
  { label: "Email", detail: "[YOU@DOMAIN]", href: "#" },
];

const posts = [
  { date: "[DATE]", title: "[Most recent post title]", href: "#" },
  { date: "[DATE]", title: "[Older post title]", href: "#" },
  { date: "[DATE]", title: "[Oldest post title]", href: "#" },
];

/** The four rooms behind the door. */
export const Inside = forwardRef<HTMLButtonElement, InsideProps>(function Inside({ open, pondActive, onLeave, padRef, onBrowse }, backRef) {
  const time = useClock();
  usePondPad(padRef);
  return (
    <div className="layer layer-inside" data-pond-layer inert={!open}>
      <header className="bar">
        <div className="bar-mark">BB</div>
        <button ref={backRef} type="button" className="bar-action" onClick={onLeave}>
          <ArrowLeft />
          <span>Back to index</span>
        </button>
        <div className="bar-meta">
          <span>Index / Inside</span>
          <span>{time} · [Your city]</span>
        </div>
      </header>

      <main className="grid">
        <section className="cell room room-bio" aria-labelledby="bio-h">
          <h2 id="bio-h" className="label">01 — Bio</h2>
          <p className="bio">Software Engineer at the Loxahatchee River District.</p>
          <div className="room-foot label">
            <span>Based in South Florida</span>
            <span>Software Engineer / University of Florida</span>
          </div>
        </section>

        <section className="cell room room-links" aria-labelledby="links-h">
          <h2 id="links-h" className="label">02 — Links</h2>
          <nav className="rows">
            {links.map((l) => (
              <a key={l.label} className="row row-link" href={l.href}>
                <span>{l.label}</span>
                <span className="label">{l.detail} ↗</span>
              </a>
            ))}
          </nav>
        </section>

        <PondWindow className="cell room room-play" active={pondActive}>
          <h2 className="label chip">03 — Play</h2>
          <button ref={padRef} type="button" className="lily" onClick={onBrowse}>
            <span>Browse</span>
          </button>
          <div className="cards">
            {projects.slice(0, 2).map((p) => (
              <Link key={p.slug} className="card" href={`/play/${p.slug}`}>
                <span>{p.title}</span>
                <span className="label">{p.status} ↗</span>
              </Link>
            ))}
          </div>
        </PondWindow>

        <section className="cell room room-writing" aria-labelledby="writing-h">
          <h2 id="writing-h" className="label">04 — Writing</h2>
          <div className="rows rows-ink">
            {posts.map((p, i) => (
              <a key={i} className="row row-post" href={p.href}>
                <span className="label post-date">{p.date}</span>
                <span>{p.title}</span>
              </a>
            ))}
          </div>
          <a className="label" href="#">All posts →</a>
        </section>
      </main>

      <div className="doors" aria-hidden="true">
        <div className="panel panel-left" />
        <div className="panel panel-right" />
      </div>
    </div>
  );
});
