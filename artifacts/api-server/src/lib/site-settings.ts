import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db/schema";

export const DEFAULT_CONTACT_PHONE = "07 57 81 72 02";

export async function getContactPhone(): Promise<string> {
  const [setting] = await db
    .select({ value: siteSettingsTable.value })
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.key, "contact_phone"))
    .limit(1);
  return setting?.value ?? DEFAULT_CONTACT_PHONE;
}
