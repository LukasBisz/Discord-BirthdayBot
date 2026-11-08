import { Client, REST, Routes } from "discord.js";
import { config } from "./config";
import { data as birthdayCommand } from "./commands/birthday";
import { data as birthdayAdminCommand } from "./commands/birthday-admin";
import { logger } from "./utils/logger";

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

export const commands = [
  birthdayCommand.toJSON(),
  birthdayAdminCommand.toJSON(),
];

export async function registerCommandsForGuild(
  guildId: string,
  clientId: string,
  guildName?: string,
) {
  const guildDisplay = guildName ? logger.formatGuild(guildName, guildId) : `(${guildId})`;

  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    logger.systemCommands(`Commands registered successfully for guild: ${guildDisplay}.`);
  } catch (error) {
    logger.systemError(`Error registering commands for guild ${guildDisplay}:`, error);
  }
}

export async function registerCommands(client: Client) {
  const clientId = client.user?.id;
  if (!clientId) {
    logger.systemError("Failed to resolve client ID!");
    return;
  }

  try {
    // Register commands for servers separately
    logger.systemProgress("Fetching all guilds for guild-specific registration...");
    const guilds = await client.guilds.fetch();

    logger.systemProgress(`Registering commands for ${guilds.size} guild(s)...`);
    for (const [guildId, guild] of guilds) {
      await registerCommandsForGuild(guildId, clientId, guild.name);
    }
    logger.systemCommands("All guild commands registered successfully!");

    // Register commands for servers globally (can take up to 1 hour to update)
    /*
    logger.systemProgress("Registering commands globally...");
    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });
    logger.systemCommands("Global commands registered successfully!");
    */
   
  } catch (error) {
    logger.systemError("Error registering commands:", error);
  }
}
