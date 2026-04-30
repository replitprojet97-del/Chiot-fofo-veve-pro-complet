import React, { useState, useEffect } from "react";
import { useSEO } from "@/hooks/useSEO";
import {
  Star, X, CheckCircle2, Info, Loader2, PawPrint as Paw, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePuppies } from "@/hooks/usePuppies";
import { type Puppy } from "@/lib/api";
import ReservationModal from "@/components/ReservationModal";
import ImageGallery from "@/components/ImageGallery";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const STATUS_LABELS: Record<string, string> = { available: "Disponible", reserved: "Réservé", sold: "Vendu" };
const STATUS_COLORS: Record<string, string> = {
  available: "bg-emerald-500 text-white shadow-lg shadow-emerald-900/30",
  reserved: "bg-amber-500 text-white shadow-lg shadow-amber-900/25",
  sold: "bg-slate-600 text-white shadow-lg shadow-slate-900/25",
};

function FeaturedCard({ puppy, onClick }: { puppy: Puppy; onClick: () => void }) {
  const img = puppy.images[0] ?? "/images/puppy-bleu-merle.png";
  return (
    <div
      onClick={onClick}
      className="group bg-card rounded-2xl overflow-hidden border-2 border-amber-300/60 dark:border-amber-600/40 shadow-sm hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-500 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Image pleine largeur — même layout mobile et desktop */}
      <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0">
        <img
          src={img}
          alt={puppy.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badge À la Une */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-white text-xs font-bold shadow">
          <Sparkles className="w-3 h-3" /> À la Une
        </div>
        {/* Prix */}
        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
          {puppy.price.toLocaleString("fr-FR")} €
        </div>
        {/* Statut */}
        <div className={`absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ring-white/20 ${STATUS_COLORS[puppy.status]}`}>
          {puppy.status === "available" && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />}
          {puppy.status === "reserved" && <span className="w-1.5 h-1.5 rounded-full bg-white/80 flex-shrink-0" />}
          {puppy.status === "sold" && <X className="w-3 h-3 text-white/70 flex-shrink-0" />}
          {STATUS_LABELS[puppy.status]}
        </div>
        {/* Badge sexe */}
        <div className={`absolute bottom-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow ${puppy.sex === "Mâle" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-200" : "bg-pink-100 text-pink-700 dark:bg-pink-900/80 dark:text-pink-200"}`}>
          {puppy.sex === "Mâle" ? "M" : "F"}
        </div>
      </div>

      {/* Corps de la carte */}
      <div className="flex flex-col flex-grow p-4 gap-3">
        <div>
          <h3 className="font-serif text-xl font-bold group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-tight">
            {puppy.name}
          </h3>
          <p className="text-muted-foreground text-sm capitalize mt-0.5">
            {puppy.color} · {puppy.sex} · {puppy.ageWeeks} sem.
          </p>
        </div>

        {puppy.traits.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {puppy.traits.slice(0, 3).map((t) => (
              <span key={t} className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-700/40 text-xs rounded-md font-medium">
                {t}
              </span>
            ))}
          </div>
        )}

        {puppy.status === "reserved" && puppy.reservedFor && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
            Réservé pour <span className="font-bold">{puppy.reservedFor}</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-amber-100 dark:border-amber-800/30">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            Pucé · Vacciné · Certifié
          </div>
          <Button size="sm" className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white border-none text-xs h-8 px-4 shadow-sm flex-shrink-0">
            Voir →
          </Button>
        </div>
      </div>
    </div>
  );
}

function PuppyCard({ puppy, onClick }: { puppy: Puppy; onClick: () => void }) {
  const img = puppy.images[0] ?? "/images/puppy-bleu-merle.png";
  return (
    <div
      className="group bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={img} alt={puppy.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ring-white/20 ${STATUS_COLORS[puppy.status]}`}>
            {puppy.status === "available" && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />}
            {puppy.status === "reserved" && <span className="w-1.5 h-1.5 rounded-full bg-white/80 flex-shrink-0" />}
            {puppy.status === "sold" && <X className="w-3 h-3 text-white/70 flex-shrink-0" />}
            {STATUS_LABELS[puppy.status]}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
          {puppy.price.toLocaleString("fr-FR")} €
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-serif text-2xl font-bold group-hover:text-primary transition-colors">{puppy.name}</h3>
            <p className="text-muted-foreground text-sm capitalize mt-0.5">{puppy.color} · {puppy.ageWeeks} sem.</p>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${puppy.sex === "Mâle" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300"}`}>
            {puppy.sex === "Mâle" ? "M" : "F"}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3 mt-3">
          {puppy.traits.slice(0, 2).map((t) => <span key={t} className="px-2.5 py-1 bg-secondary text-secondary-foreground text-xs rounded-md font-medium">{t}</span>)}
        </div>
        {puppy.status === "reserved" && puppy.reservedFor && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
            Réservé pour <span className="font-bold">{puppy.reservedFor}</span>
          </div>
        )}
        <Button className="w-full rounded-xl h-11 font-medium">Voir les détails</Button>
      </div>
    </div>
  );
}

export default function Chiots() {
  useSEO({
    title: "Nos Chiots Berger Australien à Vendre — LOF, Bleu Merle, Rouge Merle | Élevage du Berger Bleu",
    description: "Découvrez nos chiots Berger Australien disponibles : bleu merle, rouge merle, noir tricolore, rouge tricolore. Tous LOF avec pedigree, vaccinés et vérifiés par vétérinaire. Réservez votre chiot Aussie.",
    canonical: "https://www.elevagedubergerbleu.com/chiots",
  });
  const [filterColor, setFilterColor] = useState<ColorFilter>("Tous");
  const [filterSex, setFilterSex] = useState<SexFilter>("Tous");
  const [filterStatus, setFilterStatus] = useState<"Tous" | "available" | "reserved" | "sold">("Tous");
  const [selectedPuppy, setSelectedPuppy] = useState<Puppy | null>(null);
  const [reservingPuppy, setReservingPuppy] = useState<Puppy | null>(null);
  const { data: puppies = [], isLoading } = usePuppies();

  useEffect(() => {
    document.body.style.overflow = (selectedPuppy || reservingPuppy) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedPuppy, reservingPuppy]);

  const filtered = puppies.filter((p) => {
    if (filterColor !== "Tous" && p.color !== filterColor) return false;
    if (filterSex !== "Tous" && p.sex !== filterSex) return false;
    if (filterStatus !== "Tous" && p.status !== filterStatus) return false;
    return true;
  });

  const featuredPuppies = filtered.filter((p) => p.isPremium);
  const regularPuppies = filtered.filter((p) => !p.isPremium);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* WhatsApp */}
      <a
        href="https://wa.me/33757817202?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9(e)%20par%20vos%20chiots."
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.422-.272.347-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
        </svg>
      </a>

      <div className="pt-20">
        {/* Header */}
        <div className="bg-secondary/30 py-16">
          <div className="container px-4 mx-auto text-center">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">Nos Chiots</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Chaque chiot part pucé, vacciné, vermifugé avec certificat vétérinaire.<br />
              <span className="font-medium">Livraisons en 🇫🇷 France · 🇨🇭 Suisse · 🇧🇪 Belgique</span>
            </p>
          </div>
        </div>

        <section className="py-12">
          <div className="container px-4 mx-auto">

            {/* Filters */}
            <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-4 mb-12 p-5 bg-card rounded-2xl border border-border/50 shadow-sm">
              <div className="flex flex-wrap justify-center gap-2">
                <span className="text-xs text-muted-foreground font-medium self-center mr-1">Robe :</span>
                {(["Tous", "bleu merle", "rouge merle", "noir tricolore", "rouge tricolore"] as const).map((c) => (
                  <button key={c} onClick={() => setFilterColor(c)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterColor === c ? "bg-primary text-primary-foreground shadow-md scale-105" : "bg-secondary hover:bg-accent border border-border"}`}>
                    <span className="capitalize">{c}</span>
                  </button>
                ))}
              </div>
              <div className="h-8 w-px bg-border hidden md:block" />
              <div className="flex flex-wrap justify-center gap-2">
                <span className="text-xs text-muted-foreground font-medium self-center mr-1">Sexe :</span>
                {(["Tous", "Mâle", "Femelle"] as const).map((s) => (
                  <button key={s} onClick={() => setFilterSex(s)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterSex === s ? "bg-foreground text-background shadow-md scale-105" : "bg-secondary hover:bg-accent border border-border"}`}>{s}</button>
                ))}
              </div>
              <div className="h-8 w-px bg-border hidden md:block" />
              <div className="flex flex-wrap justify-center gap-2">
                <span className="text-xs text-muted-foreground font-medium self-center mr-1">Statut :</span>
                {([
                  { v: "Tous" as const, l: "Tous" },
                  { v: "available" as const, l: "Disponible" },
                  { v: "reserved" as const, l: "Réservé" },
                  { v: "sold" as const, l: "Vendu" },
                ]).map((s) => (
                  <button key={s.v} onClick={() => setFilterStatus(s.v)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterStatus === s.v ? "bg-primary/20 text-primary border border-primary/40 scale-105" : "bg-secondary hover:bg-accent border border-border"}`}>{s.l}</button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* ─── À LA UNE section ─── */}
                {featuredPuppies.length > 0 && (
                  <div className="mb-14">
                    {/* Section container with amber tinted frame */}
                    <div className="rounded-3xl border border-amber-300/50 dark:border-amber-700/40 bg-amber-50/60 dark:bg-amber-950/20 overflow-hidden shadow-sm">
                      {/* Section header */}
                      <div className="flex items-center justify-between px-6 py-4 border-b border-amber-200/60 dark:border-amber-700/30 bg-gradient-to-r from-amber-500/10 to-transparent">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-white text-sm font-bold shadow-sm">
                            <Sparkles className="w-3.5 h-3.5" />
                            À la Une
                          </div>
                          <span className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                            {featuredPuppies.length} annonce{featuredPuppies.length > 1 ? "s" : ""} mise{featuredPuppies.length > 1 ? "s" : ""} en avant
                          </span>
                        </div>
                        <span className="text-xs text-amber-700/60 dark:text-amber-500/60 hidden sm:block">Annonces sélectionnées par l'élevage</span>
                      </div>

                      {/* Featured cards — 1 colonne mobile, 2 colonnes desktop */}
                      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {featuredPuppies.map((p) => (
                          <FeaturedCard key={p.id} puppy={p} onClick={() => setSelectedPuppy(p)} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── Regular listings ─── */}
                {regularPuppies.length > 0 && (
                  <div>
                    {featuredPuppies.length > 0 && (
                      <div className="flex items-center gap-3 mb-8">
                        <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
                          Toutes les annonces
                          <span className="ml-2 text-xs font-normal">({regularPuppies.length})</span>
                        </span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {regularPuppies.map((p) => <PuppyCard key={p.id} puppy={p} onClick={() => setSelectedPuppy(p)} />)}
                    </div>
                  </div>
                )}

                {filtered.length === 0 && (
                  <div className="text-center py-24 bg-card rounded-3xl border border-dashed border-border">
                    <Paw className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Aucun chiot correspondant</h3>
                    <p className="text-muted-foreground mb-6">Essayez de modifier vos filtres</p>
                    <Button variant="outline" onClick={() => { setFilterColor("Tous"); setFilterSex("Tous"); setFilterStatus("Tous"); }} className="rounded-full">Réinitialiser les filtres</Button>
                  </div>
                )}
              </>
            )}

            {/* Info livraison */}
            <div className="mt-16 grid grid-cols-3 gap-4 p-6 bg-primary/5 rounded-2xl border border-primary/20 text-center">
              {[
                { flag: "🇫🇷", label: "France" },
                { flag: "🇨🇭", label: "Suisse" },
                { flag: "🇧🇪", label: "Belgique" },
              ].map((z) => (
                <div key={z.label}>
                  <div className="text-3xl mb-1">{z.flag}</div>
                  <div className="text-sm font-semibold">{z.label}</div>
                  <div className="text-xs text-muted-foreground">Livraison assurée</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Puppy Detail Modal */}
      {selectedPuppy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSelectedPuppy(null)} />
          <div className="relative bg-card text-card-foreground w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {selectedPuppy.isPremium && (
              <div className="absolute top-0 left-0 right-0 z-10 flex justify-start px-4 pt-4">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-white text-xs font-bold shadow">
                  <Sparkles className="w-3 h-3" /> À la Une
                </div>
              </div>
            )}
            <button onClick={() => setSelectedPuppy(null)} className={`absolute right-4 z-20 w-10 h-10 bg-background/60 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-background transition-colors ${selectedPuppy.isPremium ? "top-10" : "top-4"}`}>
              <X className="w-5 h-5" />
            </button>
            <div className="overflow-y-auto">
              <div className="grid md:grid-cols-2">
                <ImageGallery
                  key={selectedPuppy.id}
                  images={selectedPuppy.images}
                  puppyName={selectedPuppy.name}
                  isPremium={selectedPuppy.isPremium}
                />
                <div className="p-8 flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ring-white/20 ${STATUS_COLORS[selectedPuppy.status]}`}>
                      {selectedPuppy.status === "available" && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />}
                      {selectedPuppy.status === "reserved" && <span className="w-1.5 h-1.5 rounded-full bg-white/80 flex-shrink-0" />}
                      {selectedPuppy.status === "sold" && <X className="w-3 h-3 text-white/70 flex-shrink-0" />}
                      {STATUS_LABELS[selectedPuppy.status]}
                    </span>
                    <span className="text-muted-foreground font-bold">{selectedPuppy.price.toLocaleString("fr-FR")} €</span>
                  </div>
                  {selectedPuppy.status === "reserved" && selectedPuppy.reservedFor && (
                    <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl">
                      <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                      <span className="text-sm text-amber-700 dark:text-amber-400">Réservé pour <strong>{selectedPuppy.reservedFor}</strong></span>
                    </div>
                  )}
                  <h2 className="font-serif text-4xl font-bold mb-2">{selectedPuppy.name}</h2>
                  <p className="text-lg text-muted-foreground mb-6 capitalize">{selectedPuppy.color} · {selectedPuppy.sex} · {selectedPuppy.ageWeeks} semaines</p>
                  <div className="space-y-5 flex-grow">
                    {selectedPuppy.description && (
                      <div>
                        <h4 className="font-bold mb-2 flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> Description</h4>
                        <p className="text-muted-foreground leading-relaxed">{selectedPuppy.description}</p>
                      </div>
                    )}
                    {selectedPuppy.traits.length > 0 && (
                      <div>
                        <h4 className="font-bold mb-2 flex items-center gap-2"><Star className="w-4 h-4 text-primary" /> Caractère</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedPuppy.traits.map((t) => <span key={t} className="px-3 py-1.5 bg-secondary rounded-lg text-sm font-medium">{t}</span>)}
                        </div>
                      </div>
                    )}
                    {selectedPuppy.parents && (
                      <div className="bg-accent/50 rounded-xl p-4 border border-border/50">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Parents</h4>
                        <p className="font-medium text-sm">{selectedPuppy.parents}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {["Pucé & Vacciné", "Vermifugé", "Cert. Santé", "Kit Chiot"].map((item) => (
                        <div key={item} className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />{item}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-secondary/50 rounded-xl">
                      <span>🌍</span>
                      <span>Livraison disponible en <strong>France, Suisse et Belgique</strong></span>
                    </div>
                  </div>
                  <div className="mt-6 pt-5 border-t border-border space-y-3">
                    {selectedPuppy.status === "reserved" && (
                      <div className="flex items-start gap-2.5 p-3.5 bg-amber-500/8 border border-amber-400/30 rounded-xl text-sm text-amber-700 dark:text-amber-400">
                        <span className="text-base flex-shrink-0">ℹ️</span>
                        <span>Ce chiot a un acompte en cours. Une réservation peut tomber — inscrivez-vous sur liste d'attente, nous vous contacterons en priorité si il se libère.</span>
                      </div>
                    )}
                    <Button
                      className="w-full h-13 text-lg rounded-xl shadow-lg hover:-translate-y-1 transition-all"
                      disabled={selectedPuppy.status === "sold"}
                      variant={selectedPuppy.status === "reserved" ? "outline" : "default"}
                      onClick={() => { setReservingPuppy(selectedPuppy); setSelectedPuppy(null); }}
                    >
                      {selectedPuppy.status === "sold"
                        ? "Ce chiot a trouvé son foyer"
                        : selectedPuppy.status === "reserved"
                          ? `📋 Liste d'attente — ${selectedPuppy.name}`
                          : `Réserver ${selectedPuppy.name}`}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {reservingPuppy && <ReservationModal puppy={reservingPuppy} onClose={() => setReservingPuppy(null)} />}

      <Footer />
    </div>
  );
}
