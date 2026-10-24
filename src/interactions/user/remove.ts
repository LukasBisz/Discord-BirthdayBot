import { ButtonInteraction } from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "../../db/connection";
import { birthdays } from "../../db/schema";

export async function removeInteraction(interaction: ButtonInteraction) {
  const userId = interaction.user.id;

  if (interaction.customId === "user_remove_birthday_cancel") {
    return interaction.update({
      content: "❌ Vorgang abgebrochen. Dein Geburtstag bleibt unverändert.",
      components: [],
    });
  }

  if (interaction.customId === "user_remove_birthday_confirm") {
    try {
      const [existingBirthday] = await db
        .select()
        .from(birthdays)
        .where(eq(birthdays.birthdayId, userId));

      if (!existingBirthday) {
        return interaction.update({
          content: "ℹ️ Du hattest bisher gar keinen Geburtstag eingetragen.",
          components: [],
        });
      }

      await db.delete(birthdays).where(eq(birthdays.birthdayId, userId));

      return interaction.update({
        content: "🗑️ Dein Geburtstag wurde erfolgreich gelöscht.",
        components: [],
      });
    } catch (error) {
      console.error("❌ Fehler beim Löschen des Geburtstags:", error);
      return interaction.update({
        content:
          "❌ Beim Löschen deines Geburtstags ist ein Fehler aufgetreten.",
        components: [],
      });
    }
  }
}
