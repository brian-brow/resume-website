import { forwardRef } from "react";
import { PondWindow } from "../pond/react";
import { ArrowRight, ArrowUpRight } from "./icons";
import { useClock } from "./useClock";

interface HomeProps {
  open: boolean;
  pondActive: boolean;
  onEnter: () => void;
}

/** The index: name, two windows onto the pond, and the door into the menu. */
export const Home = forwardRef<HTMLButtonElement, HomeProps>(function Home({ open, pondActive, onEnter }, doorRef) {
  const time = useClock();
  return (
    <div className="layer layer-home" data-pond-layer inert={open}>
      <header className="bar">
        <div className="bar-mark">BB</div>
        <div className="bar-meta">
          <span>{time}</span>
          <span className="bar-status">Currently — Fixing my quickshell config</span>
        </div>
        <button type="button" className="bar-action bar-action-dark" onClick={onEnter}>
          <span>Hello</span>
          <ArrowRight />
        </button>
      </header>

      <main className="grid">
        <section className="cell cell-name">
          <p className="label"></p>
          <h1 className="name">
            Brian
            <br />
            Brown
          </h1>
        </section>

        <PondWindow className="cell" active={pondActive} />
        <PondWindow className="cell cell-pond-secondary" active={pondActive} />

        <button ref={doorRef} type="button" className="cell door" onClick={onEnter} aria-label="Open the menu">
          <span className="door-line">Linux Enthusiast.</span>
          <span className="door-foot">
            {/* <span className="label">Bio · Links · Play · Writing</span> */}
            <span className="door-arrow">
              <ArrowUpRight />
            </span>
          </span>
        </button>
      </main>
    </div>
  );
});
