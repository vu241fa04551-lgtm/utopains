// Pure slug generation — extracted so it's independently testable
// without a database (course creation needs a unique, URL-safe slug).
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
