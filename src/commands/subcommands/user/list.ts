import {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { handleListInteraction } from "../../../interactions/user/list";

export function registerSubcommand(subcommand: SlashCommandSubcommandBuilder) {
  return subcommand
    .setName("list")
    .setDescription("Zeigt die nächsten 5 anstehenden Geburtstage an.");
}
export async function execute(interaction: ChatInputCommandInteraction) {
  await handleListInteraction(interaction);
}