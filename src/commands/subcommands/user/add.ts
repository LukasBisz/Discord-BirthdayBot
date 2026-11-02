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
    .setDescription("Open a form to register your birthday.");
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const modal = new ModalBuilder()
    .setCustomId("user_add_birthday_modal")
    .setTitle("Register Your Birthday");

  const dateInput = new TextInputBuilder()
    .setCustomId("date_input")
    .setLabel("When is your birthday?")
    .setPlaceholder("DD.MM")
    .setStyle(TextInputStyle.Short)
    .setMinLength(3)
    .setMaxLength(5)
    .setRequired(true);

  const yearInput = new TextInputBuilder()
    .setCustomId("year_input")
    .setLabel("What year were you born?")
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
