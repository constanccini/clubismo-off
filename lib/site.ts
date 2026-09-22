// NEXT_PUBLIC_BASE_PATH is supplied by GitHub's configure-pages action.
// It is empty for a custom domain/user site and /repository for project sites.
export const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
export function assetPath(path: string) {
  if (!path || /^https?:\/\//i.test(path)) return path;
  if (basePath && (path === basePath || path.startsWith(`${basePath}/`))) return path;
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}
export const brand = { logo: "/images/logo-clubismo-off.png" };
