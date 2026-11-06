import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { handleRemoveCommand } from "../../../interactions/user/remove";

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

  await handleRemoveCommand(interaction, [row]);
}
