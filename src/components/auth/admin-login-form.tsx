"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAdminAction } from "@/app/actions/auth";
import { adminHref, toAdminInternalPath } from "@/lib/admin-routing";

export function AdminLoginForm({ basePath = "/admin" }: { basePath?: string }) {
  const router = useRouter();
  const search = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await signInAdminAction(fd);
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      const requestedRedirect = search.get("redirect");
      const redirectTo = resolveAdminRedirect(basePath, requestedRedirect ?? res.redirectTo);
      toast.success("Officer session verified.");
      router.replace(redirectTo);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-md border border-champagne-500/20 bg-champagne-500/[0.07] px-3.5 py-3 text-[12px] leading-relaxed text-ivory-100/76">
        <div className="mb-1 flex items-center gap-2 font-medium text-champagne-200">
          <ShieldCheck className="h-3.5 w-3.5" />
          Officer-only access
        </div>
        Client accounts are not accepted here. All officer sessions are role-checked and audit logged.
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-email">Officer email</Label>
        <Input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="officer@continentallbank.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-password">Password</Label>
        <div className="relative">
          <Input
            id="admin-password"
            name="password"
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1.5 text-muted-foreground transition hover:text-foreground"
            aria-label={showPass ? "Hide password" : "Show password"}
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-2 text-[13px] text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Verifying officer..." : "Enter administration"}
        {!pending && <ArrowRight className="h-4 w-4" />}
      </Button>
    </form>
  );
}

function resolveAdminRedirect(basePath: string, target?: string | null) {
  if (basePath) {
    return target?.startsWith("/admin") ? target : "/admin";
  }

  if (!target?.startsWith("/")) {
    return "/";
  }

  return adminHref("", toAdminInternalPath(target));
}
