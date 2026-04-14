import React, { useState, useEffect } from "react";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  Star, 
  Shield, 
  Award, 
  ChevronDown, 
  X, 
  Moon, 
  Sun, 
  PawPrint as Paw,
  CheckCircle2,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Data Models
type PuppyColor = "bleu merle" | "rouge merle" | "noir tricolore" | "rouge tricolore";
type Sex = "Mâle" | "Femelle";

interface Puppy {
  id: string;
  name: string;
  age: number; // in weeks
  color: PuppyColor;
  sex: Sex;
  price: number;
  image: string;
  description: string;
  traits: string[];
  parents: string;
}

const PUPPIES: Puppy[] = [
  {
    id: "p1",
    name: "Milo",
    age: 8,
    color: "bleu merle",
    sex: "Mâle",
    price: 1800,
    image: "/__mockup/images/puppy-bleu-merle.png",
    description: "Milo est un chiot très joueur et affectueux. Il adore explorer et a une belle robe bleue bien marquée.",
    traits: ["Joueur", "Curieux", "Très affectueux"],
    parents: "Luna (Bleu Merle) x Orion (Noir Tricolore)"
  },
  {
    id: "p2",
    name: "Ruby",
    age: 9,
    color: "rouge merle",
    sex: "Femelle",
    price: 2000,
    image: "/__mockup/images/puppy-rouge-merle.png",
    description: "Ruby est une petite femelle douce et calme. Elle est très attentive et sera parfaite pour une famille avec enfants.",
    traits: ["Calme", "Attentive", "Douce"],
    parents: "Stella (Rouge Merle) x Orion (Noir Tricolore)"
  },
  {
    id: "p3",
    name: "Buster",
    age: 8,
    color: "noir tricolore",
    sex: "Mâle",
    price: 1500,
    image: "/__mockup/images/puppy-noir-tricolore.png",
    description: "Buster est plein d'énergie et très intelligent. Il apprend vite et ferait un excellent chien de sport.",
    traits: ["Énergique", "Intelligent", "Sportif"],
    parents: "Luna (Bleu Merle) x Orion (Noir Tricolore)"
  },
  {
    id: "p4",
    name: "Hazel",
    age: 10,
    color: "rouge tricolore",
    sex: "Femelle",
    price: 1600,
    image: "/__mockup/images/puppy-rouge-tricolore.png",
    description: "Hazel a un magnifique pelage rouge et un regard très expressif. Elle est câline et toujours prête pour une promenade.",
    traits: ["Câline", "Expressive", "Sociable"],
    parents: "Stella (Rouge Merle) x Jasper (Rouge Tricolore)"
  },
  {
    id: "p5",
    name: "Oscar",
    age: 7,
    color: "bleu merle",
    sex: "Mâle",
    price: 1900,
    image: "/__mockup/images/puppy-bleu-merle.png",
    description: "Oscar est le petit clown de la portée. Il est toujours prêt à faire des bêtises pour attirer l'attention.",
    traits: ["Rigolo", "Sociable", "Actif"],
    parents: "Luna (Bleu Merle) x Orion (Noir Tricolore)"
  },
  {
    id: "p6",
    name: "Bella",
    age: 8,
    color: "rouge merle",
    sex: "Femelle",
    price: 2200,
    image: "/__mockup/images/puppy-rouge-merle.png",
    description: "Bella a des yeux vairons magnifiques. Elle est très proche de l'homme et demande beaucoup de tendresse.",
    traits: ["Proche de l'homme", "Tendre", "Observatrice"],
    parents: "Stella (Rouge Merle) x Orion (Noir Tricolore)"
  }
];

