import { forwardRef } from "react";
import { Link, up } from "../lib/router";
import { ArrowLeft } from "./icons";
import { useClock } from "./useClock";

interface PlayProps {
  open: boolean;
  /** The selected project from /play/<slug>; the first project when missing or unknown. */
  slug?: string;
}

export const projects = [
  { slug: "first-project", title: "[Game or project name]", status: "[In progress]", info: "[How to play, what it is, what it's built with.]" },
  { slug: "second-project", title: "[Another thing you made]", status: "[Year]", info: "[How to play, what it is, what it's built with.]" },
];

/** The projects screen: the selected project, the list, and its info. */
export const Play = forwardRef<HTMLButtonElement, PlayProps>(function Play({ open, slug }, backRef) {
  const time = useClock();
  const project = projects.find((p) => p.slug === slug) ?? projects[0];
  return (
    <div className="layer layer-play" inert={!open}>
      <header className="bar">
        <div className="bar-mark">BB</div>
        <button ref={backRef} type="button" className="bar-action" onClick={() => up("/menu")}>
          <ArrowLeft />
          <span>Back to menu</span>
        </button>
        <div className="bar-meta">
          <span>Index / Inside / Play</span>
          <span>{time} · [Your city]</span>
        </div>
      </header>

      <main className="play-grid">
        <section className="cell play-stage" aria-label={project.title}>
          <p className="label">[{project.title} goes here]</p>
        </section>

        <nav className="cell play-list" aria-label="Projects">
          <div className="rows rows-ink">
            {projects.map((p) => (
              <Link
                key={p.slug}
                className="row row-link"
                href={`/play/${p.slug}`}
                replace
                aria-current={p === project ? "page" : undefined}
              >
                <span>{p.title}</span>
                <span className="label">{p.status}</span>
              </Link>
            ))}
          </div>
        </nav>

        <section className="cell play-info" aria-labelledby="play-info-h">
          <h2 id="play-info-h" className="label">{project.title}</h2>
          <p className="bio">{project.info}</p>
        </section>
      </main>
    </div>
  );
});
