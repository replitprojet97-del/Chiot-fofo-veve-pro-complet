import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";
const COOKIE_NAME = "admin_token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export interface AdminPayload {
  adminId: number;
  email: string;
}

export interface PendingPayload {
  adminId: number;
  email: string;
  pending2fa: true;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

export function signToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function signPendingToken(payload: Omit<PendingPayload, "pending2fa">): string {
  return jwt.sign({ ...payload, pending2fa: true }, JWT_SECRET, { expiresIn: "5m" });
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload & { pending2fa?: boolean };
    if (decoded.pending2fa) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function verifyPendingToken(token: string): Omit<PendingPayload, "pending2fa"> | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as PendingPayload;
    if (!decoded.pending2fa) return null;
    return { adminId: decoded.adminId, email: decoded.email };
  } catch {
    return null;
  }
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token =
    req.cookies?.[COOKIE_NAME] ??
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Non autorisé" });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Token invalide ou expiré" });
    return;
  }

  req.admin = payload;
  next();
}
