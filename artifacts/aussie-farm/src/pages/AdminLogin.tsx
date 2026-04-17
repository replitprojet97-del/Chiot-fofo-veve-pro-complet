import React, { useState } from "react";
import { Loader2, PawPrint as Paw, AlertCircle, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api";

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [step, setStep] = useState<"credentials" | "totp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [pendingToken, setPendingToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await adminApi.login(email, password);
      if (result.require2fa && result.pendingToken) {
        setPendingToken(result.pendingToken);
        setStep("totp");
      } else {
        onLogin();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  const handleTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await adminApi.complete2fa(pendingToken, totpCode);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code incorrect");
      setTotpCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleTotpInput = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    setTotpCode(cleaned);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-3xl shadow-xl border border-border p-8 md:p-10">

        {step === "credentials" && (
          <>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Paw className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold">Espace Admin</h1>
                <p className="text-muted-foreground text-sm">Élevage du Berger Bleu</p>
              </div>
            </div>

            <form onSubmit={handleCredentials} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="admin@berger-bleu.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="bg-background h-12"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mot de passe</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background h-12"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-600 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl text-base font-medium"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Connexion...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </>
        )}

        {step === "totp" && (
          <>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold">Vérification 2FA</h1>
                <p className="text-muted-foreground text-sm">Double authentification</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Ouvrez votre application d'authentification (Google Authenticator, Authy…) et saisissez le code à 6 chiffres affiché.
            </p>

            <form onSubmit={handleTotp} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Code à 6 chiffres</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="000 000"
                  value={totpCode.replace(/(\d{3})(\d{1,3})/, "$1 $2")}
                  onChange={(e) => handleTotpInput(e.target.value)}
                  required
                  autoFocus
                  maxLength={7}
                  className="bg-background h-14 text-center text-2xl font-mono tracking-[0.35em]"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-600 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || totpCode.length < 6}
                className="w-full h-12 rounded-xl text-base font-medium"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Vérification...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Vérifier le code
                  </span>
                )}
              </Button>

              <button
                type="button"
                onClick={() => { setStep("credentials"); setError(""); setTotpCode(""); }}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Retour à la connexion
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <a href="/" className="text-primary hover:underline">← Retour au site</a>
        </p>
      </div>
    </div>
  );
}
