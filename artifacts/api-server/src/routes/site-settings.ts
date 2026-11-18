import { Router } from "express";
import { getContactPhone } from "../lib/site-settings.js";

const router = Router();

router.get("/settings/phone", async (_req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    res.json({ phone: await getContactPhone() });
  } catch (err) {
    console.error("[settings/phone]", err);
    res.status(500).json({ error: "Impossible de charger le numéro de téléphone" });
  }
});

export default router;
