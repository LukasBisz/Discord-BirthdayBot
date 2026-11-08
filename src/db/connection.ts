import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema.js";
import { config } from "../config.js";
import { logger } from "../utils/logger";

const dbPath = config.DATABASE_URL.replace("file:", "");
const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema });

export const connectToDatabase = async () => {
  try {
    migrate(db, { migrationsFolder: "./src/db/drizzle" });

    logger.dbSync("Connection to Database has been established successfully.");
    logger.dbSync("All models were synchronized successfully.");
  } catch (error) {
    logger.dbError("Unable to connect to the database:", error);
    process.exit(1);
  }
};
