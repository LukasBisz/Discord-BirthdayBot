import { ActionRowBuilder, TextInputBuilder } from "@discordjs/builders";
import {
  ChatInputCommandInteraction,
  ModalBuilder,
  SlashCommandSubcommandBuilder,
  TextInputStyle,
} from "discord.js";

export function registerSubcommand(subcommand: SlashCommandSubcommandBuilder) {
  return subcommand
    .setName("add")
    .setDescription(
      "Trage einen Geburtstag für ein Mitglied oder externe Person ein.",
    );
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const modal = new ModalBuilder()
    .setCustomId("admin_add_birthday_modal")
    .setTitle("Geburtstag eintragen (Admin)");

  const targetInput = new TextInputBuilder()
    .setCustomId("target_input")
    .setLabel("Discord-ID oder Name der Person")
    .setPlaceholder("z. B. 1561394751264137227 oder Freund")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const dateInput = new TextInputBuilder()
    .setCustomId("date_input")
    .setLabel("Geburtstag")
    .setPlaceholder("DD.MM")
    .setStyle(TextInputStyle.Short)
    .setMinLength(3)
    .setMaxLength(5)
    .setRequired(true);

  const yearInput = new TextInputBuilder()
    .setCustomId("year_input")
    .setLabel("Geburtsjahr")
    .setPlaceholder("Optional")
    .setStyle(TextInputStyle.Short)
    .setMaxLength(4)
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(targetInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(dateInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(yearInput),
  );

  await interaction.showModal(modal);
}
