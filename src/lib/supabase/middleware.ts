import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfigured } from "@/lib/auth-mode";

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
  "/register",
  "/auth/callback",
];
const ADMIN_ROLES = ["super_admin", "finance_admin", "support_admin"] as const;

function isAdminRole(role: string | null | undefined) {
  return Boolean(role && ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]));
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseConfigured() || !url || !key) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
      const u = request.nextUrl.clone();
      u.pathname = "/login";
      u.searchParams.set("redirect", pathname);
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

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/health");

  if (!user && !isPublic) {
    const u = request.nextUrl.clone();
    u.pathname = "/login";
    u.searchParams.set("redirect", pathname);
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
      u.pathname = "/login";
      return NextResponse.redirect(u);
    }
    const role = (profile as { role: string }).role;
    const status = (profile as { account_status: string }).account_status;

    if (pathname.startsWith("/admin")) {
      if (!isAdminRole(role)) {
        return redirectTo(request, status === "approved" ? "/dashboard" : "/pending");
      }
    } else if (pathname.startsWith("/dashboard")) {
      if (isAdminRole(role)) {
        return redirectTo(request, "/admin");
      }
      // Suspended users stay — frozen overlay is rendered by the layout.
      if (status !== "approved" && status !== "suspended") {
        return redirectTo(request, "/pending");
      }
    }
  }

  if (user && (pathname === "/login" || pathname === "/register")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, account_status")
      .eq("id", user.id)
      .maybeSingle();

    const u = request.nextUrl.clone();
    const role = (profile as { role?: string } | null)?.role;
    const status = (profile as { account_status?: string } | null)?.account_status;
    if (isAdminRole(role)) {
      u.pathname = "/admin";
    } else if (status === "approved") {
      u.pathname = "/dashboard";
    } else {
      u.pathname = "/pending";
    }
    return NextResponse.redirect(u);
  }

  return responseRef;
}
