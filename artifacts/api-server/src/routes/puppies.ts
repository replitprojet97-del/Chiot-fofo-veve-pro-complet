import { Router } from "express";
import { db } from "@workspace/db";
import { puppiesTable } from "@workspace/db/schema";
import { eq, asc, desc } from "drizzle-orm";

const router = Router();

router.get("/puppies", async (_req, res) => {
  try {
    const puppies = await db
      .select()
      .from(puppiesTable)
      .orderBy(desc(puppiesTable.isPremium), asc(puppiesTable.createdAt));
    res.json(puppies);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/puppies/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [puppy] = await db
      .select()
      .from(puppiesTable)
      .where(eq(puppiesTable.id, id))
      .limit(1);
    if (!puppy) {
      res.status(404).json({ error: "Chiot introuvable" });
      return;
    }
    res.json(puppy);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
