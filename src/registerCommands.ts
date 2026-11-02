import { Client, REST, Routes } from "discord.js";
import { config } from "./config";
import { data as birthdayCommand } from "./commands/birthday";
import { data as birthdayAdminCommand } from "./commands/birthday-admin";

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

export const commands = [
  birthdayCommand.toJSON(),
  birthdayAdminCommand.toJSON(),
];

export async function registerCommandsForGuild(
  guildId: string,
  clientId: string,
) {
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    console.log(`✅ Commands registered successfully for guild (${guildId}).`);
  } catch (error) {
    console.error(`❌ Error registering commands for guild (${guildId}):`, error);
  }
}

export async function registerCommands(client: Client) {
  const clientId = client.user?.id;
  if (!clientId) {
    console.error("❌ Failed to resolve client ID!");
    return;
  }

  try {
    // Register commands for servers separately
    console.log("📡 Fetching all guilds for guild-specific registration...");
    const guilds = await client.guilds.fetch();

    console.log(`🔄 Registering commands for ${guilds.size} guild(s)...`);
    for (const [guildId, oauthGuild] of guilds) {
      await registerCommandsForGuild(guildId, clientId);
    }
    console.log("✅ All guild commands registered successfully!");

    // Register commands for servers globally (can take up to 1 hour to update)
    /*
    console.log("🔄 Registering commands globally...");
    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });
    console.log("✅ Global commands registered successfully!");
    */
   
  } catch (error) {
    console.error("❌ Error registering commands:", error);
  }
}
