import {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { handleListInteraction } from "../../../interactions/user/list";

export function registerSubcommand(subcommand: SlashCommandSubcommandBuilder) {
  return subcommand
    .setName("list")
    .setDescription("View the next 5 upcoming birthdays.");
}

export async function execute(interaction: ChatInputCommandInteraction) {
  await handleListInteraction(interaction);
}
