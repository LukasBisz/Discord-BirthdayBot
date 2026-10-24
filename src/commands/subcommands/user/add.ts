import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  SlashCommandSubcommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

export function registerSubcommand(subcommand: SlashCommandSubcommandBuilder) {
  return subcommand
    .setName("add")
    .setDescription("Öffnet ein Formular, um einen Geburtstag einzutragen.");
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const modal = new ModalBuilder()
    .setCustomId("user_add_birthday_modal")
    .setTitle("Deinen Geburtstag eintragen");

  const dateInput = new TextInputBuilder()
    .setCustomId("date_input")
    .setLabel("Wann hast du Geburtstag?")
    .setPlaceholder("DD.MM")
    .setStyle(TextInputStyle.Short)
    .setMinLength(3)
    .setMaxLength(5)
    .setRequired(true);

  const yearInput = new TextInputBuilder()
    .setCustomId("year_input")
    .setLabel("In welchem Jahr bist du geboren?")
    .setPlaceholder("(Optional)")
    .setStyle(TextInputStyle.Short)
    .setMaxLength(4)
    .setRequired(false);

  const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    dateInput,
  );

  const secondRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    yearInput,
  );

  modal.addComponents(firstRow, secondRow);

  await interaction.showModal(modal);
}
