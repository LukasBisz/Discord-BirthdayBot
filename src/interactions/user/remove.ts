import { ButtonInteraction } from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "../../db/connection";
import { birthdays } from "../../db/schema";

export async function removeInteraction(interaction: ButtonInteraction) {
  const userId = interaction.user.id;

  if (interaction.customId === "user_remove_birthday_cancel") {
    return interaction.update({
      content: "❌ Action cancelled. Your birthday remains unchanged.",
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
          content: "ℹ️ You did not have a birthday registered.",
          components: [],
        });
      }

      await db.delete(birthdays).where(eq(birthdays.birthdayId, userId));

      return interaction.update({
        content: "🗑️ Your birthday has been deleted successfully.",
        components: [],
      });
    } catch (error) {
      console.error("❌ Error deleting birthday:", error);
      return interaction.update({
        content:
          "❌ An error occurred while deleting your birthday.",
        components: [],
      });
    }
  }
}
