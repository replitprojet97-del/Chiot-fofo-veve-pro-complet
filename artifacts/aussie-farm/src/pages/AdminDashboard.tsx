import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, LogOut, Pencil, Trash2, UploadCloud, X, Loader2,
  CheckCircle2, AlertCircle, PawPrint as Paw, Image as ImageIcon,
  ChevronDown, Sparkles, ExternalLink, Star, ShieldCheck, Clock, MessageSquare,
  Mail, FileText, Phone, AtSign, CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  adminApi, reviewsApi,
  type Puppy, type PuppyPayload, type PuppyStatus, type PuppyColor, type PuppySex,
  type ReviewFromDB, type ReviewSubmitPayload, type ContactMessage,
} from "@/lib/api";

const COLORS: PuppyColor[] = ["bleu merle", "rouge merle", "noir tricolore", "rouge tricolore"];
const SEXES: PuppySex[] = ["Mâle", "Femelle"];
const STATUSES: { value: PuppyStatus; label: string; color: string }[] = [
  { value: "available", label: "Disponible", color: "text-green-600 bg-green-500/10" },
  { value: "reserved", label: "Réservé", color: "text-amber-600 bg-amber-500/10" },
  { value: "sold", label: "Vendu", color: "text-red-600 bg-red-500/10" },
];

const EMPTY_PUPPY: PuppyPayload = {
  name: "", ageWeeks: 8, color: "bleu merle", sex: "Mâle",
  price: 1500, description: "", traits: [], parents: "", images: [], status: "available", isPremium: false,
};

const EMPTY_REVIEW: ReviewSubmitPayload = { name: "", location: "", puppyName: "", rating: 5, text: "" };

