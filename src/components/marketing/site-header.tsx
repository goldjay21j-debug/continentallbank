import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ScrollAwareHeader } from "./scroll-aware-header";
import { getT } from "@/lib/i18n/dictionaries";
import { detectLocale } from "@/lib/i18n/detect";

export async function SiteHeader() {
  const locale = await detectLocale();
  const t = getT(locale);

  const nav = [
    { href: "/services", label: t("nav.services") },
    { href: "/leadership", label: t("nav.leadership") },
    { href: "/offices", label: t("nav.global_reach") },
    { href: "/insights", label: t("nav.insights") },
  ];

  return (
    <ScrollAwareHeader>
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="focus-ring rounded-sm">
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-[13px] font-medium tracking-tight text-foreground/75 transition-colors duration-200 hover:text-foreground after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:scale-x-0 after:origin-left after:bg-champagne-500/70 after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher currentLocale={locale} />
          <span className="mx-1 hidden h-5 w-px bg-border md:inline-block" />
          <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
            <Link href="/login">{t("common.login")}</Link>
          </Button>
          <Button variant="gold" size="sm" asChild>
            <Link href="/register">{t("common.register")}</Link>
          </Button>
        </div>
      </div>
    </ScrollAwareHeader>
  );
}
