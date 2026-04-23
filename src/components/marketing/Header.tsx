import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

const NAV = [
  { label: "Product", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Use cases", href: "#use-cases" },
  { label: "Pricing", href: "#pricing" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 " +
        (scrolled
          ? "backdrop-blur-2xl bg-background/40 border-b border-white/5 py-0"
          : "bg-transparent py-4")
      }
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-10">
        <Logo />
        
        <nav className="hidden items-center gap-2 md:flex border border-white/5 bg-white/[0.03] backdrop-blur-md rounded-full px-2 py-1.5">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-full px-5 py-2 text-sm font-bold uppercase tracking-widest text-muted-foreground/80 transition-all hover:text-white hover:bg-white/5 text-[10px]"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Button asChild variant="ghost" size="sm" className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground hover:text-white">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild variant="hero" size="sm" className="h-10 px-6 font-bold uppercase tracking-widest text-[10px] group">
            <Link to="/login">Start free <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" /></Link>
          </Button>
        </div>

        <button
          className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-2xl glass-strong border-white/10"
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-3xl animate-fade-in">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-6 font-display">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-4 text-lg font-bold text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
              >
                {n.label}
              </a>
            ))}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Button asChild variant="glass" size="lg" className="h-14 font-bold border-white/5">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild variant="hero" size="lg" className="h-14 font-bold">
                <Link to="/login" onClick={() => setOpen(false)}>Start free</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
