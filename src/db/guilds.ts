import { db } from "./connection";
import { eq, and } from "drizzle-orm";
import { birthdays, configuration } from "./schema";
import { Client } from "discord.js";
import { logger } from "../utils/logger";

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
      logger.dbSync(`Initialized configuration for guild (${guildId}).`);
    }
  } catch (error) {
    logger.dbError(
      `Error creating configuration for guild (${guildId}):`,
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
    logger.dbSync(
      `All guild configurations synchronized successfully (${guilds.size} guild(s)).`,
    );
  } catch (error) {
    logger.dbError("Error synchronizing guild configurations:", error);
  }
}

export async function cleanupGuild(guildId: string): Promise<void> {
  try {
    await db.delete(configuration).where(eq(configuration.guildId, guildId));
    await db.delete(birthdays).where(eq(birthdays.guildId, guildId));
    logger.dbCleanup(`Data for guild (${guildId}) was cleaned up successfully.`);
  } catch (error) {
    logger.dbError(`Error cleaning up data for guild (${guildId}):`, error);
  }
}

export async function cleanupMemberBirthday(
  guildId: string,
  userId: string,
  username?: string,
  guildName?: string,
): Promise<void> {
  try {
    const [existing] = await db
      .select()
      .from(birthdays)
      .where(
        and(eq(birthdays.guildId, guildId), eq(birthdays.birthdayId, userId)),
      );

    if (existing) {
      await db
        .delete(birthdays)
        .where(
          and(eq(birthdays.guildId, guildId), eq(birthdays.birthdayId, userId)),
        );

      const userTag = logger.formatUser(username ?? userId, userId);
      const guildTag = logger.formatGuild(guildName ?? guildId, guildId);
      logger.dbCleanup(
        `Removed birthday for member ${userTag} who left guild ${guildTag}.`,
      );
    }
  } catch (error) {
    logger.dbError(
      `Error removing birthday for member (${userId}) in guild (${guildId}):`,
      error,
    );
  }
}
