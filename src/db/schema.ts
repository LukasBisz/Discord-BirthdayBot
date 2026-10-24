import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const birthdays = sqliteTable("birthdays", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  birthdayId: text("birthday_id").notNull(),
  addedBy: text("added_by").notNull(),
  day: integer("day").notNull(),
  month: integer("month").notNull(),
  year: integer("year"),
  lastDisplayedAt: text("last_displayed_at"),
});

export const configuration = sqliteTable("configuration", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  guildId: text("guild_id").notNull(),
  channelId: text("channel_id").notNull(),
  setupComplete: integer("setup_complete", { mode: "boolean" })
    .default(false)
    .notNull(),
});
