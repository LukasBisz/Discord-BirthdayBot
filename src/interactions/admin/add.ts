import { MessageFlags, ModalSubmitInteraction } from "discord.js";
import {
  BIRTHDAY_DATE_REGEX,
  BIRTHDAY_YEAR_REGEX,
  DISCORD_ID_REGEX,
} from "../../utils/regex";
import { db } from "../../db/connection";
import { birthdays } from "../../db/schema";
import { eq, and } from "drizzle-orm";

export async function handleAdminAddModal(interaction: ModalSubmitInteraction) {
  if (!interaction.guildId) {
    return interaction.reply({
      content: "❌ Dieser Befehl kann nur auf einem Server ausgeführt werden.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const targetInput = interaction.fields
    .getTextInputValue("target_input")
    .trim();
  const dateStr = interaction.fields.getTextInputValue("date_input").trim();
  const yearStr = interaction.fields.getTextInputValue("year_input").trim();

  const guildId = interaction.guildId;
  const addedBy = interaction.user.id;

  const dateMatch = dateStr.match(BIRTHDAY_DATE_REGEX);
  if (!dateMatch) {
    return interaction.reply({
      content:
        "❌ Bitte gib ein gültiges Datum im Format **TT.MM** ein (z. B. `15.04`).",
      flags: MessageFlags.Ephemeral,
    });
  }

  const day = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10);

  let year: number | null = null;
  if (yearStr !== "") {
    const currentYear = new Date().getFullYear();
    if (
      !BIRTHDAY_YEAR_REGEX.test(yearStr) ||
      parseInt(yearStr, 10) > currentYear
    ) {
      return interaction.reply({
        content: `❌ Bitte gib ein realistisches Geburtsjahr ein (zwischen 1900 und ${currentYear}).`,
        flags: MessageFlags.Ephemeral,
      });
    }
    year = parseInt(yearStr, 10);
  }

  const testYear = year ?? 2024;
  const calenderCheck = new Date(testYear, month - 1, day);
  if (
    calenderCheck.getMonth() !== month - 1 ||
    calenderCheck.getDate() !== day
  ) {
    return interaction.reply({
      content:
        "❌ Diesen Tag gibt es im angegebenen Monat nicht (z. B. 31. April oder 30. Februar).",
      flags: MessageFlags.Ephemeral,
    });
  }

  let displayName = targetInput;
  if (DISCORD_ID_REGEX.test(targetInput)) {
    const user = await interaction.client.users
      .fetch(targetInput)
      .catch(() => null);
    if (user) displayName = `@${user.username}`;
  }

  try {
    const [existingBirthday] = await db
      .select()
      .from(birthdays)
      .where(
        and(
          eq(birthdays.guildId, guildId),
          eq(birthdays.birthdayId, targetInput),
        ),
      );

    if (existingBirthday) {
      await db
        .update(birthdays)
        .set({ day, month, year, addedBy })
        .where(
          and(
            eq(birthdays.guildId, guildId),
            eq(birthdays.birthdayId, targetInput),
          ),
        );
    } else {
      await db.insert(birthdays).values({
        guildId,
        birthdayId: targetInput,
        addedBy,
        day,
        month,
        year,
      });
    }

    const formattedDay = String(day).padStart(2, "0");
    const formattedMonth = String(month).padStart(2, "0");
    const dateDisplay = year
      ? `${formattedDay}.${formattedMonth}.${year}`
      : `${formattedDay}.${formattedMonth}.`;

    await interaction.reply({
      content: `🎉 Der Geburtstag von **${displayName}** wurde erfolgreich auf den **${dateDisplay}** gespeichert!`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.error("❌ Fehler beim Speichern des Geburtstags:", error);
    await interaction.reply({
      content: "❌ Beim Speichern in die Datenbank ist ein Fehler aufgetreten.",
      flags: MessageFlags.Ephemeral,
    });
  }
}
