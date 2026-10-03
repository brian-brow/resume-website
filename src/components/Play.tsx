import { forwardRef } from "react";
import { Link, up } from "../lib/router";
import { PondWindow } from "../pond/react";
import ConnectFour from "../play/connectfour/ConnectFour";
import SandSim from "../play/sandsim/SandSim";
import Conway from "../play/conway/Conway";
import WFCollapse from "../play/wfcollapse/WFCollapse";
import { ArrowLeft } from "./icons";
import { useClock } from "./useClock";

interface PlayProps {
  open: boolean;
  project: Project;
}

/** The pond itself, with the boids confined to it. */
function Boids() {
  return <PondWindow className="boids-tank" tank />;
}

export const projects = [
  {
    slug: "boids",
    title: "Boids",
    status: "Simulation",
    info: "Fish that flock using separation, alignment and cohesion, swimming over caustic water. They scatter from the cursor.",
    Stage: Boids,
  },
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
    slug: "life",
    title: "Conways Game of Life",
    status: "Simulation",
    info: "PLUH.",
    Stage: Conway,
  },
  {
    slug: "wave-function-collapse",
    title: "Wave Function Collapse",
    status: "Generator",
    info: "A procedural generation algorithm that collapses a grid of possibilities into a coherent image, tile by tile, guided by adjacency constraints.",
    Stage: WFCollapse,
  },
];

export type Project = (typeof projects)[number];

/** Every project, with the shown one marked. */
export function ProjectList({ project }: { project: Project }) {
  return (
    <nav className="cell play-list" aria-label="Projects">
      <div className="rows rows-ink">
        {projects.map((p) => (
          <Link key={p.slug} className="row row-link" href={`/play/${p.slug}`} replace aria-current={p === project ? "page" : undefined}>
            <span>{p.title}</span>
            <span className="label">{p.status}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function ProjectInfo({ project }: { project: Project }) {
  return (
    <section className="cell play-info" aria-label={project.title}>
      <h2 className="label">{project.title}</h2>
      <p className="bio">{project.info}</p>
    </section>
  );
}

/** The projects screen: the selected project, the list, and its info. */
export const Play = forwardRef<HTMLButtonElement, PlayProps>(function Play({ open, project }, backRef) {
  const time = useClock();

  return (
    <div className="layer layer-play" data-pond-layer inert={!open}>
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
          {open && <project.Stage key={project.slug} />}
        </section>

        <ProjectList project={project} />
        <ProjectInfo project={project} />
      </main>
    </div>
  );
});
