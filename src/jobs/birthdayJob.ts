import { CronJob } from "cron";
import { Client, TextChannel, EmbedBuilder } from "discord.js";
import { db } from "../db/connection";
import { birthdays, configuration } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { DateTime } from "luxon";

const TIMEZONE = "Europe/Berlin";

export function toDateString(dt: DateTime): string {
  return dt.toISODate()!;
}

export async function announceBirthday(
  client: Client,
  guildId: string,
  birthdayUserId: string,
  year: number | null,
): Promise<boolean> {
  const now = DateTime.now().setZone(TIMEZONE);
  const todayString = toDateString(now);

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

    if (record?.lastDisplayedAt === todayString) {
      console.log(`⏭️ Already sent for user (${birthdayUserId}) today, skipping.`);
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

export function startBirthdayJob(client: Client): void {
  new CronJob(
    "0 8 * * *",
    async () => {
      console.log("🎂 Running birthday check...");

      const now = DateTime.now().setZone(TIMEZONE);
      const today = { day: now.day, month: now.month };

      try {
        const todaysBirthdays = await db
          .select()
          .from(birthdays)
          .where(
            and(eq(birthdays.day, today.day), eq(birthdays.month, today.month)),
          );

        for (const record of todaysBirthdays) {
          await announceBirthday(
            client,
            record.guildId,
            record.birthdayId,
            record.year,
          );
        }
      } catch (error) {
        console.error("❌ Birthday job failed:", error);
      }
    },
    null,
    true,
    "Europe/Berlin",
  );

  console.log("✅ Birthday job scheduled (daily at 08:00 Europe/Berlin).");
}
