import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { siteSettingsApi } from "@/lib/api";

export const DEFAULT_CONTACT_PHONE = "07 57 81 72 02";
export const SITE_PHONE_QUERY_KEY = ["site-phone"] as const;

async function fetchSitePhone(): Promise<string> {
  const data = await siteSettingsApi.getPhone();
  if (typeof data.phone !== "string" || !data.phone.trim()) {
    throw new Error("Numéro de téléphone invalide reçu du serveur");
  }
  return data.phone;
}

export function toInternationalPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (phone.trim().startsWith("+")) return `+${digits}`;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("0")) return `+33${digits.slice(1)}`;
  if (digits.startsWith("33")) return `+${digits}`;
  return `+${digits}`;
}

export function toWhatsAppNumber(phone: string): string {
  return toInternationalPhone(phone).replace(/\D/g, "");
}

export function useSitePhone() {
  const { data = DEFAULT_CONTACT_PHONE, ...query } = useQuery({
    queryKey: SITE_PHONE_QUERY_KEY,
    queryFn: fetchSitePhone,
    initialData: DEFAULT_CONTACT_PHONE,
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]').forEach((script) => {
      try {
        const structuredData = JSON.parse(script.textContent ?? "");
        const syncTelephone = (value: unknown) => {
          if (!value || typeof value !== "object") return;
          if (Array.isArray(value)) {
            value.forEach(syncTelephone);
            return;
          }
          const record = value as Record<string, unknown>;
          if (record.telephone) record.telephone = toInternationalPhone(data);
          Object.values(record).forEach(syncTelephone);
        };
        syncTelephone(structuredData);
        if (structuredData) {
          script.textContent = JSON.stringify(structuredData);
        }
      } catch {
        // Leave unrelated or malformed structured data untouched.
      }
    });
  }, [data]);

  return {
    ...query,
    phone: data,
    telHref: `tel:${toInternationalPhone(data)}`,
    whatsappNumber: toWhatsAppNumber(data),
  };
}
