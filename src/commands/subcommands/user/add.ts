import {
  ChatInputCommandInteraction,
  LabelBuilder,
  ModalBuilder,
  SlashCommandSubcommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { TIMEZONE_OPTIONS } from "../../../constants/timezones";

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
    .setPlaceholder("DD.MM")
    .setStyle(TextInputStyle.Short)
    .setMinLength(3)
    .setMaxLength(5)
    .setRequired(true);

  const yearInput = new TextInputBuilder()
    .setCustomId("year_input")
    .setPlaceholder("(Optional)")
    .setStyle(TextInputStyle.Short)
    .setMaxLength(4)
    .setRequired(false);

  const selectTimeZone = new StringSelectMenuBuilder()
    .setCustomId("select_time_zone")
    .setPlaceholder("Select your time zone")
    .setRequired(true)
    .addOptions(
      TIMEZONE_OPTIONS.map((tz) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(tz.label)
          .setDescription(tz.description)
          .setValue(tz.value)
          .setEmoji(tz.emoji),
      ),
    );

  const dateLabel = new LabelBuilder()
    .setLabel("When is your birthday?")
    .setTextInputComponent(dateInput);

  const yearLabel = new LabelBuilder()
    .setLabel("What year were you born?")
    .setTextInputComponent(yearInput);

  const timezoneLabel = new LabelBuilder()
    .setLabel("Select your time zone.")
    .setStringSelectMenuComponent(selectTimeZone);

  modal.addLabelComponents(dateLabel, yearLabel, timezoneLabel);

  await interaction.showModal(modal);
}
