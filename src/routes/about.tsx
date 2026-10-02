import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/page-heading";
import { siteQueryOptions } from "@/lib/site-query";
import interiorImage from "@/assets/restaurant-interior.jpg";

export const Route = createFileRoute("/about")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQueryOptions()),
  head: () => ({ meta: [{ title: "About — Mumtaz Foods" }, { name: "description", content: "Learn about Mumtaz Foods in Westridge, Rawalpindi." }, { property: "og:title", content: "About Mumtaz Foods" }, { property: "og:description", content: "Pakistani food for dine-in, takeaway and delivery in Rawalpindi." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: AboutPage,
});

function AboutPage() {
  const { data } = useSuspenseQuery(siteQueryOptions());
  return <><PageHeading eyebrow="Our restaurant" title="Mumtaz Foods"><p>{data.settings?.tagline ?? "Authentic Taste. Made Fresh."}</p></PageHeading><section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 md:items-center lg:px-8 lg:py-20"><img src={interiorImage} alt="Mumtaz Foods restaurant interior" className="aspect-[4/3] w-full rounded-lg object-cover"/><div><h2 className="text-3xl">Pakistani food in Westridge</h2><p className="mt-5 leading-7 text-muted-foreground">{data.settings?.about_text ?? "Mumtaz Foods serves Pakistani food for dine-in, takeaway and delivery from Westridge, Rawalpindi."}</p><Button asChild className="mt-7"><Link to="/menu">View menu</Link></Button></div></section></>;
}