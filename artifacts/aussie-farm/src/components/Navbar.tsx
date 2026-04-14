import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Moon, Sun, PawPrint as Paw, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/chiots", label: "Nos Chiots" },
  { href: "/a-propos", label: "À Propos" },
  { href: "/avis", label: "Avis Clients" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { isDark, toggle } = useTheme();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-md border-b border-border transition-colors duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <Paw className="w-7 h-7 text-primary" />
          <span className="font-serif text-xl font-bold tracking-wide">Élevage du Berger Bleu</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location === l.href
                  ? "text-primary bg-primary/10"
                  : "text-foreground/80 hover:text-foreground hover:bg-accent"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="w-px h-6 bg-border mx-2" />
          <Button variant="ghost" size="icon" onClick={toggle} className="rounded-full w-10 h-10">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={toggle} className="rounded-full">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} className="rounded-full">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background/97 backdrop-blur-md px-4 py-4 flex flex-col gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location === l.href
                  ? "text-primary bg-primary/10"
                  : "hover:bg-accent"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
