import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bike, MapPin, Phone, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { siteQueryOptions } from "@/lib/site-query";
import { getOpenState, SITE, telHref } from "@/lib/site";
import heroImage from "@/assets/hero-pulao.jpg";
import interiorImage from "@/assets/restaurant-interior.jpg";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQueryOptions()),
  head: () => ({ meta: [
    { title: "Mumtaz Foods — Pakistani Restaurant in Rawalpindi" }, { name: "description", content: "Order Pakistani food for delivery, takeaway or dine-in from Mumtaz Foods in Westridge, Rawalpindi." },
    { property: "og:title", content: "Mumtaz Foods — Rawalpindi" }, { property: "og:description", content: "Pakistani food for delivery, takeaway and dine-in in Westridge, Rawalpindi." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}), component: HomePage,
});
function HomePage() {
  const { data } = useSuspenseQuery(siteQueryOptions());
  const featured = data.products.filter((product) => product.is_featured && product.is_available).slice(0, 3);
  const open = getOpenState(data.hours);
  const settings = data.settings;
  return <>
    <section className="relative min-h-[72vh] overflow-hidden bg-charcoal md:min-h-[78vh]"><img src={heroImage} alt="Pakistani rice dish served at Mumtaz Foods" className="absolute inset-0 h-full w-full object-cover" /><div className="hero-overlay absolute inset-0" /><div className="relative mx-auto flex min-h-[72vh] max-w-7xl items-end px-4 pb-14 pt-24 md:min-h-[78vh] md:pb-20 lg:px-8"><div className="max-w-3xl text-charcoal-foreground"><p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gold">Mumtaz Foods · Rawalpindi</p><h1 className="text-balance text-5xl leading-[1.05] md:text-7xl">{settings?.tagline ?? "Authentic Taste. Made Fresh."}</h1><p className="mt-5 max-w-xl text-lg text-charcoal-foreground/80">Pakistani food prepared for dine-in, takeaway and delivery from our Westridge location.</p><div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg"><Link to="/menu"><ShoppingBag />Order now</Link></Button><Button asChild size="lg" variant="secondary"><Link to="/menu">View menu</Link></Button><Button asChild size="lg" variant="outline" className="border-charcoal-foreground/40 bg-transparent text-charcoal-foreground hover:bg-charcoal-foreground hover:text-charcoal"><a href={telHref(settings?.phone)}><Phone />Call now</a></Button></div><p className="mt-6 flex items-center gap-2 text-sm"><span className={`size-2 rounded-full ${open.isOpen ? "bg-success" : "bg-destructive"}`} />{open.label}{open.nextChange ? ` · ${open.nextChange}` : ""}</p></div></div></section>
    <section className="border-b bg-background"><div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y px-4 md:grid-cols-4 md:divide-y-0 lg:px-8">{[{Icon:UtensilsCrossed,label:"Dine in"},{Icon:ShoppingBag,label:"Takeaway"},{Icon:Bike,label:"Delivery"},{Icon:MapPin,label:"Directions"}].map(({Icon,label}) => <Link key={label} to={label === "Directions" ? "/locations" : "/menu"} className="flex items-center justify-center gap-3 py-6 font-semibold hover:text-primary"><Icon className="size-5 text-primary" />{label}</Link>)}</div></section>
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24"><div className="flex items-end justify-between gap-4"><div><p className="eyebrow">From our menu</p><h2 className="mt-3 text-4xl md:text-5xl">Popular at Mumtaz Foods</h2></div><Button asChild variant="outline" className="hidden sm:flex"><Link to="/menu">View full menu</Link></Button></div><div className="mt-9 grid gap-6 md:grid-cols-3">{featured.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>
    <section className="bg-primary text-primary-foreground"><div className="mx-auto grid max-w-7xl md:grid-cols-2"><img src={interiorImage} alt="Mumtaz Foods restaurant interior" className="h-full min-h-96 w-full object-cover" /><div className="flex items-center px-6 py-14 md:px-14"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Visit us</p><h2 className="mt-3 text-4xl">Dine in at Westridge</h2><p className="mt-5 text-primary-foreground/80">{settings?.address ?? SITE.address}</p><div className="mt-7 flex flex-wrap gap-3"><Button asChild variant="secondary"><a href={settings?.maps_url ?? SITE.mapsUrl} target="_blank" rel="noreferrer"><MapPin />Get directions</a></Button><Button asChild variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"><Link to="/locations">Hours & location</Link></Button></div></div></div></div></section>
  </>;
}
