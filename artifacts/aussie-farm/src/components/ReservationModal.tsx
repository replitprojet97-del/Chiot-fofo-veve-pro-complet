import React, { useState } from "react";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactApi, type Puppy } from "@/lib/api";

interface ReservationModalProps {
  puppy: Puppy;
  onClose: () => void;
}

export default function ReservationModal({ puppy, onClose }: ReservationModalProps) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const primaryImage = puppy.images[0] ?? "/images/puppy-bleu-merle.png";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      await contactApi.sendReservation({
        ...form,
        puppyId: puppy.id,
        puppyName: puppy.name,
        puppyColor: puppy.color,
        puppySex: puppy.sex,
        puppyPrice: puppy.price,
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    }
  };

  const statusLabels: Record<string, string> = {
    available: "Disponible",
    reserved: "Réservé",
    sold: "Vendu",
  };

  const statusColors: Record<string, string> = {
    available: "bg-green-500/10 text-green-600",
    reserved: "bg-amber-500/10 text-amber-600",
    sold: "bg-red-500/10 text-red-600",
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card text-card-foreground w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-background/60 backdrop-blur rounded-full flex items-center justify-center hover:bg-background transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto">
          {/* Puppy recap */}
          <div className="flex items-center gap-5 p-6 border-b border-border bg-secondary/30">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
              <img src={primaryImage} alt={puppy.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="font-serif text-2xl font-bold">{puppy.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColors[puppy.status]}`}>
                  {statusLabels[puppy.status]}
                </span>
              </div>
              <p className="text-muted-foreground capitalize text-sm">
                {puppy.color} • {puppy.sex} • {puppy.ageWeeks} semaines
              </p>
              <p className="font-bold text-lg mt-1">{puppy.price.toLocaleString("fr-FR")} €</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 md:p-8">
            <h3 className="font-serif text-xl font-bold mb-1">Votre demande de réservation</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Remplissez ce formulaire pour exprimer votre intérêt pour <strong>{puppy.name}</strong>. 
              Nous vous recontacterons rapidement.
            </p>

            {status === "success" ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-xl font-bold">Demande envoyée !</h4>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Votre demande de réservation pour <strong>{puppy.name}</strong> a bien été transmise. 
                  Nous vous contacterons sous 24h.
                </p>
                <Button className="mt-4 rounded-xl" onClick={onClose}>Fermer</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Prénom *</label>
                    <Input
                      placeholder="Jean"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Nom *</label>
                    <Input
                      placeholder="Dupont"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      required
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    placeholder="jean.dupont@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Téléphone</label>
                  <Input
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Votre message *</label>
                  <Textarea
                    placeholder={`Bonjour, je suis intéressé(e) par ${puppy.name}. Je vis dans une maison avec jardin et...`}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    className="h-28 bg-background"
                  />
                </div>

                {status === "error" && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-600 rounded-xl text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errorMsg || "Une erreur est survenue, veuillez réessayer."}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full h-12 rounded-xl text-base font-medium shadow-md transition-transform hover:-translate-y-0.5"
                >
                  {status === "loading" ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...
                    </span>
                  ) : (
                    `Envoyer ma demande pour ${puppy.name}`
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
