import {
  ChannelSelectMenuInteraction,
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "../../db/connection";
import { configuration } from "../../db/schema";
import { logger } from "../../utils/logger";

export async function setupInteraction(
  interaction: ChannelSelectMenuInteraction,
) {
  if (!interaction.guildId) {
    return interaction.reply({
      content: "❌ This action can only be used in a server.",
      ephemeral: true,
    });
  }

  const guildId = interaction.guildId;
  const selectedChannelId = interaction.values[0];

  try {
    const [existingConfig] = await db
      .select()
      .from(configuration)
      .where(eq(configuration.guildId, guildId));

    if (existingConfig) {
      await db
        .update(configuration)
        .set({
          channelId: selectedChannelId,
          setupComplete: true,
        })
        .where(eq(configuration.guildId, guildId));
    } else {
      await db.insert(configuration).values({
        guildId,
        channelId: selectedChannelId,
        setupComplete: true,
      });
    }

    await interaction.update({
      content: `✅ The birthday announcement channel has been set to <#${selectedChannelId}>!`,
      components: [],
    });
  } catch (error) {
    logger.error("Error saving birthday channel:", error);
    await interaction.reply({
      content:
        "❌ An error occurred while saving the channel settings.",
      ephemeral: true,
    });
  }
}

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
