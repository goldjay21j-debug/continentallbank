import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isAdminHost,
  toAdminExternalPath,
  toAdminInternalPath,
} from "@/lib/admin-routing";
import { supabasePublicConfigured } from "@/lib/auth-mode";

type CookiePair = { name: string; value: string; options?: CookieOptions };

// Pages that do NOT require an authenticated session.
const PUBLIC_PATHS = [
  "/",
  "/about",
  "/leadership",
  "/services",
  "/offices",
  "/insights",
  "/security",
  "/compliance",
  "/fraud-protection",
  "/help",
  "/faq",
  "/privacy",
  "/refund",
  "/terms",
  "/login",
  "/admin/login",
  "/register",
  "/auth/callback",
];
const ADMIN_ROLES = ["super_admin", "finance_admin", "support_admin"] as const;

function isAdminRole(role: string | null | undefined) {
  return Boolean(role && ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]));
}

function redirectTo(request: NextRequest, pathname: string, adminHost = false) {
  if (adminHost && !pathname.startsWith("/admin")) {
    const publicOrigin = (process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin).replace(
      /\/$/,
      "",
    );
    return NextResponse.redirect(new URL(pathname, publicOrigin));
  }

  const url = request.nextUrl.clone();
  url.pathname = adminHost ? toAdminExternalPath(pathname) : pathname;
  return NextResponse.redirect(url);
}

function rewriteToInternal(request: NextRequest, pathname: string, response: NextResponse) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const rewritten = NextResponse.rewrite(url, { request });
  response.cookies.getAll().forEach((cookie) => rewritten.cookies.set(cookie));
  return rewritten;
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  const originalPathname = request.nextUrl.pathname;
  const adminHostRequest = isAdminHost(request.headers.get("host"));

  if (adminHostRequest && originalPathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = toAdminExternalPath(originalPathname);
    return NextResponse.redirect(url);
  }

  const pathname = adminHostRequest ? toAdminInternalPath(originalPathname) : originalPathname;

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/health");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabasePublicConfigured() || !url || !key) {
    if (isPublic) return response;

    if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
      const u = request.nextUrl.clone();
      u.pathname = pathname.startsWith("/admin") && adminHostRequest ? "/login" : pathname.startsWith("/admin") ? "/admin/login" : "/login";
      u.searchParams.set(
        "redirect",
        pathname.startsWith("/admin") && adminHostRequest ? toAdminExternalPath(pathname) : pathname,
      );
      return NextResponse.redirect(u);
    }
    return response;
  }

  // --- Real Supabase session check ----------------------------------
  let responseRef = response;
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet: CookiePair[]) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        responseRef = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          responseRef.cookies.set(name, value, options),
        );
      },
    },
  });

  let user: { id: string } | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    return responseRef;
  }

  if (!user && !isPublic) {
    const u = request.nextUrl.clone();
    u.pathname = pathname.startsWith("/admin") && adminHostRequest ? "/login" : pathname.startsWith("/admin") ? "/admin/login" : "/login";
    u.searchParams.set(
      "redirect",
      pathname.startsWith("/admin") && adminHostRequest ? toAdminExternalPath(pathname) : pathname,
    );
    return NextResponse.redirect(u);
  }

  if (user && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, account_status")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      const u = request.nextUrl.clone();
      u.pathname = pathname.startsWith("/admin") && adminHostRequest ? "/login" : pathname.startsWith("/admin") ? "/admin/login" : "/login";
      return NextResponse.redirect(u);
    }
    const role = (profile as { role: string }).role;
    const status = (profile as { account_status: string }).account_status;

    if (pathname.startsWith("/admin")) {
      if (pathname === "/admin/login") {
        return redirectTo(
          request,
          isAdminRole(role) ? "/admin" : status === "approved" ? "/dashboard" : "/pending",
          adminHostRequest,
        );
      }
      if (!isAdminRole(role)) {
        return redirectTo(request, status === "approved" ? "/dashboard" : "/pending", adminHostRequest);
      }
    } else if (pathname.startsWith("/dashboard")) {
      if (isAdminRole(role)) {
        return redirectTo(request, "/admin", adminHostRequest);
      }
      // Suspended users stay — frozen overlay is rendered by the layout.
      if (status !== "approved" && status !== "suspended") {
        return redirectTo(request, "/pending", adminHostRequest);
      }
    }
  }

  if (user && (pathname === "/login" || pathname === "/register" || pathname === "/admin/login")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, account_status")
      .eq("id", user.id)
      .maybeSingle();

    const u = request.nextUrl.clone();
    const role = (profile as { role?: string } | null)?.role;
    const status = (profile as { account_status?: string } | null)?.account_status;
    if (isAdminRole(role)) {
      u.pathname = adminHostRequest ? "/" : "/admin";
    } else if (status === "approved") {
      if (adminHostRequest) return redirectTo(request, "/dashboard", true);
      u.pathname = "/dashboard";
    } else {
      if (adminHostRequest) return redirectTo(request, "/pending", true);
      u.pathname = "/pending";
    }
    return NextResponse.redirect(u);
  }

  if (adminHostRequest && pathname !== originalPathname) {
    return rewriteToInternal(request, pathname, responseRef);
  }

  return responseRef;
}
