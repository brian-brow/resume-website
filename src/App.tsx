import { useEffect, useRef, useState } from "react";
import { Home } from "./components/Home";
import { Inside } from "./components/Inside";
import { Play } from "./components/Play";
import { Writing } from "./components/Writing";
import { go, up, usePath } from "./lib/router";
import { offsetInLayer, usePondStage } from "./pond/react";

const isPlay = (path: string) => /^\/play(\/|$)/.test(path);
const isWriting = (path: string) => /^\/writing(\/|$)/.test(path);

export default function App() {
  const path = usePath();
  const play = isPlay(path);
  const writing = isWriting(path);
  // The menu stays zoomed in underneath the projects and posts screens
  const open = path === "/menu" || play || writing;
  const [moving, setMoving] = useState(false);
  const stageRef = usePondStage<HTMLDivElement>();
  const doorRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const writingRef = useRef<HTMLButtonElement>(null);
  const lilyRef = useRef<HTMLButtonElement>(null);
  const firstRender = useRef(true);

  // Keeps the zoom aimed at the door
  useEffect(() => {
    const stage = stageRef.current;
    const door = doorRef.current;

    if (!stage || !door) return;

    const measure = () => {
      const W = stage.clientWidth;
      const H = stage.clientHeight;

      const { offsetLeft: x, offsetTop: y, offsetWidth: w, offsetHeight: h } = door;
      const s = Math.max(W / w, H / h);
      stage.style.setProperty("--zoom-s", String(s));
      stage.style.setProperty("--zoom-x", `${W / 2 - s * (x + w / 2)}px`);
      stage.style.setProperty("--zoom-y", `${H / 2 - s * (y + h / 2)}px`);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    ro.observe(door);
    return () => ro.disconnect();
  }, [stageRef]);

  // Keeps the ripple centred on the lily pad
  useEffect(() => {
    const stage = stageRef.current;
    const lily = lilyRef.current;
    const menu = lily?.closest<HTMLElement>("[data-pond-layer]");
    if (!stage || !lily || !menu) return;
    const measure = () => {
      const { left, top } = offsetInLayer(lily);
      stage.style.setProperty("--lily-x", `${left + lily.offsetWidth / 2 - menu.scrollLeft}px`);
      stage.style.setProperty("--lily-y", `${top + lily.offsetHeight / 2 - menu.scrollTop}px`);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    menu.addEventListener("scroll", measure, { passive: true });
    return () => {
      ro.disconnect();
      menu.removeEventListener("scroll", measure);
    };
  }, [stageRef]);

  // While the zoom or ripple runs both layers are visible, so both keep painting
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const stage = stageRef.current;
    if (!stage) return;
    setMoving(true);
    const ms = parseFloat(getComputedStyle(stage).getPropertyValue("--t-zoom"));
    const id = setTimeout(() => {
      setMoving(false);
      (play ? playRef : writing ? writingRef : open ? backRef : doorRef).current?.focus({ preventScroll: true });
    }, ms);
    return () => clearTimeout(id);
  }, [open, play, writing, stageRef]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isPlay(location.pathname) || isWriting(location.pathname)) up("/menu");
      else if (location.pathname === "/menu") up("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const className = ["stage", open && "is-open", play && "is-play", writing && "is-writing"].filter(Boolean).join(" ");

  return (
    <div ref={stageRef} className={className}>
      <Home ref={doorRef} open={open} pondActive={!open || moving} onEnter={() => go("/menu")} />
      <Inside ref={backRef} open={open && !play && !writing} pondActive={(open && !play && !writing) || moving}
        onLeave={() => up("/")}
        padRef={lilyRef}
        onBrowse={() => go("/play")}
      />
      <Play ref={playRef} open={play} slug={path.split("/")[2]} />
      <Writing ref={writingRef} open={writing} slug={path.split("/")[2]} />
    </div>
  );
}
