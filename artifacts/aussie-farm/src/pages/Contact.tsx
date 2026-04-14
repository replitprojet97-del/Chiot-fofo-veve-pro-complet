import React, { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { Phone, Mail, MapPin, CheckCircle2, Loader2, AlertCircle, Plane, Truck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactApi } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const DELIVERY_ZONES = [
  { flag: "🇫🇷", country: "France métropolitaine", detail: "Livraison à domicile ou remise sur notre domaine de Bourges. Frais inclus dans le prix." },
  { flag: "🇨🇭", country: "Suisse", detail: "Transport organisé avec passeport européen, microchip, rabies titer test si requis. Délai et conditions sur devis." },
  { flag: "🇧🇪", country: "Belgique", detail: "Livraison possible à domicile ou à un point de jonction. Documents vétérinaires complets fournis." },
];

export default function Contact() {
  useSEO({
    title: "Contactez-Nous — Réserver un Chiot Berger Australien | Élevage du Berger Bleu",
    description: "Contactez l'Élevage du Berger Bleu pour réserver votre chiot Berger Australien LOF. Livraison partout en France. Répondons à toutes vos questions sur la race et nos disponibilités.",
    canonical: "https://www.elevagedubergerbleu.fr/contact",
  });
  const [formData, setFormData] = useState({ prenom: "", nom: "", email: "", phone: "", message: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("loading");
    setFormError("");
    try {
      await contactApi.sendContact({
        firstName: formData.prenom,
        lastName: formData.nom,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });
      setFormStatus("success");
      setFormData({ prenom: "", nom: "", email: "", phone: "", message: "" });
      setTimeout(() => setFormStatus("idle"), 8000);
    } catch (err) {
      setFormStatus("error");
      setFormError(err instanceof Error ? err.message : "Erreur lors de l'envoi.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-20">

        {/* Header */}
        <div className="bg-primary text-primary-foreground py-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          <div className="container px-4 mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white mb-6 text-sm font-medium">
              <MessageSquare className="w-4 h-4" />
              <span>Réponse sous 24h</span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">Parlons de votre projet</h1>
            <p className="text-xl text-primary-foreground/80 max-w-xl mx-auto">
              Vous souhaitez adopter un chiot, vous avez des questions ou souhaitez visiter notre domaine ? Écrivez-nous.
            </p>
          </div>
        </div>

        {/* Contact grid */}
        <section className="py-20">
          <div className="container px-4 mx-auto max-w-5xl">
            <div className="grid lg:grid-cols-5 gap-12">

              {/* Form */}
              <div className="lg:col-span-3">
                <h2 className="font-serif text-3xl font-bold mb-8">Envoyer un message</h2>
                {formStatus === "success" ? (
                  <div className="flex flex-col items-center py-16 text-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold">Message bien reçu !</h3>
                    <p className="text-muted-foreground max-w-sm">Nous vous répondrons dans les meilleurs délais, généralement sous 24 heures.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Prénom *</label>
                        <Input placeholder="Jean" className="h-11" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nom *</label>
                        <Input placeholder="Dupont" className="h-11" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email *</label>
                      <Input type="email" placeholder="jean.dupont@email.com" className="h-11" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Téléphone <span className="text-muted-foreground font-normal">(optionnel)</span></label>
                      <Input type="tel" placeholder="+33 6 12 34 56 78" className="h-11" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Votre message *</label>
                      <Textarea
                        placeholder="Bonjour, nous sommes une famille avec deux enfants et un grand jardin. Nous cherchons un Berger Australien pour..."
                        className="min-h-36 resize-none"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>
                    {formStatus === "error" && (
                      <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {formError}
                      </div>
                    )}
                    <Button type="submit" disabled={formStatus === "loading"} className="w-full h-12 text-base rounded-xl">
                      {formStatus === "loading"
                        ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...</span>
                        : "Envoyer le message"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      En soumettant ce formulaire, vous acceptez que vos données soient utilisées pour vous recontacter.
                    </p>
                  </form>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="font-serif text-3xl font-bold mb-6">Infos pratiques</h2>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Téléphone</p>
                        <a href="tel:+33612345678" className="font-bold text-lg hover:text-primary transition-colors">06 12 34 56 78</a>
                        <p className="text-xs text-muted-foreground mt-0.5">Lundi – Samedi · 9h à 18h</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Email</p>
                        <a href="mailto:contact@berger-bleu.fr" className="font-bold hover:text-primary transition-colors">contact@berger-bleu.fr</a>
                        <p className="text-xs text-muted-foreground mt-0.5">Réponse sous 24h</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Adresse</p>
                        <p className="font-bold">Domaine des Trois Chênes</p>
                        <p className="text-sm">18000 Bourges, France</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Visites sur rendez-vous uniquement</p>
                      </div>
                    </div>
                  </div>
                </div>

                <a
                  href="https://wa.me/33612345678?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20vos%20chiots."
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-xl transition-colors group"
                >
                  <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.422-.272.347-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm group-hover:text-[#25D366] transition-colors">Discuter sur WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Réponse rapide garantie</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Zones de livraison */}
        <section className="py-20 bg-secondary/30">
          <div className="container px-4 mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4 text-sm font-medium">
                <Plane className="w-4 h-4" /> Livraisons internationales
              </div>
              <h2 className="font-serif text-4xl font-bold mb-4">Nous livrons en France, Suisse et Belgique</h2>
              <p className="text-muted-foreground">Chaque transport est soigneusement planifié pour le confort de votre chiot. Documents et formalités pris en charge.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {DELIVERY_ZONES.map((z) => (
                <div key={z.country} className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm">
                  <div className="text-4xl mb-4">{z.flag}</div>
                  <h3 className="font-semibold text-lg mb-3">{z.country}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{z.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 max-w-4xl mx-auto flex items-center gap-4 p-5 bg-primary/5 rounded-2xl border border-primary/20">
              <Truck className="w-8 h-8 text-primary flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Frais de transport inclus</strong> dans le prix pour la France. Pour la Suisse et la Belgique, un devis personnalisé vous sera communiqué lors de notre échange.
              </p>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
}
