import type { ReactNode } from "react";
export function PageHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return <section className="border-b bg-surface"><div className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20"><p className="eyebrow">{eyebrow}</p><h1 className="mt-3 max-w-3xl text-4xl leading-tight md:text-6xl">{title}</h1>{children && <div className="mt-5 max-w-2xl text-muted-foreground">{children}</div>}</div></section>;
}
