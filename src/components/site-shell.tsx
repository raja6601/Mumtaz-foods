import { Link } from "@tanstack/react-router";
import { Clock3, MapPin, Menu, Minus, Phone, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatPrice, SITE, telHref } from "@/lib/site";

const links = [
  ["/", "Home"], ["/menu", "Menu"], ["/about", "About"], ["/locations", "Locations"],
  ["/gallery", "Gallery"], ["/reviews", "Reviews"], ["/contact", "Contact"],
] as const;

const mobileLinks = links.filter(([, label]) => label !== "Home");

export function SiteShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cart = useCart();
  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-6 px-4 lg:px-8">
        <Link to="/" className="mr-auto flex items-center gap-3" aria-label="Mumtaz Foods home">
          <span className="grid size-10 place-items-center rounded-full bg-primary font-display text-lg text-primary-foreground">M</span>
          <span><strong className="block font-display text-lg leading-none">Mumtaz Foods</strong><span className="text-xs text-muted-foreground">Rawalpindi</span></span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
          {links.map(([to, label]) => <Link key={to} to={to} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary" activeProps={{ className: "text-primary" }}>{label}</Link>)}
        </nav>
        <Button variant="ghost" size="icon" onClick={() => cart.setOpen(true)} aria-label={`Open cart with ${cart.count} items`} className="relative">
          <ShoppingBag /><span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-gold text-[10px] font-bold text-gold-foreground">{cart.count}</span>
        </Button>
        <Button asChild className="hidden sm:inline-flex"><Link to="/menu">Order now</Link></Button>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</Button>
      </div>
      {menuOpen && <nav className="grid border-t bg-background px-4 py-3 lg:hidden">{mobileLinks.map(([to, label]) => <Link key={to} to={to} onClick={() => setMenuOpen(false)} className="border-b py-3 text-sm font-medium last:border-0">{label}</Link>)}</nav>}
    </header>
    <main>{children}</main>
    <footer className="bg-charcoal pb-24 text-charcoal-foreground md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.2fr_.8fr_.8fr] lg:px-8">
        <div><p className="font-display text-2xl">Mumtaz Foods</p><p className="mt-3 max-w-md text-sm text-charcoal-foreground/70">Pakistani food for dine-in, takeaway and delivery in Westridge, Rawalpindi.</p></div>
        <div><p className="mb-3 font-semibold">Visit</p><a href={SITE.mapsUrl} target="_blank" rel="noreferrer" className="flex gap-2 text-sm text-charcoal-foreground/70 hover:text-gold"><MapPin className="mt-0.5 size-4 shrink-0" />{SITE.address}</a></div>
        <div><p className="mb-3 font-semibold">Contact</p><a href={telHref()} className="flex items-center gap-2 text-sm text-charcoal-foreground/70 hover:text-gold"><Phone className="size-4" />{SITE.phone}</a><Link to="/locations" className="mt-3 flex items-center gap-2 text-sm text-charcoal-foreground/70 hover:text-gold"><Clock3 className="size-4" />Opening hours</Link></div>
      </div>
      <div className="border-t border-charcoal-foreground/10 px-4 py-5 text-center text-xs text-charcoal-foreground/50">© 2026 Mumtaz Foods · <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link> · <Link to="/refund-policy">Refunds</Link></div>
    </footer>
    <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t bg-background p-2 shadow-lift md:hidden">
      <Button variant="ghost" asChild><Link to="/menu"><Menu />Menu</Link></Button>
      <Button onClick={() => cart.setOpen(true)}><ShoppingBag />Cart ({cart.count})</Button>
      <Button variant="ghost" asChild><a href={telHref()}><Phone />Call</a></Button>
    </div>
    {cart.isOpen && <CartDrawer />}
  </div>;
}

function CartDrawer() {
  const cart = useCart();
  return <div className="fixed inset-0 z-50 flex justify-end bg-foreground/45" role="dialog" aria-modal="true" aria-label="Your order">
    <button className="absolute inset-0 cursor-default" onClick={() => cart.setOpen(false)} aria-label="Close cart" />
    <aside className="relative flex h-full w-full max-w-md flex-col bg-background shadow-lift">
      <div className="flex items-center justify-between border-b p-5"><div><h2 className="text-2xl">Your order</h2><p className="text-sm text-muted-foreground">{cart.count} item{cart.count === 1 ? "" : "s"}</p></div><Button variant="ghost" size="icon" onClick={() => cart.setOpen(false)} aria-label="Close cart"><X /></Button></div>
      <div className="flex-1 overflow-auto p-5">
        {!cart.items.length ? <div className="grid min-h-64 place-items-center text-center"><div><ShoppingBag className="mx-auto mb-4 size-10 text-muted-foreground" /><p className="font-semibold">Your cart is empty</p><p className="mt-1 text-sm text-muted-foreground">Add dishes from the menu to begin.</p><Button asChild className="mt-5" onClick={() => cart.setOpen(false)}><Link to="/menu">Browse menu</Link></Button></div></div> : <div className="space-y-5">{cart.items.map((item) => <div key={item.key} className="border-b pb-5"><div className="flex justify-between gap-4"><div><p className="font-semibold">{item.name}</p>{item.options.length > 0 && <p className="mt-1 text-xs text-muted-foreground">{item.options.map((option) => option.name).join(", ")}</p>}<p className="mt-2 text-sm font-semibold text-primary">{formatPrice(item.price === null ? null : (item.price + item.options.reduce((sum, option) => sum + option.extra_price, 0)) * item.quantity)}</p></div><Button variant="ghost" size="icon" onClick={() => cart.remove(item.key)} aria-label={`Remove ${item.name}`}><Trash2 /></Button></div><div className="mt-3 flex items-center gap-2"><Button variant="outline" size="icon" onClick={() => cart.update(item.key, item.quantity - 1)} aria-label="Decrease quantity"><Minus /></Button><span className="w-8 text-center text-sm font-semibold">{item.quantity}</span><Button variant="outline" size="icon" onClick={() => cart.update(item.key, item.quantity + 1)} aria-label="Increase quantity"><Plus /></Button></div></div>)}</div>}
      </div>
      {cart.items.length > 0 && <div className="border-t bg-surface p-5"><div className="mb-4 flex justify-between font-semibold"><span>Subtotal</span><span>{formatPrice(cart.subtotal)}</span></div><Button asChild size="lg" className="w-full" onClick={() => cart.setOpen(false)}><Link to="/checkout">Proceed to checkout</Link></Button><Button variant="ghost" className="mt-2 w-full" onClick={() => cart.setOpen(false)}>Continue shopping</Button></div>}
    </aside>
  </div>;
}
