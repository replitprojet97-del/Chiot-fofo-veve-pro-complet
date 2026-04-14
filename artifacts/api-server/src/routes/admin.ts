import { Router } from "express";
import multer from "multer";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { puppiesTable, adminUsersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, signToken, setAuthCookie, clearAuthCookie } from "../lib/auth.js";
import { uploadImageBuffer } from "../lib/cloudinary.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email et mot de passe requis" });
      return;
    }

    const [admin] = await db
      .select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.email, email.toLowerCase()))
      .limit(1);

    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      res.status(401).json({ error: "Identifiants incorrects" });
      return;
    }

    const token = signToken({ adminId: admin.id, email: admin.email });
    setAuthCookie(res, token);
    res.json({ success: true, admin: { id: admin.id, email: admin.email } });
  } catch (err) {
    console.error("[admin/login]", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/admin/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ success: true });
});

router.get("/admin/me", requireAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

router.get("/admin/seed", async (_req, res) => {
  if (process.env.NODE_ENV === "production") {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_INITIAL_PASSWORD;

  if (!email || !password) {
    res.status(400).json({ error: "ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD env vars required" });
    return;
  }

  const existing = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, email.toLowerCase()))
    .limit(1);

  if (existing.length > 0) {
    res.json({ message: "Admin already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.insert(adminUsersTable).values({ email: email.toLowerCase(), passwordHash });
  res.json({ success: true, message: "Admin created" });
});

router.get("/admin/puppies", requireAdmin, async (_req, res) => {
  try {
    const puppies = await db.select().from(puppiesTable).orderBy(puppiesTable.createdAt);
    res.json(puppies);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/admin/puppies", requireAdmin, async (req, res) => {
  try {
    const body = req.body;
    const [puppy] = await db
      .insert(puppiesTable)
      .values({
        name: body.name,
        ageWeeks: parseInt(body.ageWeeks, 10),
        color: body.color,
        sex: body.sex,
        price: parseInt(body.price, 10),
        description: body.description ?? "",
        traits: Array.isArray(body.traits) ? body.traits : [],
        parents: body.parents ?? "",
        images: Array.isArray(body.images) ? body.images : [],
        status: body.status ?? "available",
      })
      .returning();
    res.status(201).json(puppy);
  } catch (err) {
    console.error("[admin/puppies POST]", err);
    res.status(500).json({ error: "Erreur lors de la création" });
  }
});

router.put("/admin/puppies/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const body = req.body;

    const updateData: Partial<typeof puppiesTable.$inferInsert> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.ageWeeks !== undefined) updateData.ageWeeks = parseInt(body.ageWeeks, 10);
    if (body.color !== undefined) updateData.color = body.color;
    if (body.sex !== undefined) updateData.sex = body.sex;
    if (body.price !== undefined) updateData.price = parseInt(body.price, 10);
    if (body.description !== undefined) updateData.description = body.description;
    if (body.traits !== undefined) updateData.traits = Array.isArray(body.traits) ? body.traits : [];
    if (body.parents !== undefined) updateData.parents = body.parents;
    if (body.images !== undefined) updateData.images = Array.isArray(body.images) ? body.images : [];
    if (body.status !== undefined) updateData.status = body.status;

    const [updated] = await db
      .update(puppiesTable)
      .set(updateData)
      .where(eq(puppiesTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Chiot introuvable" });
      return;
    }
    res.json(updated);
  } catch (err) {
    console.error("[admin/puppies PUT]", err);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
});

router.patch("/admin/puppies/:id/status", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!["available", "reserved", "sold"].includes(status)) {
      res.status(400).json({ error: "Statut invalide" });
      return;
    }

    const [updated] = await db
      .update(puppiesTable)
      .set({ status })
      .where(eq(puppiesTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Chiot introuvable" });
      return;
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/admin/puppies/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(puppiesTable).where(eq(puppiesTable.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/admin/upload", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Aucun fichier fourni" });
      return;
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      res.status(503).json({ error: "Cloudinary non configuré" });
      return;
    }

    const result = await uploadImageBuffer(req.file.buffer, req.file.originalname);
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error("[admin/upload]", err);
    res.status(500).json({ error: "Erreur lors de l'upload" });
  }
});

export default router;
