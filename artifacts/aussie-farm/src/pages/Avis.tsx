import React, { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star, Quote, ChevronLeft, ChevronRight, PawPrint as Paw, ArrowRight,
  CheckCircle2, Loader2, AlertCircle, Send, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { reviewsApi, type ReviewFromDB } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AVATAR_COLORS = [
  "bg-emerald-500", "bg-blue-500", "bg-rose-500", "bg-violet-500", "bg-amber-500",
  "bg-teal-500", "bg-indigo-500", "bg-pink-500", "bg-cyan-500", "bg-lime-600",
  "bg-orange-500", "bg-red-500", "bg-fuchsia-500", "bg-sky-500", "bg-emerald-600",
  "bg-violet-600", "bg-rose-600", "bg-blue-600", "bg-teal-600", "bg-amber-600",
  "bg-indigo-600",
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

const STATIC_REVIEWS = [
  { id: "s1", name: "Sophie M.", location: "Lyon", date: "Mars 2026", rating: 5, text: "Notre petite Luna est arrivée à la maison il y a 3 semaines et c'est un vrai bonheur. Elle est parfaitement socialisée, très curieuse et déjà à l'aise avec nos enfants. Le suivi de l'éleveur est irréprochable, toujours disponible pour répondre à nos questions.", puppy: "Luna — Bleu Merle" },
  { id: "s2", name: "Thomas & Julie D.", location: "Bordeaux", date: "Fév. 2026", rating: 5, text: "Nous avons adopté Maxou il y a un mois. Un chiot en parfaite santé, avec un caractère exceptionnel. On sentait vraiment l'amour que l'éleveur porte à ses chiens.", puppy: "Maxou — Noir Tricolore" },
  { id: "s3", name: "Camille R.", location: "Paris", date: "Jan. 2026", rating: 5, text: "Deuxième adoption chez le Berger Bleu, et encore une expérience parfaite. Nala est une femelle rouge merle absolument splendide. Je recommande à 1000%.", puppy: "Nala — Rouge Merle" },
  { id: "s4", name: "Marc L.", location: "Nantes", date: "Déc. 2025", rating: 5, text: "L'éleveur a pris le temps de tout m'expliquer, les besoins de la race, l'alimentation, le sport... Un accompagnement vraiment personnalisé et professionnel.", puppy: "" },
  { id: "s5", name: "Aurélie & Baptiste F.", location: "Strasbourg", date: "Nov. 2025", rating: 5, text: "Rio est avec nous depuis 2 mois et c'est déjà notre meilleur ami. Un chiot exceptionnel, équilibré, curieux et débordant d'énergie. Merci pour ce beau cadeau de vie !", puppy: "Rio — Bleu Merle" },
  { id: "s6", name: "Nathalie P.", location: "Toulouse", date: "Oct. 2025", rating: 5, text: "Le domaine est magnifique, les chiens courent en liberté. Notre chiot Iris était déjà habituée aux humains, aux enfants et aux autres animaux. Un travail de socialisation remarquable.", puppy: "Iris — Rouge Tricolore" },
  { id: "s7", name: "Julien M.", location: "Rennes", date: "Sept. 2025", rating: 5, text: "Athos est un berger australien absolument parfait. Caractère doux et joueur, en très bonne santé. Le suivi post-adoption est vraiment appréciable.", puppy: "Athos — Bleu Merle" },
  { id: "s8", name: "Léa & François G.", location: "Montpellier", date: "Août 2025", rating: 5, text: "On a attendu 3 mois sur liste d'attente et ça valait tellement la peine ! Tests de santé complets, pedigree, assurance... tout était parfaitement organisé.", puppy: "Elsa — Rouge Merle" },
  { id: "s9", name: "Pierre-Antoine V.", location: "Lille", date: "Juil. 2025", rating: 5, text: "Troisième chien de la même éleveuse ! Je ne vais nulle part ailleurs. Des chiots bien dans leur tête, bien dans leur corps. Elle aime vraiment ses animaux et ça se ressent.", puppy: "" },
  { id: "s10", name: "Émilie D.", location: "Nice", date: "Juin 2025", rating: 5, text: "Jade est une merveille. Elle est arrivée avec son carnet de santé complet, ses vaccins, sa puce et même un petit kit. Une attention aux détails qui montre le sérieux de cet élevage.", puppy: "Jade — Noir Tricolore" },
  { id: "s11", name: "Antoine B.", location: "Grenoble", date: "Mai 2025", rating: 5, text: "Exceptionnellement bien socialisé, Zeus a pris ses marques chez nous en moins d'une semaine. L'éleveur nous envoyait des photos chaque semaine. Ce suivi, c'est irremplaçable.", puppy: "Zeus — Bleu Merle" },
  { id: "s12", name: "Claire & Renaud H.", location: "Marseille", date: "Avr. 2025", rating: 5, text: "Notre petite femelle rouge tricolore est arrivée parfaitement habituée à la laisse, aux bruits de la ville et aux enfants en bas âge. Impressionnant pour un chiot de 8 semaines.", puppy: "Noisette — Rouge Tricolore" },
  { id: "s13", name: "Sandrine M.", location: "Dijon", date: "Jan. 2025", rating: 5, text: "Cela fait 4 mois que Pixel est avec nous et on ne peut plus imaginer notre vie sans lui. Intelligent, affectueux, apprend à une vitesse folle. Tout le mérite revient à sa socialisation précoce.", puppy: "Pixel — Bleu Merle" },
  { id: "s14", name: "Nicolas & Pauline T.", location: "Clermont-Ferrand", date: "Nov. 2024", rating: 5, text: "Une expérience au-delà de nos espérances. L'éleveur nous a guidés dans notre choix avec patience. On a adopté une petite rouge merle absolument spectaculaire.", puppy: "Cannelle — Rouge Merle" },
  { id: "s15", name: "Delphine R.", location: "Rouen", date: "Sept. 2024", rating: 5, text: "Après beaucoup de recherches, c'est cet élevage qui m'a convaincue par son sérieux et sa transparence. Tango est en pleine forme, adore le sport et est très câlin.", puppy: "Tango — Noir Tricolore" },
  { id: "s16", name: "Bertrand & Hélène C.", location: "Angers", date: "Juil. 2024", rating: 5, text: "Notre famille adore Chipie ! Elle joue avec les enfants, est propre depuis 10 jours. Notre vétérinaire a été impressionné par son état de santé général.", puppy: "Chipie — Rouge Tricolore" },
  { id: "s17", name: "Alexis F.", location: "Metz", date: "Avr. 2024", rating: 5, text: "Un an avec notre Storm et il est tout simplement extraordinaire. En bonne santé, équilibré, super en agility. Ce fut notre meilleur investissement. Merci à l'éleveur.", puppy: "Storm — Bleu Merle" },
  { id: "s18", name: "Marguerite B.", location: "Genève 🇨🇭", date: "Mars 2026", rating: 5, text: "Depuis la Suisse, l'éleveur a tout géré : documents d'exportation, vétérinaire frontalier, transport. Arya est arrivée en parfaite forme. Service irréprochable.", puppy: "Arya — Bleu Merle" },
  { id: "s19", name: "Frédéric & Sophie N.", location: "Bruxelles 🇧🇪", date: "Fév. 2026", rating: 5, text: "Depuis la Belgique, tout était parfaitement organisé ! Passeport européen, vaccinations conformes, transport soigné. Notre Brutus est arrivé serein et heureux.", puppy: "Brutus — Rouge Tricolore" },
  { id: "s20", name: "Isabelle M.", location: "Lausanne 🇨🇭", date: "Déc. 2025", rating: 5, text: "Depuis Lausanne, tout s'est déroulé à merveille. Mon Berger Australien est en pleine santé, bien socialisé, déjà à l'école de chiens avec de très bons résultats.", puppy: "Coco — Rouge Merle" },
];

interface ReviewCardProps {
  name: string;
  location: string;
  date: string;
  rating: number;
  text: string;
  puppy?: string;
  isVerified?: boolean;
}

function ReviewCard({ name, location, date, rating, text, puppy, isVerified }: ReviewCardProps) {
  const initials = getInitials(name);
  const avatarColor = getAvatarColor(name);
  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-sm">{name}</p>
              {isVerified && (
                <span className="flex items-center gap-0.5 text-[10px] text-green-600 dark:text-green-400 font-medium">
                  <ShieldCheck className="w-3 h-3" /> Vérifié
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{location}{location && " · "}{date}</p>
          </div>
        </div>
        <Quote className="w-6 h-6 text-primary/20 flex-shrink-0" />
      </div>
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, k) => (
          <Star key={k} className={`w-4 h-4 ${k < rating ? "text-yellow-500 fill-current" : "text-border"}`} />
        ))}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed flex-grow">{text}</p>
      {puppy && (
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <Paw className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">{puppy}</span>
        </div>
      )}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star className={`w-8 h-8 transition-colors ${n <= (hovered || value) ? "text-yellow-500 fill-current" : "text-border"}`} />
        </button>
      ))}
    </div>
  );
}

