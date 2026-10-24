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
    .setDescription("Lösche deinen eingetragenen Geburtstag.");
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const confirmButton = new ButtonBuilder()
    .setCustomId("user_remove_birthday_confirm")
    .setLabel("Ja, löschen")
    .setStyle(ButtonStyle.Danger)
    .setEmoji("🗑️");

  const cancelButton = new ButtonBuilder()
    .setCustomId("user_remove_birthday_cancel")
    .setLabel("Abbrechen")
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    confirmButton,
    cancelButton,
  );

  await interaction.reply({
    content:
      "⚠️ Möchtest du deinen eingetragenen Geburtstag wirklich aus der Datenbank entfernen?",
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}
