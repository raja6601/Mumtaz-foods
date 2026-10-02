import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/menu-types";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/site";
import pulaoImage from "@/assets/hero-pulao.jpg";
import kababImage from "@/assets/food-kabab.jpg";
import karahiImage from "@/assets/food-karahi.jpg";

function fallbackImage(product: Product) {
  if (product.slug.includes("kabab")) return kababImage;
  if (product.slug.includes("karahi")) return karahiImage;
  return pulaoImage;
}

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const [quantity, setQuantity] = useState(1);
  const image = product.image_url || fallbackImage(product);
  return <article className="group overflow-hidden rounded-lg border bg-card shadow-card transition-transform hover:-translate-y-1 hover:shadow-lift">
    <div className="relative aspect-[4/3] overflow-hidden bg-muted"><img src={image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />{product.is_placeholder && <span className="absolute left-3 top-3 rounded bg-background/90 px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground">Sample item</span>}</div>
    <div className="p-4"><div className="flex items-start justify-between gap-3"><h3 className="text-xl">{product.name}</h3><span className={`mt-1 size-3 shrink-0 rounded-full border-2 ${product.is_vegetarian ? "border-success bg-success" : "border-primary bg-primary"}`} aria-label={product.is_vegetarian ? "Vegetarian" : "Non-vegetarian"} /></div><p className="mt-2 line-clamp-2 min-h-10 text-sm text-muted-foreground">{product.description}</p><div className="mt-4 flex items-center justify-between"><strong className="text-primary">{formatPrice(product.price)}</strong>{product.is_available ? <div className="flex items-center gap-1"><Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease"><Minus /></Button><span className="w-6 text-center text-sm">{quantity}</span><Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)} aria-label="Increase"><Plus /></Button><Button onClick={() => { for (let i = 0; i < quantity; i++) cart.add(product); }}>Add</Button></div> : <span className="text-sm text-muted-foreground">Unavailable</span>}</div></div>
  </article>;
}
