import { queryOptions } from "@tanstack/react-query";
import { getSiteData } from "./public-data.functions";
export const siteQueryOptions = () => queryOptions({ queryKey: ["site-data"], queryFn: () => getSiteData(), staleTime: 60_000 });
