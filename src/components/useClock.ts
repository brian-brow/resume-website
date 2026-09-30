import { useEffect, useState } from "react";

const format = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

/** Visitor's local time, refreshed every 15s. */
export function useClock(): string {
  const [time, setTime] = useState(format);
  useEffect(() => {
    const id = setInterval(() => setTime(format()), 15_000);
    return () => clearInterval(id);
  }, []);
  return time;
}
