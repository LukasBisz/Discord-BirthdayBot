import {
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { configuration } from "../db/schema";

export async function isServerSetup(
  interaction: ChatInputCommandInteraction,
): Promise<boolean> {
  if (!interaction.guildId) {
    await interaction.reply({
      content: "❌ Dieser Befehl kann nur auf einem Server ausgeführt werden.",
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  const [config] = await db
    .select()
    .from(configuration)
    .where(eq(configuration.guildId, interaction.guildId));

  if (!config || !config.setupComplete) {
    const isAdmin =
      interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) ??
      false;

    const messageContent = isAdmin
      ? "⚙️ Der BirthdayBot wurde auf diesem Server noch nicht eingerichtet.\nBitte führe zuerst `/birthday-admin setup` aus, um den Zielkanal festzulegen."
      : "⚙️ Der BirthdayBot wurde auf diesem Server noch nicht eingerichtet.\nBitte wende dich an einen Administrator, um die Einrichtung abzuschließen.";

    await interaction.reply({
      content: messageContent,
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  return true;
}
