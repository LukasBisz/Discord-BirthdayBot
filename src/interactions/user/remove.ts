import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/connection";
import { birthdays } from "../../db/schema";
import { logger } from "../../utils/logger";

export async function handleRemoveCommand(
  interaction: ChatInputCommandInteraction,
  components: ActionRowBuilder<ButtonBuilder>[],
) {
  if (!interaction.guildId) {
    return interaction.reply({
      content: "❌ This command can only be used in a server.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const [existing] = await db
    .select()
    .from(birthdays)
    .where(
      and(
        eq(birthdays.birthdayId, interaction.user.id),
        eq(birthdays.guildId, interaction.guildId),
      ),
    );

  if (!existing) {
    return interaction.reply({
      content: "ℹ️ You don't have a birthday registered on this server.",
      flags: MessageFlags.Ephemeral,
    });
  }

  return interaction.reply({
    content:
      "⚠️ Are you sure you want to remove your registered birthday from the database?",
    components,
    flags: MessageFlags.Ephemeral,
  });
}

export async function removeInteraction(interaction: ButtonInteraction) {
  const userId = interaction.user.id;
  const guildId = interaction.guildId;

  if (interaction.customId === "user_remove_birthday_cancel") {
    return interaction.update({
      content: "❌ Action cancelled. Your birthday remains unchanged.",
      components: [],
    });
  }

  if (interaction.customId === "user_remove_birthday_confirm") {
    if (!guildId) {
      return interaction.update({
        content: "❌ This action can only be performed in a server.",
        components: [],
      });
    }

    try {
      const [existingBirthday] = await db
        .select()
        .from(birthdays)
        .where(
          and(
            eq(birthdays.birthdayId, userId),
            eq(birthdays.guildId, guildId),
          ),
        );

      if (!existingBirthday) {
        return interaction.update({
          content: "ℹ️ You did not have a birthday registered.",
          components: [],
        });
      }

      await db
        .delete(birthdays)
        .where(
          and(
            eq(birthdays.birthdayId, userId),
            eq(birthdays.guildId, guildId),
          ),
        );

      logger.actionRemove(
        `Birthday removed | Target: ${logger.formatUser(interaction.user)}`,
      );

      return interaction.update({
        content: "🗑️ Your birthday has been deleted successfully.",
        components: [],
      });
    } catch (error) {
      logger.error("Error deleting birthday:", error);
      return interaction.update({
        content: "❌ An error occurred while deleting your birthday.",
        components: [],
      });
    }
  }
}
