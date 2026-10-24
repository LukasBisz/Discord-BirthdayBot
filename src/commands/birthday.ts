import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import * as addCommand from "./subcommands/user/add";
import * as removeCommand from "./subcommands/user/remove";

export const data = new SlashCommandBuilder()
  .setName("birthday")
  .setDescription("Geburtstags-Befehle")
  .addSubcommand((subcommand) => addCommand.registerSubcommand(subcommand))
  .addSubcommand((subcommand) => removeCommand.registerSubcommand(subcommand));

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "add") {
    await addCommand.execute(interaction);
  } else if (subcommand === "remove") {
    await removeCommand.execute(interaction);
  }
}
