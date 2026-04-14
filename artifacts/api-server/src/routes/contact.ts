import { Router } from "express";
import { db } from "@workspace/db";
import { contactMessagesTable } from "@workspace/db/schema";
import { sendContactEmail, sendReservationEmail } from "../lib/email.js";

const router = Router();

router.post("/contact", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
      res.status(400).json({ error: "Champs obligatoires manquants" });
      return;
    }

    await db.insert(contactMessagesTable).values({
      firstName,
      lastName,
      email,
      phone: phone ?? "",
      message,
      type: "contact",
    });

    await sendContactEmail({ firstName, lastName, email, phone, message });

    res.json({ success: true });
  } catch (err) {
    console.error("[contact] error:", err);
    res.status(500).json({ error: "Erreur lors de l'envoi du message" });
  }
});

router.post("/reserve", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message, puppyId, puppyName, puppyColor, puppySex, puppyPrice } = req.body;

    if (!firstName || !lastName || !email || !message || !puppyId) {
      res.status(400).json({ error: "Champs obligatoires manquants" });
      return;
    }

    await db.insert(contactMessagesTable).values({
      puppyId: parseInt(puppyId, 10),
      puppyName: puppyName ?? "",
      firstName,
      lastName,
      email,
      phone: phone ?? "",
      message,
      type: "reservation",
    });

    await sendReservationEmail({
      firstName,
      lastName,
      email,
      phone,
      message,
      puppyName,
      puppyColor,
      puppySex,
      puppyPrice: parseInt(puppyPrice, 10),
      puppyId: parseInt(puppyId, 10),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("[reserve] error:", err);
    res.status(500).json({ error: "Erreur lors de la demande de réservation" });
  }
});

export default router;