export default function AussieFarm() {
  const [isDark, setIsDark] = useState(false);
  const [filterColor, setFilterColor] = useState<PuppyColor | "Tous">("Tous");
  const [filterSex, setFilterSex] = useState<Sex | "Tous">("Tous");
  const [selectedPuppy, setSelectedPuppy] = useState<Puppy | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const filteredPuppies = PUPPIES.filter(p => {
    if (filterColor !== "Tous" && p.color !== filterColor) return false;
    if (filterSex !== "Tous" && p.sex !== filterSex) return false;
    return true;
  });

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-300">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection("home")}>
            <Paw className="w-8 h-8 text-primary" />
            <span className="font-serif text-xl font-bold tracking-wide">Élevage du Berger Bleu</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium">
            <button onClick={() => scrollToSection("home")} className="hover:text-primary transition-colors">Accueil</button>
            <button onClick={() => scrollToSection("chiots")} className="hover:text-primary transition-colors">Nos Chiots</button>
            <button onClick={() => scrollToSection("apropos")} className="hover:text-primary transition-colors">À Propos</button>
            <button onClick={() => scrollToSection("contact")} className="hover:text-primary transition-colors">Contact</button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsDark(!isDark)}
              className="rounded-full w-10 h-10"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-20 pb-16 md:pt-32 md:pb-24 min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="/__mockup/images/aussie-hero.png" 
            alt="Magnifique Berger Australien dans la nature" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent dark:from-background/95 dark:via-background/80"></div>
        </div>
        
        <div className="container relative z-10 px-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 font-medium text-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Star className="w-4 h-4" />
              <span>Élevage familial en plein cœur de la France</span>
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
              Des compagnons fidèles, <br className="hidden md:block"/> élevés avec <span className="text-primary italic">passion</span>.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both leading-relaxed">
              Nous élevons des Bergers Australiens Standard et Miniatures dans un environnement familial. Nos chiots grandissent entourés d'amour, prêts à partager votre vie.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500 fill-mode-both">
              <Button size="lg" className="text-lg px-8 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:-translate-y-1" onClick={() => scrollToSection("chiots")}>
                Voir nos chiots
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 rounded-full bg-background/50 backdrop-blur-sm border-2 hover:bg-accent transition-all" onClick={() => scrollToSection("apropos")}>
                Découvrir l'élevage
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="mt-16 flex flex-wrap items-center gap-6 md:gap-10 animate-in fade-in duration-1000 delay-700 fill-mode-both">
              <div className="flex items-center gap-3 text-sm font-medium">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <span>Santé Certifiée</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Award className="w-5 h-5" />
                </div>
                <span>Pedigree Officiel</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Heart className="w-5 h-5" />
                </div>
                <span>Suivi Éleveur à vie</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Chiots Section */}
      <section id="chiots" className="py-24 bg-secondary/30">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">Nos Chiots Disponibles</h2>
            <p className="text-lg text-muted-foreground">
              Découvrez nos petites merveilles. Chaque chiot partira pucé, vacciné, vermifugé, avec un certificat de bonne santé vétérinaire.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-12">
            <div className="flex flex-wrap justify-center gap-2">
              {(["Tous", "bleu merle", "rouge merle", "noir tricolore", "rouge tricolore"] as const).map(color => (
                <button
                  key={color}
                  onClick={() => setFilterColor(color)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    filterColor === color 
                      ? "bg-primary text-primary-foreground shadow-md scale-105" 
                      : "bg-background border border-border hover:bg-accent hover:border-primary/50 text-foreground"
                  }`}
                >
                  <span className="capitalize">{color}</span>
                </button>
              ))}
            </div>
            <div className="h-8 w-px bg-border hidden md:block"></div>
            <div className="flex justify-center gap-2">
              {(["Tous", "Mâle", "Femelle"] as const).map(sex => (
                <button
                  key={sex}
                  onClick={() => setFilterSex(sex)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    filterSex === sex 
                      ? "bg-foreground text-background shadow-md scale-105" 
                      : "bg-background border border-border hover:bg-accent text-foreground"
                  }`}
                >
                  {sex}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {filteredPuppies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPuppies.map((puppy, i) => (
                <div 
                  key={puppy.id} 
                  className="group bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-in fade-in zoom-in-95 fill-mode-both"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={puppy.image} 
                      alt={`Chiot ${puppy.name}`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
                      {puppy.price} €
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-serif text-2xl font-bold mb-1 group-hover:text-primary transition-colors">{puppy.name}</h3>
                        <p className="text-muted-foreground text-sm capitalize">{puppy.color} • {puppy.age} semaines</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-medium text-primary">
                        {puppy.sex === "Mâle" ? "M" : "F"}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {puppy.traits.slice(0, 2).map(trait => (
                        <span key={trait} className="px-2.5 py-1 bg-secondary text-secondary-foreground text-xs rounded-md font-medium">
                          {trait}
                        </span>
                      ))}
                    </div>

                    <Button 
                      className="w-full rounded-xl h-12 text-md font-medium" 
                      onClick={() => setSelectedPuppy(puppy)}
                    >
                      Voir détails & Réserver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-background rounded-3xl border border-dashed border-border">
              <Paw className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Aucun chiot ne correspond</h3>
              <p className="text-muted-foreground">Essayez de modifier vos filtres de recherche.</p>
              <Button variant="link" onClick={() => { setFilterColor("Tous"); setFilterSex("Tous"); }} className="mt-4 text-primary">
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* À Propos Section */}
      <section id="apropos" className="py-24">
        <div className="container px-4 mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-[3rem] transform -rotate-3 scale-105"></div>
              <img 
                src="/__mockup/images/farm-pastoral.png" 
                alt="Notre domaine" 
                className="relative rounded-3xl shadow-2xl object-cover aspect-[4/3] w-full"
              />
              <div className="absolute -bottom-8 -right-8 bg-card p-6 rounded-2xl shadow-xl border border-border max-w-[240px] hidden md:block animate-in slide-in-from-bottom-4 duration-1000 delay-300">
                <div className="flex gap-1 text-yellow-500 mb-2">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
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
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Situé sur un domaine de 5 hectares de prairies, l'Élevage du Berger Bleu est avant tout l'histoire d'une famille passionnée par le Berger Australien depuis plus de 15 ans.
                </p>
                <p>
                  Nos chiens vivent avec nous, partagent notre quotidien et nos activités. Pas de chenils fermés : ici, c'est la vie au grand air, les balades en forêt et les soirées au coin du feu.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6 mt-10">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary mt-1">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Bien-être animal</h4>
                    <p className="text-sm text-muted-foreground">Socialisation précoce et environnement stimulant.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary mt-1">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Qualité des lignées</h4>
                    <p className="text-sm text-muted-foreground">Tests de santé complets (MDR1, AOC, APR-prcd, dysplasie).</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-5xl mx-auto bg-card text-card-foreground rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            
            {/* Form Side */}
            <div className="p-8 md:p-12 md:w-3/5">
              <h2 className="font-serif text-3xl font-bold mb-2">Discutons de votre projet</h2>
              <p className="text-muted-foreground mb-8">Adopter un chiot est un engagement. Écrivez-nous pour faire connaissance et parler de vos attentes.</p>
              
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prénom</label>
                    <Input placeholder="Jean" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom</label>
                    <Input placeholder="Dupont" className="bg-background" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="jean.dupont@email.com" className="bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Votre projet (Mode de vie, temps disponible...)</label>
                  <Textarea placeholder="Bonjour, nous sommes une famille avec deux enfants et un jardin..." className="h-32 bg-background" />
                </div>
                <Button className="w-full h-12 text-lg rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-transform hover:-translate-y-1">
                  Envoyer le message
                </Button>
              </form>
            </div>
            
            {/* Info Side */}
            <div className="bg-secondary/50 p-8 md:p-12 md:w-2/5 flex flex-col justify-between border-l border-border/50">
              <div>
                <h3 className="font-serif text-2xl font-bold mb-8">Contact Direct</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-background shadow-sm flex items-center justify-center text-primary flex-shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Téléphone</p>
                      <p className="font-bold text-lg">06 12 34 56 78</p>
                      <p className="text-xs text-muted-foreground">Lun - Sam, 9h à 18h</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-background shadow-sm flex items-center justify-center text-primary flex-shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Email</p>
                      <p className="font-bold">contact@berger-bleu.fr</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-background shadow-sm flex items-center justify-center text-primary flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
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
                <Button className="w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold shadow-lg transition-transform hover:-translate-y-1 gap-2 border-none">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.422-.272.347-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  Discuter sur WhatsApp
                </Button>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-8 border-t border-border">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Paw className="w-5 h-5 text-primary" />
            <span className="font-serif font-bold">Élevage du Berger Bleu</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Élevage du Berger Bleu. Tous droits réservés.
          </p>
        </div>
      </footer>

      {/* Puppy Detail Modal */}
      {selectedPuppy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedPuppy(null)}></div>
          
          <div className="relative bg-card text-card-foreground w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setSelectedPuppy(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-background/50 backdrop-blur-md rounded-full flex items-center justify-center text-foreground hover:bg-background transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="overflow-y-auto">
              <div className="grid md:grid-cols-2">
                {/* Images side */}
                <div className="flex flex-col gap-2 p-2">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
                    <img src={selectedPuppy.image} alt={selectedPuppy.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
                      <img src="/__mockup/images/aussie-modal-extra.png" alt="Chiots" className="w-full h-full object-cover" />
                    </div>
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-secondary flex items-center justify-center">
                      <Paw className="w-12 h-12 text-primary/20" />
                    </div>
                  </div>
                </div>
                
                {/* Details side */}
                <div className="p-8 flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                      Disponible
                    </span>
                    <span className="text-muted-foreground text-sm font-medium">
                      {selectedPuppy.price} €
                    </span>
                  </div>
                  
                  <h2 className="font-serif text-4xl font-bold mb-2">{selectedPuppy.name}</h2>
                  <p className="text-lg text-muted-foreground mb-6 capitalize">
                    {selectedPuppy.color} • {selectedPuppy.sex} • {selectedPuppy.age} semaines
                  </p>
                  
                  <div className="space-y-6 flex-grow">
                    <div>
                      <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" /> À propos
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">{selectedPuppy.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4 text-primary" /> Caractère
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPuppy.traits.map(trait => (
                          <span key={trait} className="px-3 py-1.5 bg-secondary rounded-lg text-sm font-medium">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-accent/50 rounded-xl p-4 border border-border/50">
                      <h4 className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">Parents</h4>
                      <p className="font-medium">{selectedPuppy.parents}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Pucé & Vacciné
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Vermifugé
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Certificat Santé
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Kit Chiot Inclus
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-border">
                    <Button className="w-full h-14 text-lg rounded-xl shadow-lg hover:-translate-y-1 transition-all" onClick={() => {
                      setSelectedPuppy(null);
                      scrollToSection("contact");
                    }}>
                      Me contacter pour {selectedPuppy.name}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
