import React, { useState, useEffect } from "react";
import {
  Phone, Mail, MapPin, Heart, Star, Shield, Award, X,
  Moon, Sun, PawPrint as Paw, CheckCircle2, Info, Loader2, AlertCircle,
  Quote, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePuppies } from "@/hooks/usePuppies";
import { contactApi, type Puppy } from "@/lib/api";
import ReservationModal from "@/components/ReservationModal";

type PuppyColor = "bleu merle" | "rouge merle" | "noir tricolore" | "rouge tricolore" | "Tous";
type SexFilter = "Mâle" | "Femelle" | "Tous";

const STATUS_LABELS: Record<string, string> = {
  available: "Disponible",
  reserved: "Réservé",
  sold: "Vendu",
};
const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-500/10 text-green-700 dark:text-green-400",
  reserved: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  sold: "bg-red-500/10 text-red-700 dark:text-red-400",
};

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

const REVIEWS: Review[] = [
  { id: 1, name: "Sophie M.", location: "Lyon", date: "Mars 2026", rating: 5, text: "Notre petite Luna est arrivée à la maison il y a 3 semaines et c'est un vrai bonheur. Elle est parfaitement socialisée, très curieuse et déjà à l'aise avec nos enfants. Le suivi de l'éleveur est irréprochable, toujours disponible pour répondre à nos questions.", puppy: "Luna — Bleu Merle", initials: "SM", color: "bg-emerald-500" },
  { id: 2, name: "Thomas & Julie D.", location: "Bordeaux", date: "Fév. 2026", rating: 5, text: "Nous avons adopté Maxou il y a un mois. Un chiot en parfaite santé, avec un caractère exceptionnel. On sentait vraiment l'amour que l'éleveur porte à ses chiens. La visite du domaine était magnifique, les chiens vivent vraiment dans de super conditions.", puppy: "Maxou — Noir Tricolore", initials: "TD", color: "bg-blue-500" },
  { id: 3, name: "Camille R.", location: "Paris", date: "Jan. 2026", rating: 5, text: "Deuxième adoption chez le Berger Bleu, et encore une expérience parfaite. Nala est une femelle rouge merle absolument splendide. Elle est déjà propre, connait son prénom et adore les câlins. Je recommande à 1000%.", puppy: "Nala — Rouge Merle", initials: "CR", color: "bg-rose-500" },
  { id: 4, name: "Marc L.", location: "Nantes", date: "Déc. 2025", rating: 5, text: "J'avais beaucoup de questions avant d'adopter car c'est mon premier Berger Australien. L'éleveur a pris le temps de tout m'expliquer, les besoins de la race, l'alimentation, le sport... Un accompagnement vraiment personnalisé et professionnel.", initials: "ML", color: "bg-violet-500" },
  { id: 5, name: "Aurélie & Baptiste F.", location: "Strasbourg", date: "Nov. 2025", rating: 5, text: "Rio est avec nous depuis 2 mois et c'est déjà notre meilleur ami. Un chiot exceptionnel, équilibré, curieux et débordant d'énergie. On adore. Merci pour ce beau cadeau de vie !", puppy: "Rio — Bleu Merle", initials: "AF", color: "bg-amber-500" },
  { id: 6, name: "Nathalie P.", location: "Toulouse", date: "Oct. 2025", rating: 5, text: "Le domaine est magnifique, les chiens courent en liberté et on voit immédiatement qu'ils sont heureux. Notre chiot Iris était déjà habituée aux humains, aux enfants et aux autres animaux. Un travail de socialisation remarquable dès le plus jeune âge.", puppy: "Iris — Rouge Tricolore", initials: "NP", color: "bg-teal-500" },
  { id: 7, name: "Julien M.", location: "Rennes", date: "Sept. 2025", rating: 5, text: "Athos est un berger australien miniature absolument parfait. Caractère doux et joueur, en très bonne santé. Le suivi post-adoption est vraiment appréciable, l'éleveur répond toujours rapidement à nos messages. C'est rassurant pour un primo-adoptant.", puppy: "Athos — Bleu Merle", initials: "JM", color: "bg-indigo-500" },
  { id: 8, name: "Léa & François G.", location: "Montpellier", date: "Août 2025", rating: 5, text: "On a attendu 3 mois sur liste d'attente et ça valait tellement la peine ! Elsa est tout simplement magnifique. Tests de santé complets, pedigree, assurance... tout était parfaitement organisé. C'est de la vraie passion, ça se voit.", puppy: "Elsa — Rouge Merle", initials: "LG", color: "bg-pink-500" },
  { id: 9, name: "Pierre-Antoine V.", location: "Lille", date: "Juil. 2025", rating: 5, text: "Troisième chien de la même éleveuse ! Je ne vais nulle part ailleurs. Chaque expérience est parfaite : des chiots bien dans leur tête, bien dans leur corps. Elle aime vraiment ses animaux et ça se ressent instantanément.", initials: "PV", color: "bg-cyan-500" },
  { id: 10, name: "Émilie D.", location: "Nice", date: "Juin 2025", rating: 5, text: "Jade est une merveille. Elle est arrivée avec son carnet de santé complet, ses vaccins, sa puce et même un petit kit avec sa couverture et ses jouets favoris pour faciliter la transition. Une attention aux détails qui montre le sérieux de cet élevage.", puppy: "Jade — Noir Tricolore", initials: "ED", color: "bg-lime-600" },
  { id: 11, name: "Antoine B.", location: "Grenoble", date: "Mai 2025", rating: 5, text: "Exceptionnellement bien socialisé, Zeus a pris ses marques chez nous en moins d'une semaine. L'éleveur nous a envoyé des photos toutes les semaines jusqu'à ce qu'on puisse le récupérer. Ce genre de suivi, c'est irremplaçable.", puppy: "Zeus — Bleu Merle", initials: "AB", color: "bg-orange-500" },
  { id: 12, name: "Claire & Renaud H.", location: "Marseille", date: "Avr. 2025", rating: 5, text: "Sertie de la portée la plus mignonne qu'on ait jamais vue ! Notre petite femelle rouge tricolore est arrivée parfaitement habituée à la laisse, aux bruits de la ville et aux enfants en bas âge. Impressionnant pour un chiot de 8 semaines.", puppy: "Noisette — Rouge Tricolore", initials: "CH", color: "bg-red-500" },
  { id: 13, name: "Hugo L.", location: "Tours", date: "Mars 2025", rating: 5, text: "J'avais des doutes au début car je cherchais via internet, mais le professionnel de l'autre côté a tout de suite mis en confiance. Visite du domaine proposée, transparence sur les tests génétiques, historique des parents... Rien à redire.", initials: "HL", color: "bg-fuchsia-500" },
  { id: 14, name: "Sandrine M.", location: "Dijon", date: "Jan. 2025", rating: 5, text: "Cela fait maintenant 4 mois que Pixel est avec nous et on ne peut plus imaginer notre vie sans lui. Il est intelligent, affectueux, et apprend à une vitesse folle. Tout le mérite revient à sa socialisation précoce et à son éleveur passionné.", puppy: "Pixel — Bleu Merle", initials: "SM", color: "bg-sky-500" },
  { id: 15, name: "Nicolas & Pauline T.", location: "Clermont-Ferrand", date: "Nov. 2024", rating: 5, text: "Une expérience au-delà de nos espérances. L'éleveur nous a guidés dans notre choix, expliqué les différences entre les robe, les tailles standard/miniature. On a adopté une petite rouge merle absolument spectaculaire. Merci infiniment !", puppy: "Cannelle — Rouge Merle", initials: "NT", color: "bg-emerald-600" },
  { id: 16, name: "Delphine R.", location: "Rouen", date: "Sept. 2024", rating: 5, text: "Après beaucoup de recherches sur les élevages en France, c'est celui-ci qui m'a convaincue par son sérieux et sa transparence. Je ne le regrette pas. Tango est en pleine forme, adore le sport et est très câlin. Un chien parfait.", puppy: "Tango — Noir Tricolore", initials: "DR", color: "bg-violet-600" },
  { id: 17, name: "Bertrand & Hélène C.", location: "Angers", date: "Juil. 2024", rating: 5, text: "Notre famille adore Chipie ! Elle joue avec les enfants (5 et 8 ans), dort dans sa corbeille dès le premier soir et est propre depuis 10 jours. Un vrai miracle selon notre vétérinaire qui a été impressionné par son état de santé général.", puppy: "Chipie — Rouge Tricolore", initials: "BC", color: "bg-rose-600" },
  { id: 18, name: "Alexis F.", location: "Metz", date: "Avr. 2024", rating: 5, text: "Un an déjà avec notre berger bleu merle Storm et il est tout simplement extraordinaire. Toujours en bonne santé, équilibré, super en agility. Ce fut notre meilleur investissement. Merci à l'éleveur pour ce compagnon exceptionnel.", puppy: "Storm — Bleu Merle", initials: "AF", color: "bg-blue-600" },
];

