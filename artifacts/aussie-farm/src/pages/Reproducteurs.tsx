import React, { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "wouter";
import {
  CheckCircle2, Heart, Shield, Award, ArrowRight,
  PawPrint as Paw, Star, Baby, Mars, Venus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MALE = {
  name: "Ulysse du Berger Bleu",
  shortName: "Ulysse",
  color: "Noir tricolore",
  sex: "Mâle",
  birthYear: 2020,
  photo: "/images/parent-noir-tricolore.jpg",
  titles: ["LOF confirmé", "Titré Exposition", "Excellent morphologie"],
  tests: ["MDR1 Normal/Normal", "AOC Libre", "APR-prcd Libre", "HSF4 Libre", "Hanches A/A"],
  description:
    "Ulysse est notre reproducteur principal, un Berger Australien noir tricolore d'exception. Doté d'un caractère équilibré et joyeux, il transmet à ses chiots son énergie communicative, son équilibre nerveux et sa beauté caractéristique. Socialisé depuis sa naissance avec des enfants et d'autres animaux, il est la fierté de notre élevage.",
  traits: ["Équilibré", "Joueur", "Sociable", "Endurant"],
};

const FEMELLES = [
  {
    name: "Alaska du Berger Bleu",
    shortName: "Alaska",
    color: "Bleu merle",
    sex: "Femelle",
    birthYear: 2021,
    photo: "/images/parent-bleu-merle.jpg",
    titles: ["LOF confirmée", "Sélectionnée reproduction", "Morphologie Excellent"],
    tests: ["MDR1 Normal/Normal", "AOC Libre", "APR-prcd Libre", "HSF4 Libre", "Hanches A/B"],
    description:
      "Alaska est une superbe Berger Australien bleu merle aux yeux vairons envoûtants. Mère attentionnée et excellente éducatrice de ses chiots, elle leur transmet douceur, intelligence et un instinct naturel extraordinaire. Ses portées sont réputées pour la qualité exceptionnelle des robes et l'équilibre du caractère.",
    traits: ["Douce", "Intelligente", "Maternelle", "Athlétique"],
    litter: 1,
  },
  {
    name: "Cassandra du Berger Bleu",
    shortName: "Cassandra",
    color: "Rouge merle",
    sex: "Femelle",
    birthYear: 2022,
    photo: "/images/parent-rouge-merle.jpg",
    titles: ["LOF confirmée", "Sélectionnée reproduction"],
    tests: ["MDR1 Normal/Normal", "AOC Libre", "APR-prcd Libre", "HSF4 Libre", "Hanches A/A"],
    description:
      "Cassandra est notre jeune reproductrice rouge merle, issue d'une lignée internationale primée. Vive, curieuse et débordante d'affection, elle donne naissance à des chiots aux robes soleil aux caractères remarquables. Son instinct maternel exceptionnel garantit une socialisation optimale de ses petits dès les premiers jours.",
    traits: ["Vive", "Affectueuse", "Curieuse", "Dynamique"],
    litter: 2,
  },
];

const PORTEES = [
  {
    id: 1,
    label: "Portée 1",
    mere: "Alaska",
    pere: "Ulysse",
    mereCouleur: "Bleu merle",
    pereCouleur: "Noir tricolore",
    colors: ["Bleu merle", "Noir tricolore", "Rouge merle"],
    nbreChiots: 6,
    nbreDisponibles: 4,
    description: "Croisement Alaska × Ulysse — chiots aux robes bleu merle & noir tricolore d'exception. Tous testés génétiquement sains.",
    badge: "Disponibles",
    badgeColor: "bg-green-500/10 text-green-700 border-green-200",
  },
  {
    id: 2,
    label: "Portée 2",
    mere: "Cassandra",
    pere: "Ulysse",
    mereCouleur: "Rouge merle",
    pereCouleur: "Noir tricolore",
    colors: ["Rouge merle", "Rouge tricolore"],
    nbreChiots: 5,
    nbreDisponibles: 3,
    description: "Croisement Cassandra × Ulysse — chiots soleil aux robes rouge merle & rouge tricolore. Caractère équilibré garanti.",
    badge: "Disponibles",
    badgeColor: "bg-green-500/10 text-green-700 border-green-200",
  },
];

function ParentCard({ parent, reverse = false }: { parent: typeof MALE | (typeof FEMELLES)[0]; reverse?: boolean }) {
  const [imgError, setImgError] = useState(false);
  const isMale = parent.sex === "Mâle";
  return (
    <div className={`grid lg:grid-cols-2 gap-12 items-center ${reverse ? "lg:direction-rtl" : ""}`}>
      <div className={reverse ? "lg:order-2" : ""}>
        <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
          {!imgError ? (
            <img
              src={parent.photo}
              alt={parent.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <Paw className="w-20 h-20 text-muted-foreground/20" />
            </div>
          )}
          <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold shadow ${isMale ? "bg-blue-500 text-white" : "bg-pink-500 text-white"}`}>
            {isMale ? <Mars className="w-4 h-4" /> : <Venus className="w-4 h-4" />}
            {isMale ? "Mâle" : "Femelle"}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <p className="text-white font-serif text-2xl font-bold">{parent.shortName}</p>
            <p className="text-white/80 text-sm capitalize">{parent.color} · Né{isMale ? "" : "e"} en {parent.birthYear}</p>
          </div>
        </div>
      </div>

      <div className={reverse ? "lg:order-1" : ""}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground mb-5 text-sm font-medium">
          <Paw className="w-4 h-4 text-primary" /> {parent.sex} reproducteur{isMale ? "" : "rice"}
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">{parent.name}</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">{parent.description}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {parent.traits.map((t) => (
            <span key={t} className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full border border-primary/20">{t}</span>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Award className="w-5 h-5" />
              <span className="font-semibold text-sm">Titres & Confirmations</span>
            </div>
            <ul className="space-y-2">
              {parent.titles.map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Shield className="w-5 h-5" />
              <span className="font-semibold text-sm">Tests génétiques</span>
            </div>
            <ul className="space-y-2">
              {parent.tests.map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Reproducteurs() {
  useSEO({
    title: "Nos Reproducteurs — Mâles & Femelles LOF | Élevage du Berger Bleu",
    description: "Découvrez nos reproducteurs Berger Australien : Ulysse (noir tricolore), Alaska (bleu merle) et Cassandra (rouge merle). Tous testés génétiquement, LOF confirmés. Deux portées disponibles.",
    canonical: "https://www.elevagedubergerbleu.com/reproducteurs",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* WhatsApp flottant */}
      <a
        href="https://wa.me/33757817202?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9(e)%20par%20vos%20reproducteurs%20et%20vos%20chiots."
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110"
        title="WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.422-.272.347-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
        </svg>
      </a>

      <div className="pt-20">
        {/* Hero */}
        <div className="bg-secondary/30 py-16">
          <div className="container px-4 mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 text-sm font-medium border border-primary/20">
              <Heart className="w-4 h-4" /> Sélection & Passion
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">Nos Reproducteurs</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des chiens d'exception sélectionnés pour leur beauté, leur caractère et leur santé certifiée.<br />
              <span className="font-medium">Tous LOF · Testés génétiquement · Confirmés</span>
            </p>
          </div>
        </div>

        {/* Engagements */}
        <section className="py-10 border-b border-border/50">
          <div className="container px-4 mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { icon: <Shield className="w-6 h-6" />, label: "100% testés", sub: "Génétiquement sains" },
                { icon: <Award className="w-6 h-6" />, label: "LOF confirmés", sub: "Pedigree officiel" },
                { icon: <Heart className="w-6 h-6" />, label: "Élevés en famille", sub: "Socialisés dès la naissance" },
                { icon: <Baby className="w-6 h-6" />, label: "2 portées actives", sub: "Chiots disponibles" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2 p-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{item.icon}</div>
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Notre mâle */}
        <section className="py-20">
          <div className="container px-4 mx-auto max-w-6xl">
            <div className="flex items-center gap-4 mb-14">
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold text-lg border border-blue-200/50 dark:border-blue-700/40">
                <Mars className="w-5 h-5" /> Notre Mâle
              </div>
              <div className="flex-1 h-px bg-border" />
            </div>
            <ParentCard parent={MALE} />
          </div>
        </section>

        {/* Nos femelles */}
        <section className="py-20 bg-secondary/20">
          <div className="container px-4 mx-auto max-w-6xl">
            <div className="flex items-center gap-4 mb-14">
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-pink-500/10 text-pink-700 dark:text-pink-300 font-bold text-lg border border-pink-200/50 dark:border-pink-700/40">
                <Venus className="w-5 h-5" /> Nos Femelles
              </div>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-24">
              {FEMELLES.map((f, i) => (
                <ParentCard key={f.name} parent={f} reverse={i % 2 !== 0} />
              ))}
            </div>
          </div>
        </section>

        {/* Nos portées */}
        <section className="py-20">
          <div className="container px-4 mx-auto max-w-6xl">
            <div className="text-center mb-14">
              <h2 className="font-serif text-4xl font-bold mb-4">Nos Portées en Cours</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Deux portées actives issues de nos reproducteurs. Chiots élevés à la maison, socialisés avec enfants et animaux.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {PORTEES.map((p) => (
                <div key={p.id} className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="p-7">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Baby className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-serif text-xl font-bold">{p.label}</p>
                          <p className="text-xs text-muted-foreground">{p.mere} × {p.pere}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${p.badgeColor}`}>{p.badge}</span>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed mb-5">{p.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="bg-secondary/50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-foreground">{p.nbreChiots}</p>
                        <p className="text-xs text-muted-foreground">chiots total</p>
                      </div>
                      <div className="bg-green-500/10 rounded-xl p-3 text-center border border-green-200/40">
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">{p.nbreDisponibles}</p>
                        <p className="text-xs text-muted-foreground">encore disponibles</p>
                      </div>
                    </div>

                    <div className="mb-5">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Robes présentes</p>
                      <div className="flex flex-wrap gap-2">
                        {p.colors.map((c) => (
                          <span key={c} className="px-2.5 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-lg capitalize border border-border/50">{c}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href="/chiots" className="flex-1">
                        <Button className="w-full rounded-xl h-11 gap-2">
                          Voir les chiots <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                      <a
                        href="https://wa.me/33757817202?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9(e)%20par%20la%20port%C3%A9e%20de%20vos%20chiots."
                        target="_blank" rel="noopener noreferrer"
                      >
                        <Button variant="outline" className="rounded-xl h-11 px-4 border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10">
                          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.422-.272.347-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                          </svg>
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container px-4 mx-auto text-center max-w-2xl">
            <h2 className="font-serif text-4xl font-bold mb-4">Vous avez des questions ?</h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Nos reproducteurs peuvent être visités sur rendez-vous. Venez rencontrer Alaska, Cassandra et Ulysse en personne.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" variant="secondary" className="rounded-full px-8 h-13 gap-2">
                  Prendre rendez-vous <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/chiots">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-13 border-white/30 text-white hover:bg-white/10">
                  Voir tous les chiots
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
