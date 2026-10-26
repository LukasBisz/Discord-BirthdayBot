import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { configuration } from "../db/schema";

export async function isServerSetup(
  interaction: ChatInputCommandInteraction,
): Promise<boolean> {
  if (!interaction.guildId) {
    await interaction.reply({
      content: "❌ Dieser Befehl kann nur auf einem Server ausgeführt werden.",
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  const [config] = await db
    .select()
    .from(configuration)
    .where(eq(configuration.guildId, interaction.guildId));

  if (!config || !config.setupComplete) {
    await interaction.reply({
      content:
        "⚙️ Der BirthdayBot wurde auf diesem Server noch nicht eingerichtet.\nEin Administrator muss zuerst `/birthday-admin setup` ausführen.",
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  return true;
}
