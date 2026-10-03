import { forwardRef, useEffect, useState, type MouseEvent, type RefObject } from "react";
import { Link } from "../lib/router";
import { palettes } from "../palettes";
import { PondWindow, usePondColours, usePondPad } from "../pond/react";
import { ArrowLeft } from "./icons";
import { ProjectInfo, ProjectList, projects, type Project } from "./Play";
import { useClock } from "./useClock";
import { posts } from "./Writing";

interface InsideProps {
  open: boolean;
  pondActive: boolean;
  onLeave: () => void;
  padRef: RefObject<HTMLButtonElement | null>;
  onBrowse: () => void;
  /** The project Play shows, for the cards the links flap reveals. */
  project: Project;
}

const links = [
  { label: "GitHub", detail: "brian-brow", href: "https://github.com/brian-brow" },
  { label: "X / Twitter", detail: "secret", href: "#" },
  { label: "LinkedIn", detail: "in/brian-brown", href: "https://www.linkedin.com/in/brian-brown-5a7aa2298/" },
  { label: "Email", detail: "brianbrown13378@gmail.com", href: "mailto:brianbrown13378@gmail.com" },
];

const isMail = (href: string) => href.startsWith("mailto:");

/** The four rooms behind the door. */
export const Inside = forwardRef<HTMLButtonElement, InsideProps>(function Inside({ open, pondActive, onLeave, padRef, onBrowse, project }, backRef) {
  const time = useClock();
  usePondPad(padRef);
  const [copied, setCopied] = useState(false);
  const [palette, setPalette] = useState(palettes[0]);
  usePondColours(palette.ink, palette.paper, palette.lily);
  useEffect(() => {
    for (const [k, v] of Object.entries(palette)) document.documentElement.style.setProperty(`--${k}`, v);
  }, [palette]);
  const shuffle = () => {
    const others = palettes.filter((p) => p !== palette);
    setPalette(others[Math.floor(Math.random() * others.length)]);
  };

  /** Copies the address instead of opening a mail app; falls back to the mailto link if the clipboard is blocked. */
  const copy = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    navigator.clipboard.writeText(href.slice("mailto:".length)).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => (location.href = href),
    );
  };

  return (
    <div className="layer layer-inside" data-pond-layer inert={!open}>
      <header className="bar">
        <div className="bar-mark">BB</div>
        <button ref={backRef} type="button" className="bar-action" onClick={onLeave}>
          <ArrowLeft />
          <span>Back</span>
        </button>
        <div className="bar-meta">
          <button type="button" className="bar-shuffle" onClick={shuffle}>
            Shuffle colours
          </button>
          <span>{time}</span>
        </div>
      </header>

      <main className="grid">
        <PondWindow className="cell bio-pond" active={pondActive} />
        <section className="cell room room-bio" aria-labelledby="bio-h">
          <h2 id="bio-h" className="label">01 — Bio</h2>
          <p className="bio">Computer science graduate from the University of Florida.</p>
          <div className="room-foot label">
            <span>Based in South Florida</span>
            <span>Software Engineer / University of Florida</span>
          </div>
        </section>

        {/* going to Play, the links flap falls over the equator, revealing Play's list behind it and landing as Play's info */}
        <div className="flip-under" inert aria-hidden="true">
          <ProjectList project={project} />
        </div>
        <div className="flap">
          <section className="cell room room-links" aria-labelledby="links-h">
            <h2 id="links-h" className="label">02 — Links</h2>
            <nav className="rows">
              {links.map((l) => (
                <a key={l.label} className="row row-link" href={l.href} onClick={isMail(l.href) ? (e) => copy(e, l.href) : undefined}>
                  <span>{l.label}</span>
                  <span className="label" aria-live="polite">
                    {copied && isMail(l.href) ? "Copied" : l.detail} ↗
                  </span>
                </a>
              ))}
            </nav>
          </section>
          <div className="flap-back" inert aria-hidden="true">
            <ProjectInfo project={project} />
          </div>
        </div>

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
            {posts.slice(0, 3).map((p) => (
              <Link key={p.slug} className="row row-post" href={`/writing/${p.slug}`}>
                <span className="label post-date">{p.date}</span>
                <span>{p.title}</span>
              </Link>
            ))}
          </div>
          <Link className="label" href="/writing">All posts →</Link>
        </section>
      </main>

      <div className="doors" aria-hidden="true">
        <div className="panel panel-left" />
        <div className="panel panel-right" />
      </div>
    </div>
  );
});
