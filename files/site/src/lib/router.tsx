import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent } from "react";

/** Tells usePath the URL changed; the History API only fires popstate for Back/Forward. */
const notify = () => dispatchEvent(new PopStateEvent("popstate"));

/** Step into a deeper layer, adding a history entry. */
export function go(to: string) {
  if (to === location.pathname) return;
  history.pushState({ prev: location.pathname }, "", to);
  notify();
}

/** Change the URL without adding a history entry, e.g. picking a different project. */
export function swap(to: string) {
  history.replaceState(history.state, "", to);
  notify();
}

/** Step back out to `to`, popping the entry that stepped in when there is one so the browser's Back and ours agree. */
export function up(to: string) {
  if (history.state?.prev === to) return history.back();
  history.replaceState(null, "", to);
  notify();
}

/** The current URL path. */
export function usePath() {
  const [path, setPath] = useState(location.pathname);
  useEffect(() => {
    const onPop = () => setPath(location.pathname);
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, []);
  return path;
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; replace?: boolean };

/** An <a> that navigates in place; modified clicks (new tab, etc.) behave like a normal link. */
export function Link({ href, replace, onClick, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    (replace ? swap : go)(href);
  };
  return <a href={href} onClick={handle} {...rest} />;
}
