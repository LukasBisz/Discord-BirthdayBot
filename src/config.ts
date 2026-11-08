import dotenv from "dotenv";

dotenv.config();

// Normalize keys in process.env (Docker Compose env_file leaves trailing spaces if '=' has spaces around it)
for (const [key, value] of Object.entries(process.env)) {
  const trimmedKey = key.trim();
  if (trimmedKey !== key && value !== undefined) {
    process.env[trimmedKey] = value.trim();
  }
}

const DISCORD_TOKEN = process.env.DISCORD_TOKEN?.trim();
const DATABASE_URL = process.env.DATABASE_URL?.trim();

if (!DISCORD_TOKEN) {
  console.error("❌ Available environment keys:", Object.keys(process.env));
  throw new Error("❌ Missing Discord Token!");
}

export const config = {
  DISCORD_TOKEN,
  DATABASE_URL: DATABASE_URL || "file:database.sqlite",
};
