import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema.js";

const sqlite = new Database("database.sqlite");
export const db = drizzle(sqlite, { schema });

export const connectToDatabase = async () => {
  try {
    migrate(db, { migrationsFolder: "./src/db/drizzle" });

    console.log("✅ Connection to Database has been established successfully.");
    console.log("✅ All models were synchronized successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1);
  }
};