const STATS = [
  { value: "15+", label: "Années d'élevage" },
  { value: "48", label: "Portées réussies" },
  { value: "320+", label: "Familles heureuses" },
  { value: "100%", label: "Tests de santé" },
];

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [filterColor, setFilterColor] = useState<PuppyColor>("Tous");
  const [filterSex, setFilterSex] = useState<SexFilter>("Tous");
  const [selectedPuppy, setSelectedPuppy] = useState<Puppy | null>(null);
  const [reservingPuppy, setReservingPuppy] = useState<Puppy | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ prenom: "", nom: "", email: "", message: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");
  const [reviewPage, setReviewPage] = useState(0);

  const reviewsPerPage = 3;
  const totalPages = Math.ceil(REVIEWS.length / reviewsPerPage);
  const visibleReviews = REVIEWS.slice(reviewPage * reviewsPerPage, reviewPage * reviewsPerPage + reviewsPerPage);

  const { data: puppies = [], isLoading: puppiesLoading } = usePuppies();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    document.body.style.overflow = (selectedPuppy || reservingPuppy) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedPuppy, reservingPuppy]);

  // Auto-advance reviews
  useEffect(() => {
    const timer = setInterval(() => {
      setReviewPage((p) => (p + 1) % totalPages);
    }, 6000);
    return () => clearInterval(timer);
  }, [totalPages]);

  const filteredPuppies = puppies.filter((p) => {
    if (filterColor !== "Tous" && p.color !== filterColor) return false;
    if (filterSex !== "Tous" && p.sex !== filterSex) return false;
    return true;
  });

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("loading");
    setFormError("");
    try {
      await contactApi.sendContact({
        firstName: formData.prenom,
        lastName: formData.nom,
        email: formData.email,
        message: formData.message,
      });
      setFormStatus("success");
      setFormData({ prenom: "", nom: "", email: "", message: "" });
      setTimeout(() => setFormStatus("idle"), 5000);
    } catch (err) {
      setFormStatus("error");
      setFormError(err instanceof Error ? err.message : "Erreur lors de l'envoi du message");
    }
  };

  const primaryImage = (p: Puppy) => p.images[0] ?? "/images/puppy-bleu-merle.png";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/33612345678?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9(e)%20par%20vos%20chiots%20berger%20australien."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-2xl"
        title="Discuter sur WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.422-.272.347-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
        </svg>
      </a>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-300">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <button className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection("home")}>
            <Paw className="w-7 h-7 text-primary" />
            <span className="font-serif text-xl font-bold tracking-wide">Élevage du Berger Bleu</span>
          </button>
          <div className="hidden md:flex items-center gap-8 font-medium">
            {[
              { id: "home", label: "Accueil" },
              { id: "chiots", label: "Nos Chiots" },
              { id: "apropos", label: "À Propos" },
              { id: "avis", label: "Avis" },
              { id: "contact", label: "Contact" },
            ].map((s) => (
              <button key={s.id} onClick={() => scrollToSection(s.id)} className="hover:text-primary transition-colors text-sm">{s.label}</button>
            ))}
            <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="rounded-full w-10 h-10">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="rounded-full">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg hover:bg-accent transition-colors">
              <div className="w-5 h-0.5 bg-foreground mb-1" />
              <div className="w-5 h-0.5 bg-foreground mb-1" />
              <div className="w-5 h-0.5 bg-foreground" />
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md px-4 py-4 flex flex-col gap-4 font-medium">
            {[
              { id: "home", label: "Accueil" }, { id: "chiots", label: "Nos Chiots" },
              { id: "apropos", label: "À Propos" }, { id: "avis", label: "Avis" }, { id: "contact", label: "Contact" },
            ].map((s) => (
              <button key={s.id} onClick={() => scrollToSection(s.id)} className="text-left hover:text-primary transition-colors py-2 border-b border-border/50 last:border-0">{s.label}</button>
            ))}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section id="home" className="relative pt-20 min-h-[92vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src="/images/aussie-hero.png" alt="Berger Australien" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/92 via-background/65 to-background/10 dark:from-background/97 dark:via-background/80" />
        </div>
        <div className="container relative z-10 px-4 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 font-medium text-sm">
              <Star className="w-4 h-4" />
              <span>Élevage familial en plein cœur de la France</span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6">
              Des compagnons fidèles,<br className="hidden md:block" />
              élevés avec <span className="text-primary italic">passion</span>.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
              Nous élevons des Bergers Australiens Standard et Miniatures dans un environnement familial.
              Nos chiots grandissent entourés d'amour, prêts à partager votre vie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:-translate-y-1" onClick={() => scrollToSection("chiots")}>
                Voir nos chiots
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 rounded-full bg-background/50 backdrop-blur-sm border-2 hover:bg-accent" onClick={() => scrollToSection("apropos")}>
                Découvrir l'élevage
              </Button>
            </div>
            <div className="mt-16 flex flex-wrap items-center gap-6 md:gap-10">
              {[
                { icon: <Shield className="w-5 h-5" />, label: "Santé Certifiée" },
                { icon: <Award className="w-5 h-5" />, label: "Pedigree Officiel" },
                { icon: <Heart className="w-5 h-5" />, label: "Suivi Éleveur à vie" },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-3 text-sm font-medium">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">{badge.icon}</div>
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="bg-primary text-primary-foreground py-10">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="font-serif text-4xl md:text-5xl font-bold mb-1">{s.value}</div>
                <div className="text-primary-foreground/70 text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Puppies Section */}
      <section id="chiots" className="py-24 bg-secondary/30">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">Nos Chiots Disponibles</h2>
            <p className="text-lg text-muted-foreground">
              Découvrez nos petites merveilles. Chaque chiot partira pucé, vacciné, vermifugé, avec un certificat vétérinaire.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-12">
            <div className="flex flex-wrap justify-center gap-2">
              {(["Tous", "bleu merle", "rouge merle", "noir tricolore", "rouge tricolore"] as const).map((color) => (
                <button
                  key={color}
                  onClick={() => setFilterColor(color)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${filterColor === color ? "bg-primary text-primary-foreground shadow-md scale-105" : "bg-background border border-border hover:bg-accent hover:border-primary/50"}`}
                >
                  <span className="capitalize">{color}</span>
                </button>
              ))}
            </div>
            <div className="h-8 w-px bg-border hidden md:block" />
            <div className="flex justify-center gap-2">
              {(["Tous", "Mâle", "Femelle"] as const).map((sex) => (
                <button
                  key={sex}
                  onClick={() => setFilterSex(sex)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${filterSex === sex ? "bg-foreground text-background shadow-md scale-105" : "bg-background border border-border hover:bg-accent"}`}
                >
                  {sex}
                </button>
              ))}
            </div>
          </div>

          {puppiesLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredPuppies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPuppies.map((puppy, i) => (
                <div key={puppy.id} className="group bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={primaryImage(puppy)} alt={`Chiot ${puppy.name}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[puppy.status]}`}>{STATUS_LABELS[puppy.status]}</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
                      {puppy.price.toLocaleString("fr-FR")} €
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-serif text-2xl font-bold mb-1 group-hover:text-primary transition-colors">{puppy.name}</h3>
                        <p className="text-muted-foreground text-sm capitalize">{puppy.color} • {puppy.ageWeeks} semaines</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-medium text-primary">
                        {puppy.sex === "Mâle" ? "M" : "F"}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {puppy.traits.slice(0, 2).map((trait) => (
                        <span key={trait} className="px-2.5 py-1 bg-secondary text-secondary-foreground text-xs rounded-md font-medium">{trait}</span>
                      ))}
                    </div>
                    <Button className="w-full rounded-xl h-12 font-medium" onClick={() => setSelectedPuppy(puppy)}>
                      Voir les détails
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-background rounded-3xl border border-dashed border-border">
              <Paw className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Aucun chiot ne correspond</h3>
              <Button variant="link" onClick={() => { setFilterColor("Tous"); setFilterSex("Tous"); }} className="mt-2 text-primary">Réinitialiser les filtres</Button>
            </div>
          )}
        </div>
      </section>

      {/* À Propos */}
      <section id="apropos" className="py-24">
        <div className="container px-4 mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-[3rem] transform -rotate-3 scale-105" />
              <img src="/images/farm-pastoral.png" alt="Notre domaine" className="relative rounded-3xl shadow-2xl object-cover aspect-[4/3] w-full" loading="lazy" />
              <div className="absolute -bottom-8 -right-8 bg-card p-6 rounded-2xl shadow-xl border border-border max-w-[240px] hidden md:block">
                <div className="flex gap-1 text-yellow-500 mb-2">
                  {[...Array(5)].map((_, k) => <Star key={k} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-sm italic font-serif">"Un élevage exceptionnel, des chiens équilibrés et un suivi parfait."</p>
                <p className="text-xs text-muted-foreground mt-2 font-medium">— Famille Dubois</p>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground mb-6 font-medium text-sm">
                <Heart className="w-4 h-4 text-primary" />
                <span>Notre Histoire</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">Une passion née au cœur de la nature.</h2>
              <div className="space-y-5 text-lg text-muted-foreground leading-relaxed">
                <p>Situé sur un domaine de 5 hectares de prairies, l'Élevage du Berger Bleu est avant tout l'histoire d'une famille passionnée par le Berger Australien depuis plus de 15 ans.</p>
                <p>Nos chiens vivent avec nous, partagent notre quotidien et nos activités. Pas de chenils fermés : ici, c'est la vie au grand air, les balades en forêt et les soirées au coin du feu.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-6 mt-10">
                {[
                  { title: "Bien-être animal", desc: "Socialisation précoce et environnement stimulant." },
                  { title: "Qualité des lignées", desc: "Tests de santé complets (MDR1, AOC, APR-prcd, dysplasie)." },
                  { title: "Passion & Éthique", desc: "Sélection rigoureuse des reproducteurs pour la santé et le caractère." },
                  { title: "Suivi Personnalisé", desc: "Accompagnement de l'éleveur disponible à vie pour chaque famille." },
                ].map((v) => (
                  <div key={v.title} className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary mt-1"><CheckCircle2 className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">{v.title}</h4>
                      <p className="text-sm text-muted-foreground">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Avis Clients */}
      <section id="avis" className="py-24 bg-secondary/30">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 mb-6 font-medium text-sm">
              <Star className="w-4 h-4 fill-current" />
              <span>Avis vérifiés — Note moyenne 5/5</span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Ce que disent nos familles</h2>
            <p className="text-lg text-muted-foreground">
              Plus de 320 familles nous font confiance depuis 2 ans. Voici leurs témoignages.
            </p>
          </div>

          {/* Global rating */}
          <div className="flex items-center justify-center gap-4 mb-14">
            <div className="text-center">
              <div className="font-serif text-6xl font-bold text-foreground">5.0</div>
              <div className="flex gap-1 text-yellow-500 justify-center mt-1">
                {[...Array(5)].map((_, k) => <Star key={k} className="w-5 h-5 fill-current" />)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">sur {REVIEWS.length} avis</div>
            </div>
            <div className="h-16 w-px bg-border mx-4 hidden sm:block" />
            <div className="space-y-1.5 hidden sm:block">
              {[5, 4, 3, 2, 1].map((n) => (
                <div key={n} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-3">{n}</span>
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <div className="w-32 h-2 rounded-full bg-border overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: n === 5 ? "100%" : "0%" }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{n === 5 ? REVIEWS.length : 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {visibleReviews.map((review) => (
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
                    <span className="text-xs font-medium text-primary capitalize">{review.puppy}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setReviewPage((p) => (p - 1 + totalPages) % totalPages)}
              className="w-10 h-10 rounded-full border border-border bg-card hover:bg-accent flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setReviewPage(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${reviewPage === i ? "bg-primary scale-125" : "bg-border hover:bg-primary/40"}`}
                />
              ))}
            </div>
            <button
              onClick={() => setReviewPage((p) => (p + 1) % totalPages)}
              className="w-10 h-10 rounded-full border border-border bg-card hover:bg-accent flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-5xl mx-auto bg-card text-card-foreground rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="p-8 md:p-12 md:w-3/5">
              <h2 className="font-serif text-3xl font-bold mb-2">Discutons de votre projet</h2>
              <p className="text-muted-foreground mb-8">Adopter un chiot est un engagement. Écrivez-nous pour faire connaissance et parler de vos attentes.</p>
              {formStatus === "success" ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary"><CheckCircle2 className="w-8 h-8" /></div>
                  <h3 className="font-serif text-2xl font-bold">Message envoyé !</h3>
                  <p className="text-muted-foreground">Nous vous répondrons dans les meilleurs délais.</p>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleContactSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prénom</label>
                      <Input placeholder="Jean" className="bg-background" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom</label>
                      <Input placeholder="Dupont" className="bg-background" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" placeholder="jean.dupont@email.com" className="bg-background" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Votre projet</label>
                    <Textarea placeholder="Bonjour, nous sommes une famille avec deux enfants et un jardin..." className="h-32 bg-background" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required />
                  </div>
                  {formStatus === "error" && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-600 rounded-xl text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {formError || "Une erreur est survenue."}
                    </div>
                  )}
                  <Button type="submit" disabled={formStatus === "loading"} className="w-full h-12 text-lg rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-transform hover:-translate-y-1">
                    {formStatus === "loading" ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</span> : "Envoyer le message"}
                  </Button>
                </form>
              )}
            </div>
            <div className="bg-secondary/50 p-8 md:p-12 md:w-2/5 flex flex-col justify-between border-l border-border/50">
              <div>
                <h3 className="font-serif text-2xl font-bold mb-8">Contact Direct</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-background shadow-sm flex items-center justify-center text-primary flex-shrink-0"><Phone className="w-5 h-5" /></div>
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Téléphone</p>
                      <a href="tel:+33612345678" className="font-bold text-lg hover:text-primary transition-colors">06 12 34 56 78</a>
                      <p className="text-xs text-muted-foreground">Lun - Sam, 9h à 18h</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-background shadow-sm flex items-center justify-center text-primary flex-shrink-0"><Mail className="w-5 h-5" /></div>
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Email</p>
                      <a href="mailto:contact@berger-bleu.fr" className="font-bold hover:text-primary transition-colors">contact@berger-bleu.fr</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-background shadow-sm flex items-center justify-center text-primary flex-shrink-0"><MapPin className="w-5 h-5" /></div>
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Domaine</p>
                      <p className="font-bold">Domaine des Trois Chênes</p>
                      <p className="text-sm">18000 Bourges, France</p>
                      <p className="text-xs text-muted-foreground mt-1">Sur rendez-vous uniquement</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-12">
                <a href="https://wa.me/33612345678?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20vos%20chiots%20berger%20australien." target="_blank" rel="noopener noreferrer">
                  <Button className="w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold shadow-lg transition-transform hover:-translate-y-1 gap-2 border-none">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.422-.272.347-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                    Discuter sur WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-10 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Paw className="w-5 h-5 text-primary" />
              <span className="font-serif font-bold">Élevage du Berger Bleu</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="tel:+33612345678" className="hover:text-primary transition-colors">06 12 34 56 78</a>
              <span>·</span>
              <a href="mailto:contact@berger-bleu.fr" className="hover:text-primary transition-colors">contact@berger-bleu.fr</a>
              <span>·</span>
              <span>Bourges, France</span>
            </div>
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Élevage du Berger Bleu</p>
          </div>
        </div>
      </footer>

      {/* Puppy Detail Modal */}
      {selectedPuppy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSelectedPuppy(null)} />
          <div className="relative bg-card text-card-foreground w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <button onClick={() => setSelectedPuppy(null)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-background/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-background transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="overflow-y-auto">
              <div className="grid md:grid-cols-2">
                <div className="flex flex-col gap-2 p-2">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                    <img src={primaryImage(selectedPuppy)} alt={selectedPuppy.name} className="w-full h-full object-cover" />
                  </div>
                  {selectedPuppy.images.length > 1 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {selectedPuppy.images.slice(1, 4).map((img, i) => (
                        <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                        <img src="/images/aussie-modal-extra.png" alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-secondary flex items-center justify-center">
                        <Paw className="w-12 h-12 text-primary/20" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-8 flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[selectedPuppy.status]}`}>{STATUS_LABELS[selectedPuppy.status]}</span>
                    <span className="text-muted-foreground text-sm font-medium">{selectedPuppy.price.toLocaleString("fr-FR")} €</span>
                  </div>
                  <h2 className="font-serif text-4xl font-bold mb-2">{selectedPuppy.name}</h2>
                  <p className="text-lg text-muted-foreground mb-6 capitalize">{selectedPuppy.color} • {selectedPuppy.sex} • {selectedPuppy.ageWeeks} semaines</p>
                  <div className="space-y-6 flex-grow">
                    {selectedPuppy.description && (
                      <div>
                        <h4 className="font-bold mb-2 flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> À propos</h4>
                        <p className="text-muted-foreground leading-relaxed">{selectedPuppy.description}</p>
                      </div>
                    )}
                    {selectedPuppy.traits.length > 0 && (
                      <div>
                        <h4 className="font-bold mb-2 flex items-center gap-2"><Star className="w-4 h-4 text-primary" /> Caractère</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedPuppy.traits.map((trait) => <span key={trait} className="px-3 py-1.5 bg-secondary rounded-lg text-sm font-medium">{trait}</span>)}
                        </div>
                      </div>
                    )}
                    {selectedPuppy.parents && (
                      <div className="bg-accent/50 rounded-xl p-4 border border-border/50">
                        <h4 className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">Parents</h4>
                        <p className="font-medium">{selectedPuppy.parents}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {["Pucé & Vacciné", "Vermifugé", "Certificat Santé", "Kit Chiot Inclus"].map((item) => (
                        <div key={item} className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />{item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-border">
                    <Button
                      className="w-full h-14 text-lg rounded-xl shadow-lg hover:-translate-y-1 transition-all"
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

      {/* Reservation Modal */}
      {reservingPuppy && (
        <ReservationModal puppy={reservingPuppy} onClose={() => setReservingPuppy(null)} />
      )}
    </div>
  );
}
