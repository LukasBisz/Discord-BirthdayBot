import dotenv from "dotenv";

dotenv.config();

const { DISCORD_TOKEN, DATABASE_URL } = process.env;

if (!DISCORD_TOKEN) {
  throw new Error("❌ Missing Discord Token!");
}

export const config = {
  DISCORD_TOKEN,
  DATABASE_URL: DATABASE_URL || "file:database.sqlite",
};
