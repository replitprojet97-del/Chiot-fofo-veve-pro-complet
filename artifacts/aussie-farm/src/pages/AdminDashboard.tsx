import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, LogOut, Pencil, Trash2, UploadCloud, X, Loader2,
  CheckCircle2, AlertCircle, PawPrint as Paw, Image as ImageIcon,
  ChevronDown, Sparkles, ExternalLink, Star, ShieldCheck, Clock, MessageSquare,
  Mail, FileText, Phone, AtSign, CalendarDays, BookOpen, Info, Download,
  Eye, EyeOff, ArrowRight, HelpCircle, Lightbulb, Baby,
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
  const [activeTab, setActiveTab] = useState<"guide" | "chiots" | "avis" | "messages">("guide");

  // Contract state
  const [contractPuppy, setContractPuppy] = useState<Puppy | null>(null);
  const [contractBuyer, setContractBuyer] = useState({ firstName: "", lastName: "", address: "", city: "", zip: "", phone: "", email: "" });
  const [contractDeposit, setContractDeposit] = useState(300);
  const [contractSecondPayment, setContractSecondPayment] = useState(0);
  const [contractDate, setContractDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Messages state
  const [deleteMessageConfirm, setDeleteMessageConfirm] = useState<number | null>(null);

  // PDF generation state
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // 2FA state
  const [show2faModal, setShow2faModal] = useState(false);
  const [twoFaStep, setTwoFaStep] = useState<"status" | "setup" | "confirm" | "disable">("status");
  const [twoFaQrCode, setTwoFaQrCode] = useState("");
  const [twoFaSecret, setTwoFaSecret] = useState("");
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaPassword, setTwoFaPassword] = useState("");
  const [twoFaError, setTwoFaError] = useState("");
  const [twoFaLoading, setTwoFaLoading] = useState(false);

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

  // 2FA query
  const { data: twoFaStatus, refetch: refetch2faStatus } = useQuery<{ totpEnabled: boolean }>({
    queryKey: ["admin-2fa-status"],
    queryFn: adminApi.get2faStatus,
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

  const open2faModal = () => {
    setTwoFaStep("status");
    setTwoFaCode("");
    setTwoFaPassword("");
    setTwoFaError("");
    setTwoFaQrCode("");
    setTwoFaSecret("");
    setShow2faModal(true);
  };

  const handle2faSetup = async () => {
    setTwoFaLoading(true);
    setTwoFaError("");
    try {
      const data = await adminApi.setup2fa();
      setTwoFaQrCode(data.qrCode);
      setTwoFaSecret(data.secret);
      setTwoFaStep("setup");
    } catch (err) {
      setTwoFaError(err instanceof Error ? err.message : "Erreur serveur");
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handle2faConfirm = async () => {
    if (twoFaCode.length < 6) return;
    setTwoFaLoading(true);
    setTwoFaError("");
    try {
      await adminApi.confirm2fa(twoFaCode);
      await refetch2faStatus();
      setTwoFaStep("status");
      setTwoFaCode("");
      setTwoFaQrCode("");
      setTwoFaSecret("");
    } catch (err) {
      setTwoFaError(err instanceof Error ? err.message : "Code incorrect");
      setTwoFaCode("");
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handle2faDisable = async () => {
    if (!twoFaPassword) return;
    setTwoFaLoading(true);
    setTwoFaError("");
    try {
      await adminApi.disable2fa(twoFaPassword);
      await refetch2faStatus();
      setTwoFaStep("status");
      setTwoFaPassword("");
    } catch (err) {
      setTwoFaError(err instanceof Error ? err.message : "Mot de passe incorrect");
    } finally {
      setTwoFaLoading(false);
    }
  };

  const generateContractPDF = async () => {
    if (!contractPuppy) return;
    setPdfGenerating(true);
    const p = contractPuppy;
    const b = contractBuyer;
    const dateStr = new Date(contractDate + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const solde = p.price - contractDeposit;
    const auDepart = solde - contractSecondPayment;

    const sigUrl = `${window.location.origin}/images/signature-vendeur.png`;
    const refNum = `BB-${contractDate.replace(/-/g, "")}-${p.name.toUpperCase().replace(/\s+/g, "")}`;

    const field = (label: string, value: string, grow = 1) => `
      <div style="flex:${grow};min-width:0">
        <div style="font-size:6.5pt;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;margin-bottom:2px">${label}</div>
        <div style="font-size:9.5pt;font-weight:600;color:#111827;border-bottom:1px solid #d1d5db;padding-bottom:3px;min-height:20px;line-height:1.4">${value || "—"}</div>
      </div>`;

    const bodyHtml = `
<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#fff;width:794px;height:1123px;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden">

  <!-- HEADER -->
  <div style="background:#1c4a35;padding:22px 44px 18px;flex-shrink:0">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:14px">
        <div style="width:48px;height:48px;background:rgba(255,255,255,0.12);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="5" cy="7" rx="2" ry="3" fill="rgba(255,255,255,0.9)"/>
            <ellipse cx="9" cy="4.5" rx="1.8" ry="2.6" fill="rgba(255,255,255,0.9)"/>
            <ellipse cx="15" cy="4.5" rx="1.8" ry="2.6" fill="rgba(255,255,255,0.9)"/>
            <ellipse cx="19" cy="7" rx="2" ry="3" fill="rgba(255,255,255,0.9)"/>
            <path d="M12 9C8.5 9 6 11.5 6 15C6 17.5 7.5 19.5 9.5 20.5C10.5 21 11.2 21 12 21C12.8 21 13.5 21 14.5 20.5C16.5 19.5 18 17.5 18 15C18 11.5 15.5 9 12 9Z" fill="rgba(255,255,255,0.9)"/>
          </svg>
        </div>
        <div>
          <div style="font-size:16pt;font-weight:800;color:#ffffff;letter-spacing:-0.3px;line-height:1.1">Élevage du Berger Bleu</div>
          <div style="font-size:7.5pt;color:rgba(255,255,255,0.65);margin-top:2px;letter-spacing:0.3px">Bergers Australiens LOF · Bellevaux, Haute-Savoie</div>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-size:6.5pt;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.5);margin-bottom:2px">Réf. contrat</div>
        <div style="font-size:8pt;font-weight:700;color:rgba(255,255,255,0.9);font-family:monospace">${refNum}</div>
        <div style="font-size:6.5pt;color:rgba(255,255,255,0.5);margin-top:3px">${dateStr}</div>
      </div>
    </div>
  </div>

  <!-- TITLE BAND -->
  <div style="background:#f0f7f4;border-bottom:2px solid #2d6a4f;padding:10px 44px;flex-shrink:0;display:flex;align-items:center;justify-content:space-between">
    <div>
      <div style="font-size:13pt;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#1c4a35">Contrat de Réservation</div>
      <div style="font-size:7pt;color:#6b7280;margin-top:1px">Cession d'animal de compagnie — Particulier déclaré DDPP</div>
    </div>
    <div style="background:#2d6a4f;color:white;font-size:7pt;font-weight:700;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px">Original</div>
  </div>

  <!-- CONTENT -->
  <div style="padding:16px 44px 0;flex:1;display:flex;flex-direction:column;overflow:hidden">

    <!-- VENDEUR + ACQUÉREUR side by side -->
    <div style="display:flex;gap:16px;margin-bottom:10px">
      <div style="flex:1;background:#f8fffe;border:1px solid #d1fae5;border-radius:8px;padding:10px 12px">
        <div style="display:flex;align-items:center;gap:5px;margin-bottom:7px">
          <div style="width:16px;height:16px;background:#2d6a4f;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:8px;color:white;flex-shrink:0">V</div>
          <div style="font-size:6.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#2d6a4f">Vendeur</div>
        </div>
        <div style="font-size:8.5pt;font-weight:700;color:#111827;line-height:1.4">MR JESSE BOUCHAND</div>
        <div style="font-size:7.5pt;color:#4b5563;line-height:1.5;margin-top:1px">Élevage du Berger Bleu<br>Les Alpages du Berger Bleu, 74470 Bellevaux<br>Tél. : 07 57 81 72 02 · DDPP déclaré</div>
      </div>
      <div style="flex:1.4;background:#fafafa;border:1px solid #e5e7eb;border-radius:8px;padding:10px 12px">
        <div style="display:flex;align-items:center;gap:5px;margin-bottom:7px">
          <div style="width:16px;height:16px;background:#374151;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:8px;color:white;flex-shrink:0">A</div>
          <div style="font-size:6.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#374151">Acquéreur</div>
        </div>
        <div style="display:flex;gap:10px;margin-bottom:6px">
          ${field("Nom et prénom", `${b.firstName || ""} ${b.lastName || ""}`.trim(), 2)}
          ${field("Téléphone", b.phone || "")}
        </div>
        <div style="display:flex;gap:10px;margin-bottom:6px">
          ${field("Adresse", b.address || "", 2)}
          ${field("Code postal · Ville", b.zip && b.city ? `${b.zip} ${b.city}` : (b.zip || b.city || ""))}
        </div>
        <div style="display:flex;gap:10px">
          ${field("Email", b.email || "", 2)}
        </div>
      </div>
    </div>

    <!-- ANIMAL + FINANCES side by side -->
    <div style="display:flex;gap:16px;margin-bottom:10px">
      <div style="flex:1.4;background:#fafafa;border:1px solid #e5e7eb;border-radius:8px;padding:10px 12px">
        <div style="display:flex;align-items:center;gap:5px;margin-bottom:7px">
          <div style="width:16px;height:16px;background:#4f46e5;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:8px;color:white;flex-shrink:0">🐾</div>
          <div style="font-size:6.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#4f46e5">Animal cédé</div>
        </div>
        <div style="display:flex;gap:10px;margin-bottom:6px">
          ${field("Nom du chiot", p.name)}
          ${field("Race", "Berger Australien")}
        </div>
        <div style="display:flex;gap:10px;margin-bottom:6px">
          ${field("Robe", p.color)}
          ${field("Sexe", p.sex)}
          ${field("Âge (semaines)", String(p.ageWeeks))}
        </div>
        <div style="display:flex;gap:10px">
          ${field("Inscrit au LOF", "Oui — Livre des Origines Français", 2)}
          ${p.parents ? field("Parenté", p.parents, 2) : ""}
        </div>
      </div>
      <div style="flex:1;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px 12px">
        <div style="display:flex;align-items:center;gap:5px;margin-bottom:7px">
          <div style="width:16px;height:16px;background:#d97706;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:8px;color:white;flex-shrink:0">€</div>
          <div style="font-size:6.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#b45309">Conditions financières</div>
        </div>
        <div style="margin-bottom:8px">
          <div style="font-size:6.5pt;text-transform:uppercase;letter-spacing:0.5px;color:#92400e;margin-bottom:1px">Prix de vente total</div>
          <div style="font-size:13pt;font-weight:800;color:#111827">${p.price.toLocaleString("fr-FR")} €</div>
        </div>
        <div style="display:flex;gap:6px;margin-bottom:8px">
          <div style="flex:1;background:rgba(255,255,255,0.7);border-radius:5px;padding:6px 8px">
            <div style="font-size:5.5pt;color:#92400e;margin-bottom:1px">Acompte versé</div>
            <div style="font-size:9.5pt;font-weight:700;color:#d97706">${contractDeposit.toLocaleString("fr-FR")} €</div>
          </div>
          <div style="flex:1;background:#2d6a4f;border-radius:5px;padding:6px 8px">
            <div style="font-size:5.5pt;color:rgba(255,255,255,0.7);margin-bottom:1px">Solde restant</div>
            <div style="font-size:9.5pt;font-weight:700;color:#ffffff">${solde.toLocaleString("fr-FR")} €</div>
          </div>
        </div>
        <div style="font-size:6.5pt;color:#92400e;font-style:italic;line-height:1.4">Règlement en 3 tranches — acompte à la réservation, second virement dès réception du contrat signé, solde au départ du chiot.</div>
      </div>
    </div>

    <!-- CLAUSES -->
    <div style="flex:1;background:#fafafa;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;margin-bottom:10px;display:flex;flex-direction:column">
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:10px;flex-shrink:0">
        <div style="width:16px;height:16px;background:#1f2937;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:8px;color:white;flex-shrink:0">§</div>
        <div style="font-size:6.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#1f2937">Clauses contractuelles</div>
        <div style="flex:1;height:1px;background:#e5e7eb;margin-left:4px"></div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;justify-content:space-between">
        <p style="margin:0 0 8px;font-size:7.5pt;line-height:1.55;color:#374151"><strong style="color:#111827">Art. 1 — Annulation de la réservation.</strong> Si l'acquéreur annule cette réservation, l'acompte versé est définitivement perdu pour lui. Si le vendeur ne peut pas fournir le chiot réservé, l'acompte est intégralement restitué à l'acquéreur.</p>
        <p style="margin:0 0 8px;font-size:7.5pt;line-height:1.55;color:#374151"><strong style="color:#111827">Art. 2 — Propriété du chiot.</strong> Le chiot reste la propriété du vendeur jusqu'au paiement intégral du prix de vente. L'acquéreur bénéficie d'un délai de <strong>14 jours</strong> de rétractation et sera immédiatement remboursé si le chiot de son choix ne lui convient pas lors de la visite.</p>
        <p style="margin:0 0 8px;font-size:7.5pt;line-height:1.55;color:#374151"><strong style="color:#111827">Art. 3 — Révocabilité pour maladie.</strong> La réservation du chiot est révocable en cas de maladie grave détectée avant l'acquisition définitive, engageant la survie du chiot, sa bonne santé ou son espérance de vie. Le vendeur s'engage à en informer l'acquéreur dans les meilleurs délais et à lui restituer l'intégralité de l'acompte versé.</p>
        <p style="margin:0 0 8px;font-size:7.5pt;line-height:1.55;color:#374151"><strong style="color:#111827">Art. 4 — Finalisation &amp; attestation de vente.</strong> Pour finaliser la vente et établir le titre de nouveau propriétaire, l'acquéreur procédera à un second virement de <strong>${contractSecondPayment > 0 ? contractSecondPayment.toLocaleString("fr-FR") + " €" : "_____ €"}</strong> dès réception du présent document dûment signé, afin d'obtenir le permis de visite qui lui sera délivré en titre de nouvelle famille. Les <strong>${contractSecondPayment > 0 ? auDepart.toLocaleString("fr-FR") + " €" : "_____ €"}</strong> restants seront réglés au départ du chiot.</p>
        <p style="margin:0 0 8px;font-size:7.5pt;line-height:1.55;color:#374151"><strong style="color:#111827">Art. 5 — Retour du contrat.</strong> À réception du présent contrat de réservation, celui-ci devra être retourné dûment signé par l'acquéreur, accompagné du justificatif du second virement. Le chiot sera remis muni de son carnet de santé, de sa puce électronique et de son certificat de naissance LOF.</p>
        <p style="margin:0;font-size:7.5pt;line-height:1.55;color:#374151"><strong style="color:#111827">Art. 6 — Conformité légale.</strong> La présente réservation est conforme aux conditions prescrites par le code civil et par le code rural, notamment en ce qui concerne les vices rédhibitoires. L'acquéreur s'engage à assurer à l'animal des conditions de vie adaptées à ses besoins, conformément à l'article L. 214-1 du Code rural.</p>
      </div>
    </div>

    <!-- SIGNATURES -->
    <div style="display:flex;gap:16px;margin-bottom:12px">
      <div style="flex:1;border:1px solid #d1d5db;border-radius:8px;padding:12px 16px;background:#fff">
        <div style="font-size:6.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#374151;margin-bottom:4px">Le vendeur</div>
        <div style="font-size:8pt;font-weight:600;color:#111827;margin-bottom:1px">MR JESSE BOUCHAND</div>
        <div style="font-size:6.5pt;color:#6b7280;margin-bottom:8px">Fait à Bellevaux, le ${dateStr}</div>
        <img src="${sigUrl}" alt="Signature vendeur" style="height:90px;width:auto;display:block;object-fit:contain;max-width:220px" crossorigin="anonymous" />
      </div>
      <div style="flex:1;border:1px dashed #d1d5db;border-radius:8px;padding:12px 16px;background:#fafafa">
        <div style="font-size:6.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#374151;margin-bottom:4px">L'acquéreur</div>
        <div style="font-size:8pt;color:#111827;margin-bottom:1px">${b.firstName || ""} ${b.lastName || ""}</div>
        <div style="font-size:6.5pt;color:#6b7280;margin-bottom:16px">Fait à ________, le ${dateStr}</div>
        <div style="height:58px;border-bottom:1px solid #9ca3af"></div>
        <div style="font-size:6.5pt;color:#9ca3af;font-style:italic;margin-top:4px">Précédée de « Lu et approuvé »</div>
      </div>
    </div>

  </div>

  <!-- FOOTER -->
  <div style="background:#1c4a35;padding:8px 44px;flex-shrink:0;display:flex;align-items:center;justify-content:space-between">
    <div style="font-size:6.5pt;color:rgba(255,255,255,0.6)">Élevage du Berger Bleu · Les Alpages du Berger Bleu, 74470 Bellevaux, Haute-Savoie</div>
    <div style="font-size:6.5pt;color:rgba(255,255,255,0.6)">07 57 81 72 02 · contact@berger-bleu.com · Particulier déclaré DDPP</div>
  </div>

</div>`;

    const container = document.createElement("div");
    container.style.cssText = "position:fixed;left:-9999px;top:0;width:794px;height:1123px;background:#fff;box-sizing:border-box;overflow:hidden;";
    container.innerHTML = bodyHtml;
    document.body.appendChild(container);

    try {
      await new Promise<void>((r) => setTimeout(r, 900));
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(container, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pW = pdf.internal.pageSize.getWidth();
      const pH = pdf.internal.pageSize.getHeight();
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pW, pH);
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
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-xl gap-1.5 ${twoFaStatus?.totpEnabled ? "text-green-600" : "text-muted-foreground"}`}
            onClick={open2faModal}
            title="Double authentification"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">2FA</span>
          </Button>
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
        <div className="flex gap-2 mb-8 border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab("guide")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap ${
              activeTab === "guide" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Guide d'utilisation
          </button>
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

        {/* ─── TAB: GUIDE ─── */}
        {activeTab === "guide" && (
          <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex items-start gap-4 p-5 bg-primary/5 border border-primary/20 rounded-2xl">
              <BookOpen className="w-8 h-8 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h1 className="font-serif text-2xl font-bold mb-1">Guide d'utilisation — Espace Admin</h1>
                <p className="text-muted-foreground text-sm leading-relaxed">Bienvenue dans votre tableau de bord. Ce guide vous explique comment gérer votre site pas à pas. Vous pouvez y revenir à tout moment en cliquant sur l'onglet <strong>Guide d'utilisation</strong>.</p>
              </div>
            </div>

            {/* Section Chiots */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 bg-muted/40 border-b border-border">
                <Paw className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-base">Onglet « Nos Chiots » — Gérer vos annonces</h2>
              </div>
              <div className="px-6 py-5 space-y-4 text-sm leading-relaxed text-foreground/90">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                  <div>
                    <p className="font-semibold mb-0.5">Ajouter un nouveau chiot</p>
                    <p className="text-muted-foreground">Cliquez sur le bouton <strong>+ Ajouter un chiot</strong> en haut à droite. Remplissez le nom, la robe, le sexe, l'âge, le prix, la description et les traits de caractère (séparés par des virgules). Cliquez ensuite sur <strong>Ajouter le chiot</strong> pour publier l'annonce.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">2</span>
                  <div>
                    <p className="font-semibold mb-0.5">Ajouter des photos</p>
                    <p className="text-muted-foreground">Une fois le chiot créé, cliquez sur l'icône <strong>crayon (modifier)</strong> sur sa carte, puis sur la zone d'upload <strong>Ajouter des photos</strong>. Vous pouvez téléverser plusieurs images. La première image affichée sera la photo principale de l'annonce.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">3</span>
                  <div>
                    <p className="font-semibold mb-0.5">Changer le statut d'un chiot</p>
                    <p className="text-muted-foreground">Dans le formulaire de modification, le champ <strong>Statut</strong> vous permet de passer un chiot de <em>Disponible</em> → <em>Réservé</em> → <em>Vendu</em>. Ce statut s'affiche directement sur l'annonce publique. Un chiot « Vendu » reste visible mais clairement marqué comme indisponible.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold flex items-center justify-center mt-0.5">
                    <Sparkles className="w-3 h-3" />
                  </span>
                  <div>
                    <p className="font-semibold mb-0.5">Badge « Coup de cœur »</p>
                    <p className="text-muted-foreground">Cochez la case <strong>Coup de cœur</strong> dans le formulaire pour mettre en avant un chiot avec un badge doré sur son annonce. À utiliser avec parcimonie pour les chiots les plus exceptionnels.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/10 text-red-600 text-xs font-bold flex items-center justify-center mt-0.5">
                    <Trash2 className="w-3 h-3" />
                  </span>
                  <div>
                    <p className="font-semibold mb-0.5">Supprimer un chiot</p>
                    <p className="text-muted-foreground">Cliquez sur l'icône <strong>poubelle</strong> sur la carte du chiot. Une confirmation vous sera demandée avant suppression définitive. Cette action est irréversible.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Contrat */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 bg-muted/40 border-b border-border">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-base">Générer un contrat de réservation PDF</h2>
              </div>
              <div className="px-6 py-5 space-y-4 text-sm leading-relaxed text-foreground/90">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                  <div>
                    <p className="font-semibold mb-0.5">Quand l'utiliser ?</p>
                    <p className="text-muted-foreground">Le bouton <strong>Générer le contrat</strong> n'apparaît que sur les chiots ayant le statut <em>Réservé</em>. Passez d'abord le statut du chiot en « Réservé », puis cliquez sur le bouton vert <strong>Générer le contrat</strong> sur sa carte.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">2</span>
                  <div>
                    <p className="font-semibold mb-0.5">Remplir les informations de l'acquéreur</p>
                    <p className="text-muted-foreground">Un panneau s'ouvre sur la droite. Saisissez le <strong>prénom, nom, adresse complète, code postal, ville, téléphone et email</strong> de l'acheteur. Indiquez aussi le montant de l'acompte versé et la date de signature.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">3</span>
                  <div>
                    <p className="font-semibold mb-0.5">Télécharger le PDF</p>
                    <p className="text-muted-foreground">Cliquez sur <strong>Télécharger le PDF</strong>. Le contrat se génère en quelques secondes et se télécharge automatiquement avec votre signature. Le fichier est nommé <em>Contrat_reservation_[NomChiot]_[date].pdf</em>. Envoyez-le ensuite par email à l'acquéreur pour signature.</p>
                  </div>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-2">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-800 dark:text-amber-300 text-xs">Le contrat inclut automatiquement les informations du chiot (robe, sexe, âge, LOF), les clauses légales françaises, et votre signature. L'acquéreur doit signer et écrire « Lu et approuvé » à la main avant de vous retourner le document.</p>
                </div>
              </div>
            </div>

            {/* Section Avis */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 bg-muted/40 border-b border-border">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-base">Onglet « Avis Clients » — Gérer les témoignages</h2>
              </div>
              <div className="px-6 py-5 space-y-4 text-sm leading-relaxed text-foreground/90">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                  <div>
                    <p className="font-semibold mb-0.5">Avis en attente de validation</p>
                    <p className="text-muted-foreground">Lorsqu'un client soumet un avis sur le site, il apparaît ici avec un badge orange <strong>« en attente »</strong>. Il est invisible sur le site public jusqu'à votre validation. Lisez-le et supprimez-le s'il est inapproprié, ou attendez — il sera publié automatiquement à la prochaine validation.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">2</span>
                  <div>
                    <p className="font-semibold mb-0.5">Ajouter un avis manuellement</p>
                    <p className="text-muted-foreground">Vous pouvez ajouter un témoignage d'un client satisfait en cliquant sur <strong>+ Ajouter un avis</strong>. Renseignez le nom, la ville, le nom du chiot adopté, la note et le témoignage. Cet avis sera publié immédiatement.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/10 text-red-600 text-xs font-bold flex items-center justify-center mt-0.5">
                    <Trash2 className="w-3 h-3" />
                  </span>
                  <div>
                    <p className="font-semibold mb-0.5">Supprimer un avis</p>
                    <p className="text-muted-foreground">Cliquez sur le bouton <strong>Supprimer</strong> sur l'avis concerné. Une confirmation vous sera demandée. La suppression est définitive.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Messages */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 bg-muted/40 border-b border-border">
                <Mail className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-base">Onglet « Messages » — Demandes de contact et réservations</h2>
              </div>
              <div className="px-6 py-5 space-y-4 text-sm leading-relaxed text-foreground/90">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                  <div>
                    <p className="font-semibold mb-0.5">Comprendre les messages reçus</p>
                    <p className="text-muted-foreground">Chaque fois qu'un visiteur remplit le formulaire de contact ou de réservation sur le site, un message apparaît ici. Les messages de type <strong>Réservation</strong> (badge bleu) indiquent qu'un client souhaite réserver un chiot spécifique. Les messages <strong>Contact</strong> (badge gris) sont des demandes générales.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">2</span>
                  <div>
                    <p className="font-semibold mb-0.5">Répondre à un message</p>
                    <p className="text-muted-foreground">Cliquez directement sur l'adresse email ou le numéro de téléphone affichés pour contacter le client. Vous recevez aussi une copie de chaque message par email (notification automatique). Il n'y a pas de réponse intégrée — utilisez votre messagerie habituelle.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/10 text-red-600 text-xs font-bold flex items-center justify-center mt-0.5">
                    <Trash2 className="w-3 h-3" />
                  </span>
                  <div>
                    <p className="font-semibold mb-0.5">Archiver / supprimer un message</p>
                    <p className="text-muted-foreground">Une fois que vous avez traité un message, supprimez-le avec l'icône <strong>poubelle</strong> pour garder votre boîte propre. Une confirmation est demandée avant suppression définitive.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Sécurité */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 bg-muted/40 border-b border-border">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-base">Sécurité & Déconnexion</h2>
              </div>
              <div className="px-6 py-5 space-y-4 text-sm leading-relaxed text-foreground/90">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    <LogOut className="w-3 h-3" />
                  </span>
                  <div>
                    <p className="font-semibold mb-0.5">Se déconnecter</p>
                    <p className="text-muted-foreground">Cliquez sur le bouton <strong>Déconnexion</strong> en haut à droite de l'écran. Il est important de se déconnecter si vous utilisez un ordinateur partagé ou public. La session expire automatiquement après une période d'inactivité.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    <ExternalLink className="w-3 h-3" />
                  </span>
                  <div>
                    <p className="font-semibold mb-0.5">Voir le site public</p>
                    <p className="text-muted-foreground">Cliquez sur <strong>Voir le site</strong> en haut à droite pour visualiser le site tel qu'il apparaît à vos visiteurs dans un nouvel onglet. Utile pour vérifier vos modifications avant de les partager.</p>
                  </div>
                </div>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex gap-2">
                  <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-foreground/70 text-xs">Vos identifiants de connexion ne doivent être partagés avec personne. En cas de doute sur la sécurité, contactez votre développeur pour changer le mot de passe.</p>
                </div>
              </div>
            </div>

            {/* Section Portées & Annonces */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 bg-muted/40 border-b border-border">
                <Baby className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-base">Gestion des portées — Ce qui est automatique et ce qui est manuel</h2>
              </div>
              <div className="px-6 py-5 space-y-5 text-sm leading-relaxed text-foreground/90">

                {/* Automatic */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <p className="font-semibold text-green-700 dark:text-green-400">Ce que le site gère seul (automatique)</p>
                  </div>
                  <ul className="space-y-2 ml-6 text-muted-foreground">
                    <li className="list-disc">Le <strong>nombre de chiots disponibles</strong> affiché sur chaque portée (ex : « 4 encore disponibles ») est calculé en temps réel depuis votre base de données. Il se met à jour dès que vous changez le statut d'un chiot.</li>
                    <li className="list-disc">Le <strong>total de chiots par portée</strong> (ex : « 6 chiots total ») est également automatique.</li>
                    <li className="list-disc">Les <strong>annonces individuelles</strong> de chaque chiot apparaissent et disparaissent selon leur statut. Il n'y a <strong>aucune limite</strong> au nombre de chiots que vous pouvez publier.</li>
                    <li className="list-disc">Une <strong>nouvelle portée</strong> apparaît sur le site dès que vous y publiez au moins un chiot avec un nom de portée renseigné.</li>
                  </ul>
                </div>

                <div className="border-t border-border" />

                {/* Manual warning */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <p className="font-semibold text-amber-700 dark:text-amber-400">Ce qui nécessite une mise à jour manuelle (développeur)</p>
                  </div>
                  <p className="text-muted-foreground mb-3">
                    Certains textes du site ont été écrits en dur et font référence à <strong>« 2 portées actives »</strong>. Si vous ouvrez une <strong>3ème portée</strong>, ces 4 endroits deviendront inexacts et devront être corrigés par votre développeur :
                  </p>
                  <div className="space-y-3">

                    <div className="p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">1</span>
                        <p className="font-semibold text-xs">Page « Reproducteurs » — badge statistique</p>
                      </div>
                      <p className="text-xs text-muted-foreground ml-5">Texte actuel : <code className="bg-muted px-1 rounded">2 portées actives</code> → à remplacer par <code className="bg-muted px-1 rounded">3 portées actives</code></p>
                    </div>

                    <div className="p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">2</span>
                        <p className="font-semibold text-xs">Page « Reproducteurs » — texte d'introduction</p>
                      </div>
                      <p className="text-xs text-muted-foreground ml-5">Texte actuel : <code className="bg-muted px-1 rounded">Deux portées actives issues de nos reproducteurs.</code> → à remplacer par <code className="bg-muted px-1 rounded">Trois portées actives issues de nos reproducteurs.</code></p>
                    </div>

                    <div className="p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">3</span>
                        <p className="font-semibold text-xs">Page « Accueil » — section portées</p>
                      </div>
                      <p className="text-xs text-muted-foreground ml-5">Texte actuel : <code className="bg-muted px-1 rounded">2 portées actives</code> → à remplacer par <code className="bg-muted px-1 rounded">3 portées actives</code></p>
                    </div>

                    <div className="p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">4</span>
                        <p className="font-semibold text-xs">Balise SEO (description Google) — Page Reproducteurs</p>
                      </div>
                      <p className="text-xs text-muted-foreground ml-5">Texte actuel : <code className="bg-muted px-1 rounded">Deux portées disponibles.</code> → à remplacer par <code className="bg-muted px-1 rounded">Trois portées disponibles.</code></p>
                    </div>

                  </div>
                  <div className="mt-3 p-3 bg-muted/60 rounded-xl flex gap-2">
                    <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">Les mentions <em>« 2 à 3 portées par an »</em> présentes dans les pages À Propos et Accueil sont du discours général sur votre philosophie d'élevage — elles n'ont pas besoin d'être modifiées.</p>
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* How to add a new litter */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Plus className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="font-semibold">Comment publier les annonces d'une nouvelle portée</p>
                  </div>
                  <div className="space-y-3 ml-1">
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                      <div>
                        <p className="font-semibold mb-0.5">Allez dans l'onglet « Nos Chiots »</p>
                        <p className="text-muted-foreground">Cliquez sur <strong>+ Ajouter un chiot</strong> pour chaque chiot de la nouvelle portée.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">2</span>
                      <div>
                        <p className="font-semibold mb-0.5">Renseignez le nom de la portée</p>
                        <p className="text-muted-foreground">Dans le champ <strong>Portée</strong> du formulaire, indiquez un nom cohérent (ex : <em>Portée 3</em> ou <em>Alaska × Ulysse II</em>). Tous les chiots d'une même portée doivent avoir le <strong>même nom de portée exactement</strong> — c'est ce qui les regroupe automatiquement sur la page Reproducteurs.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">3</span>
                      <div>
                        <p className="font-semibold mb-0.5">Publiez chiot par chiot</p>
                        <p className="text-muted-foreground">Ajoutez la description, les photos, le sexe, la robe, le prix et le statut <em>Disponible</em>. La nouvelle portée apparaît instantanément sur le site public dès le premier chiot publié.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">4</span>
                      <div>
                        <p className="font-semibold mb-0.5">Prévenez votre développeur</p>
                        <p className="text-muted-foreground">Une fois la 3ème portée en ligne, signalez-le à votre développeur pour qu'il mette à jour les 4 textes listés ci-dessus. Cela prend moins de 5 minutes.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Button onClick={() => setActiveTab("chiots")} className="gap-2 rounded-xl">
                <Paw className="w-4 h-4" /> Aller gérer mes chiots <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

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
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Acompte (€)</label>
                  <Input type="number" min={0} value={contractDeposit} onChange={(e) => setContractDeposit(parseInt(e.target.value, 10) || 0)} className="bg-background" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Second virement (€)</label>
                  <Input type="number" min={0} value={contractSecondPayment} onChange={(e) => setContractSecondPayment(parseInt(e.target.value, 10) || 0)} placeholder="0" className="bg-background" />
                  {contractPuppy && contractSecondPayment > 0 && (
                    <p className="text-xs text-muted-foreground">Solde au départ : {(contractPuppy.price - contractDeposit - contractSecondPayment).toLocaleString("fr-FR")} €</p>
                  )}
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

      {/* 2FA Modal */}
      {show2faModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card rounded-3xl shadow-2xl border border-border w-full max-w-md p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-serif text-xl font-bold">Double authentification</h2>
              </div>
              <button
                onClick={() => setShow2faModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {twoFaStep === "status" && (
              <div className="space-y-4">
                <div className={`flex items-center gap-3 p-4 rounded-2xl border ${twoFaStatus?.totpEnabled ? "bg-green-500/10 border-green-500/30" : "bg-muted/50 border-border"}`}>
                  <ShieldCheck className={`w-5 h-5 flex-shrink-0 ${twoFaStatus?.totpEnabled ? "text-green-600" : "text-muted-foreground"}`} />
                  <div>
                    <p className={`font-medium text-sm ${twoFaStatus?.totpEnabled ? "text-green-700" : "text-foreground"}`}>
                      {twoFaStatus?.totpEnabled ? "2FA activé" : "2FA désactivé"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {twoFaStatus?.totpEnabled
                        ? "Votre compte est protégé par une double authentification."
                        : "Ajoutez une couche de sécurité supplémentaire à votre compte."}
                    </p>
                  </div>
                </div>

                {twoFaError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-600 rounded-xl text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {twoFaError}
                  </div>
                )}

                {!twoFaStatus?.totpEnabled ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      En activant le 2FA, vous devrez saisir un code de 6 chiffres généré par une application comme <strong>Google Authenticator</strong> ou <strong>Authy</strong> à chaque connexion.
                    </p>
                    <Button
                      className="w-full h-11 rounded-xl gap-2"
                      onClick={handle2faSetup}
                      disabled={twoFaLoading}
                    >
                      {twoFaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      Activer le 2FA
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full h-11 rounded-xl gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      onClick={() => { setTwoFaStep("disable"); setTwoFaError(""); }}
                    >
                      <X className="w-4 h-4" /> Désactiver le 2FA
                    </Button>
                  </div>
                )}
              </div>
            )}

            {twoFaStep === "setup" && (
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium mb-2">1. Scannez ce QR code</p>
                  <p className="text-xs text-muted-foreground mb-3">Ouvrez <strong>Google Authenticator</strong> ou <strong>Authy</strong>, appuyez sur « + » puis scannez le code ci-dessous.</p>
                  {twoFaQrCode && (
                    <div className="flex justify-center p-4 bg-white rounded-2xl border border-border">
                      <img src={twoFaQrCode} alt="QR Code 2FA" className="w-48 h-48" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Clé manuelle (si scan impossible)</p>
                  <div className="flex items-center gap-2 p-2.5 bg-muted rounded-xl">
                    <code className="text-xs font-mono flex-1 break-all select-all">{twoFaSecret}</code>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">2. Confirmez avec le code affiché</p>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="000000"
                    value={twoFaCode}
                    onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="bg-background h-12 text-center text-xl font-mono tracking-widest"
                    maxLength={6}
                    autoFocus
                  />
                </div>
                {twoFaError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-600 rounded-xl text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {twoFaError}
                  </div>
                )}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => { setTwoFaStep("status"); setTwoFaError(""); }}>Retour</Button>
                  <Button
                    className="flex-1 rounded-xl gap-2"
                    onClick={handle2faConfirm}
                    disabled={twoFaLoading || twoFaCode.length < 6}
                  >
                    {twoFaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Confirmer
                  </Button>
                </div>
              </div>
            )}

            {twoFaStep === "disable" && (
              <div className="space-y-5">
                <div className="p-4 bg-red-500/10 rounded-2xl border border-red-200">
                  <p className="text-sm text-red-700 font-medium">Désactiver la double authentification</p>
                  <p className="text-xs text-red-600 mt-1">Cette action supprimera la protection 2FA de votre compte. Confirmez avec votre mot de passe.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Mot de passe actuel</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={twoFaPassword}
                    onChange={(e) => setTwoFaPassword(e.target.value)}
                    className="bg-background h-12"
                    autoFocus
                  />
                </div>
                {twoFaError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-600 rounded-xl text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {twoFaError}
                  </div>
                )}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => { setTwoFaStep("status"); setTwoFaError(""); }}>Annuler</Button>
                  <Button
                    variant="destructive"
                    className="flex-1 rounded-xl gap-2"
                    onClick={handle2faDisable}
                    disabled={twoFaLoading || !twoFaPassword}
                  >
                    {twoFaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    Désactiver
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
