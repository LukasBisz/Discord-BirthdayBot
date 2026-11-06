import {
  LabelBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  SlashCommandSubcommandBuilder,
  TextInputStyle,
  TextInputBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { TIMEZONE_OPTIONS } from "../../../constants/timezones";

export function registerSubcommand(subcommand: SlashCommandSubcommandBuilder) {
  return subcommand
    .setName("add")
    .setDescription("Register a birthday for a member or external person.");
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const modal = new ModalBuilder()
    .setCustomId("admin_add_birthday_modal")
    .setTitle("Register Birthday (Admin)");

  const targetInput = new TextInputBuilder()
    .setCustomId("target_input")
    .setPlaceholder("e.g. 1561394751264137227 or Friend")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const dateInput = new TextInputBuilder()
    .setCustomId("date_input")
    .setPlaceholder("DD.MM")
    .setStyle(TextInputStyle.Short)
    .setMinLength(3)
    .setMaxLength(5)
    .setRequired(true);

  const yearInput = new TextInputBuilder()
    .setCustomId("year_input")
    .setPlaceholder("Optional")
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

  const targetLabel = new LabelBuilder()
    .setLabel("Discord ID or name of the person.")
    .setTextInputComponent(targetInput);

  const dateLabel = new LabelBuilder()
    .setLabel("Birth date.")
    .setTextInputComponent(dateInput);

  const yearLabel = new LabelBuilder()
    .setLabel("Birth year.")
    .setTextInputComponent(yearInput);

  const timezoneLabel = new LabelBuilder()
    .setLabel("Select a time zone.")
    .setStringSelectMenuComponent(selectTimeZone);

  modal.addLabelComponents(targetLabel, dateLabel, yearLabel, timezoneLabel);

  await interaction.showModal(modal);
}
