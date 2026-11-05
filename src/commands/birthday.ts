import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { isServerSetup } from "../interactions/admin/setup";
import * as addCommand from "./subcommands/user/add";
import * as removeCommand from "./subcommands/user/remove";
import * as listCommand from "./subcommands/user/list";

export const data = new SlashCommandBuilder()
  .setName("birthday")
  .setDescription("Birthday commands")
  .addSubcommand((subcommand) => addCommand.registerSubcommand(subcommand))
  .addSubcommand((subcommand) => removeCommand.registerSubcommand(subcommand))
  .addSubcommand((subcommand) => listCommand.registerSubcommand(subcommand));

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!(await isServerSetup(interaction))) return;
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "add") {
    await addCommand.execute(interaction);
  } else if (subcommand === "remove") {
    await removeCommand.execute(interaction);
  } else if (subcommand === "list") {
    await listCommand.execute(interaction);
  }
}