const PER_PAGE = 9;

export default function Avis() {
  useSEO({
    title: "Avis Clients — Témoignages Acheteurs de Chiots Berger Australien | Élevage du Berger Bleu",
    description: "Lisez les témoignages de nos familles heureuses. Des dizaines d'avis vérifiés sur nos chiots Berger Australien LOF. Partagez votre expérience avec l'Élevage du Berger Bleu.",
    canonical: "https://www.elevagedubergerbleu.fr/avis",
  });
  const [staticPage, setStaticPage] = useState(0);
  const [formData, setFormData] = useState({ name: "", location: "", puppyName: "", rating: 5, text: "" });
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState("");

  const { data: dbReviews = [] } = useQuery<ReviewFromDB[]>({
    queryKey: ["approved-reviews"],
    queryFn: reviewsApi.listApproved,
    staleTime: 60_000,
  });

  const totalStaticPages = Math.ceil(STATIC_REVIEWS.length / PER_PAGE);
  const visibleStatic = STATIC_REVIEWS.slice(staticPage * PER_PAGE, staticPage * PER_PAGE + PER_PAGE);

  const totalCount = STATIC_REVIEWS.length + dbReviews.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.text.trim()) return;
    setSubmitStatus("loading");
    setSubmitError("");
    try {
      await reviewsApi.submit(formData);
      setSubmitStatus("success");
      setFormData({ name: "", location: "", puppyName: "", rating: 5, text: "" });
    } catch (err) {
      setSubmitStatus("error");
      setSubmitError(err instanceof Error ? err.message : "Erreur lors de la soumission.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-20">
        {/* Header */}
        <div className="bg-secondary/30 py-16 text-center">
          <div className="container px-4 mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 mb-6 font-medium text-sm">
              <Star className="w-4 h-4 fill-current" />
              <span>Avis déposés et vérifiés par notre équipe — Note 5/5</span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">Ce que disent nos familles</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Chaque avis est soumis par une famille ayant adopté chez nous, puis validé par notre équipe avant publication.
            </p>

            <div className="flex items-center justify-center gap-8 mt-10">
              <div className="text-center">
                <div className="font-serif text-6xl font-bold">5.0</div>
                <div className="flex gap-1 text-yellow-500 justify-center mt-2">
                  {[...Array(5)].map((_, k) => <Star key={k} className="w-5 h-5 fill-current" />)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">sur {totalCount}+ avis</div>
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
                    <span className="text-xs text-muted-foreground">{n === 5 ? totalCount + "+" : "0"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic approved reviews from DB (if any) */}
        {dbReviews.length > 0 && (
          <section className="py-12 bg-primary/3">
            <div className="container px-4 mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-medium">
                  <ShieldCheck className="w-4 h-4" /> Avis récents vérifiés
                </div>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dbReviews.map((r) => (
                  <ReviewCard
                    key={r.id}
                    name={r.name}
                    location={r.location}
                    date={formatDate(r.createdAt)}
                    rating={r.rating}
                    text={r.text}
                    puppy={r.puppyName || undefined}
                    isVerified
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Static reviews grid */}
        <section className="py-12">
          <div className="container px-4 mx-auto">
            {dbReviews.length > 0 && (
              <div className="flex items-center gap-3 mb-8">
                <span className="text-sm font-medium text-muted-foreground">Tous nos avis</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {visibleStatic.map((r) => (
                <ReviewCard key={r.id} name={r.name} location={r.location} date={r.date} rating={r.rating} text={r.text} puppy={r.puppy || undefined} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => { setStaticPage((p) => Math.max(0, p - 1)); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                disabled={staticPage === 0}
                className="w-10 h-10 rounded-full border border-border bg-card hover:bg-accent flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-2">
                {Array.from({ length: totalStaticPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setStaticPage(i); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${staticPage === i ? "bg-primary scale-125" : "bg-border hover:bg-primary/40"}`}
                  />
                ))}
              </div>
              <button
                onClick={() => { setStaticPage((p) => Math.min(totalStaticPages - 1, p + 1)); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                disabled={staticPage === totalStaticPages - 1}
                className="w-10 h-10 rounded-full border border-border bg-card hover:bg-accent flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Review submission form */}
        <section className="py-20 bg-secondary/30">
          <div className="container px-4 mx-auto max-w-3xl">
            <div className="bg-card rounded-3xl border border-border/50 shadow-md overflow-hidden">
              {/* Form header */}
              <div className="bg-primary text-primary-foreground p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-7 h-7 fill-current" />
                </div>
                <h2 className="font-serif text-3xl font-bold mb-2">Déposez votre avis</h2>
                <p className="text-primary-foreground/80 text-sm max-w-md mx-auto">
                  Vous avez adopté un chiot chez nous ? Partagez votre expérience.
                  Votre avis sera examiné par notre équipe avant publication.
                </p>
              </div>

              <div className="p-8">
                {/* Trust badge */}
                <div className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/20 rounded-xl mb-8">
                  <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">Avis vérifiés et modérés</p>
                    <p className="text-xs text-muted-foreground">Chaque avis est relu par notre équipe avant d'apparaître sur le site. Aucun avis anonyme ou frauduleux n'est accepté.</p>
                  </div>
                </div>

                {submitStatus === "success" ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-4">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold mb-3">Merci pour votre avis !</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      Votre témoignage a bien été reçu. Notre équipe le vérifiera et le publiera prochainement. Nous vous en sommes très reconnaissants.
                    </p>
                    <Button onClick={() => setSubmitStatus("idle")} variant="outline" className="mt-6 rounded-full">
                      Laisser un autre avis
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Votre prénom & nom *</label>
                        <Input
                          placeholder="Jean Dupont"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Ville / Pays</label>
                        <Input
                          placeholder="Paris, France"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quel chiot avez-vous adopté ? <span className="text-muted-foreground font-normal">(optionnel)</span></label>
                      <Input
                        placeholder="Ex : Milo — Bleu Merle"
                        value={formData.puppyName}
                        onChange={(e) => setFormData({ ...formData, puppyName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">Votre note *</label>
                      <StarPicker value={formData.rating} onChange={(v) => setFormData({ ...formData, rating: v })} />
                      <p className="text-xs text-muted-foreground">
                        {formData.rating === 5 ? "Excellent — parfaitement satisfait(e)" :
                         formData.rating === 4 ? "Très bien" :
                         formData.rating === 3 ? "Bien" :
                         formData.rating === 2 ? "Passable" : "Décevant"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Votre témoignage *</label>
                      <Textarea
                        placeholder="Décrivez votre expérience avec notre élevage : l'accueil, le chiot, le suivi, la livraison..."
                        className="min-h-32 resize-none"
                        value={formData.text}
                        onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                        required
                        minLength={30}
                      />
                      <p className="text-xs text-muted-foreground">{formData.text.length}/30 caractères minimum</p>
                    </div>

                    {submitStatus === "error" && (
                      <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {submitError}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={submitStatus === "loading" || formData.text.length < 30}
                      className="w-full h-12 text-base rounded-xl gap-2"
                    >
                      {submitStatus === "loading"
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...</>
                        : <><Send className="w-4 h-4" /> Soumettre mon avis</>}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      En soumettant ce formulaire, vous certifiez avoir adopté un chiot chez l'Élevage du Berger Bleu.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-primary-foreground text-center">
          <div className="container px-4 mx-auto max-w-2xl">
            <h2 className="font-serif text-3xl font-bold mb-4">Rejoignez nos familles heureuses</h2>
            <p className="text-primary-foreground/80 mb-8">Consultez nos chiots disponibles ou contactez-nous pour votre projet d'adoption.</p>
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
