import { ActionRowBuilder, ButtonBuilder } from "discord.js";
import {
  ButtonStyle,
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandSubcommandBuilder,
} from "discord.js";

export function registerSubcommand(subcommand: SlashCommandSubcommandBuilder) {
  return subcommand
    .setName("remove")
    .setDescription("Delete your registered birthday.");
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const confirmButton = new ButtonBuilder()
    .setCustomId("user_remove_birthday_confirm")
    .setLabel("Yes, delete")
    .setStyle(ButtonStyle.Danger)
    .setEmoji("🗑️");

  const cancelButton = new ButtonBuilder()
    .setCustomId("user_remove_birthday_cancel")
    .setLabel("Cancel")
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    confirmButton,
    cancelButton,
  );

  await interaction.reply({
    content:
      "⚠️ Are you sure you want to remove your registered birthday from the database?",
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}
