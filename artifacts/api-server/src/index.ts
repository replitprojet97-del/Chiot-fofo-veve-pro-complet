import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function runStartupMigrations() {
  const client = await pool.connect();
  try {
    await client.query(
      `ALTER TABLE puppies ADD COLUMN IF NOT EXISTS reserved_for TEXT;`
    );
    logger.info("Startup migrations completed successfully");
  } catch (err) {
    logger.error({ err }, "Startup migration failed");
    throw err;
  } finally {
    client.release();
  }
}

runStartupMigrations()
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }

      logger.info({ port }, "Server listening");

      const selfUrl = process.env["RENDER_EXTERNAL_URL"];
      if (selfUrl) {
        const INTERVAL_MS = 14 * 60 * 1000;
        setInterval(async () => {
          try {
            const res = await fetch(`${selfUrl}/healthz`);
            logger.info({ status: res.status }, "Keepalive ping sent");
          } catch (err) {
            logger.warn({ err }, "Keepalive ping failed");
          }
        }, INTERVAL_MS);
        logger.info({ selfUrl, intervalMin: 14 }, "Keepalive cron started");
      }
    });
  })
  .catch((err) => {
    logger.error({ err }, "Failed to run startup migrations — server not started");
    process.exit(1);
  });
