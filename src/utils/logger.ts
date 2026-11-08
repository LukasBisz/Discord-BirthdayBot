import { User, GuildMember, Guild } from "discord.js";

export const logger = {
  formatUser(
    user:
      | User
      | GuildMember
      | { username?: string; displayName?: string; id: string }
      | string,
    id?: string,
  ): string {
    if (typeof user === "string") {
      return id ? `${user}(${id})` : user;
    }
    const discordUser = "user" in user && user.user ? user.user : (user as any);
    const username =
      discordUser.username ?? (user as any).displayName ?? "Unknown";
    return `${username}(${discordUser.id})`;
  },

  formatGuild(
    guild: Guild | { name?: string; id: string } | string,
    id?: string,
  ): string {
    if (typeof guild === "string") {
      return id ? `"${guild}"(${id})` : guild;
    }
    return `"${guild.name}"(${guild.id})`;
  },

  systemReady: (msg: string) => console.log(`[System]     🟢 ${msg}`),
  systemProgress: (msg: string) => console.log(`[System]     🔄 ${msg}`),
  systemCommands: (msg: string) => console.log(`[System]     ⚡ ${msg}`),
  systemError: (msg: string, err?: unknown) =>
    err !== undefined
      ? console.error(`[System]     🔴 ${msg}`, err)
      : console.error(`[System]     🔴 ${msg}`),

  dbSync: (msg: string) => console.log(`[Database]   💾 ${msg}`),
  dbCleanup: (msg: string) => console.log(`[Database]   🧹 ${msg}`),
  dbError: (msg: string, err?: unknown) =>
    err !== undefined
      ? console.error(`[Database]   ❌ ${msg}`, err)
      : console.error(`[Database]   ❌ ${msg}`),

  guildJoin: (msg: string) => console.log(`[Guild]      🌐 ${msg}`),
  guildLeave: (msg: string) => console.log(`[Guild]      ❌ ${msg}`),

  cronStart: (msg: string) => console.log(`[Cron]       🔄 ${msg}`),
  cronSuccess: (msg: string) => console.log(`[Cron]       ✅ ${msg}`),
  cronWarn: (msg: string) => console.warn(`[Cron]       ⚠️ ${msg}`),

  actionAdd: (msg: string) => console.log(`[UserAction] ➕ ${msg}`),
  actionUpdate: (msg: string) => console.log(`[UserAction] ✏️ ${msg}`),
  actionRemove: (msg: string) => console.log(`[UserAction] 🗑️ ${msg}`),
  actionSelf: (msg: string) => console.log(`[UserAction] 👤 ${msg}`),

  error: (msg: string, err?: unknown) =>
    err !== undefined
      ? console.error(`[Error]      ❌ ${msg}`, err)
      : console.error(`[Error]      ❌ ${msg}`),
};
