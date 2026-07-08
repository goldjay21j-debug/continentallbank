import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";

const desks = [
  { city: "Geneva", region: "Headquarters", since: "1972" },
  { city: "London", region: "United Kingdom", since: "1981" },
  { city: "Luxembourg", region: "European Union", since: "1986" },
  { city: "Singapore", region: "Asia–Pacific", since: "1997" },
  { city: "Dubai", region: "Middle East & North Africa", since: "2009" },
  { city: "New York", region: "Americas (Representative)", since: "2014" },
];

export function GlobalSection() {
  return (
    <section id="global" className="border-t border-border bg-background">
      <div className="container py-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
          <Reveal>
            <div className="eyebrow flex items-center gap-3 mb-4">
              <span className="inline-block h-px w-8 bg-champagne-500/70" />
              <span>Global Reach</span>
            </div>
            <h2 className="font-display text-display-lg text-foreground text-balance">
              Six desks. One ledger. One relationship.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground text-pretty">
              Whether you wake in Singapore or settle in Geneva, the same banker, the same record,
              the same standard. Continental's coordinated desks operate as one institution under
              one common protocol.
            </p>
          </Reveal>

          <Stagger as="ul" className="divide-y divide-border border-y border-border" step={0.05}>
            {desks.map((d) => (
              <StaggerItem
                as="li"
                key={d.city}
                className="flex items-baseline justify-between py-4 transition-colors hover:bg-muted/40"
              >
                <div>
                  <div className="font-display text-lg font-medium text-foreground">{d.city}</div>
                  <div className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
                    {d.region}
                  </div>
                </div>
                <div className="tabular-figures text-sm font-medium text-champagne-700 dark:text-champagne-400">
                  Est. {d.since}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
