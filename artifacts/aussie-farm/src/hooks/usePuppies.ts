import { useQuery } from "@tanstack/react-query";
import { puppiesApi, type Puppy } from "@/lib/api";

const FALLBACK_PUPPIES: Puppy[] = [
  { id: 1, name: "Milo", ageWeeks: 8, color: "bleu merle", sex: "Mâle", price: 1800, description: "Milo est un chiot très joueur et affectueux. Il adore explorer et a une belle robe bleue bien marquée.", traits: ["Joueur", "Curieux", "Très affectueux"], parents: "Luna (Bleu Merle) x Orion (Noir Tricolore)", images: ["/images/puppy-bleu-merle.png", "/images/aussie-modal-extra.png", "/images/farm-pastoral.png", "/images/aussie-hero.png"], status: "available", isPremium: false, createdAt: new Date().toISOString() },
  { id: 2, name: "Ruby", ageWeeks: 9, color: "rouge merle", sex: "Femelle", price: 2000, description: "Ruby est une petite femelle douce et calme. Elle est très attentive et sera parfaite pour une famille avec enfants.", traits: ["Calme", "Attentive", "Douce"], parents: "Stella (Rouge Merle) x Orion (Noir Tricolore)", images: ["/images/puppy-rouge-merle.png", "/images/aussie-modal-extra.png", "/images/farm-pastoral.png"], status: "available", isPremium: false, createdAt: new Date().toISOString() },
  { id: 3, name: "Buster", ageWeeks: 8, color: "noir tricolore", sex: "Mâle", price: 1500, description: "Buster est plein d'énergie et très intelligent. Il apprend vite et ferait un excellent chien de sport.", traits: ["Énergique", "Intelligent", "Sportif"], parents: "Luna (Bleu Merle) x Orion (Noir Tricolore)", images: ["/images/puppy-noir-tricolore.png", "/images/aussie-modal-extra.png", "/images/farm-pastoral.png"], status: "available", isPremium: false, createdAt: new Date().toISOString() },
  { id: 4, name: "Hazel", ageWeeks: 10, color: "rouge tricolore", sex: "Femelle", price: 1600, description: "Hazel a un magnifique pelage rouge et un regard très expressif. Elle est câline et toujours prête pour une promenade.", traits: ["Câline", "Expressive", "Sociable"], parents: "Stella (Rouge Merle) x Jasper (Rouge Tricolore)", images: ["/images/puppy-rouge-tricolore.png", "/images/aussie-modal-extra.png", "/images/farm-pastoral.png", "/images/aussie-hero.png"], status: "available", isPremium: false, createdAt: new Date().toISOString() },
  { id: 5, name: "Oscar", ageWeeks: 7, color: "bleu merle", sex: "Mâle", price: 1900, description: "Oscar est le petit clown de la portée. Il est toujours prêt à faire des bêtises pour attirer l'attention.", traits: ["Rigolo", "Sociable", "Actif"], parents: "Luna (Bleu Merle) x Orion (Noir Tricolore)", images: ["/images/puppy-bleu-merle.png", "/images/farm-pastoral.png", "/images/aussie-hero.png"], status: "available", isPremium: false, createdAt: new Date().toISOString() },
  { id: 6, name: "Bella", ageWeeks: 8, color: "rouge merle", sex: "Femelle", price: 2200, description: "Bella a des yeux vairons magnifiques. Elle est très proche de l'homme et demande beaucoup de tendresse.", traits: ["Proche de l'homme", "Tendre", "Observatrice"], parents: "Stella (Rouge Merle) x Orion (Noir Tricolore)", images: ["/images/puppy-rouge-merle.png", "/images/aussie-modal-extra.png", "/images/farm-pastoral.png"], status: "available", isPremium: false, createdAt: new Date().toISOString() },
];

export function usePuppies() {
  return useQuery<Puppy[]>({
    queryKey: ["puppies"],
    queryFn: async () => {
      try {
        return await puppiesApi.list();
      } catch {
        return FALLBACK_PUPPIES;
      }
    },
    staleTime: 30_000,
    placeholderData: FALLBACK_PUPPIES,
  });
}
