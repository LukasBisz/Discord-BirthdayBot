import { REST, Routes } from "discord.js";
import { config } from "./config";
import { data as birthdayCommand } from "./commands/birthday";
import { data as birthdayAdminCommand } from "./commands/birthday-admin";

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

export async function registerCommands() {
  try {
    console.log("🔄 Connecting to Discord...");

    const appInfo = (await rest.get(Routes.oauth2CurrentApplication())) as {
      id: string;
    };
    const clientId = appInfo.id;
    console.log(`✅ Bot erfolgreich erkannt! (Client ID: ${clientId})`);

    const commands = [
      birthdayCommand.toJSON(), birthdayAdminCommand.toJSON(),
    ];

    //Test
    const GUILD_ID = "1247584911972372551";

    console.log(`🔄 Registriere Befehle auf dem Testserver (${GUILD_ID})...`);
    await rest.put(Routes.applicationGuildCommands(clientId, GUILD_ID), {
      body: commands,
    });

    //LIVE
    /*
        console.log("🔄 Registriere Befehle Global...")
        await rest.put(Routes.applicationCommands(clientId), {
            body:commands,
        });
        */

    console.log("✅ Befehle erfolgreich registriert!");
  } catch (error) {
    console.error("❌ Fehler beim Registrieren der Befehle:", error);
  }
}
