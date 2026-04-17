import React from "react";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "wouter";
import { CheckCircle2, Heart, Shield, Award, Star, ArrowRight, PawPrint as Paw, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const VALUES = [
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Passion & Éthique",
    desc: "Chaque chiot est traité comme un membre de la famille. Nous ne voyons pas nos chiens comme des produits mais comme des êtres vivants à qui nous devons le meilleur départ dans la vie.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Santé Avant Tout",
    desc: "Tous nos reproducteurs sont testés génétiquement (MDR1, AOC, APR-prcd, HSF4) et passent une radio de dépistage de la dysplasie. Nous ne produisons que des chiots génétiquement sains.",
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Excellence des Lignées",
    desc: "Nous travaillons avec des lignées reconnues internationalement, sélectionnées pour la beauté, le caractère et les aptitudes sportives du Berger Australien.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Accompagnement Personnalisé",
    desc: "Nous ne disparaissons pas le jour de la vente. Chaque famille bénéficie d'un suivi à vie : conseils alimentation, santé, éducation, sport — nous sommes là.",
  },
];

const HEALTH_TESTS = [
  "Test MDR1 (sensibilité aux médicaments)",
  "Test AOC (anomalie de l'œil du Colley)",
  "Test APR-prcd (atrophie progressive de la rétine)",
  "Test HSF4 (cataracte héréditaire)",
  "Radio de dépistage dysplasie hanches & coudes",
  "Examen ophtalmologique annuel",
  "Bilan cardiologique",
];

const WHATS_INCLUDED = [
  "Puce électronique + enregistrement au LOOF",
  "Vaccinations à jour (CHPPiL)",
  "Vermifugations régulières",
  "Certificat vétérinaire de bonne santé",
  "Carnet de santé complet",
  "Passeport européen (pour Suisse et Belgique)",
  "Kit de bienvenue (couverture, jouets, alimentation de démarrage)",
  "Notice de soins et d'éducation personnalisée",
  "Suivi éleveur disponible à vie",
];

export default function APropos() {
  useSEO({
    title: "À Propos de Notre Élevage — Berger Australien Passion | Élevage du Berger Bleu",
    description: "Élevage familial passionné de Bergers Australiens depuis 2009. Découvrez notre histoire, nos valeurs, notre engagement envers le bien-être animal et nos certifications officielles.",
    canonical: "https://www.elevagedubergerbleu.fr/a-propos",
  });
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <div className="pt-20">
        <div className="relative h-72 md:h-96 overflow-hidden">
          <img src="/images/farm-pastoral.png" alt="Notre domaine" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 container px-4 pb-10">
            <h1 className="font-serif text-4xl md:text-6xl font-bold">Notre Élevage</h1>
            <p className="text-muted-foreground mt-2 text-lg">17 ans de passion au cœur de la France</p>
          </div>
        </div>
      </div>

      {/* Notre histoire */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground mb-6 text-sm font-medium">
                <Paw className="w-4 h-4 text-primary" /> Notre histoire
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">Nés d'une passion pour le Berger Australien</h2>
              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p>L'Élevage du Berger Bleu est né en 2009 d'une rencontre inattendue avec un magnifique Berger Australien bleu merle. Depuis ce jour, notre famille a organisé toute sa vie autour de cette race exceptionnelle.</p>
                <p>Notre domaine de 5 hectares en Champagne-Berrichonne offre à nos chiens un environnement idéal : prairies, forêts, ruisseaux. Ils vivent avec nous, dorment à la maison et participent à toutes nos activités.</p>
                <p>Chaque portée est le fruit d'une réflexion longue et sérieuse : choix des reproducteurs, timing, préparation de la mère... Nous n'avons que 2 à 3 portées par an pour garantir une socialisation parfaite de chaque chiot.</p>
              </div>
              <div className="flex items-center gap-3 mt-8 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Domaine des Trois Chênes</p>
                  <p className="text-xs text-muted-foreground">18000 Bourges, Centre-Val de Loire · Visites sur rendez-vous</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                <img src="/images/farm-pastoral.png" alt="Domaine" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col gap-4 mt-8">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img src="/images/puppy-bleu-merle.png" alt="Chiot bleu merle" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img src="/images/puppy-rouge-merle.png" alt="Chiot rouge merle" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos valeurs */}
      <section className="py-20 bg-secondary/30">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-serif text-4xl font-bold mb-4">Nos Valeurs</h2>
            <p className="text-muted-foreground text-lg">Ce qui nous guide au quotidien dans notre travail d'éleveur passionné.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">{v.icon}</div>
                <h3 className="font-semibold text-lg mb-3">{v.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tests de santé */}
      <section className="py-20">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-serif text-3xl font-bold mb-6">Tests de Santé</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">Tous nos reproducteurs sont soumis à un protocole de santé rigoureux. Nous n'acceptons aucun compromis sur la santé de nos chiens.</p>
              <ul className="space-y-3">
                {HEALTH_TESTS.map((test) => (
                  <li key={test} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{test}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-serif text-3xl font-bold mb-6">Ce qui est inclus</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">Chaque chiot part de chez nous avec tout ce dont il a besoin pour bien commencer sa nouvelle vie.</p>
              <ul className="space-y-3">
                {WHATS_INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 mx-auto text-center max-w-2xl">
          <h2 className="font-serif text-4xl font-bold mb-4">Venez nous rendre visite</h2>
          <p className="text-primary-foreground/80 text-lg mb-8">Nous organisons des visites sur rendez-vous pour vous présenter notre élevage, nos reproducteurs et la portée en cours.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="rounded-full px-8 h-13 gap-2">
                Prendre rendez-vous <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/chiots">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-13 border-white/30 text-white hover:bg-white/10">
                Voir nos chiots
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
