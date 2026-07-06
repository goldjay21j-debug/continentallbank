"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { setLocale } from "@/app/actions/locale";
import { LANGUAGES } from "@/lib/constants";
import { getT, type Locale } from "@/lib/i18n/dictionaries";

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const t = getT(currentLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("language.change")}
          className="gap-1.5 text-[12px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
          disabled={pending}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>{currentLocale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>{t("language.label")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            className="justify-between"
            onSelect={() =>
              startTransition(() =>
                setLocale(l.code as Locale).then((result) => {
                  if (result.ok) router.refresh();
                }),
              )
            }
          >
            <span>{l.name}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {l.code}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
