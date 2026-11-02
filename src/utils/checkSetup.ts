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
      content: "❌ This command can only be used in a server.",
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
      ? "⚙️ BirthdayBot has not been set up on this server yet.\nPlease run `/birthday-admin setup` first to configure the announcement channel."
      : "⚙️ BirthdayBot has not been set up on this server yet.\nPlease contact an Administrator to complete the setup.";

    await interaction.reply({
      content: messageContent,
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  return true;
}
