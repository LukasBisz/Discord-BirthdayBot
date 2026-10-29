import { MessageFlags, ModalSubmitInteraction } from "discord.js";
import { eq, and } from "drizzle-orm";
import { db } from "../../db/connection";
import { birthdays } from "../../db/schema";
import { BIRTHDAY_DATE_REGEX, BIRTHDAY_YEAR_REGEX } from "../../utils/regex";
import { announceBirthday } from "../../jobs/birthdayJob";

export async function addInteraction(interaction: ModalSubmitInteraction) {
  if (!interaction.guildId) {
    return interaction.reply({
      content: "❌ Dieser Befehl kann nur auf einem Server ausgeführt werden.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const dateStr = interaction.fields.getTextInputValue("date_input").trim();
  const yearStr = interaction.fields.getTextInputValue("year_input").trim();

  const userId = interaction.user.id;
  const guildId = interaction.guildId;

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
        content: `❌ Bitte gib ein realistisches Geburtsjahr ein (z. B. zwischen 1900 und ${currentYear}).`,
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

  try {
    const [existingBirthday] = await db
      .select()
      .from(birthdays)
      .where(
        and(eq(birthdays.guildId, guildId), eq(birthdays.birthdayId, userId)),
      );

    if (existingBirthday) {
      await db
        .update(birthdays)
        .set({
          day,
          month,
          year,
          addedBy: userId,
        })
        .where(
          and(eq(birthdays.guildId, guildId), eq(birthdays.birthdayId, userId)),
        );
    } else {
      await db.insert(birthdays).values({
        guildId,
        birthdayId: userId,
        addedBy: userId,
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
      content: `🎉 Dein Geburtstag wurde erfolgreich auf den **${dateDisplay}** gespeichert!`,
      flags: MessageFlags.Ephemeral,
    });

    const now = new Date();
    const isToday = day === now.getDate() && month === now.getMonth() + 1;

    if (isToday) {
      await announceBirthday(interaction.client, guildId, userId, year);
    }
  } catch (error) {
    console.error("❌ Fehler beim Speichern des Geburtstags:", error);
    await interaction.reply({
      content:
        "❌ Beim Speichern deines Geburtstags in der Datenbank ist ein Fehler aufgetreten.",
      flags: MessageFlags.Ephemeral,
    });
  }
}
