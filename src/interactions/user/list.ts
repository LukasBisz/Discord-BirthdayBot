import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "../../db/connection";
import { birthdays } from "../../db/schema";
import { DISCORD_ID_REGEX } from "../../utils/regex";
import { DateTime } from "luxon";

const TIMEZONE = "Europe/Berlin";

export async function handleListInteraction(
  interaction: ChatInputCommandInteraction,
) {
  const guildId = interaction.guildId;
  if (!guildId) {
    return interaction.reply({
      content: "❌ This command can only be used in a server.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const guildBirthdays = await db
    .select()
    .from(birthdays)
    .where(eq(birthdays.guildId, guildId));

  if (guildBirthdays.length === 0) {
    return interaction.reply({
      content: "ℹ️ No birthdays have been registered on this server yet.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const today = DateTime.now().setZone(TIMEZONE).startOf("day");
  const currentYear = today.year;

  const upcomingList = guildBirthdays.map((b) => {
    let nextDate = DateTime.fromObject(
      { year: currentYear, month: b.month, day: b.day },
      { zone: TIMEZONE },
    ).startOf("day");

    if (nextDate <= today) {
      nextDate = nextDate.plus({ years: 1 });
    }

    const daysUntil = Math.round(nextDate.diff(today, "days").days);
    const turningAge = b.year ? nextDate.year - b.year : null;

    return {
      ...b,
      daysUntil,
      nextDate,
      turningAge,
    };
  });

  upcomingList.sort((a, b) => a.daysUntil - b.daysUntil);
  const nextFive = upcomingList.slice(0, 5);

  const descriptionLines = nextFive.map((b, index) => {
    const formattedDay = String(b.day).padStart(2, "0");
    const formattedMonth = String(b.month).padStart(2, "0");

    const target = DISCORD_ID_REGEX.test(b.birthdayId)
      ? `<@${b.birthdayId}>`
      : `**${b.birthdayId}**`;

    const daysText =
      b.daysUntil === 1 ? "Tomorrow" : `in ${b.daysUntil} days`;

    const ageText = b.turningAge ? ` • turns **${b.turningAge}**` : "";

    return `**${index + 1}.** ${target} - \`${formattedDay}.${formattedMonth}.\` (${daysText})${ageText}`;
  });

  const embed = new EmbedBuilder()
    .setTitle("📅 Upcoming Birthdays (Next 5)")
    .setColor(0xff6347)
    .setDescription(descriptionLines.join("\n\n"))
    .setFooter({
      text: "via BirthdayBot",
      iconURL: interaction.client.user.displayAvatarURL(),
    })
    .setTimestamp();

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
}
