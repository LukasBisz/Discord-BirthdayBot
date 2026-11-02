import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { showAdminRemoveMenu } from "../../../interactions/admin/remove";

export function registerSubcommand(subcommand: SlashCommandSubcommandBuilder) {
  return subcommand
    .setName("remove")
    .setDescription("Delete a registered birthday from this server.");
}

export async function execute(interaction: ChatInputCommandInteraction) {
  await showAdminRemoveMenu(interaction);
}
