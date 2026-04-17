import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Star, Shield, Award, Heart, CheckCircle2, Plane, Truck,
  ArrowRight, PawPrint as Paw, Info, Sparkles, X,
  FileText, Cpu, Stethoscope, BookOpen, ClipboardList, ScrollText,
  Mars, Venus, Baby,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePuppies } from "@/hooks/usePuppies";
import { useSEO } from "@/hooks/useSEO";
import { type Puppy } from "@/lib/api";
import ReservationModal from "@/components/ReservationModal";
import ImageGallery from "@/components/ImageGallery";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const STATUS_LABELS: Record<string, string> = { available: "Disponible", reserved: "Réservé", sold: "Vendu" };
const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-500/10 text-green-700 dark:text-green-400",
  reserved: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  sold: "bg-red-500/10 text-red-700 dark:text-red-400",
};

function HomeFeaturedCard({ puppy, onClick }: { puppy: Puppy; onClick: () => void }) {
  const img = puppy.images[0] ?? "/images/puppy-bleu-merle.png";
  return (
    <div
      onClick={onClick}
      className="group bg-card rounded-2xl overflow-hidden border-2 border-amber-400/70 dark:border-amber-500/50 shadow-md hover:shadow-xl hover:border-amber-500 transition-all duration-300 cursor-pointer hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={img}
          alt={puppy.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badge À la Une */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-white text-[11px] font-bold shadow-md">
          <Sparkles className="w-3 h-3" />
          À la Une
        </div>
        {/* Statut */}
        <div className={`absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full text-xs font-bold backdrop-blur-sm ${STATUS_COLORS[puppy.status]}`}>
          {STATUS_LABELS[puppy.status]}
        </div>
        {/* Prix */}
        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-sm font-bold shadow-sm">
          {puppy.price.toLocaleString("fr-FR")} €
        </div>
      </div>

      {/* Infos */}
      <div className="p-3.5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-serif text-lg font-bold group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-tight">
            {puppy.name}
          </h3>
          <div className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold flex-shrink-0 ${puppy.sex === "Mâle" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300"}`}>
            {puppy.sex === "Mâle" ? "M" : "F"}
          </div>
        </div>
        <p className="text-muted-foreground text-xs capitalize mb-2">{puppy.color} · {puppy.sex} · {puppy.ageWeeks} sem.</p>
        {puppy.traits.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {puppy.traits.slice(0, 3).map((t) => (
              <span key={t} className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-700/40 text-[11px] rounded font-medium">{t}</span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-2.5 border-t border-amber-100 dark:border-amber-800/30">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
            LOF · Vacciné
          </div>
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:underline">
            Voir →
          </span>
        </div>
      </div>
    </div>
  );
}

function HomePuppyCard({ puppy, onClick, isFeatured = false }: { puppy: Puppy; onClick: () => void; isFeatured?: boolean }) {
  const img = puppy.images[0] ?? "/images/puppy-bleu-merle.png";
  return (
    <div
      className={`group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer ${isFeatured ? "border-2 border-amber-400/70 dark:border-amber-500/50" : "border border-border/50"}`}
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={img} alt={puppy.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isFeatured && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-white text-[11px] font-bold shadow-md">
              <Sparkles className="w-2.5 h-2.5" />À la Une
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${STATUS_COLORS[puppy.status]}`}>{STATUS_LABELS[puppy.status]}</span>
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
        <div className="flex flex-wrap gap-1.5 mb-5 mt-3">
          {puppy.traits.slice(0, 2).map((t) => <span key={t} className="px-2.5 py-1 bg-secondary text-secondary-foreground text-xs rounded-md font-medium">{t}</span>)}
        </div>
        <Button className={`w-full rounded-xl h-11 font-medium ${isFeatured ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}`}>Voir les détails</Button>
      </div>
    </div>
  );
}

const STATS = [
  { value: "17", label: "Ans d'élevage" },
  { value: "42+", label: "Portées réussies" },
  { value: "160+", label: "Familles heureuses" },
  { value: "100%", label: "Tests de santé" },
];

const HERO_SLIDES = [
  {
    img: "/images/aussie-hero.png",
    alt: "Berger Australien adulte dans la prairie",
  },
  {
    img: "/images/puppy-bleu-merle.png",
    alt: "Chiot Berger Australien Bleu Merle",
  },
  {
    img: "/images/farm-pastoral.png",
    alt: "Notre domaine d'élevage",
  },
];

const TICKER_ITEMS = [
  { icon: "⚖️", text: "Loi du 30 nov. 2021 : tout éleveur réalisant plus d'une portée par an doit être déclaré à la DDPP — notre élevage est en règle et contrôlé." },
  { icon: "📋", text: "Depuis le 1er janv. 2024, la vente d'un chiot est conditionnée à la remise d'un Certificat d'Engagement et de Connaissance (CEC) signé par l'acheteur." },
  { icon: "🏆", text: "Le Berger Australien figure dans le top 10 des races les plus intelligentes au monde selon le Dr Stanley Coren, professeur de psychologie canine." },
  { icon: "🧬", text: "Nos reproducteurs sont systématiquement testés : MDR1, dysplasie des hanches (OFA), APR-prcd et tares oculaires DOMS — résultats disponibles sur demande." },
  { icon: "🌍", text: "Le passeport européen pour animaux de compagnie est obligatoire pour tout transport vers la Suisse ou la Belgique — nous le fournissons avec chaque chiot." },
  { icon: "📦", text: "En France, tout annonceur professionnel doit mentionner son numéro SIREN sur ses annonces en ligne — le nôtre figure sur toutes nos publications." },
  { icon: "🐾", text: "Un chiot bien socialisé entre 3 et 12 semaines devient un adulte équilibré : c'est pourquoi nos chiots grandissent avec nos enfants, nos autres animaux et du bruit quotidien." },
  { icon: "🩺", text: "Chaque chiot quitte notre élevage avec : puce électronique, vaccins à jour, carnet de santé, vermifugations, bilan vétérinaire complet et kit de bienvenue." },
  { icon: "📜", text: "Le LOF (Livre des Origines Français) est tenu par la SCC — nos chiots inscrits ont un pedigree officiel garantissant la traçabilité sur 3 générations minimum." },
];

const DELIVERY_ZONES = [
  { flag: "🇫🇷", country: "France", desc: "Livraison à domicile ou récupération sur notre domaine à Bourges" },
  { flag: "🇨🇭", country: "Suisse", desc: "Livraison sécurisée avec tous les documents vétérinaires requis" },
  { flag: "🇧🇪", country: "Belgique", desc: "Transport organisé par nos soins, en toute sérénité" },
];

function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
        setFading(false);
      }, 800);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {HERO_SLIDES.map((slide, i) => (
        <div
          key={slide.img}
          className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
          style={{ opacity: i === current ? (fading ? 0 : 1) : 0 }}
        >
          <img
            src={slide.img}
            alt={slide.alt}
            className="w-full h-full object-cover"
            style={{ transform: i === current ? "scale(1.04)" : "scale(1)", transition: "transform 6s ease-out" }}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/10 dark:from-background/98 dark:via-background/85" />

      {/* Slide dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? "w-8 bg-primary" : "w-2 bg-white/40 hover:bg-white/60"}`}
          />
        ))}
      </div>
    </div>
  );
}

function InfoTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="bg-primary/5 border-y border-primary/15 py-3 overflow-hidden relative">
      <div className="flex">
        <div
          className="flex gap-0 whitespace-nowrap"
          style={{
            animation: "ticker-scroll 160s linear infinite",
          }}
        >
          {doubled.map((item, i) => (
            <div key={i} className="inline-flex items-center gap-2 px-8 text-sm">
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <span className="text-muted-foreground">{item.text}</span>
              <span className="mx-6 text-primary/30">•</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  useSEO({
    title: "Élevage du Berger Bleu — Chiots Berger Australien LOF | Bleu Merle, Rouge Merle",
    description: "Élevage familial de Bergers Australiens. Chiots LOF bleu merle, rouge merle, noir tricolore. Pedigree officiel, suivi éleveur à vie. Depuis 2009, France.",
    canonical: "https://www.elevagedubergerbleu.fr/",
  });
  const { data: puppies = [] } = usePuppies();
  const [selectedPuppy, setSelectedPuppy] = useState<Puppy | null>(null);
  const [reservingPuppy, setReservingPuppy] = useState<Puppy | null>(null);

  const featuredPuppies = puppies.filter((p) => p.isPremium);
  const featuredOnHome = featuredPuppies.slice(0, 6);
  const regularSlots = Math.max(0, 6 - featuredOnHome.length);
  const regularPuppies = puppies.filter((p) => !p.isPremium && p.status !== "sold").slice(0, regularSlots);
  const hasPuppies = featuredOnHome.length > 0 || regularPuppies.length > 0;

  // Mobile : index courant du carousel (1 carte à la fois)
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    document.body.style.overflow = (selectedPuppy || reservingPuppy) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedPuppy, reservingPuppy]);

  // Auto-avance mobile (1 carte)
  useEffect(() => {
    if (featuredPuppies.length <= 1) return;
    const timer = setInterval(() => {
      setFeaturedIndex((i) => (i + 1) % featuredPuppies.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [featuredPuppies.length]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* WhatsApp flottant */}
      <a
        href="https://wa.me/33757817202?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9(e)%20par%20vos%20chiots."
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110"
        title="WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.422-.272.347-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
        </svg>
      </a>

      {/* Hero avec slideshow */}
      <section className="relative min-h-screen flex items-center">
        <HeroSlideshow />
        <div className="container relative z-10 px-4 py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 font-medium text-sm border border-primary/20 backdrop-blur-sm">
              <Star className="w-4 h-4 fill-current" />
              <span>Élevage familial certifié LOF · 17 ans d'expérience</span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold leading-[1.1] mb-6">
              Des compagnons fidèles,<br />
              élevés avec <span className="text-primary italic">passion</span>.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
              Bergers Australiens élevés en famille dans un environnement naturel.
              Livraisons assurées en <strong className="text-foreground">France, Suisse et Belgique</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/chiots">
                <Button size="lg" className="text-lg px-8 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 gap-2">
                  Voir nos chiots <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 rounded-full border-2 hover:bg-accent backdrop-blur-sm">
                  Nous contacter
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              {[
                { icon: <Shield className="w-5 h-5" />, label: "Santé certifiée" },
                { icon: <Award className="w-5 h-5" />, label: "Pedigree LOF" },
                { icon: <Heart className="w-5 h-5" />, label: "Suivi à vie" },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-3 text-sm font-medium">
                  <div className="w-10 h-10 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center text-primary border border-primary/20">{b.icon}</div>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Barre d'infos défilante */}
      <InfoTicker />

      {/* Stats */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container px-4 mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="font-serif text-4xl md:text-5xl font-bold mb-1">{s.value}</div>
              <div className="text-primary-foreground/70 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Notre histoire ─── */}
      <section className="py-20">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-5 gap-12 items-center">

            {/* Photos empilées */}
            <div className="lg:col-span-2 hidden lg:grid grid-cols-2 gap-3">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden mt-8">
                <img src="/images/parent-bleu-merle.jpg" alt="Alaska, femelle bleu merle" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col gap-3">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img src="/images/parent-noir-tricolore.jpg" alt="Ulysse, mâle noir tricolore" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img src="/images/parent-rouge-merle.jpg" alt="Cassandra, femelle rouge merle" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Texte */}
            <div className="lg:col-span-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 text-sm font-medium border border-primary/20">
                <Heart className="w-4 h-4" /> Qui sommes-nous ?
              </div>
              <h2 className="font-serif text-4xl font-bold mb-6 leading-tight">
                Une famille,<br />une passion, <span className="text-primary">une race.</span>
              </h2>

              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p>
                  Tout a commencé en 2009, presque par hasard. Un regard croisé avec un Berger Australien bleu merle lors d'une promenade, et plus rien n'a été pareil. Nous sommes une famille ordinaire — pas une entreprise, pas un chenil industriel — juste des gens qui sont tombés éperdument amoureux de cette race extraordinaire.
                </p>
                <p>
                  Depuis cette rencontre fondatrice, l'Aussie s'est installé dans chaque recoin de notre quotidien. Aujourd'hui, <strong className="text-foreground">Ulysse</strong>, notre magnifique mâle noir tricolore, partage le canapé avec <strong className="text-foreground">Alaska</strong>, notre douce bleu merle aux yeux vairons, et <strong className="text-foreground">Cassandra</strong>, notre pétillante rouge merle. Ils ne sont pas dans un chenil : ils dorment dans nos chambres, jouent avec nos enfants, et nous accompagnent partout.
                </p>
                <p>
                  C'est précisément parce que nous sommes des particuliers passionnés — et non des professionnels de la production — que chaque chiot reçoit une attention totale. Nous ne faisons que 2 à 3 portées par an. Pas davantage. Chaque chiot compte, chaque placement est réfléchi, chaque famille qui repart avec l'un de nos bébés devient pour nous une histoire qu'on suit avec le cœur.
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/a-propos">
                  <Button variant="outline" className="rounded-full px-6 h-11 gap-2">
                    Notre histoire complète <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/reproducteurs">
                  <Button variant="ghost" className="rounded-full px-6 h-11 gap-2 text-primary hover:text-primary hover:bg-primary/10">
                    <Paw className="w-4 h-4" /> Voir nos reproducteurs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Annonces chiots ─── */}
      {hasPuppies && (
        <section className="py-20 bg-secondary/20">
          <div className="container px-4 mx-auto">

            <div className="flex flex-col md:flex-row justify-between items-end mb-10">
              <div>
                <h2 className="font-serif text-4xl font-bold mb-2">Nos chiots disponibles</h2>
                <p className="text-muted-foreground">Cliquez sur une annonce pour voir le détail et réserver</p>
              </div>
              <Link href="/chiots">
                <Button variant="outline" className="mt-4 md:mt-0 gap-2 rounded-full">
                  Voir toutes les annonces <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* ── MOBILE UNIQUEMENT : carousel auto (1 carte à la fois) ── */}
            {featuredPuppies.length > 0 && (
              <div className="sm:hidden mb-10">
                <div className="rounded-3xl border border-amber-300/50 dark:border-amber-700/40 bg-amber-50/60 dark:bg-amber-950/20 overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-amber-200/60 dark:border-amber-700/30 bg-gradient-to-r from-amber-500/10 to-transparent">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-white text-xs font-bold shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        À la Une
                      </div>
                      <span className="text-xs text-amber-800 dark:text-amber-400 font-medium">
                        {featuredIndex + 1}/{featuredPuppies.length}
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-700/60 italic">Sélectionnées par l'élevage</span>
                  </div>
                  <div className="overflow-hidden">
                    <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${featuredIndex * 100}%)` }}
                    >
                      {featuredPuppies.map((p) => (
                        <div key={p.id} className="w-full flex-shrink-0 p-4">
                          <HomeFeaturedCard puppy={p} onClick={() => setSelectedPuppy(p)} />
                        </div>
                      ))}
                    </div>
                  </div>
                  {featuredPuppies.length > 1 && (
                    <div className="flex justify-center gap-1.5 pb-3">
                      {featuredPuppies.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setFeaturedIndex(i)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${i === featuredIndex ? "w-5 bg-amber-500" : "w-1.5 bg-amber-300 dark:bg-amber-700"}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════
                Grille des annonces
                Mobile  : réguliers seulement (featured = carousel ci-dessus)
                Desktop : featured en premier (bordure ambrée + badge),
                          puis réguliers — une seule grille propre
            ══════════════════════════════════════════════ */}
            {hasPuppies && (
              <div>
                {/* Mobile : réguliers seulement */}
                {regularPuppies.length > 0 && (
                  <div className="grid grid-cols-1 gap-8 sm:hidden">
                    {regularPuppies.map((p) => (
                      <HomePuppyCard key={p.id} puppy={p} onClick={() => setSelectedPuppy(p)} />
                    ))}
                  </div>
                )}
                {/* Desktop : grille unifiée — featured d'abord, puis réguliers */}
                <div className="hidden sm:grid grid-cols-3 gap-8">
                  {[...featuredOnHome, ...regularPuppies].map((p) => (
                    <HomePuppyCard
                      key={p.id}
                      puppy={p}
                      isFeatured={p.isPremium}
                      onClick={() => setSelectedPuppy(p)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Zones de livraison */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 font-medium text-sm">
              <Plane className="w-4 h-4" />
              <span>Livraisons internationales</span>
            </div>
            <h2 className="font-serif text-4xl font-bold mb-4">Nous livrons votre chiot<br />en France, Suisse et Belgique</h2>
            <p className="text-muted-foreground text-lg">Chaque transport est soigneusement organisé pour assurer le confort et la sécurité de votre chiot. Tous les documents vétérinaires et administratifs sont inclus.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {DELIVERY_ZONES.map((z) => (
              <div key={z.country} className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="text-5xl mb-4">{z.flag}</div>
                <h3 className="font-serif text-2xl font-bold mb-3">{z.country}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{z.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 max-w-4xl mx-auto bg-primary/5 rounded-2xl p-6 border border-primary/20 flex flex-col md:flex-row items-center gap-6">
            <Truck className="w-10 h-10 text-primary flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-1">Tous frais de transport inclus dans le prix</h4>
              <p className="text-sm text-muted-foreground">Prise en charge du transport, vétérinaire de départ, passeport européen, assurance voyage. Nous nous occupons de tout pour vous.</p>
            </div>
            <Link href="/contact" className="flex-shrink-0">
              <Button className="rounded-full gap-2 whitespace-nowrap">
                Nous contacter <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pourquoi nous choisir */}
      <section className="py-24 bg-secondary/30">
        <div className="container px-4 mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif text-4xl font-bold mb-6">Pourquoi choisir l'Élevage du Berger Bleu ?</h2>
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                {[
                  { title: "Bien-être animal", desc: "Nos chiots grandissent en liberté sur 5 hectares de prairies." },
                  { title: "Tests génétiques", desc: "MDR1, AOC, APR-prcd, dysplasie — tout est testé." },
                  { title: "Suivi à vie", desc: "Notre équipe répond à toutes vos questions, même des années après." },
                  { title: "Kit complet", desc: "Pucé, vacciné, vermifugé, carnet de santé, kit de bienvenue." },
                ].map((v) => (
                  <div key={v.title} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary mt-1">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">{v.title}</h4>
                      <p className="text-sm text-muted-foreground">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/a-propos">
                  <Button variant="outline" className="rounded-full gap-2">Découvrir notre élevage <ArrowRight className="w-4 h-4" /></Button>
                </Link>
                <Link href="/avis">
                  <Button variant="ghost" className="rounded-full gap-2 text-primary">Lire les avis <Star className="w-4 h-4 fill-current" /></Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-[3rem] transform -rotate-3 scale-105" />
              <img src="/images/farm-pastoral.png" alt="Notre domaine" className="relative rounded-3xl shadow-2xl object-cover aspect-[4/3] w-full" loading="lazy" />
              <div className="absolute -bottom-6 -right-6 bg-card p-5 rounded-2xl shadow-xl border border-border max-w-[220px] hidden md:block">
                <div className="flex gap-1 text-yellow-500 mb-2">
                  {[...Array(5)].map((_, k) => <Star key={k} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm italic font-serif">"Un élevage exceptionnel, des chiens équilibrés."</p>
                <p className="text-xs text-muted-foreground mt-2">— 160+ familles satisfaites</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Reproducteurs & La Race */}
      <section className="py-24 bg-secondary/20">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 font-medium text-sm">
              <Paw className="w-4 h-4" /> Nos parents reproducteurs
            </div>
            <h2 className="font-serif text-4xl font-bold mb-4">Des lignées d'exception</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Tous nos reproducteurs sont LOF confirmés, testés génétiquement et sélectionnés pour leur beauté, leur caractère et leur santé.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { name: "Ulysse", color: "Noir tricolore", sex: "Mâle", photo: "/images/parent-noir-tricolore.jpg", icon: <Mars className="w-4 h-4" />, iconClass: "bg-blue-500 text-white" },
              { name: "Alaska", color: "Bleu merle", sex: "Femelle", photo: "/images/parent-bleu-merle.jpg", icon: <Venus className="w-4 h-4" />, iconClass: "bg-pink-500 text-white" },
              { name: "Cassandra", color: "Rouge merle", sex: "Femelle", photo: "/images/parent-rouge-merle.jpg", icon: <Venus className="w-4 h-4" />, iconClass: "bg-pink-500 text-white" },
            ].map((p) => (
              <Link href="/reproducteurs" key={p.name} className="group block">
                <div className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-52 overflow-hidden">
                    <img src={p.photo} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold shadow ${p.iconClass}`}>
                      {p.icon} {p.sex}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-white font-serif text-xl font-bold">{p.name}</p>
                      <p className="text-white/80 text-xs">{p.color}</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-muted-foreground">LOF · Tests ADN complets</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl p-7 border border-border/50 shadow-sm flex items-start gap-5">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Baby className="w-7 h-7" />
              </div>
              <div>
                <p className="font-semibold text-lg mb-1">2 portées actives</p>
                <p className="text-sm text-muted-foreground mb-3">Chiots issus d'Alaska × Ulysse (bleu merle / noir tricolore) et Cassandra × Ulysse (rouge merle / rouge tricolore).</p>
                <Link href="/reproducteurs">
                  <Button size="sm" className="rounded-full gap-2 h-9">Voir les portées <ArrowRight className="w-3.5 h-3.5" /></Button>
                </Link>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-7 border border-border/50 shadow-sm flex items-start gap-5">
              <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <p className="font-semibold text-lg mb-1">Tout savoir sur le Berger Australien</p>
                <p className="text-sm text-muted-foreground mb-3">Caractère, robes officielles, aptitudes, guide d'achat, coûts annuels… tout ce que vous devez savoir avant d'adopter.</p>
                <Link href="/race">
                  <Button size="sm" variant="outline" className="rounded-full gap-2 h-9">Découvrir la race <ArrowRight className="w-3.5 h-3.5" /></Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Encart réglementaire */}
      <section className="py-16">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="bg-primary/5 rounded-3xl border border-primary/15 p-8 flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold mb-3">Élevage déclaré et conforme à la réglementation française</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Notre élevage est officiellement enregistré auprès de la DDPP (Direction Départementale de la Protection des Populations). Nous sommes soumis à des contrôles réguliers et respectons scrupuleusement la réglementation en vigueur, notamment la loi du 30 novembre 2021 sur la protection animale.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Déclaré DDPP", "LOF certifié", "CEC fourni", "Passeport EU inclus", "Suivi vétérinaire"].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documents fournis après l'adoption */}
      <section className="py-24 bg-secondary/30">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 font-medium text-sm">
              <ScrollText className="w-4 h-4" />
              <span>Transparence & sérieux</span>
            </div>
            <h2 className="font-serif text-4xl font-bold mb-4">
              Documents fournis<br />après l'adoption
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              À la remise de votre chiot, vous recevez un dossier complet. Chaque document est officiel, à jour, et conforme à la réglementation française en vigueur.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: <FileText className="w-6 h-6" />,
                title: "Certificat de cession",
                desc: "Contrat de vente officiel signé par les deux parties, attestant légalement le transfert de propriété de l'animal (Code rural L214-8).",
                tag: "Obligatoire",
              },
              {
                icon: <Cpu className="w-6 h-6" />,
                title: "Attestation I-CAD",
                desc: "Confirmation de l'identification par puce électronique, enregistrée auprès de l'organisme officiel I-CAD. Permet de retrouver votre chien en cas de perte.",
                tag: "Obligatoire",
              },
              {
                icon: <Stethoscope className="w-6 h-6" />,
                title: "Certificat vétérinaire",
                desc: "Délivré par notre vétérinaire avant la cession, il confirme le bon état de santé du chiot, ses vaccinations et ses traitements antiparasitaires.",
                tag: "Obligatoire",
              },
              {
                icon: <BookOpen className="w-6 h-6" />,
                title: "Passeport européen",
                desc: "Document officiel contenant le carnet de santé complet, les rappels vaccinaux effectués, et obligatoire pour tout séjour en Suisse ou en Belgique.",
                tag: "Obligatoire",
              },
              {
                icon: <ClipboardList className="w-6 h-6" />,
                title: "CEC + Guide pratique",
                desc: "L'acheteur signe le Certificat d'Engagement et de Connaissance (loi 2021). Nous remettons aussi un guide personnalisé alimentation, éducation et bien-être.",
                tag: "Loi nov. 2021",
              },
              {
                icon: <Award className="w-6 h-6" />,
                title: "Certificat de naissance LOF",
                desc: "Pour nos chiots de race pure inscrits au Livre des Origines Français, ce document permet d'obtenir le pedigree officiel auprès de la SCC.",
                tag: "Race pure",
              },
            ].map((doc) => (
              <div
                key={doc.title}
                className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    {doc.icon}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/8 text-primary border border-primary/15 whitespace-nowrap">
                    {doc.tag}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg mb-2">{doc.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{doc.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 max-w-5xl mx-auto bg-primary/5 border border-primary/15 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="text-3xl flex-shrink-0">📦</div>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
              <strong className="text-foreground">Tout est prêt le jour J.</strong> Le dossier complet vous est remis lors de la récupération ou accompagne le chiot lors de la livraison. Aucune démarche supplémentaire n'est à votre charge.
            </p>
            <Link href="/contact" className="flex-shrink-0">
              <Button className="rounded-full gap-2 whitespace-nowrap">
                Des questions ? <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24">
        <div className="container px-4 mx-auto text-center max-w-3xl">
          <div className="text-6xl mb-6">🐾</div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">Prêt à accueillir votre Berger Australien ?</h2>
          <p className="text-xl text-muted-foreground mb-10">Consultez nos annonces ou contactez-nous directement. Nous serons ravis d'échanger avec vous sur votre projet.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/chiots">
              <Button size="lg" className="text-lg px-10 h-14 rounded-full gap-2 shadow-lg hover:-translate-y-1 transition-all">
                <Paw className="w-5 h-5" /> Voir les chiots disponibles
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-lg px-10 h-14 rounded-full border-2">
                Poser une question
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

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
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[selectedPuppy.status]}`}>{STATUS_LABELS[selectedPuppy.status]}</span>
                    <span className="text-muted-foreground font-bold">{selectedPuppy.price.toLocaleString("fr-FR")} €</span>
                  </div>
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
                  <div className="mt-6 pt-5 border-t border-border">
                    <Button
                      className="w-full h-13 text-lg rounded-xl shadow-lg hover:-translate-y-1 transition-all"
                      disabled={selectedPuppy.status === "sold"}
                      onClick={() => { setReservingPuppy(selectedPuppy); setSelectedPuppy(null); }}
                    >
                      {selectedPuppy.status === "sold" ? "Ce chiot a trouvé son foyer" : `Réserver ${selectedPuppy.name}`}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {reservingPuppy && <ReservationModal puppy={reservingPuppy} onClose={() => setReservingPuppy(null)} />}
    </div>
  );
}
