import { db } from "./connection";
import { eq } from "drizzle-orm";
import { birthdays, configuration } from "./schema";
import { Client } from "discord.js";

export async function initGuild(guildId: string): Promise<void> {
  try {
    const [existing] = await db
      .select()
      .from(configuration)
      .where(eq(configuration.guildId, guildId));

    if (!existing) {
      await db.insert(configuration).values({
        guildId,
        setupComplete: false,
      });
      console.log(`📝 Konfiguration für Server (${guildId}) initial angelegt.`);
    }
  } catch (error) {
    console.error(
      `❌ Fehler beim Anlegen der Konfiguration für (${guildId}):`,
      error,
    );
  }
}

export async function syncGuild(client: Client): Promise<void> {
  try {
    const guilds = await client.guilds.fetch();
    for (const [guildId] of guilds) {
      await initGuild(guildId);
    }
    console.log(
      `✅ Alle Server-Konfigurationen synchronisiert (${guilds.size} Server).`,
    );
  } catch (error) {
    console.error(
      "❌ Fehler beim Synchronisieren der Server-Konfigurationen:",
      error,
    );
  }
}

export async function cleanupGuild(guildId: string): Promise<void> {
  try {
    await db.delete(configuration).where(eq(configuration.guildId, guildId));
    await db.delete(birthdays).where(eq(birthdays.guildId, guildId));
    console.log(
      `🧹 Daten für Server (${guildId}) wurden vollständig bereinigt.`,
    );
  } catch (error) {
    console.error(
      `❌ Fehler beim Bereinigen der Daten für Server (${guildId}):`,
      error,
    );
  }
}
