import React from "react";
import { Link } from "wouter";
import { PawPrint as Paw, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Paw className="w-5 h-5 text-primary" />
              <span className="font-serif font-bold text-lg">Élevage du Berger Bleu</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Élevage familial passionné de Bergers Australiens depuis 2009. Chiots LOF élevés à la maison. Livraisons en France, Suisse et Belgique.
            </p>
            <div className="flex items-center gap-2 text-xs text-primary font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Chiots disponibles actuellement
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                { href: "/", label: "Accueil" },
                { href: "/chiots", label: "Nos Chiots" },
                { href: "/reproducteurs", label: "Nos Reproducteurs" },
                { href: "/race", label: "Le Berger Australien" },
                { href: "/a-propos", label: "À Propos" },
                { href: "/avis", label: "Avis Clients" },
                { href: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-primary transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact & Zones</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="tel:+33757817202" className="hover:text-primary transition-colors">07 57 81 72 02</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="mailto:contact@berger-bleu.fr" className="hover:text-primary transition-colors">contact@berger-bleu.fr</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Bellevaux (74), Haute-Savoie<br />Livraisons : 🇫🇷 France · 🇨🇭 Suisse · 🇧🇪 Belgique</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Élevage du Berger Bleu — Tous droits réservés</p>
          <div className="flex items-center gap-4">
            <span>Déclaré DDPP</span>
            <span>·</span>
            <span>Élevage LOF agréé</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
