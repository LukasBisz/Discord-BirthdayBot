import { MessageFlags, ModalSubmitInteraction } from "discord.js";
import {
  BIRTHDAY_DATE_REGEX,
  BIRTHDAY_YEAR_REGEX,
  DISCORD_ID_REGEX,
} from "../../utils/regex";
import { db } from "../../db/connection";
import { birthdays } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import {
  announceBirthday,
  isBirthdayToday,
  toDateString,
} from "../../jobs/birthdayJob";
import { DateTime } from "luxon";
import { logger } from "../../utils/logger";

export async function handleAdminAddModal(interaction: ModalSubmitInteraction) {
  if (!interaction.guildId) {
    return interaction.reply({
      content: "❌ This command can only be used in a server.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const targetInput = interaction.fields
    .getTextInputValue("target_input")
    .trim();
  const dateStr = interaction.fields.getTextInputValue("date_input").trim();
  const yearStr = interaction.fields.getTextInputValue("year_input").trim();
  const timezone =
    interaction.fields.getStringSelectValues("select_time_zone")[0];

  const guildId = interaction.guildId;
  const addedBy = interaction.user.id;

  const dateMatch = dateStr.match(BIRTHDAY_DATE_REGEX);
  if (!dateMatch) {
    return interaction.reply({
      content:
        "❌ Please enter a valid date in the format **DD.MM** (e.g. `15.04`).",
      flags: MessageFlags.Ephemeral,
    });
  }

  const day = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10);

  let year: number | null = null;
  if (yearStr !== "") {
    const currentYear = DateTime.now().year;
    if (
      !BIRTHDAY_YEAR_REGEX.test(yearStr) ||
      parseInt(yearStr, 10) > currentYear
    ) {
      return interaction.reply({
        content: `❌ Please enter a realistic birth year (between 1900 and ${currentYear}).`,
        flags: MessageFlags.Ephemeral,
      });
    }
    year = parseInt(yearStr, 10);
  }

  const testYear = year ?? 2024;
  if (!DateTime.fromObject({ year: testYear, month, day }).isValid) {
    return interaction.reply({
      content:
        "❌ This day does not exist in the specified month (e.g. April 31st or February 30th).",
      flags: MessageFlags.Ephemeral,
    });
  }

  let displayName = `**${targetInput}**`;
  let targetUser = null;
  if (DISCORD_ID_REGEX.test(targetInput)) {
    targetUser = await interaction.client.users
      .fetch(targetInput)
      .catch(() => null);
    if (targetUser) displayName = `<@${targetUser.id}>`;
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
        .set({ day, month, year, timezone, addedBy })
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
        timezone,
      });
    }

    const formattedDay = String(day).padStart(2, "0");
    const formattedMonth = String(month).padStart(2, "0");
    const dateDisplay = year
      ? `${formattedDay}.${formattedMonth}.${year}`
      : `${formattedDay}.${formattedMonth}.`;

    await interaction.reply({
      content: `🎉 The birthday for ${displayName} was successfully saved for **${dateDisplay}**!`,
      flags: MessageFlags.Ephemeral,
    });

    const targetFormatted = targetUser
      ? logger.formatUser(targetUser)
      : logger.formatUser(targetInput, targetInput);

    if (existingBirthday) {
      logger.actionUpdate(
        `Birthday updated | Target: ${targetFormatted} | Executed by: ${logger.formatUser(interaction.user)}`,
      );
    } else if (targetInput === interaction.user.id) {
      logger.actionSelf(
        `Birthday added | Target: ${targetFormatted} | Executed by: ${logger.formatUser(interaction.user)}`,
      );
    } else {
      logger.actionAdd(
        `Birthday added | Target: ${targetFormatted} | Executed by: ${logger.formatUser(interaction.user)}`,
      );
    }

    const userTz = timezone || "UTC";
    const nowInTz = DateTime.now().setZone(userTz);
    const isToday = isBirthdayToday(day, month, nowInTz);

    if (isToday) {
      const todayString = toDateString(nowInTz);
      if (existingBirthday?.lastDisplayedAt !== todayString) {
        await announceBirthday(
          interaction.client,
          guildId,
          targetInput,
          year,
          userTz,
        );
      }
    }
  } catch (error) {
    logger.error("Error saving birthday:", error);
    await interaction.reply({
      content: "❌ An error occurred while saving to the database.",
      flags: MessageFlags.Ephemeral,
    });
  }
}
