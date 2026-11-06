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
    .setDescription("Select the channel for birthday announcements.");
}

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content:
        "❌ You need Administrator permissions to run the setup.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const channelSelector = new ChannelSelectMenuBuilder()
    .setCustomId("setup_channel_selector")
    .setPlaceholder("Select a text channel...")
    .setChannelTypes([ChannelType.GuildText])
    .setMinValues(1)
    .setMaxValues(1);

  const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
    channelSelector,
  );

  await interaction.reply({
    content:
      "📌 Please use the dropdown menu to select the channel where birthday announcements should be posted:",
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}
