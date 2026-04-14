import bcrypt from "bcryptjs";
import { db, adminUsersTable, puppiesTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("❌  ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD env vars are required");
  process.exit(1);
}

const PUPPIES = [
  {
    name: "Milo",
    ageWeeks: 8,
    color: "bleu merle" as const,
    sex: "Mâle" as const,
    price: 1800,
    description: "Milo est un chiot très joueur et affectueux. Il adore explorer et a une belle robe bleue bien marquée.",
    traits: ["Joueur", "Curieux", "Très affectueux"],
    parents: "Luna (Bleu Merle) x Orion (Noir Tricolore)",
    images: ["/images/puppy-bleu-merle.png", "/images/aussie-modal-extra.png", "/images/farm-pastoral.png", "/images/aussie-hero.png"],
    status: "available" as const,
    isPremium: true,
  },
  {
    name: "Ruby",
    ageWeeks: 9,
    color: "rouge merle" as const,
    sex: "Femelle" as const,
    price: 2000,
    description: "Ruby est une petite femelle douce et calme. Elle est très attentive et sera parfaite pour une famille avec enfants.",
    traits: ["Calme", "Attentive", "Douce"],
    parents: "Stella (Rouge Merle) x Orion (Noir Tricolore)",
    images: ["/images/puppy-rouge-merle.png", "/images/aussie-modal-extra.png", "/images/farm-pastoral.png"],
    status: "available" as const,
    isPremium: false,
  },
  {
    name: "Buster",
    ageWeeks: 8,
    color: "noir tricolore" as const,
    sex: "Mâle" as const,
    price: 1500,
    description: "Buster est plein d'énergie et très intelligent. Il apprend vite et ferait un excellent chien de sport.",
    traits: ["Énergique", "Intelligent", "Sportif"],
    parents: "Luna (Bleu Merle) x Orion (Noir Tricolore)",
    images: ["/images/puppy-noir-tricolore.png", "/images/aussie-modal-extra.png", "/images/farm-pastoral.png"],
    status: "available" as const,
    isPremium: false,
  },
  {
    name: "Hazel",
    ageWeeks: 10,
    color: "rouge tricolore" as const,
    sex: "Femelle" as const,
    price: 1600,
    description: "Hazel a un magnifique pelage rouge et un regard très expressif. Elle est câline et toujours prête pour une promenade.",
    traits: ["Câline", "Expressive", "Sociable"],
    parents: "Stella (Rouge Merle) x Jasper (Rouge Tricolore)",
    images: ["/images/puppy-rouge-tricolore.png", "/images/aussie-modal-extra.png", "/images/farm-pastoral.png", "/images/aussie-hero.png"],
    status: "available" as const,
    isPremium: false,
  },
  {
    name: "Oscar",
    ageWeeks: 7,
    color: "bleu merle" as const,
    sex: "Mâle" as const,
    price: 1900,
    description: "Oscar est le petit clown de la portée. Il est toujours prêt à faire des bêtises pour attirer l'attention.",
    traits: ["Rigolo", "Sociable", "Actif"],
    parents: "Luna (Bleu Merle) x Orion (Noir Tricolore)",
    images: ["/images/puppy-bleu-merle.png", "/images/farm-pastoral.png", "/images/aussie-hero.png"],
    status: "available" as const,
    isPremium: false,
  },
  {
    name: "Bella",
    ageWeeks: 8,
    color: "rouge merle" as const,
    sex: "Femelle" as const,
    price: 2200,
    description: "Bella a des yeux vairons magnifiques. Elle est très proche de l'homme et demande beaucoup de tendresse.",
    traits: ["Proche de l'homme", "Tendre", "Observatrice"],
    parents: "Stella (Rouge Merle) x Orion (Noir Tricolore)",
    images: ["/images/puppy-rouge-merle.png", "/images/aussie-modal-extra.png", "/images/farm-pastoral.png"],
    status: "available" as const,
    isPremium: false,
  },
];

async function seed() {
  console.log("🌱  Starting seed...\n");

  // ── Admin ──────────────────────────────────────────────────────────────────
  const existing = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, ADMIN_EMAIL!.toLowerCase()))
    .limit(1);

  if (existing.length > 0) {
    console.log(`✅  Admin already exists: ${ADMIN_EMAIL}`);
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD!, 12);
    await db.insert(adminUsersTable).values({
      email: ADMIN_EMAIL!.toLowerCase(),
      passwordHash,
    });
    console.log(`✅  Admin created: ${ADMIN_EMAIL}`);
  }

  // ── Puppies ────────────────────────────────────────────────────────────────
  const [{ total }] = await db.select({ total: count() }).from(puppiesTable);

  if (Number(total) > 0) {
    console.log(`✅  Puppies already seeded (${total} found — skipping)`);
  } else {
    await db.insert(puppiesTable).values(PUPPIES);
    console.log(`✅  ${PUPPIES.length} puppies inserted`);
  }

  console.log("\n🎉  Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
