import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import { adminApi } from "@/lib/api";

export default function Admin() {
  const [state, setState] = useState<"loading" | "logged-out" | "logged-in">("loading");
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    adminApi
      .me()
      .then(({ admin }) => {
        setAdminEmail(admin.email);
        setState("logged-in");
      })
      .catch(() => setState("logged-out"));
  }, []);

  const handleLogin = () => {
    adminApi.me().then(({ admin }) => {
      setAdminEmail(admin.email);
      setState("logged-in");
    });
  };

  const handleLogout = () => {
    setState("logged-out");
    setAdminEmail("");
  };

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (state === "logged-out") {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard onLogout={handleLogout} adminEmail={adminEmail} />;
}
