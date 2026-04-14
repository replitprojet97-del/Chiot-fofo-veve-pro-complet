import React, { useState } from "react";
import { Link } from "wouter";
import { Star, Quote, ChevronLeft, ChevronRight, PawPrint as Paw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Review {
  id: number;
  name: string;
  location: string;
  date: string;
  rating: number;
  text: string;
  puppy?: string;
  initials: string;
  color: string;
}

const ALL_REVIEWS: Review[] = [
  { id: 1, name: "Sophie M.", location: "Lyon", date: "Mars 2026", rating: 5, text: "Notre petite Luna est arrivée à la maison il y a 3 semaines et c'est un vrai bonheur. Elle est parfaitement socialisée, très curieuse et déjà à l'aise avec nos enfants. Le suivi de l'éleveur est irréprochable, toujours disponible pour répondre à nos questions.", puppy: "Luna — Bleu Merle", initials: "SM", color: "bg-emerald-500" },
  { id: 2, name: "Thomas & Julie D.", location: "Bordeaux", date: "Fév. 2026", rating: 5, text: "Nous avons adopté Maxou il y a un mois. Un chiot en parfaite santé, avec un caractère exceptionnel. On sentait vraiment l'amour que l'éleveur porte à ses chiens. La visite du domaine était magnifique, les chiens vivent vraiment dans de super conditions.", puppy: "Maxou — Noir Tricolore", initials: "TD", color: "bg-blue-500" },
  { id: 3, name: "Camille R.", location: "Paris", date: "Jan. 2026", rating: 5, text: "Deuxième adoption chez le Berger Bleu, et encore une expérience parfaite. Nala est une femelle rouge merle absolument splendide. Elle est déjà propre, connaît son prénom et adore les câlins. Je recommande à 1000%.", puppy: "Nala — Rouge Merle", initials: "CR", color: "bg-rose-500" },
  { id: 4, name: "Marc L.", location: "Nantes", date: "Déc. 2025", rating: 5, text: "J'avais beaucoup de questions avant d'adopter car c'est mon premier Berger Australien. L'éleveur a pris le temps de tout m'expliquer, les besoins de la race, l'alimentation, le sport... Un accompagnement vraiment personnalisé et professionnel.", initials: "ML", color: "bg-violet-500" },
  { id: 5, name: "Aurélie & Baptiste F.", location: "Strasbourg", date: "Nov. 2025", rating: 5, text: "Rio est avec nous depuis 2 mois et c'est déjà notre meilleur ami. Un chiot exceptionnel, équilibré, curieux et débordant d'énergie. On adore. Merci pour ce beau cadeau de vie !", puppy: "Rio — Bleu Merle", initials: "AF", color: "bg-amber-500" },
  { id: 6, name: "Nathalie P.", location: "Toulouse", date: "Oct. 2025", rating: 5, text: "Le domaine est magnifique, les chiens courent en liberté et on voit immédiatement qu'ils sont heureux. Notre chiot Iris était déjà habituée aux humains, aux enfants et aux autres animaux. Un travail de socialisation remarquable dès le plus jeune âge.", puppy: "Iris — Rouge Tricolore", initials: "NP", color: "bg-teal-500" },
  { id: 7, name: "Julien M.", location: "Rennes", date: "Sept. 2025", rating: 5, text: "Athos est un berger australien absolument parfait. Caractère doux et joueur, en très bonne santé. Le suivi post-adoption est vraiment appréciable, l'éleveur répond toujours rapidement à nos messages.", puppy: "Athos — Bleu Merle", initials: "JM", color: "bg-indigo-500" },
  { id: 8, name: "Léa & François G.", location: "Montpellier", date: "Août 2025", rating: 5, text: "On a attendu 3 mois sur liste d'attente et ça valait tellement la peine ! Elsa est tout simplement magnifique. Tests de santé complets, pedigree, assurance... tout était parfaitement organisé.", puppy: "Elsa — Rouge Merle", initials: "LG", color: "bg-pink-500" },
  { id: 9, name: "Pierre-Antoine V.", location: "Lille", date: "Juil. 2025", rating: 5, text: "Troisième chien de la même éleveuse ! Je ne vais nulle part ailleurs. Chaque expérience est parfaite : des chiots bien dans leur tête, bien dans leur corps. Elle aime vraiment ses animaux et ça se ressent instantanément.", initials: "PV", color: "bg-cyan-500" },
  { id: 10, name: "Émilie D.", location: "Nice", date: "Juin 2025", rating: 5, text: "Jade est une merveille. Elle est arrivée avec son carnet de santé complet, ses vaccins, sa puce et même un petit kit avec sa couverture et ses jouets favoris pour faciliter la transition. Une attention aux détails qui montre le sérieux de cet élevage.", puppy: "Jade — Noir Tricolore", initials: "ED", color: "bg-lime-600" },
  { id: 11, name: "Antoine B.", location: "Grenoble", date: "Mai 2025", rating: 5, text: "Exceptionnellement bien socialisé, Zeus a pris ses marques chez nous en moins d'une semaine. L'éleveur nous a envoyé des photos toutes les semaines jusqu'à ce qu'on puisse le récupérer. Ce genre de suivi, c'est irremplaçable.", puppy: "Zeus — Bleu Merle", initials: "AB", color: "bg-orange-500" },
  { id: 12, name: "Claire & Renaud H.", location: "Marseille", date: "Avr. 2025", rating: 5, text: "Notre petite femelle rouge tricolore est arrivée parfaitement habituée à la laisse, aux bruits de la ville et aux enfants en bas âge. Impressionnant pour un chiot de 8 semaines.", puppy: "Noisette — Rouge Tricolore", initials: "CH", color: "bg-red-500" },
  { id: 13, name: "Hugo L.", location: "Tours", date: "Mars 2025", rating: 5, text: "J'avais des doutes au début car je cherchais via internet, mais l'éleveur a tout de suite mis en confiance. Visite du domaine proposée, transparence sur les tests génétiques, historique des parents... Rien à redire.", initials: "HL", color: "bg-fuchsia-500" },
  { id: 14, name: "Sandrine M.", location: "Dijon", date: "Jan. 2025", rating: 5, text: "Cela fait maintenant 4 mois que Pixel est avec nous et on ne peut plus imaginer notre vie sans lui. Il est intelligent, affectueux, et apprend à une vitesse folle. Tout le mérite revient à sa socialisation précoce.", puppy: "Pixel — Bleu Merle", initials: "SM", color: "bg-sky-500" },
  { id: 15, name: "Nicolas & Pauline T.", location: "Clermont-Ferrand", date: "Nov. 2024", rating: 5, text: "Une expérience au-delà de nos espérances. L'éleveur nous a guidés dans notre choix, expliqué les différences entre les robes, les tailles standard/miniature. On a adopté une petite rouge merle absolument spectaculaire.", puppy: "Cannelle — Rouge Merle", initials: "NT", color: "bg-emerald-600" },
  { id: 16, name: "Delphine R.", location: "Rouen", date: "Sept. 2024", rating: 5, text: "Après beaucoup de recherches sur les élevages en France, c'est celui-ci qui m'a convaincue par son sérieux et sa transparence. Je ne le regrette pas. Tango est en pleine forme, adore le sport et est très câlin.", puppy: "Tango — Noir Tricolore", initials: "DR", color: "bg-violet-600" },
  { id: 17, name: "Bertrand & Hélène C.", location: "Angers", date: "Juil. 2024", rating: 5, text: "Notre famille adore Chipie ! Elle joue avec les enfants (5 et 8 ans), dort dans sa corbeille dès le premier soir et est propre depuis 10 jours. Un vrai miracle selon notre vétérinaire qui a été impressionné par son état de santé général.", puppy: "Chipie — Rouge Tricolore", initials: "BC", color: "bg-rose-600" },
  { id: 18, name: "Alexis F.", location: "Metz", date: "Avr. 2024", rating: 5, text: "Un an déjà avec notre berger bleu merle Storm et il est tout simplement extraordinaire. Toujours en bonne santé, équilibré, super en agility. Ce fut notre meilleur investissement. Merci à l'éleveur pour ce compagnon exceptionnel.", puppy: "Storm — Bleu Merle", initials: "AF", color: "bg-blue-600" },
  { id: 19, name: "Marguerite B.", location: "Genève 🇨🇭", date: "Mars 2026", rating: 5, text: "Depuis la Suisse, j'étais un peu inquiète pour l'organisation. L'éleveur a tout géré : documents d'exportation, vétérinaire frontalier, transport. Arya est arrivée en parfaite forme. Service irréprochable.", puppy: "Arya — Bleu Merle", initials: "MB", color: "bg-teal-600" },
  { id: 20, name: "Frédéric & Sophie N.", location: "Bruxelles 🇧🇪", date: "Fév. 2026", rating: 5, text: "Commande depuis la Belgique — tout était parfaitement organisé ! Passeport européen, vaccinations conformes, transport soigné. Notre Brutus est arrivé serein et heureux. On recommande vivement cet élevage.", puppy: "Brutus — Rouge Tricolore", initials: "FN", color: "bg-amber-600" },
  { id: 21, name: "Isabelle M.", location: "Lausanne 🇨🇭", date: "Déc. 2025", rating: 5, text: "Adoptée depuis Lausanne, tout s'est déroulé à merveille. La qualité du chiot est remarquable. Mon Berger Australien est en pleine santé, bien socialisé, et déjà à l'école de chiens avec de très bons résultats.", puppy: "Coco — Rouge Merle", initials: "IM", color: "bg-indigo-600" },
];

const PER_PAGE = 9;

export default function Avis() {
  const [page, setPage] = useState(0);
  const total = Math.ceil(ALL_REVIEWS.length / PER_PAGE);
  const visible = ALL_REVIEWS.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-20">
        {/* Header */}
        <div className="bg-secondary/30 py-16 text-center">
          <div className="container px-4 mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 mb-6 font-medium text-sm">
              <Star className="w-4 h-4 fill-current" />
              <span>Avis vérifiés — Note moyenne 5/5</span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">Ce que disent nos familles</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Plus de 320 familles nous ont fait confiance en France, Suisse et Belgique. Voici leurs témoignages authentiques.
            </p>

            {/* Rating summary */}
            <div className="flex items-center justify-center gap-8 mt-10">
              <div className="text-center">
                <div className="font-serif text-6xl font-bold">5.0</div>
                <div className="flex gap-1 text-yellow-500 justify-center mt-2">
                  {[...Array(5)].map((_, k) => <Star key={k} className="w-5 h-5 fill-current" />)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">sur {ALL_REVIEWS.length} avis</div>
              </div>
              <div className="hidden sm:block h-16 w-px bg-border" />
              <div className="hidden sm:block space-y-1.5">
                {[5, 4, 3, 2, 1].map((n) => (
                  <div key={n} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-3">{n}</span>
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <div className="w-36 h-2 rounded-full bg-border overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: n === 5 ? "100%" : "0%" }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{n === 5 ? ALL_REVIEWS.length : 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews grid */}
        <section className="py-16">
          <div className="container px-4 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {visible.map((review) => (
                <div key={review.id} className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-full ${review.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {review.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{review.name}</p>
                        <p className="text-xs text-muted-foreground">{review.location} · {review.date}</p>
                      </div>
                    </div>
                    <Quote className="w-6 h-6 text-primary/20 flex-shrink-0" />
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(review.rating)].map((_, k) => <Star key={k} className="w-4 h-4 text-yellow-500 fill-current" />)}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-grow">{review.text}</p>
                  {review.puppy && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                      <Paw className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">{review.puppy}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => { setPage((p) => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                disabled={page === 0}
                className="w-10 h-10 rounded-full border border-border bg-card hover:bg-accent flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-2">
                {Array.from({ length: total }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setPage(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${page === i ? "bg-primary scale-125" : "bg-border hover:bg-primary/40"}`}
                  />
                ))}
              </div>
              <button
                onClick={() => { setPage((p) => Math.min(total - 1, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                disabled={page === total - 1}
                className="w-10 h-10 rounded-full border border-border bg-card hover:bg-accent flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-primary-foreground text-center">
          <div className="container px-4 mx-auto max-w-2xl">
            <h2 className="font-serif text-3xl font-bold mb-4">Rejoignez nos familles heureuses</h2>
            <p className="text-primary-foreground/80 mb-8">Consultez nos chiots disponibles ou contactez-nous pour vous inscrire sur liste d'attente.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chiots">
                <Button size="lg" variant="secondary" className="rounded-full px-8 gap-2">
                  Voir les chiots disponibles <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="rounded-full px-8 border-white/30 text-white hover:bg-white/10">
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