interface AdminDashboardProps {
  onLogout: () => void;
  adminEmail: string;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`w-4 h-4 ${n <= rating ? "text-yellow-500 fill-current" : "text-border"}`} />
      ))}
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
          <Star className={`w-7 h-7 transition-colors ${n <= (hovered || value) ? "text-yellow-500 fill-current" : "text-border"}`} />
        </button>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function AdminDashboard({ onLogout, adminEmail }: AdminDashboardProps) {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"chiots" | "avis" | "messages">("chiots");

  // Contract state
  const [contractPuppy, setContractPuppy] = useState<Puppy | null>(null);
  const [contractBuyer, setContractBuyer] = useState({ firstName: "", lastName: "", address: "", city: "", zip: "", phone: "", email: "" });
  const [contractDeposit, setContractDeposit] = useState(300);
  const [contractDate, setContractDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Messages state
  const [deleteMessageConfirm, setDeleteMessageConfirm] = useState<number | null>(null);

  // PDF generation state
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Puppy state
  const [showForm, setShowForm] = useState(false);
  const [editingPuppy, setEditingPuppy] = useState<Puppy | null>(null);
  const [form, setForm] = useState<PuppyPayload>(EMPTY_PUPPY);
  const [traitsInput, setTraitsInput] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Review state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewSubmitPayload>(EMPTY_REVIEW);
  const [reviewFormError, setReviewFormError] = useState("");
  const [deleteReviewConfirm, setDeleteReviewConfirm] = useState<number | null>(null);

  // Puppy queries
  const { data: puppies = [], isLoading } = useQuery<Puppy[]>({
    queryKey: ["admin-puppies"],
    queryFn: adminApi.listPuppies,
  });

  // Review queries
  const { data: allReviews = [], isLoading: reviewsLoading } = useQuery<ReviewFromDB[]>({
    queryKey: ["admin-reviews"],
    queryFn: adminApi.listReviews,
  });

  // Messages queries
  const { data: messages = [], isLoading: messagesLoading } = useQuery<ContactMessage[]>({
    queryKey: ["admin-messages"],
    queryFn: adminApi.listMessages,
    enabled: activeTab === "messages",
  });

  const pendingReviews = allReviews.filter((r) => r.status === "pending");
  const approvedReviews = allReviews.filter((r) => r.status === "approved");

  // Puppy mutations
  const logoutMut = useMutation({ mutationFn: adminApi.logout, onSuccess: onLogout });

  const saveMut = useMutation({
    mutationFn: (data: { id?: number; payload: PuppyPayload }) =>
      data.id ? adminApi.updatePuppy(data.id, data.payload) : adminApi.createPuppy(data.payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-puppies"] });
      qc.invalidateQueries({ queryKey: ["puppies"] });
      setShowForm(false);
      setEditingPuppy(null);
      setForm(EMPTY_PUPPY);
      setTraitsInput("");
      setFormError("");
      setFormSuccess(editingPuppy ? "Chiot mis à jour avec succès." : "Chiot ajouté avec succès.");
      setTimeout(() => setFormSuccess(""), 3000);
    },
    onError: (err) => setFormError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde"),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: PuppyStatus }) => adminApi.setStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-puppies"] }); qc.invalidateQueries({ queryKey: ["puppies"] }); },
  });

  const premiumMut = useMutation({
    mutationFn: ({ id, isPremium }: { id: number; isPremium: boolean }) => adminApi.setPremium(id, isPremium),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-puppies"] }); qc.invalidateQueries({ queryKey: ["puppies"] }); },
  });

  const deleteMut = useMutation({
    mutationFn: adminApi.deletePuppy,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-puppies"] }); qc.invalidateQueries({ queryKey: ["puppies"] }); setDeleteConfirm(null); },
  });

  // Review mutations
  const approveMut = useMutation({
    mutationFn: adminApi.approveReview,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reviews"] }); qc.invalidateQueries({ queryKey: ["approved-reviews"] }); },
  });

  const deleteReviewMut = useMutation({
    mutationFn: adminApi.deleteReview,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reviews"] }); qc.invalidateQueries({ queryKey: ["approved-reviews"] }); setDeleteReviewConfirm(null); },
  });

  const createReviewMut = useMutation({
    mutationFn: adminApi.createReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      qc.invalidateQueries({ queryKey: ["approved-reviews"] });
      setShowReviewForm(false);
      setReviewForm(EMPTY_REVIEW);
      setReviewFormError("");
    },
    onError: (err) => setReviewFormError(err instanceof Error ? err.message : "Erreur lors de l'ajout"),
  });

  // Message mutations
  const deleteMessageMut = useMutation({
    mutationFn: adminApi.deleteMessage,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-messages"] }); setDeleteMessageConfirm(null); },
  });

  // Puppy helpers
  const openAdd = () => { setEditingPuppy(null); setForm(EMPTY_PUPPY); setTraitsInput(""); setFormError(""); setShowForm(true); };
  const openEdit = (p: Puppy) => {
    setEditingPuppy(p);
    setForm({ name: p.name, ageWeeks: p.ageWeeks, color: p.color, sex: p.sex, price: p.price, description: p.description, traits: p.traits, parents: p.parents, images: p.images, status: p.status, isPremium: p.isPremium });
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
    } catch (err) { setFormError(err instanceof Error ? err.message : "Erreur upload image"); }
    finally { setUploadingImages(false); }
  }, []);
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); handleImageUpload(e.dataTransfer.files); }, [handleImageUpload]);
  const removeImage = (idx: number) => setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  const setMainImage = (idx: number) => setForm((prev) => {
    const imgs = [...prev.images];
    const [moved] = imgs.splice(idx, 1);
    imgs.unshift(moved);
    return { ...prev, images: imgs };
  });
  const moveImageUp = (idx: number) => {
    if (idx === 0) return;
    setForm((prev) => {
      const imgs = [...prev.images];
      [imgs[idx - 1], imgs[idx]] = [imgs[idx], imgs[idx - 1]];
      return { ...prev, images: imgs };
    });
  };
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const traits = traitsInput.split(",").map((t) => t.trim()).filter(Boolean);
    saveMut.mutate({ id: editingPuppy?.id, payload: { ...form, traits } });
  };

  const handleReviewFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewFormError("");
    if (!reviewForm.name.trim() || !reviewForm.text.trim()) return;
    createReviewMut.mutate(reviewForm);
  };

  const generateContractPDF = async () => {
    if (!contractPuppy) return;
    setPdfGenerating(true);
    const p = contractPuppy;
    const b = contractBuyer;
    const dateStr = new Date(contractDate + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const solde = p.price - contractDeposit;

    const signatureSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 62" width="210" height="62" style="display:block"><path d="M10,46 C12,28 20,10 32,13 C42,16 44,34 42,46 C40,58 34,62 28,58 C24,54 26,48 32,46 C38,44 44,50 44,50 C49,56 53,54 56,46 C60,38 61,24 68,18 C75,12 80,22 80,33 C80,42 81,48 87,44 C93,40 97,28 106,22 C113,17 118,26 120,37 C122,46 124,51 130,47 C136,43 141,30 150,25 C157,21 163,29 165,40 C167,48 169,54 175,51 C179,48 182,44 186,42" stroke="#0b0b1e" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M8,58 C65,61 130,60 190,58" stroke="#0b0b1e" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.45"/></svg>`;

    const row = (label1: string, val1: string, label2 = "", val2 = "") => `
      <div style="display:flex;gap:24px;margin-bottom:8px">
        <div style="flex:1"><div style="font-size:8pt;color:#666;margin-bottom:2px">${label1}</div><div style="font-size:10.5pt;font-weight:bold;border-bottom:1px solid #bbb;padding-bottom:2px;min-height:20px">${val1}</div></div>
        ${label2 ? `<div style="flex:1"><div style="font-size:8pt;color:#666;margin-bottom:2px">${label2}</div><div style="font-size:10.5pt;font-weight:bold;border-bottom:1px solid #bbb;padding-bottom:2px;min-height:20px">${val2}</div></div>` : '<div style="flex:1"></div>'}
      </div>`;

    const sectionTitle = (t: string) => `<div style="font-size:9.5pt;font-weight:bold;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #ccc;padding-bottom:4px;margin-bottom:10px;color:#444">${t}</div>`;

    const bodyHtml = `
<div style="font-family:'Georgia',serif;font-size:11pt;color:#1a1a1a;background:#fff;max-width:700px;margin:0 auto">
  <h1 style="font-size:17pt;text-align:center;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #1a1a1a;padding-bottom:10px;margin:0 0 5px">Contrat de Réservation</h1>
  <p style="text-align:center;font-size:9pt;color:#555;margin:0 0 20px">Élevage du Berger Bleu — Particulier déclaré DDPP · Bellevaux (74), Haute-Savoie</p>

  <div style="margin-bottom:16px">${sectionTitle("Vendeur")}<div style="border:1px solid #ccc;border-radius:3px;padding:10px 14px;background:#fafafa;font-size:10.5pt;line-height:1.6"><strong>Élevage du Berger Bleu</strong><br>Les Alpages du Berger Bleu, 74470 Bellevaux, Haute-Savoie<br>Tél. : 07 57 81 72 02 · Particulier déclaré DDPP</div></div>

  <div style="margin-bottom:16px">${sectionTitle("Acquéreur")}
    ${row("Nom et prénom", `${b.firstName || "…"} ${b.lastName || "…"}`, "Téléphone", b.phone || "…")}
    ${row("Adresse", b.address || "…", "Code postal · Ville", `${b.zip || "…"} ${b.city || "…"}`)}
    ${row("Email", b.email || "…")}
  </div>

  <div style="margin-bottom:16px">${sectionTitle("Animal Cédé")}
    ${row("Nom", p.name, "Race", "Berger Australien (Australian Shepherd)")}
    ${row("Robe", p.color, "Sexe", p.sex)}
    ${row("Âge à la signature", `${p.ageWeeks} semaines`, "Inscrit au LOF", "Oui — Livre des Origines Français")}
    ${p.parents ? row("Parenté", p.parents) : ""}
  </div>

  <div style="margin-bottom:16px">${sectionTitle("Conditions Financières")}
    <div style="border:1px solid #d97706;border-radius:3px;padding:12px 16px;background:#fffbeb">
      ${row("Prix de vente total", `${p.price.toLocaleString("fr-FR")} €`, "Acompte versé à la signature", `${contractDeposit.toLocaleString("fr-FR")} €`)}
      <div style="display:flex;gap:24px"><div style="flex:1"><div style="font-size:8pt;color:#666;margin-bottom:2px">Solde à verser à la remise du chiot</div><div style="font-size:13pt;font-weight:bold;color:#b45309;border-bottom:1px solid #d97706;padding-bottom:2px">${solde.toLocaleString("fr-FR")} €</div></div><div style="flex:1"></div></div>
    </div>
  </div>

  <div style="margin-bottom:18px">${sectionTitle("Clauses Contractuelles")}
    <p style="margin-bottom:7px;font-size:9pt;line-height:1.55;color:#333"><strong>Art. 1 — Acompte non remboursable.</strong> L'acompte versé est non remboursable en cas de désistement de l'acquéreur, sauf cas de force majeure dûment justifié. En cas de désistement du vendeur, l'acompte sera intégralement restitué.</p>
    <p style="margin-bottom:7px;font-size:9pt;line-height:1.55;color:#333"><strong>Art. 2 — Visite vétérinaire.</strong> L'acquéreur s'engage à soumettre l'animal à un examen vétérinaire dans les <strong>5 jours ouvrables</strong> suivant la remise. Toute anomalie constatée devra être signalée par écrit dans ce délai.</p>
    <p style="margin-bottom:7px;font-size:9pt;line-height:1.55;color:#333"><strong>Art. 3 — Garantie vices rédhibitoires.</strong> Conformément aux articles L. 213-1 et suivants du Code rural, le vendeur garantit l'animal contre les vices rédhibitoires pendant <strong>30 jours</strong> à compter de la remise, sur présentation d'un certificat vétérinaire.</p>
    <p style="margin-bottom:7px;font-size:9pt;line-height:1.55;color:#333"><strong>Art. 4 — Droit de rétractation.</strong> L'acquéreur dispose d'un délai de <strong>14 jours</strong> pour exercer son droit de rétractation à compter de la remise du chiot, sauf si l'état de santé de l'animal l'exige autrement.</p>
    <p style="margin-bottom:7px;font-size:9pt;line-height:1.55;color:#333"><strong>Art. 5 — Conditions de remise.</strong> Le chiot sera remis muni de son carnet de santé, de sa puce électronique, de son certificat de naissance LOF et d'un certificat vétérinaire de bonne santé. L'âge minimal de cession est de <strong>8 semaines</strong> révolues.</p>
    <p style="font-size:9pt;line-height:1.55;color:#333"><strong>Art. 6 — Bien-être animal.</strong> L'acquéreur s'engage à assurer à l'animal des conditions de vie adaptées à ses besoins, conformément à l'article L. 214-1 du Code rural.</p>
  </div>

  <div style="display:flex;gap:40px;margin-top:24px">
    <div style="flex:1;border-top:1px solid #999;padding-top:8px">
      <p style="font-size:8.5pt;color:#555;margin:0 0 8px">Fait à Bellevaux, le ${dateStr}</p>
      <p style="font-size:7.5pt;color:#777;margin:0 0 1px">Lu et approuvé,</p>
      ${signatureSvg}
      <p style="font-size:8pt;color:#555;margin:3px 0 0;font-style:italic">Élevage du Berger Bleu</p>
    </div>
    <div style="flex:1;border-top:1px solid #999;padding-top:8px">
      <p style="font-size:8.5pt;color:#555;margin:0 0 8px">Fait à _____________, le ${dateStr}</p>
      <p style="font-size:7.5pt;color:#777;margin:0 0 1px">Signature de l'acquéreur</p>
      <p style="font-size:7pt;color:#aaa;font-style:italic;margin:0 0 0">(précédée de « Lu et approuvé »)</p>
      <div style="height:68px"></div>
    </div>
  </div>

  <p style="text-align:center;font-size:7.5pt;color:#bbb;margin:28px 0 0;border-top:1px solid #eee;padding-top:10px">Élevage du Berger Bleu · 74470 Bellevaux, Haute-Savoie · 07 57 81 72 02 · Particulier déclaré DDPP</p>
</div>`;

    const container = document.createElement("div");
    container.style.cssText = "position:fixed;left:-9999px;top:0;width:794px;padding:48px 56px;background:#fff;box-sizing:border-box;";
    container.innerHTML = bodyHtml;
    document.body.appendChild(container);

    try {
      await new Promise<void>((r) => setTimeout(r, 250));
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 794,
        windowWidth: 794,
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pW = pdf.internal.pageSize.getWidth();
      const pH = pdf.internal.pageSize.getHeight();
      const pixPerMm = canvas.width / pW;
      const pageHeightPx = pH * pixPerMm;

      let yOffset = 0;
      let page = 0;
      while (yOffset < canvas.height) {
        if (page > 0) pdf.addPage();
        const sliceH = Math.min(pageHeightPx, canvas.height - yOffset);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.ceil(sliceH);
        sliceCanvas.getContext("2d")?.drawImage(canvas, 0, yOffset, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        const sliceImgH = (sliceH * pW) / canvas.width;
        pdf.addImage(sliceCanvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pW, sliceImgH);
        yOffset += pageHeightPx;
        page++;
      }
      pdf.save(`Contrat_reservation_${p.name}_${contractDate}.pdf`);
    } finally {
      document.body.removeChild(container);
      setPdfGenerating(false);
    }
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
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="rounded-xl gap-1.5 text-muted-foreground">
              <ExternalLink className="w-4 h-4" /> Voir le site
            </Button>
          </a>
          <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => logoutMut.mutate()}>
            <LogOut className="w-4 h-4" /> Déconnexion
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Success toast */}
        {formSuccess && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-green-500/10 text-green-700 rounded-xl text-sm border border-green-500/20">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {formSuccess}
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("chiots")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              activeTab === "chiots" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Paw className="w-4 h-4" /> Nos Chiots
            <span className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "chiots" ? "bg-primary/10" : "bg-secondary"}`}>{puppies.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("avis")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              activeTab === "avis" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Avis Clients
            {pendingReviews.length > 0 && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500 text-white">
                {pendingReviews.length} en attente
              </span>
            )}
            {pendingReviews.length === 0 && (
              <span className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "avis" ? "bg-primary/10" : "bg-secondary"}`}>{allReviews.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              activeTab === "messages" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mail className="w-4 h-4" /> Messages
            {activeTab !== "messages" && messages.length > 0 && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-bold bg-secondary">{messages.length}</span>
            )}
          </button>
        </div>

        {/* ─── TAB: CHIOTS ─── */}
        {activeTab === "chiots" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-serif text-3xl font-bold">Nos Chiots</h1>
                <p className="text-muted-foreground mt-1">Gérez les annonces publiées sur le site</p>
              </div>
              <Button onClick={openAdd} className="gap-2 rounded-xl h-11 px-5">
                <Plus className="w-4 h-4" /> Ajouter un chiot
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
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
                    <div key={p.id} className={`bg-card rounded-2xl overflow-hidden shadow-sm transition-all ${p.isPremium ? "border-2 border-yellow-400/60 shadow-yellow-400/10" : "border border-border"}`}>
                      <div className="relative aspect-[4/3]">
                        {p.images[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center"><ImageIcon className="w-12 h-12 text-muted-foreground/30" /></div>
                        )}
                        {p.isPremium && (
                          <div className="absolute top-0 left-0 right-0 flex justify-start px-3 pt-2.5">
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-white text-xs font-bold shadow">
                              <Sparkles className="w-3 h-3" /> À la Une
                            </div>
                          </div>
                        )}
                        <div className={`absolute ${p.isPremium ? "top-12" : "top-3"} left-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${st.color}`}>{st.label}</div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-serif text-xl font-bold">{p.name}</h3>
                          <span className="font-bold text-primary">{p.price.toLocaleString("fr-FR")} €</span>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize mb-4">{p.color} • {p.sex} • {p.ageWeeks} semaines</p>

                        <button
                          onClick={() => premiumMut.mutate({ id: p.id, isPremium: !p.isPremium })}
                          disabled={premiumMut.isPending}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold mb-3 transition-all border ${
                            p.isPremium
                              ? "bg-gradient-to-r from-amber-500 to-amber-400 text-white border-transparent shadow-md hover:opacity-90"
                              : "bg-secondary border-border hover:border-amber-400/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-foreground"
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                          {p.isPremium ? "Retirer de la Une" : "Mettre À la Une"}
                        </button>

                        <div className="relative mb-3">
                          <select value={p.status} onChange={(e) => statusMut.mutate({ id: p.id, status: e.target.value as PuppyStatus })}
                            className="w-full appearance-none bg-secondary border border-border rounded-xl px-4 py-2.5 pr-9 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50">
                            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>

                        <div className="flex gap-2 mb-2">
                          <Button variant="outline" size="sm" className="flex-1 gap-1.5 rounded-xl" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /> Modifier</Button>
                          <Button variant="outline" size="sm" className="flex-1 gap-1.5 rounded-xl text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => setDeleteConfirm(p.id)}><Trash2 className="w-4 h-4" /> Supprimer</Button>
                        </div>
                        {p.status === "reserved" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-1.5 rounded-xl text-amber-700 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                            onClick={() => {
                              setContractPuppy(p);
                              setContractBuyer({ firstName: "", lastName: "", address: "", city: "", zip: "", phone: "", email: "" });
                              setContractDeposit(300);
                              setContractDate(new Date().toISOString().split("T")[0]);
                            }}
                          >
                            <FileText className="w-4 h-4" /> Générer le contrat
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ─── TAB: AVIS ─── */}
        {activeTab === "avis" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-serif text-3xl font-bold">Avis Clients</h1>
                <p className="text-muted-foreground mt-1">
                  Modérez les avis soumis et ajoutez des témoignages directement
                </p>
              </div>
              <Button onClick={() => { setShowReviewForm(true); setReviewFormError(""); setReviewForm(EMPTY_REVIEW); }} className="gap-2 rounded-xl h-11 px-5">
                <Plus className="w-4 h-4" /> Ajouter un avis
              </Button>
            </div>

            {reviewsLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-10">
                {/* Pending reviews */}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-semibold">
                      <Clock className="w-4 h-4" /> En attente de validation ({pendingReviews.length})
                    </div>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {pendingReviews.length === 0 ? (
                    <div className="text-center py-10 bg-card rounded-2xl border border-dashed border-border">
                      <CheckCircle2 className="w-10 h-10 text-green-500/40 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">Aucun avis en attente — tout est à jour.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {pendingReviews.map((r) => (
                        <div key={r.id} className="bg-card border border-amber-400/30 rounded-2xl p-5 shadow-sm">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{r.name}</p>
                                {r.location && <span className="text-xs text-muted-foreground">· {r.location}</span>}
                              </div>
                              {r.puppyName && <p className="text-xs text-primary mt-0.5">Chiot : {r.puppyName}</p>}
                              <p className="text-xs text-muted-foreground mt-0.5">{formatDate(r.createdAt)}</p>
                            </div>
                            <StarDisplay rating={r.rating} />
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-4">{r.text}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 gap-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white"
                              disabled={approveMut.isPending}
                              onClick={() => approveMut.mutate(r.id)}
                            >
                              <ShieldCheck className="w-4 h-4" /> Valider
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 gap-1.5 rounded-xl text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => setDeleteReviewConfirm(r.id)}
                            >
                              <Trash2 className="w-4 h-4" /> Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Approved reviews */}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-semibold">
                      <ShieldCheck className="w-4 h-4" /> Publiés sur le site ({approvedReviews.length})
                    </div>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {approvedReviews.length === 0 ? (
                    <div className="text-center py-10 bg-card rounded-2xl border border-dashed border-border">
                      <Star className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">Aucun avis approuvé pour l'instant.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {approvedReviews.map((r) => (
                        <div key={r.id} className="bg-card border border-green-400/20 rounded-2xl p-5 shadow-sm">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{r.name}</p>
                                {r.location && <span className="text-xs text-muted-foreground">· {r.location}</span>}
                                <span className="flex items-center gap-0.5 text-[10px] text-green-600 dark:text-green-400 font-medium">
                                  <ShieldCheck className="w-3 h-3" /> Publié
                                </span>
                              </div>
                              {r.puppyName && <p className="text-xs text-primary mt-0.5">Chiot : {r.puppyName}</p>}
                              <p className="text-xs text-muted-foreground mt-0.5">{formatDate(r.createdAt)}</p>
                            </div>
                            <StarDisplay rating={r.rating} />
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{r.text}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 rounded-xl text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={() => setDeleteReviewConfirm(r.id)}
                          >
                            <Trash2 className="w-4 h-4" /> Supprimer
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── TAB: MESSAGES ─── */}
        {activeTab === "messages" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-serif text-3xl font-bold">Messages reçus</h1>
                <p className="text-muted-foreground mt-1">Contacts et demandes de réservation soumis via le site</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 rounded-xl" onClick={() => qc.invalidateQueries({ queryKey: ["admin-messages"] })}>
                Actualiser
              </Button>
            </div>

            {messagesLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary/40" /></div>
            ) : messages.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-lg font-medium">Aucun message pour l'instant</p>
                <p className="text-sm mt-1">Les contacts et demandes de réservation apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                            msg.type === "reservation"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                              : "bg-primary/10 text-primary"
                          }`}>
                            {msg.type === "reservation" ? <Paw className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                            {msg.type === "reservation" ? "Réservation" : "Contact"}
                          </span>
                          {msg.puppyName && (
                            <span className="text-xs bg-secondary px-2.5 py-1 rounded-full font-medium">
                              Chiot : {msg.puppyName}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                            <CalendarDays className="w-3 h-3" />
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                        <p className="font-semibold text-base">{msg.firstName} {msg.lastName}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><AtSign className="w-3 h-3" />{msg.email}</span>
                          {msg.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{msg.phone}</span>}
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-foreground/80 bg-secondary/40 rounded-xl px-4 py-3">{msg.message}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 rounded-xl text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950 flex-shrink-0"
                        onClick={() => setDeleteMessageConfirm(msg.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── PUPPY FORM MODAL ─── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-card text-card-foreground w-full max-w-2xl rounded-3xl shadow-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-serif text-2xl font-bold">{editingPuppy ? `Modifier — ${editingPuppy.name}` : "Ajouter un chiot"}</h2>
              <button onClick={() => setShowForm(false)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors">
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
                    <select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value as PuppyColor })} className="w-full appearance-none bg-background border border-input rounded-xl px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      {COLORS.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Sexe *</label>
                  <div className="relative">
                    <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value as PuppySex })} className="w-full appearance-none bg-background border border-input rounded-xl px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
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
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PuppyStatus })} className="w-full appearance-none bg-background border border-input rounded-xl px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${form.isPremium ? "bg-gradient-to-br from-amber-500 to-amber-400 text-white" : "bg-secondary text-muted-foreground"}`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Mettre À la Une</p>
                    <p className="text-xs text-muted-foreground">Mise en avant en tête de liste dans un encadré dédié</p>
                  </div>
                </div>
                <button type="button" onClick={() => setForm((f) => ({ ...f, isPremium: !f.isPremium }))} className={`relative w-12 h-6 rounded-full transition-colors ${form.isPremium ? "bg-amber-500" : "bg-border"}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isPremium ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Description</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Décrivez le chiot..." className="h-24 bg-background" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Traits de caractère <span className="text-muted-foreground font-normal">(séparés par des virgules)</span></label>
                <Input value={traitsInput} onChange={(e) => setTraitsInput(e.target.value)} placeholder="Joueur, Curieux, Affectueux" className="bg-background" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Parents</label>
                <Input value={form.parents} onChange={(e) => setForm({ ...form, parents: e.target.value })} placeholder="Luna (Bleu Merle) x Orion (Noir Tricolore)" className="bg-background" />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium">Photos</label>
                <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} onClick={() => document.getElementById("image-upload-input")?.click()}>
                  <input id="image-upload-input" type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />
                  {uploadingImages ? (
                    <div className="flex flex-col items-center gap-2"><Loader2 className="w-8 h-8 animate-spin text-primary" /><p className="text-sm text-muted-foreground">Upload en cours...</p></div>
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
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {form.images.length} photo{form.images.length > 1 ? "s" : ""} — la 1ère est affichée en couverture. Cliquez sur une photo pour la définir en principale.
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {form.images.map((url, i) => (
                        <div
                          key={i}
                          className={`relative group aspect-[4/3] rounded-xl overflow-hidden bg-secondary transition-all ${i === 0 ? "ring-2 ring-primary border-2 border-primary" : "border border-border hover:border-primary/50 cursor-pointer"}`}
                          onClick={i !== 0 ? () => setMainImage(i) : undefined}
                          title={i !== 0 ? "Cliquer pour définir en principale" : undefined}
                        >
                          <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />

                          {/* Badge principale / numéro */}
                          {i === 0 ? (
                            <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                              ★ Principale
                            </div>
                          ) : (
                            <div className="absolute top-1.5 left-1.5 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {i + 1}
                            </div>
                          )}

                          {/* Overlay "Définir en principale" au hover (non-main) */}
                          {i !== 0 && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-[11px] font-semibold text-center px-2">Définir en<br />principale</span>
                            </div>
                          )}

                          {/* Bouton supprimer */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full items-center justify-center hidden group-hover:flex shadow"
                            title="Supprimer cette photo"
                          >
                            <X className="w-3 h-3" />
                          </button>

                          {/* Bouton monter (← vers la gauche) */}
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); moveImageUp(i); }}
                              className="absolute bottom-1.5 left-1.5 w-6 h-6 bg-black/60 text-white rounded-full items-center justify-center hidden group-hover:flex shadow text-[10px] font-bold"
                              title="Déplacer vers la gauche"
                            >
                              ←
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Zone d'ajout rapide supplémentaire en fin de grille */}
                      <div
                        className="aspect-[4/3] rounded-xl border-2 border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors"
                        onClick={() => document.getElementById("image-upload-input")?.click()}
                        title="Ajouter d'autres photos"
                      >
                        <UploadCloud className="w-5 h-5 text-muted-foreground/60" />
                        <span className="text-[10px] text-muted-foreground font-medium">Ajouter</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {formError && <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-600 rounded-xl text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" />{formError}</div>}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setShowForm(false)}>Annuler</Button>
                <Button type="submit" disabled={saveMut.isPending} className="flex-1 rounded-xl h-12">
                  {saveMut.isPending ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde...</span> : editingPuppy ? "Sauvegarder les modifications" : "Ajouter le chiot"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ADD REVIEW MODAL ─── */}
      {showReviewForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowReviewForm(false)} />
          <div className="relative bg-card text-card-foreground w-full max-w-lg rounded-3xl shadow-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="font-serif text-2xl font-bold">Ajouter un avis</h2>
                <p className="text-xs text-muted-foreground mt-0.5">L'avis sera immédiatement publié sur le site</p>
              </div>
              <button onClick={() => setShowReviewForm(false)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleReviewFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Nom du client *</label>
                  <Input value={reviewForm.name} onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })} required placeholder="Sophie M." className="bg-background" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Ville / Pays</label>
                  <Input value={reviewForm.location} onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })} placeholder="Lyon, France" className="bg-background" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Chiot adopté <span className="text-muted-foreground font-normal">(optionnel)</span></label>
                <Input value={reviewForm.puppyName} onChange={(e) => setReviewForm({ ...reviewForm, puppyName: e.target.value })} placeholder="Luna — Bleu Merle" className="bg-background" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Note *</label>
                <StarPicker value={reviewForm.rating} onChange={(v) => setReviewForm({ ...reviewForm, rating: v })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Témoignage *</label>
                <Textarea value={reviewForm.text} onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })} required placeholder="Entrez le témoignage du client..." className="h-28 bg-background" minLength={10} />
              </div>
              {reviewFormError && <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-600 rounded-xl text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" />{reviewFormError}</div>}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setShowReviewForm(false)}>Annuler</Button>
                <Button type="submit" disabled={createReviewMut.isPending} className="flex-1 rounded-xl h-12">
                  {createReviewMut.isPending ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Publication...</span> : "Publier l'avis"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE PUPPY CONFIRMATION ─── */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-4"><Trash2 className="w-6 h-6" /></div>
            <h3 className="font-serif text-xl font-bold mb-2">Supprimer l'annonce ?</h3>
            <p className="text-muted-foreground text-sm mb-6">Cette action est irréversible. L'annonce sera définitivement supprimée du site.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
              <Button className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white border-none" disabled={deleteMut.isPending} onClick={() => deleteMut.mutate(deleteConfirm)}>
                {deleteMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Supprimer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DELETE REVIEW CONFIRMATION ─── */}
      {deleteReviewConfirm !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setDeleteReviewConfirm(null)} />
          <div className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-4"><Trash2 className="w-6 h-6" /></div>
            <h3 className="font-serif text-xl font-bold mb-2">Supprimer cet avis ?</h3>
            <p className="text-muted-foreground text-sm mb-6">L'avis sera définitivement supprimé et ne sera plus visible sur le site.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteReviewConfirm(null)}>Annuler</Button>
              <Button className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white border-none" disabled={deleteReviewMut.isPending} onClick={() => deleteReviewMut.mutate(deleteReviewConfirm)}>
                {deleteReviewMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Supprimer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DELETE MESSAGE CONFIRMATION ─── */}
      {deleteMessageConfirm !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setDeleteMessageConfirm(null)} />
          <div className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-4"><Trash2 className="w-6 h-6" /></div>
            <h3 className="font-serif text-xl font-bold mb-2">Supprimer ce message ?</h3>
            <p className="text-muted-foreground text-sm mb-6">Le message sera définitivement supprimé.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteMessageConfirm(null)}>Annuler</Button>
              <Button className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white border-none" disabled={deleteMessageMut.isPending} onClick={() => deleteMessageMut.mutate(deleteMessageConfirm)}>
                {deleteMessageMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Supprimer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CONTRACT MODAL ─── */}
      {contractPuppy && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setContractPuppy(null)} />
          <div className="relative bg-card text-card-foreground w-full max-w-2xl rounded-3xl shadow-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="font-serif text-2xl font-bold">Contrat de réservation</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Remplissez les informations de l'acquéreur, puis imprimez</p>
              </div>
              <button onClick={() => setContractPuppy(null)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-200/50 dark:border-amber-900/30">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">Chiot concerné</p>
                <p className="font-semibold">{contractPuppy.name} — {contractPuppy.color} · {contractPuppy.sex}</p>
                <p className="text-sm text-muted-foreground">{contractPuppy.ageWeeks} semaines · Prix de vente : {contractPuppy.price.toLocaleString("fr-FR")} €</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Prénom acquéreur *</label>
                  <Input value={contractBuyer.firstName} onChange={(e) => setContractBuyer({ ...contractBuyer, firstName: e.target.value })} placeholder="Marie" className="bg-background" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Nom acquéreur *</label>
                  <Input value={contractBuyer.lastName} onChange={(e) => setContractBuyer({ ...contractBuyer, lastName: e.target.value })} placeholder="Dupont" className="bg-background" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Adresse</label>
                <Input value={contractBuyer.address} onChange={(e) => setContractBuyer({ ...contractBuyer, address: e.target.value })} placeholder="12 rue des Lilas" className="bg-background" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Code postal</label>
                  <Input value={contractBuyer.zip} onChange={(e) => setContractBuyer({ ...contractBuyer, zip: e.target.value })} placeholder="69000" className="bg-background" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Ville</label>
                  <Input value={contractBuyer.city} onChange={(e) => setContractBuyer({ ...contractBuyer, city: e.target.value })} placeholder="Lyon" className="bg-background" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Téléphone</label>
                  <Input value={contractBuyer.phone} onChange={(e) => setContractBuyer({ ...contractBuyer, phone: e.target.value })} placeholder="06 12 34 56 78" className="bg-background" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Email</label>
                  <Input value={contractBuyer.email} onChange={(e) => setContractBuyer({ ...contractBuyer, email: e.target.value })} placeholder="marie@example.com" className="bg-background" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Acompte (€)</label>
                  <Input type="number" min={0} value={contractDeposit} onChange={(e) => setContractDeposit(parseInt(e.target.value, 10) || 0)} className="bg-background" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Date du contrat</label>
                  <Input type="date" value={contractDate} onChange={(e) => setContractDate(e.target.value)} className="bg-background" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setContractPuppy(null)}>Annuler</Button>
                <Button
                  type="button"
                  className="flex-1 rounded-xl h-12 gap-2"
                  disabled={pdfGenerating}
                  onClick={generateContractPDF}
                >
                  {pdfGenerating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Génération en cours...</>
                  ) : (
                    <><FileText className="w-4 h-4" /> Télécharger le PDF</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
