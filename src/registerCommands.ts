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
    console.log(`✅ Befehle für Server (${guildId}) erfolgreich registriert.`);
  } catch (error) {
    console.error(`❌ Fehler beim Registrieren für Server (${guildId}:`, error);
  }
}

export async function registerCommands(client: Client) {
  const clientId = client.user?.id;
  if (!clientId) {
    console.error("❌ Client-ID konnte nicht ermittelt werden!");
    return;
  }

  try {
    // Register commands for servers separately
    console.log("📡 Hole alle Server für gildenspezifische Registrierung...");
    const guilds = await client.guilds.fetch();

    console.log(`🔄 Registriere Befehle für ${guilds.size} Server...`);
    for (const [guildId, oauthGuild] of guilds) {
      await registerCommandsForGuild(guildId, clientId);
    }
    console.log("✅ Alle Server-Befehle erfolgreich registriert!");

    // Register commands for servers globally (can take up to 1 hour to update)
    /*
    console.log("🔄 Registriere Befehle GLOBAL...");
    await res.put(Routes.applicationCommands(clientId), {
      body: commands,
    });
    console.log("✅ Globale Befehle erfolgreich registriert!")
    */
  } catch (error) {
    console.error("❌ Fehler bei der Befehlsregistrierung:", error);
  }
}
