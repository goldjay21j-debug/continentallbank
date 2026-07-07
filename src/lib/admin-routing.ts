export const DEFAULT_ADMIN_ORIGIN = "https://admin.continentallbank.com";

export const ADMIN_ORIGIN = (
  process.env.NEXT_PUBLIC_ADMIN_URL || DEFAULT_ADMIN_ORIGIN
).replace(/\/$/, "");

const ADMIN_SECTIONS = [
  "analytics",
  "audit-logs",
  "beneficiaries",
  "compliance",
  "messages",
  "recovery",
  "refunds",
  "support",
  "transactions",
  "users",
  "withdrawals",
] as const;

export function isAdminHost(hostHeader?: string | null) {
  const host = (hostHeader ?? "").split(":")[0]?.toLowerCase();
  if (!host) return false;

  try {
    return host === new URL(ADMIN_ORIGIN).hostname.toLowerCase();
  } catch {
    return host === "admin.continentallbank.com";
  }
}

export function adminBasePathForHost(hostHeader?: string | null) {
  return isAdminHost(hostHeader) ? "" : "/admin";
}

export function toAdminInternalPath(pathname: string) {
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap")
  ) {
    return pathname;
  }

  if (pathname === "/" || pathname === "") return "/admin";
  if (pathname === "/login") return "/admin/login";
  if (pathname.startsWith("/admin")) return pathname;

  const section = pathname.split("/").filter(Boolean)[0];
  if (ADMIN_SECTIONS.includes(section as (typeof ADMIN_SECTIONS)[number])) {
    return `/admin${pathname}`;
  }

  return "/admin";
}

export function toAdminExternalPath(pathname: string) {
  if (pathname === "/admin") return "/";
  if (pathname === "/admin/login") return "/login";
  if (pathname.startsWith("/admin/")) return pathname.slice("/admin".length);
  return pathname;
}

export function adminHref(basePath: string, href: string) {
  if (basePath) return href;

  const hashIndex = href.indexOf("#");
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const queryIndex = withoutHash.indexOf("?");
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : "";

  return `${toAdminExternalPath(pathname)}${query}${hash}`;
}
