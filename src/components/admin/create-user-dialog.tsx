"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { MorphDialog } from "@/components/motion/morph-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUserAsAdmin } from "@/app/actions/admin";
import { COUNTRIES, CURRENCIES, LANGUAGES, ROLE_LABELS, type Role } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CreateUserDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState({
    fullName: "",
    email: "",
    password: "",
    country: "US",
    preferredCurrency: "USD",
    preferredLanguage: "en",
    role: "client" as Role,
    status: "approved" as "approved" | "pending",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createUserAsAdmin(state);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message ?? "Created.");
      setOpen(false);
      setState({ ...state, fullName: "", email: "", password: "" });
    });
  }

  return (
    <MorphDialog
      open={open}
      onOpenChange={setOpen}
      layoutId="create-client"
      trigger={({ ref, ...rest }) => (
        <button
          ref={ref}
          {...rest}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-5 h-10 text-sm font-medium tracking-tight",
            "bg-primary text-primary-foreground",
            "shadow-[0_8px_24px_-12px_rgba(7,17,31,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]",
            "hover:bg-primary/95 transition-colors duration-200",
            "focus-ring",
          )}
        >
          <Plus className="h-4 w-4" /> {trigger || "New client"}
        </button>
      )}
    >
      <MorphDialog.Header>
        <MorphDialog.Title>Create new client</MorphDialog.Title>
        <MorphDialog.Description>
          Provision an account directly. The wallet ledger and account number are generated
          automatically.
        </MorphDialog.Description>
      </MorphDialog.Header>

      <form onSubmit={submit} className="mt-5 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full legal name</Label>
            <Input
              id="fullName"
              value={state.fullName}
              onChange={(e) => setState({ ...state, fullName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={state.email}
              onChange={(e) => setState({ ...state, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Temporary password</Label>
          <Input
            id="password"
            type="text"
            value={state.password}
            onChange={(e) => setState({ ...state, password: e.target.value })}
            required
            minLength={8}
            placeholder="At least 8 characters"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Country</Label>
            <Select value={state.country} onValueChange={(v) => setState({ ...state, country: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select
              value={state.preferredCurrency}
              onValueChange={(v) => setState({ ...state, preferredCurrency: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Language</Label>
            <Select
              value={state.preferredLanguage}
              onValueChange={(v) => setState({ ...state, preferredLanguage: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={state.role} onValueChange={(v) => setState({ ...state, role: v as Role })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["client", "support_admin", "finance_admin", "super_admin"] as Role[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Initial status</Label>
            <Select
              value={state.status}
              onValueChange={(v) => setState({ ...state, status: v as "approved" | "pending" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Approved (active)</SelectItem>
                <SelectItem value="pending">Pending review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <MorphDialog.Footer>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create client"}
          </Button>
        </MorphDialog.Footer>
      </form>
    </MorphDialog>
  );
}
