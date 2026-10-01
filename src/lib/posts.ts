export interface Post {
  slug: string;
  date: string;
  title: string;
  body: string[];
}

/** A post from `YYYY-MM-DD-slug.md`: the first paragraph is the title, the rest is the body. */
export function parsePost(path: string, raw: string): Post {
  const m = path.match(/(\d{4}-\d{2}-\d{2})-([^/]+)\.md$/);
  if (!m) throw new Error(`Post filename must be YYYY-MM-DD-slug.md: ${path}`);
  const [title, ...body] = raw.trim().split(/\n\s*\n/);
  return { slug: m[2], date: m[1], title, body };
}

/** Posts from a glob of raw files, newest first. */
export const parsePosts = (files: Record<string, string>) =>
  Object.entries(files)
    .map(([path, raw]) => parsePost(path, raw))
    .sort((a, b) => b.date.localeCompare(a.date));
