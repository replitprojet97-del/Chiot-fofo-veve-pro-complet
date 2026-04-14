import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, LogOut, Pencil, Trash2, UploadCloud, X, Loader2,
  CheckCircle2, AlertCircle, PawPrint as Paw, Image as ImageIcon,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminApi, type Puppy, type PuppyPayload, type PuppyStatus, type PuppyColor, type PuppySex } from "@/lib/api";

const COLORS: PuppyColor[] = ["bleu merle", "rouge merle", "noir tricolore", "rouge tricolore"];
const SEXES: PuppySex[] = ["Mâle", "Femelle"];
const STATUSES: { value: PuppyStatus; label: string; color: string }[] = [
  { value: "available", label: "Disponible", color: "text-green-600 bg-green-500/10" },
  { value: "reserved", label: "Réservé", color: "text-amber-600 bg-amber-500/10" },
  { value: "sold", label: "Vendu", color: "text-red-600 bg-red-500/10" },
];

const EMPTY_FORM: PuppyPayload = {
  name: "", ageWeeks: 8, color: "bleu merle", sex: "Mâle",
  price: 1500, description: "", traits: [], parents: "", images: [], status: "available",
};

interface AdminDashboardProps {
  onLogout: () => void;
  adminEmail: string;
}

export default function AdminDashboard({ onLogout, adminEmail }: AdminDashboardProps) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPuppy, setEditingPuppy] = useState<Puppy | null>(null);
  const [form, setForm] = useState<PuppyPayload>(EMPTY_FORM);
  const [traitsInput, setTraitsInput] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const { data: puppies = [], isLoading } = useQuery<Puppy[]>({
    queryKey: ["admin-puppies"],
    queryFn: adminApi.listPuppies,
  });

  const logoutMut = useMutation({
    mutationFn: adminApi.logout,
    onSuccess: onLogout,
  });

  const saveMut = useMutation({
    mutationFn: (data: { id?: number; payload: PuppyPayload }) =>
      data.id ? adminApi.updatePuppy(data.id, data.payload) : adminApi.createPuppy(data.payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-puppies"] });
      qc.invalidateQueries({ queryKey: ["puppies"] });
      setShowForm(false);
      setEditingPuppy(null);
      setForm(EMPTY_FORM);
      setTraitsInput("");
      setFormError("");
      setFormSuccess(editingPuppy ? "Chiot mis à jour avec succès." : "Chiot ajouté avec succès.");
      setTimeout(() => setFormSuccess(""), 3000);
    },
    onError: (err) => setFormError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde"),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: PuppyStatus }) => adminApi.setStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-puppies"] });
      qc.invalidateQueries({ queryKey: ["puppies"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: adminApi.deletePuppy,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-puppies"] });
      qc.invalidateQueries({ queryKey: ["puppies"] });
      setDeleteConfirm(null);
    },
  });

  const openAdd = () => {
    setEditingPuppy(null);
    setForm(EMPTY_FORM);
    setTraitsInput("");
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (p: Puppy) => {
    setEditingPuppy(p);
    setForm({
      name: p.name, ageWeeks: p.ageWeeks, color: p.color, sex: p.sex,
      price: p.price, description: p.description, traits: p.traits,
      parents: p.parents, images: p.images, status: p.status,
    });
    setTraitsInput(p.traits.join(", "));
    setFormError("");
    setShowForm(true);
  };

  const handleImageUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    setFormError("");
    try {
      const uploads = await Promise.all(Array.from(files).map((f) => adminApi.uploadImage(f)));
      setForm((prev) => ({ ...prev, images: [...prev.images, ...uploads.map((u) => u.url)] }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur upload image");
    } finally {
      setUploadingImages(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleImageUpload(e.dataTransfer.files);
  }, [handleImageUpload]);

  const removeImage = (idx: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const traits = traitsInput.split(",").map((t) => t.trim()).filter(Boolean);
    saveMut.mutate({ id: editingPuppy?.id, payload: { ...form, traits } });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Paw className="w-6 h-6 text-primary" />
          <div>
            <span className="font-serif font-bold text-lg">Berger Bleu</span>
            <span className="text-muted-foreground text-sm ml-2 hidden sm:inline">— Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden md:block">{adminEmail}</span>
          <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => logoutMut.mutate()}>
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Success toast */}
        {formSuccess && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-green-500/10 text-green-700 rounded-xl text-sm border border-green-500/20">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {formSuccess}
          </div>
        )}

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold">Nos Chiots</h1>
            <p className="text-muted-foreground mt-1">Gérez les annonces publiées sur le site</p>
          </div>
          <Button onClick={openAdd} className="gap-2 rounded-xl h-11 px-5">
            <Plus className="w-4 h-4" />
            Ajouter un chiot
          </Button>
        </div>

        {/* Puppy cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : puppies.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
            <Paw className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Aucun chiot</h3>
            <p className="text-muted-foreground mb-6">Commencez par ajouter votre première annonce.</p>
            <Button onClick={openAdd} className="gap-2 rounded-xl"><Plus className="w-4 h-4" /> Ajouter</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {puppies.map((p) => {
              const st = STATUSES.find((s) => s.value === p.status)!;
              return (
                <div key={p.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  <div className="relative aspect-[4/3]">
                    {p.images[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${st.color}`}>
                      {st.label}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-serif text-xl font-bold">{p.name}</h3>
                      <span className="font-bold text-primary">{p.price.toLocaleString("fr-FR")} €</span>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize mb-4">
                      {p.color} • {p.sex} • {p.ageWeeks} semaines
                    </p>

                    {/* Status selector */}
                    <div className="relative mb-4">
                      <select
                        value={p.status}
                        onChange={(e) => statusMut.mutate({ id: p.id, status: e.target.value as PuppyStatus })}
                        className="w-full appearance-none bg-secondary border border-border rounded-xl px-4 py-2.5 pr-9 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 rounded-xl"
                        onClick={() => openEdit(p)}
                      >
                        <Pencil className="w-4 h-4" /> Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 rounded-xl text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => setDeleteConfirm(p.id)}
                      >
                        <Trash2 className="w-4 h-4" /> Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowForm(false)} />

          <div className="relative bg-card text-card-foreground w-full max-w-2xl rounded-3xl shadow-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-serif text-2xl font-bold">
                {editingPuppy ? `Modifier — ${editingPuppy.name}` : "Ajouter un chiot"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Nom *</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Milo" className="bg-background" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Âge (semaines) *</label>
                  <Input type="number" min={1} value={form.ageWeeks} onChange={(e) => setForm({ ...form, ageWeeks: parseInt(e.target.value, 10) || 0 })} required className="bg-background" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Couleur *</label>
                  <div className="relative">
                    <select
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value as PuppyColor })}
                      className="w-full appearance-none bg-background border border-input rounded-xl px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {COLORS.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Sexe *</label>
                  <div className="relative">
                    <select
                      value={form.sex}
                      onChange={(e) => setForm({ ...form, sex: e.target.value as PuppySex })}
                      className="w-full appearance-none bg-background border border-input rounded-xl px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {SEXES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Prix (€) *</label>
                  <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value, 10) || 0 })} required className="bg-background" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Statut</label>
                  <div className="relative">
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as PuppyStatus })}
                      className="w-full appearance-none bg-background border border-input rounded-xl px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Description</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Décrivez le chiot..." className="h-24 bg-background" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Traits de caractère <span className="text-muted-foreground font-normal">(séparés par des virgules)</span></label>
                <Input
                  value={traitsInput}
                  onChange={(e) => setTraitsInput(e.target.value)}
                  placeholder="Joueur, Curieux, Affectueux"
                  className="bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Parents</label>
                <Input value={form.parents} onChange={(e) => setForm({ ...form, parents: e.target.value })} placeholder="Luna (Bleu Merle) x Orion (Noir Tricolore)" className="bg-background" />
              </div>

              {/* Image upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Photos</label>

                <div
                  className="border-2 border-dashed border-border rounded-2xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("image-upload-input")?.click()}
                >
                  <input
                    id="image-upload-input"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                  {uploadingImages ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Upload en cours...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <UploadCloud className="w-10 h-10 text-muted-foreground/50" />
                      <p className="text-sm font-medium">Glissez vos photos ici ou cliquez pour sélectionner</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG, WEBP — Max 10 Mo par image</p>
                      <p className="text-xs text-muted-foreground">Les photos seront automatiquement recadrées et optimisées (900×675 px)</p>
                    </div>
                  )}
                </div>

                {form.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {form.images.map((url, i) => (
                      <div key={url} className="relative group aspect-[4/3] rounded-xl overflow-hidden border border-border bg-secondary">
                        <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                        {i === 0 && (
                          <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Principale</div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full items-center justify-center hidden group-hover:flex"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-600 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={saveMut.isPending} className="flex-1 rounded-xl h-12">
                  {saveMut.isPending ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde...</span>
                  ) : editingPuppy ? "Sauvegarder les modifications" : "Ajouter le chiot"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">Supprimer l'annonce ?</h3>
            <p className="text-muted-foreground text-sm mb-6">Cette action est irréversible. L'annonce sera définitivement supprimée du site.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
              <Button
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white border-none"
                disabled={deleteMut.isPending}
                onClick={() => deleteMut.mutate(deleteConfirm)}
              >
                {deleteMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Supprimer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
