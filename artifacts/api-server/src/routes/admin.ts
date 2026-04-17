import { Router } from "express";
import multer from "multer";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { db } from "@workspace/db";
import { puppiesTable, adminUsersTable, contactMessagesTable } from "@workspace/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { requireAdmin, signToken, signPendingToken, verifyPendingToken, setAuthCookie, clearAuthCookie } from "../lib/auth.js";
import { uploadImageBuffer } from "../lib/cloudinary.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

/* ─── AUTH ─── */

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
    if (admin.totpEnabled && admin.totpSecret) {
      const pendingToken = signPendingToken({ adminId: admin.id, email: admin.email });
      res.json({ require2fa: true, pendingToken });
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

router.post("/admin/2fa/complete", async (req, res) => {
  try {
    const { pendingToken, code } = req.body;
    if (!pendingToken || !code) {
      res.status(400).json({ error: "Token et code requis" });
      return;
    }
    const payload = verifyPendingToken(pendingToken);
    if (!payload) {
      res.status(401).json({ error: "Session expirée, veuillez vous reconnecter" });
      return;
    }
    const [admin] = await db
      .select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.id, payload.adminId))
      .limit(1);
    if (!admin?.totpSecret || !admin.totpEnabled) {
      res.status(400).json({ error: "2FA non configuré" });
      return;
    }
    const valid = speakeasy.totp.verify({
      secret: admin.totpSecret,
      encoding: "base32",
      token: code.replace(/\s/g, ""),
      window: 1,
    });
    if (!valid) {
      res.status(401).json({ error: "Code incorrect ou expiré" });
      return;
    }
    const token = signToken({ adminId: admin.id, email: admin.email });
    setAuthCookie(res, token);
    res.json({ success: true, admin: { id: admin.id, email: admin.email } });
  } catch (err) {
    console.error("[admin/2fa/complete]", err);
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

/* ─── 2FA MANAGEMENT ─── */

router.get("/admin/2fa/status", requireAdmin, async (req, res) => {
  try {
    const [admin] = await db
      .select({ totpEnabled: adminUsersTable.totpEnabled })
      .from(adminUsersTable)
      .where(eq(adminUsersTable.id, req.admin!.adminId))
      .limit(1);
    res.json({ totpEnabled: admin?.totpEnabled ?? false });
  } catch (err) {
    console.error("[admin/2fa/status]", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/admin/2fa/setup", requireAdmin, async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `Berger Bleu Admin (${req.admin!.email})`,
      length: 20,
    });
    await db
      .update(adminUsersTable)
      .set({ totpSecret: secret.base32, totpEnabled: false })
      .where(eq(adminUsersTable.id, req.admin!.adminId));
    const otpauthUrl = secret.otpauth_url!;
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, { width: 280, margin: 2 });
    res.json({
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      otpauthUrl,
    });
  } catch (err) {
    console.error("[admin/2fa/setup]", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/admin/2fa/confirm", requireAdmin, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ error: "Code TOTP requis" });
      return;
    }
    const [admin] = await db
      .select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.id, req.admin!.adminId))
      .limit(1);
    if (!admin?.totpSecret) {
      res.status(400).json({ error: "Lancez d'abord la configuration 2FA" });
      return;
    }
    const valid = speakeasy.totp.verify({
      secret: admin.totpSecret,
      encoding: "base32",
      token: code.replace(/\s/g, ""),
      window: 1,
    });
    if (!valid) {
      res.status(400).json({ error: "Code incorrect ou expiré. Vérifiez l'heure de votre appareil." });
      return;
    }
    await db
      .update(adminUsersTable)
      .set({ totpEnabled: true })
      .where(eq(adminUsersTable.id, req.admin!.adminId));
    res.json({ success: true });
  } catch (err) {
    console.error("[admin/2fa/confirm]", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/admin/2fa/disable", requireAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      res.status(400).json({ error: "Mot de passe requis" });
      return;
    }
    const [admin] = await db
      .select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.id, req.admin!.adminId))
      .limit(1);
    if (!admin) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Mot de passe incorrect" });
      return;
    }
    await db
      .update(adminUsersTable)
      .set({ totpEnabled: false, totpSecret: null })
      .where(eq(adminUsersTable.id, req.admin!.adminId));
    res.json({ success: true });
  } catch (err) {
    console.error("[admin/2fa/disable]", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ─── PUPPIES ─── */

router.get("/admin/puppies", requireAdmin, async (_req, res) => {
  try {
    const puppies = await db
      .select()
      .from(puppiesTable)
      .orderBy(desc(puppiesTable.isPremium), asc(puppiesTable.createdAt));
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
        isPremium: body.isPremium ?? false,
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
    if (body.isPremium !== undefined) updateData.isPremium = Boolean(body.isPremium);
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

router.patch("/admin/puppies/:id/premium", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { isPremium } = req.body;
    if (typeof isPremium !== "boolean") {
      res.status(400).json({ error: "isPremium doit être un booléen" });
      return;
    }
    const [updated] = await db
      .update(puppiesTable)
      .set({ isPremium })
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

/* ─── MESSAGES ─── */

router.get("/admin/messages", requireAdmin, async (_req, res) => {
  try {
    const messages = await db
      .select()
      .from(contactMessagesTable)
      .orderBy(desc(contactMessagesTable.createdAt));
    res.json(messages);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/admin/messages/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(contactMessagesTable).where(eq(contactMessagesTable.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ─── UPLOAD ─── */

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
