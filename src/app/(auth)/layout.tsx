import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";
import { AmbientBackdrop } from "@/components/shared/ambient-backdrop";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-foreground dark">
      <AmbientBackdrop variant="navy" />

      <div className="relative grid min-h-screen min-w-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* Left rail — editorial quote, sits on the ambient navy */}
        <aside className="relative hidden min-w-0 flex-col justify-between p-9 lg:flex xl:p-10">
          <div>
            <Link href="/" className="focus-ring rounded-sm inline-block">
              <BrandMark variant="light" />
            </Link>
          </div>

          <div className="max-w-md">
            <div className="eyebrow text-champagne-300 mb-4">A note from the chairman</div>
            <p className="font-display text-2xl leading-[1.35] text-ivory-100/95 text-balance">
              &ldquo;We do not chase scale. We protect the few who have entrusted us with a
              lifetime of careful work. Restraint is our standard.&rdquo;
            </p>
            <p className="mt-4 text-[12px] uppercase tracking-[0.18em] text-ivory-100/55">
              É. Marchand · Chairman, Continental Bank · Geneva
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ivory-100/55">
            <span>Geneva · London · Luxembourg</span>
            <span>Singapore · Dubai · New York</span>
          </div>
        </aside>

        {/* Form column — a glass-strong card centred on the navy backdrop */}
        <main className="relative flex w-full min-w-0 items-start justify-center px-4 pb-8 pt-20 sm:px-8 sm:pb-10 lg:items-center lg:p-10 xl:p-12">
          {/* Mobile-only brand mark at the top */}
          <div className="lg:hidden absolute top-6 left-6">
            <Link href="/" className="focus-ring rounded-sm inline-block">
              <BrandMark variant="light" />
            </Link>
          </div>

          <div className="relative w-full min-w-0 max-w-md animate-fade-in">
            <div className="glass-strong p-5 sm:p-7">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
