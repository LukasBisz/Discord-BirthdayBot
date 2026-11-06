import { CronJob } from "cron";
import { Client, TextChannel, EmbedBuilder } from "discord.js";
import { db } from "../db/connection";
import { birthdays, configuration } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { DateTime } from "luxon";

export function toDateString(dt: DateTime): string {
  return dt.toISODate()!;
}

export function isBirthdayToday(
  birthdayDay: number,
  birthdayMonth: number,
  nowInTz: DateTime,
): boolean {
  if (birthdayDay === 29 && birthdayMonth === 2) {
    if (nowInTz.isInLeapYear) {
      return nowInTz.day === 29 && nowInTz.month === 2;
    }
    return nowInTz.day === 1 && nowInTz.month === 3;
  }

  return nowInTz.day === birthdayDay && nowInTz.month === birthdayMonth;
}

export async function announceBirthday(
  client: Client,
  guildId: string,
  birthdayUserId: string,
  year: number | null,
  timezone?: string,
): Promise<boolean> {
  try {
    const [record] = await db
      .select()
      .from(birthdays)
      .where(
        and(
          eq(birthdays.guildId, guildId),
          eq(birthdays.birthdayId, birthdayUserId),
        ),
      )
      .limit(1);

    const userTz = timezone ?? record?.timezone ?? "UTC";
    const now = DateTime.now().setZone(userTz);
    const todayString = toDateString(now);

    if (record?.lastDisplayedAt === todayString) {
      console.log(
        `⏭️ Already sent for user (${birthdayUserId}) today, skipping.`,
      );
      return false;
    }

    const [config] = await db
      .select()
      .from(configuration)
      .where(
        and(
          eq(configuration.guildId, guildId),
          eq(configuration.setupComplete, true),
        ),
      )
      .limit(1);

    if (!config || !config.channelId) {
      console.log(`⚠️ No setup found for guild (${guildId}), skipping.`);
      return false;
    }

    const channel = await client.channels
      .fetch(config.channelId)
      .catch(() => null);
    if (!channel || !(channel instanceof TextChannel)) {
      console.log(`⚠️ Channel (${config.channelId}) not accessible.`);
      return false;
    }

    const user = await client.users.fetch(birthdayUserId).catch(() => null);
    if (!user || !client.user) {
      console.warn(`⚠️ Could not fetch user (${birthdayUserId}).`);
      return false;
    }

    const age = year != null ? now.year - year : null;

    const description =
      age !== null
        ? `Hey, it's time to **celebrate!** 🎉\n` +
          `Today is <@!${birthdayUserId}>'s birthday – they just turned **${age}** years old!\n` +
          `Let's wish them a **Happy Birthday**!`
        : `Hey, it's time to **celebrate!** 🎉\n` +
          `Today is <@!${birthdayUserId}>'s birthday.\n` +
          `Let's wish them a **Happy Birthday**!`;

    const birthdayEmbed = new EmbedBuilder()
      .setTitle(`**Happy Birthday**`)
      .setColor(0xff6347)
      .setThumbnail(user.displayAvatarURL({ size: 512 }))
      .setDescription(description)
      .addFields({
        name: " ",
        value: "BirthdayBot wishes you a **Wonderful** day.",
      })
      .setFooter({
        text: "via BirthdayBot",
        iconURL: client.user.displayAvatarURL(),
      })
      .setTimestamp();

    const sentMessage = await channel.send({ embeds: [birthdayEmbed] });
    await sentMessage.react("🎉");

    await db
      .update(birthdays)
      .set({ lastDisplayedAt: todayString })
      .where(
        and(
          eq(birthdays.guildId, guildId),
          eq(birthdays.birthdayId, birthdayUserId),
        ),
      );

    console.log(
      `✅ Sent birthday embed for: ${user.username} (${user.id}) in guild: ${channel.guild.name} (${guildId})`,
    );
    return true;
  } catch (error) {
    console.error(
      `❌ Failed to announce birthday for user (${birthdayUserId}):`,
      error,
    );
    return false;
  }
}

export async function checkBirthdays(client: Client): Promise<void> {
  console.log("⏰ Running hourly timezone-based birthday check...");

  try {
    const allBirthdays = await db.select().from(birthdays);

    for (const record of allBirthdays) {
      const userTz = record.timezone || "UTC";
      const nowInTz = DateTime.now().setZone(userTz);

      if (nowInTz.hour !== 0) {
        continue;
      }

      if (!isBirthdayToday(record.day, record.month, nowInTz)) {
        continue;
      }

      const todayString = toDateString(nowInTz);
      if (record.lastDisplayedAt === todayString) {
        continue;
      }

      await announceBirthday(
        client,
        record.guildId,
        record.birthdayId,
        record.year,
        userTz,
      );
    }
  } catch (error) {
    console.error("❌ Hourly birthday job failed:", error);
  }
}

export function startBirthdayJob(client: Client): void {
  new CronJob(
    "30 0 * * * *",
    async () => {
      await checkBirthdays(client);
    },
    null,
    true,
    "UTC",
  );

  console.log("✅ Hourly birthday job scheduled.");
}
