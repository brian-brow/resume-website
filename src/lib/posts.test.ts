import { expect, test } from "bun:test";
import { parsePost, parsePosts } from "./posts";

test("date and slug come from the filename, title from the first paragraph", () => {
  const post = parsePost("/src/posts/2026-09-30-bad-day.md", "Bad day\n\nFirst.\nStill first.\n\n  \nSecond.\n");
  expect(post).toEqual({ slug: "bad-day", date: "2026-09-30", title: "Bad day", body: ["First.\nStill first.", "Second."] });
});

test("posts sort newest first", () => {
  const posts = parsePosts({ "/a/2025-01-02-old.md": "Old", "/a/2026-03-04-new.md": "New" });
  expect(posts.map((p) => p.slug)).toEqual(["new", "old"]);
});

test("a filename without a date is rejected", () => {
  expect(() => parsePost("/src/posts/oops.md", "Oops")).toThrow();
});
