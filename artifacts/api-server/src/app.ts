import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import path from "path";
import { existsSync } from "fs";

const app: Express = express();

const CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : ["http://localhost:21570", "http://localhost:5173"];

function isAllowedOrigin(origin: string): boolean {
  if (CORS_ORIGIN.includes(origin)) return true;
  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    if (hostname.endsWith(".replit.dev") || hostname.endsWith(".janeway.replit.dev")) return true;
    for (const allowed of CORS_ORIGIN) {
      try {
        const allowedHost = new URL(allowed).hostname;
        if (hostname === `www.${allowedHost}` || `www.${hostname}` === allowedHost) return true;
      } catch {}
    }
  } catch {}
  return false;
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error(`CORS not allowed for origin: ${origin}`), false);
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// En production, servir le frontend buildé depuis le même serveur
const frontendDist = path.resolve(process.cwd(), "artifacts/aussie-farm/dist/public");
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
  logger.info({ frontendDist }, "Serving frontend static files");
}

export default app;
