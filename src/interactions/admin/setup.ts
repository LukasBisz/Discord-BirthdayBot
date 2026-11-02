import {
  ChannelSelectMenuInteraction,
  SelectMenuDefaultValueType,
} from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "../../db/connection";
import { configuration } from "../../db/schema";

export async function setupInteraction(
  interaction: ChannelSelectMenuInteraction,
) {
  if (!interaction.guildId) {
    return interaction.reply({
      content: "❌ This action can only be used in a server.",
      ephemeral: true,
    });
  }

  const guildId = interaction.guildId;
  const selectedChannelId = interaction.values[0];

  try {
    const [existingConfig] = await db
      .select()
      .from(configuration)
      .where(eq(configuration.guildId, guildId));

    if (existingConfig) {
      await db
        .update(configuration)
        .set({
          channelId: selectedChannelId,
          setupComplete: true,
        })
        .where(eq(configuration.guildId, guildId));
    } else {
      await db.insert(configuration).values({
        guildId,
        channelId: selectedChannelId,
        setupComplete: true,
      });
    }

    await interaction.update({
      content: `✅ The birthday announcement channel has been set to <#${selectedChannelId}>!`,
      components: [],
    });
  } catch (error) {
    console.error("❌ Error saving birthday channel:", error);
    await interaction.reply({
      content:
        "❌ An error occurred while saving the channel settings.",
      ephemeral: true,
    });
  }
}
