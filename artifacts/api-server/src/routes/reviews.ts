import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable } from "@workspace/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { requireAdmin } from "../lib/auth.js";

const router = Router();

router.get("/reviews", async (_req, res) => {
  try {
    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.status, "approved"))
      .orderBy(desc(reviewsTable.createdAt));
    res.json(reviews);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/reviews", async (req, res) => {
  try {
    const { name, location, puppyName, rating, text } = req.body;
    if (!name || !text) {
      res.status(400).json({ error: "Nom et avis requis" });
      return;
    }
    const ratingNum = Math.min(5, Math.max(1, parseInt(rating ?? "5", 10)));
    const [review] = await db
      .insert(reviewsTable)
      .values({
        name: name.trim(),
        location: (location ?? "").trim(),
        puppyName: (puppyName ?? "").trim(),
        rating: ratingNum,
        text: text.trim(),
        status: "pending",
      })
      .returning();
    res.status(201).json({ success: true, id: review.id });
  } catch (err) {
    console.error("[reviews POST]", err);
    res.status(500).json({ error: "Erreur lors de la soumission" });
  }
});

router.get("/admin/reviews", requireAdmin, async (_req, res) => {
  try {
    const reviews = await db
      .select()
      .from(reviewsTable)
      .orderBy(asc(reviewsTable.status), desc(reviewsTable.createdAt));
    res.json(reviews);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/admin/reviews", requireAdmin, async (req, res) => {
  try {
    const { name, location, puppyName, rating, text } = req.body;
    if (!name || !text) {
      res.status(400).json({ error: "Nom et avis requis" });
      return;
    }
    const ratingNum = Math.min(5, Math.max(1, parseInt(rating ?? "5", 10)));
    const [review] = await db
      .insert(reviewsTable)
      .values({
        name: name.trim(),
        location: (location ?? "").trim(),
        puppyName: (puppyName ?? "").trim(),
        rating: ratingNum,
        text: text.trim(),
        status: "approved",
      })
      .returning();
    res.status(201).json(review);
  } catch (err) {
    console.error("[admin/reviews POST]", err);
    res.status(500).json({ error: "Erreur lors de la création" });
  }
});

router.patch("/admin/reviews/:id/approve", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [updated] = await db
      .update(reviewsTable)
      .set({ status: "approved" })
      .where(eq(reviewsTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Avis introuvable" });
      return;
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/admin/reviews/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(reviewsTable).where(eq(reviewsTable.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
