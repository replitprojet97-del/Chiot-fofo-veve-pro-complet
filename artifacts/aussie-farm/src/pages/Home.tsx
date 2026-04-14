import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Star, Shield, Award, Heart, CheckCircle2, Plane, Truck,
  ArrowRight, PawPrint as Paw, Info, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePuppies } from "@/hooks/usePuppies";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const STATS = [
  { value: "19", label: "Ans d'élevage" },
  { value: "48", label: "Portées réussies" },
  { value: "185+", label: "Familles heureuses" },
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

const STATUS_LABELS: Record<string, string> = { available: "Disponible", reserved: "Réservé", sold: "Vendu" };
const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-500/10 text-green-700 dark:text-green-400",
  reserved: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  sold: "bg-red-500/10 text-red-700 dark:text-red-400",
};

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
            animation: "ticker-scroll 80s linear infinite",
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
  const { data: puppies = [] } = usePuppies();
  const featured = puppies.filter((p) => p.isPremium || p.status === "available").slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* WhatsApp flottant */}
      <a
        href="https://wa.me/33612345678?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9(e)%20par%20vos%20chiots."
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
              <span>Élevage familial certifié LOF · 19 ans d'expérience</span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold leading-[1.1] mb-6">
              Des compagnons fidèles,<br />
              élevés avec <span className="text-primary italic">passion</span>.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
              Bergers Australiens Standard et Miniatures, élevés en famille dans un environnement naturel.
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

      {/* Chiots mis en avant */}
      {featured.length > 0 && (
        <section className="py-24 bg-secondary/30">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                <h2 className="font-serif text-4xl font-bold mb-3">Chiots du moment</h2>
                <p className="text-muted-foreground">Découvrez nos dernières annonces disponibles</p>
              </div>
              <Link href="/chiots">
                <Button variant="outline" className="mt-4 md:mt-0 gap-2 rounded-full">
                  Voir tous les chiots <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featured.map((puppy) => (
                <div key={puppy.id} className="group bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={puppy.images[0] ?? "/images/puppy-bleu-merle.png"} alt={puppy.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                    {puppy.isPremium && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-white text-xs font-bold shadow-lg">
                        <Sparkles className="w-3.5 h-3.5" /> À la Une
                      </div>
                    )}
                    <div className={`absolute ${puppy.isPremium ? "top-3 right-3" : "top-3 left-3"}`}>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[puppy.status]}`}>{STATUS_LABELS[puppy.status]}</span>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
                      {puppy.price.toLocaleString("fr-FR")} €
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-2xl font-bold mb-1 group-hover:text-primary transition-colors">{puppy.name}</h3>
                    <p className="text-muted-foreground text-sm capitalize mb-4">{puppy.color} · {puppy.sex} · {puppy.ageWeeks} semaines</p>
                    <Link href="/chiots">
                      <Button className="w-full rounded-xl h-11">Voir les détails</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
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
                <p className="text-xs text-muted-foreground mt-2">— 185+ familles satisfaites</p>
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
                {["Déclaré DDPP", "LOF certifié", "N° SIREN visible", "CEC fourni", "Passeport EU inclus"].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 bg-secondary/30">
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
    </div>
  );
}
