import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import * as setupCommand from "./subcommands/admin/setup";

export const data = new SlashCommandBuilder()
  .setName("birthday-admin")
  .setDescription("Verwalte und konfiguriere den BirthdayBot.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand((subcommand) => setupCommand.registerSubcommand(subcommand));

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "setup") {
    await setupCommand.execute(interaction);
  }
}
