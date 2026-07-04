"use client";

import { useState, useTransition } from "react";
import { FilePlus2 } from "lucide-react";
import { toast } from "sonner";
import { issueClientDocument } from "@/app/actions/admin";
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
import { Textarea } from "@/components/ui/textarea";
import { DOCUMENT_TYPE_LABELS, type DocumentType } from "@/lib/portal/documents";

const DOCUMENT_TYPES = Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({
  value: value as DocumentType,
  label,
}));

export function DocumentIssueForm({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState({
    type: "account_letter" as DocumentType,
    title: "",
    description: "",
    paragraph: "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await issueClientDocument({ userId, ...state });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message ?? "Document issued.");
      setState({
        type: "account_letter",
        title: "",
        description: "",
        paragraph: "",
      });
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <div className="eyebrow text-champagne-700 dark:text-champagne-400">
          Document controls
        </div>
        <h3 className="mt-2 font-display text-lg font-semibold text-foreground">
          Issue to vault
        </h3>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
          Post an official notice, receipt, or letter directly to the client document vault.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Document class</Label>
          <Select
            value={state.type}
            onValueChange={(value) => setState({ ...state, type: value as DocumentType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="document-title">Title</Label>
          <Input
            id="document-title"
            value={state.title}
            onChange={(event) => setState({ ...state, title: event.target.value })}
            placeholder="Q2 mandate confirmation"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="document-description">Short description</Label>
        <Input
          id="document-description"
          value={state.description}
          onChange={(event) => setState({ ...state, description: event.target.value })}
          placeholder="Client-facing summary shown in Document Vault."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="document-paragraph">Document body</Label>
        <Textarea
          id="document-paragraph"
          rows={5}
          value={state.paragraph}
          onChange={(event) => setState({ ...state, paragraph: event.target.value })}
          placeholder="Write the official notice text that should print on the document."
          required
          minLength={20}
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Issuing..." : "Issue document"}
        <FilePlus2 className="h-4 w-4" />
      </Button>
    </form>
  );
}
