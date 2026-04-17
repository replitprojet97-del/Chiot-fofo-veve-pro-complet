import React from "react";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "wouter";
import {
  CheckCircle2, Heart, Shield, Zap, BookOpen, ArrowRight,
  PawPrint as Paw, Star, Clock, Users, Dumbbell, Brain,
  AlertTriangle, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TRAITS = [
  { icon: <Brain className="w-5 h-5" />, label: "Intelligence", value: 95, note: "Top 3 mondial" },
  { icon: <Heart className="w-5 h-5" />, label: "Affection familiale", value: 96, note: "Très attaché" },
  { icon: <Dumbbell className="w-5 h-5" />, label: "Énergie & Sport", value: 94, note: "Sport quotidien" },
  { icon: <Users className="w-5 h-5" />, label: "Sociabilité", value: 88, note: "Excellent" },
  { icon: <Shield className="w-5 h-5" />, label: "Gardiennage", value: 82, note: "Vigilant" },
  { icon: <BookOpen className="w-5 h-5" />, label: "Facilité éducation", value: 96, note: "Très facile" },
];

const COLORS = [
  {
    label: "Bleu Merle",
    desc: "Robe grise marbrée de noir avec des taches de cuivre et de blanc. La robe la plus emblématique de la race, souvent accompagnée d'yeux bleus ou vairons.",
    bg: "bg-slate-300",
    text: "text-slate-800",
  },
  {
    label: "Noir Tricolore",
    desc: "Robe noire profonde avec des marques feu et blanches bien délimitées. Élégance et noblesse. Les yeux sont généralement bruns.",
    bg: "bg-stone-800",
    text: "text-white",
  },
  {
    label: "Rouge Merle",
    desc: "Robe rouge cuivrée marbrée de marron clair, très lumineuse. Souvent accompagnée d'yeux bleus ou ambrés. Une robe soleil.",
    bg: "bg-amber-700",
    text: "text-white",
  },
  {
    label: "Rouge Tricolore",
    desc: "Robe rouge avec des marques blanches et feu. Harmonieuse et chaleureuse. Yeux ambrés ou bruns caractéristiques.",
    bg: "bg-amber-900",
    text: "text-white",
  },
];

const GUIDE_STEPS = [
  {
    step: "01",
    title: "Premier contact",
    desc: "Contactez-nous par téléphone ou WhatsApp. Nous discutons de votre projet de vie, vos attentes, votre logement et votre expérience canine.",
    icon: <Users className="w-6 h-6" />,
  },
  {
    step: "02",
    title: "Visite de l'élevage",
    desc: "Nous vous invitons à visiter l'élevage pour rencontrer les parents et voir les chiots. Cette étape est essentielle pour s'assurer que le courant passe.",
    icon: <Paw className="w-6 h-6" />,
  },
  {
    step: "03",
    title: "Choix du chiot",
    desc: "Ensemble, nous choisissons le chiot qui correspond à votre personnalité et votre projet. Certains chiots sont plus sportifs, d'autres plus calmes.",
    icon: <Heart className="w-6 h-6" />,
  },
  {
    step: "04",
    title: "Réservation",
    desc: "Un acompte de 300 € valide la réservation. Le chiot reste chez nous jusqu'à ses 8 semaines minimum pour une socialisation optimale.",
    icon: <Calendar className="w-6 h-6" />,
  },
  {
    step: "05",
    title: "Remise du chiot",
    desc: "Votre chiot part avec carnet de santé, vaccins, puce, passeport européen, kit de bienvenue et un carnet de conseils personnalisé.",
    icon: <Star className="w-6 h-6" />,
  },
  {
    step: "06",
    title: "Suivi à vie",
    desc: "Notre engagement ne s'arrête pas à la vente. Nous sommes disponibles pour toutes vos questions tout au long de la vie de votre chien.",
    icon: <Clock className="w-6 h-6" />,
  },
];

const FICHE = [
  { label: "Groupe FCI", value: "Groupe 1 — Chiens de berger" },
  { label: "Taille", value: "Mâle : 51–58 cm · Femelle : 46–53 cm" },
  { label: "Poids", value: "Mâle : 25–32 kg · Femelle : 18–25 kg" },
  { label: "Espérance de vie", value: "12 à 15 ans" },
  { label: "Poil", value: "Mi-long, légèrement ondulé ou droit" },
  { label: "Couleurs admises", value: "Bleu merle, Noir, Rouge merle, Rouge" },
  { label: "Origine", value: "États-Unis (malgré son nom)" },
  { label: "Usage initial", value: "Chien de berger, chien de troupeau" },
  { label: "Sports pratiqués", value: "Agility, Frisbee, Obé-Rythmée, Flyball, Troupeau" },
];

export default function Race() {
  useSEO({
    title: "Le Berger Australien — Race, Caractère, Couleurs | Élevage du Berger Bleu",
    description: "Tout sur le Berger Australien : caractère, couleurs de robe, soins, éducation, guide d'achat. La race de chien la plus intelligente du monde selon de nombreux experts.",
    canonical: "https://www.elevagedubergerbleu.fr/race",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* WhatsApp flottant */}
      <a
        href="https://wa.me/33757817202?text=Bonjour%2C%20j%27ai%20des%20questions%20sur%20le%20Berger%20Australien."
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
        <div className="relative bg-secondary/30 py-20 overflow-hidden">
          <div className="container px-4 mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 text-sm font-medium border border-primary/20">
              <Paw className="w-4 h-4" /> Tout savoir sur la race
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-5">Le Berger Australien</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Un chien d'exception alliant intelligence hors du commun, beauté envoûtante et énergie débordante. Découvrez tout ce qu'il faut savoir avant d'adopter un Aussie.
            </p>
          </div>
        </div>

        {/* Fiche signalétique */}
        <section className="py-16">
          <div className="container px-4 mx-auto max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="font-serif text-3xl font-bold mb-6">Fiche de la Race</h2>
                <div className="rounded-2xl border border-border/50 overflow-hidden">
                  {FICHE.map((item, i) => (
                    <div key={item.label} className={`flex items-start justify-between px-5 py-3.5 text-sm ${i % 2 === 0 ? "bg-secondary/30" : ""}`}>
                      <span className="text-muted-foreground font-medium w-44 flex-shrink-0">{item.label}</span>
                      <span className="font-medium text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-serif text-3xl font-bold mb-6">Aptitudes</h2>
                <div className="space-y-4">
                  {TRAITS.map((t) => (
                    <div key={t.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <span className="text-primary">{t.icon}</span>
                          {t.label}
                        </div>
                        <span className="text-xs text-muted-foreground">{t.note}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-700"
                          style={{ width: `${t.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Caractère */}
        <section className="py-16 bg-secondary/20">
          <div className="container px-4 mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl font-bold mb-4">Caractère & Tempérament</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Le Berger Australien n'est pas un chien comme les autres. Il choisit « son » humain et lui reste fidèle pour la vie.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Brain className="w-7 h-7" />,
                  title: "Intelligence Exceptionnelle",
                  desc: "Classé parmi les 3 races les plus intelligentes du monde, l'Aussie comprend un ordre nouveau en moins de 5 répétitions et l'obéit à plus de 95%. Idéal pour l'agility, la protection et tous les sports canins.",
                },
                {
                  icon: <Heart className="w-7 h-7" />,
                  title: "Fidélité Sans Limite",
                  desc: "Chien de « one-man dog » par excellence, le Berger Australien développe un attachement profond à sa famille. Sensible et empathique, il ressent les émotions de ses maîtres avec une acuité remarquable.",
                },
                {
                  icon: <Zap className="w-7 h-7" />,
                  title: "Énergie & Activité",
                  desc: "Race athlétique nécessitant au minimum 2 heures d'exercice quotidien. Idéal pour les familles actives, sportifs, randonneurs. S'épanouit dans les grandes maisons avec jardin.",
                },
              ].map((c) => (
                <div key={c.title} className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">{c.icon}</div>
                  <h3 className="font-semibold text-lg mb-3">{c.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Robes */}
        <section className="py-16">
          <div className="container px-4 mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl font-bold mb-4">Les Robes Officielles</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Le standard FCI reconnaît 4 robes pour le Berger Australien, toutes d'une beauté saisissante.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {COLORS.map((c) => (
                <div key={c.label} className="rounded-2xl overflow-hidden border border-border/50 shadow-sm">
                  <div className={`h-28 ${c.bg} flex items-center justify-center`}>
                    <Paw className={`w-12 h-12 ${c.text} opacity-30`} />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold mb-1">{c.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ce qu'il faut savoir */}
        <section className="py-16 bg-secondary/20">
          <div className="container px-4 mx-auto max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="font-serif text-3xl font-bold mb-6">Points Forts</h2>
                <ul className="space-y-3">
                  {[
                    "Exceptionnel en sports canins : agility, frisbee, flyball",
                    "Très propre et facile à éduquer",
                    "S'entend très bien avec les enfants",
                    "Chien polyvalent : famille, sport, travail",
                    "Peu de problèmes de santé si bien sélectionné",
                    "Adaptatif : ville comme campagne (si exercice suffisant)",
                    "Coat remarquable, très peu d'odeur",
                    "Longévité au-dessus de la moyenne (12-15 ans)",
                  ].map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-serif text-3xl font-bold mb-6">Points de Vigilance</h2>
                <ul className="space-y-3">
                  {[
                    "Besoin d'exercice quotidien important (min. 2h)",
                    "Sensibilité à la mutation MDR1 (médicaments)",
                    "Peut être hyper-attaché (anxiété de séparation)",
                    "Instinct de rassemblement (peut \"regrouper\" enfants)",
                    "Mue abondante 2 fois par an",
                    "Nécessite une stimulation mentale quotidienne",
                    "Pas fait pour rester seul toute la journée",
                    "Chiot très remuant — patience nécessaire",
                  ].map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Guide d'achat */}
        <section className="py-16">
          <div className="container px-4 mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl font-bold mb-4">Comment Acquérir Votre Chiot</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Notre processus d'adoption est conçu pour garantir le bon placement de chaque chiot. Chaque étape est pensée pour vous et pour lui.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {GUIDE_STEPS.map((s) => (
                <div key={s.step} className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-5xl font-black text-primary/5">{s.step}</div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">{s.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prix */}
        <section className="py-16 bg-secondary/20">
          <div className="container px-4 mx-auto max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="font-serif text-4xl font-bold mb-4">Le Tarif d'un Chiot</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Un investissement réfléchi qui s'étale sur 12 à 15 ans de bonheur.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                {
                  label: "Chiot LOF",
                  price: "1 500 – 2 000 €",
                  desc: "Chiot inscriptible au LOOF avec pedigree, issu de reproducteurs testés génétiquement et confirmés.",
                  highlight: true,
                },
                {
                  label: "Annuel moyen",
                  price: "800 – 1 500 €",
                  desc: "Coût annuel d'entretien : alimentation premium, soins vétérinaires, toilettage, accessoires.",
                  highlight: false,
                },
                {
                  label: "Prix suspects",
                  price: "< 500 €",
                  desc: "Méfiance absolue. Un chiot trop bon marché cache souvent des problèmes de santé, de caractère ou de provenance.",
                  highlight: false,
                  warn: true,
                },
              ].map((p) => (
                <div
                  key={p.label}
                  className={`rounded-2xl p-6 border ${p.highlight ? "border-primary/30 bg-primary/5" : p.warn ? "border-red-200/50 bg-red-50/50 dark:bg-red-950/20" : "border-border/50 bg-card"} shadow-sm`}
                >
                  <p className="font-semibold text-sm text-muted-foreground mb-1">{p.label}</p>
                  <p className={`text-2xl font-bold mb-3 ${p.warn ? "text-red-600" : p.highlight ? "text-primary" : ""}`}>{p.price}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container px-4 mx-auto text-center max-w-2xl">
            <h2 className="font-serif text-4xl font-bold mb-4">Convaincu par la race ?</h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Nos chiots sont issus de parents testés et confirmés. Contactez-nous pour connaître les disponibilités.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chiots">
                <Button size="lg" variant="secondary" className="rounded-full px-8 h-13 gap-2">
                  Voir nos chiots <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-13 border-white/30 text-white hover:bg-white/10">
                  Nous contacter
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
