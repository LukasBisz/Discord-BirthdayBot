import {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandSubcommandBuilder,
  MessageFlags,
} from "discord.js";

export function registerSubcommand(subcommand: SlashCommandSubcommandBuilder) {
  return subcommand
    .setName("setup")
    .setDescription("Wähle den Zielkanal für die Geburtstagsglückwünsche aus.");
}

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content:
        "❌ Du benötigst Administrator-Rechte, um das Setup auszuführen.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const channelSelector = new ChannelSelectMenuBuilder()
    .setCustomId("setup_channel_selector")
    .setPlaceholder("Wähle einen Textkanal aus...")
    .setChannelTypes([ChannelType.GuildText])
    .setMinValues(1)
    .setMaxValues(1);

  const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
    channelSelector,
  );

  await interaction.reply({
    content:
      "📌 Bitte wähle über das Dropdown-Menü aus, in welchen Kanal die Geburtstage gepostet werden sollen:",
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}
