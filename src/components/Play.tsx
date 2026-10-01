import { forwardRef, useEffect, useRef, useState } from "react";
import { Link, up } from "../lib/router";
import ConnectFour from "../play/connectfour/ConnectFour";
import SandSim from "../play/sandsim/SandSim";
import WFCollapse from "../play/wfcollapse/WFCollapse";
import { ArrowLeft } from "./icons";
import { useClock } from "./useClock";

interface PlayProps {
  open: boolean;
  /** The selected project from /play/<slug>; the first project when missing or unknown. */
  slug?: string;
}

export const projects = [
  {
    slug: "connect-four",
    title: "Connect Four",
    status: "Game",
    info: "A fully functioning connect four game that uses the minmax algorithm to play against you. Its depth is not very deep so its not too hard to beat.",
    Stage: ConnectFour,
  },
  {
    slug: "sand",
    title: "Sand Simulation",
    status: "Simulation",
    info: "A falling-sand simulation where particles interact with each other and their environment. Refactored from an older project into TypeScript.",
    Stage: SandSim,
  },
  {
    slug: "wave-function-collapse",
    title: "Wave Function Collapse",
    status: "Generator",
    info: "A procedural generation algorithm that collapses a grid of possibilities into a coherent image, tile by tile, guided by adjacency constraints.",
    Stage: WFCollapse,
  },
];

/** The projects screen: the selected project, the list, and its info. */
export const Play = forwardRef<HTMLButtonElement, PlayProps>(function Play({ open, slug }, backRef) {
  const time = useClock();
  const layerRef = useRef<HTMLDivElement>(null);
  // While the ripple closes the URL has already left /play, so keep showing the last project
  const lastSlug = useRef(slug);
  if (open) lastSlug.current = slug;
  const project = projects.find((p) => p.slug === lastSlug.current) ?? projects[0];
  const [live, setLive] = useState(open);

  // Unmount the project only once the ripple has fully closed over it
  useEffect(() => {
    if (open) {
      setLive(true);
      return;
    }
    const ms = parseFloat(getComputedStyle(layerRef.current!).getPropertyValue("--t-zoom"));
    const id = setTimeout(() => setLive(false), ms);
    return () => clearTimeout(id);
  }, [open]);

  return (
    <div ref={layerRef} className="layer layer-play" inert={!open}>
      <header className="bar">
        <div className="bar-mark">BB</div>
        <button ref={backRef} type="button" className="bar-action" onClick={() => up("/menu")}>
          <ArrowLeft />
          <span>Back</span>
        </button>
        <div className="bar-meta">
          <span>{time}</span>
        </div>
      </header>

      <main className="play-grid">
        <section className="cell play-stage" aria-label={project.title}>
          {(open || live) && <project.Stage key={project.slug} />}
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
