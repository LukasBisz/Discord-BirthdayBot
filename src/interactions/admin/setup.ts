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
      content: "❌ Diese Aktion kann nur auf einem Server ausgeführt werden.",
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
      content: `✅ Der Geburtstagskanal wurde erfolgreich auf <#${selectedChannelId}> festgelegt!`,
      components: [],
    });
  } catch (error) {
    console.error("❌ Fehler beim Speichern des Geburtstagskanals:", error);
    await interaction.reply({
      content:
        "❌ Beim Speichern der Kanaleinstellungen ist ein Fehler aufgetreten.",
      ephemeral: true,
    });
  }
}
