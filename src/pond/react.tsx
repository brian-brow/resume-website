import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createCaustics } from "./caustics";
import { Pond, type PondCore } from "./engine";
import { DOT, PondLoop } from "./loop";

const PondContext = createContext<PondLoop | null>(null);

/**
 * Creates one pond for the page and sizes its field to `stage`, the element
 * every window is positioned against (the full-screen layers).
 */
export function PondProvider({ children, core }: { children: ReactNode; core?: () => PondCore }) {
  const [loop] = useState(() => new PondLoop(core ? core() : new Pond(480, 300, { water: createCaustics() ?? undefined })));
  useEffect(() => {
    loop.start();
    return () => loop.stop();
  }, [loop]);
  return <PondContext.Provider value={loop}>{children}</PondContext.Provider>;
}

/** Attach to the stage element so the field matches its size. */
export function usePondStage<T extends HTMLElement>() {
  const loop = usePondLoop();
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => loop.resizeField(el.clientWidth, el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [loop]);
  return ref;
}

/** Keeps the pond's lily pad painted under `ref`'s element; its width is the pad's width. */
export function usePondPad(ref: RefObject<HTMLElement | null>) {
  const loop = usePondLoop();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const { left, top } = offsetInLayer(el);
      loop.setLily(left + el.offsetWidth / 2, top + el.offsetHeight / 2, el.offsetWidth / 2);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [loop, ref]);
}

function usePondLoop(): PondLoop {
  const loop = useContext(PondContext);
  if (!loop) throw new Error("Pond components must be inside <PondProvider>.");
  return loop;
}

/** Offset of `el` from its nearest ancestor marked data-pond-layer. Unaffected by CSS transforms. */
export function offsetInLayer(el: HTMLElement): { left: number; top: number } {
  let left = 0;
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && !node.hasAttribute("data-pond-layer")) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { left, top };
}

interface PondWindowProps {
  /** Pause painting while this window is hidden. */
  active?: boolean;
  /** The boids live inside this window while it is mounted. */
  tank?: boolean;
  className?: string;
  children?: ReactNode;
}

/** A cell that shows its part of the shared pond. Children render on top. */
export function PondWindow({ active = true, tank = false, className, children }: PondWindowProps) {
  const loop = usePondLoop();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<ReturnType<PondLoop["add"]> | null>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const handle = loop.add(canvas);
    handleRef.current = handle;
    const measure = () => {
      const { left, top } = offsetInLayer(wrap);
      const crop = {
        sx: Math.round(left / DOT),
        sy: Math.round(top / DOT),
        sw: Math.max(1, Math.ceil(wrap.clientWidth / DOT)),
        sh: Math.max(1, Math.ceil(wrap.clientHeight / DOT)),
      };
      loop.setCrop(handle, crop);
      if (tank) loop.setTank(crop);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      loop.remove(handle);
      if (tank) loop.setTank(null);
      handleRef.current = null;
    };
  }, [loop, tank]);

  useEffect(() => {
    if (handleRef.current) loop.setActive(handleRef.current, active);
  }, [loop, active]);

  return (
    <div
      ref={wrapRef}
      className={["pond-window", className].filter(Boolean).join(" ")}
      onPointerMove={(e) => handleRef.current && loop.poke(handleRef.current, e.clientX, e.clientY)}
    >
      <canvas ref={canvasRef} className="pond-canvas" aria-hidden="true" />
      {children}
    </div>
  );
}
