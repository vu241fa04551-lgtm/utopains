// Minimal className joiner so the UI kit doesn't need an extra
// dependency just for conditional class merging.
export function clsx(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(" ");
}
