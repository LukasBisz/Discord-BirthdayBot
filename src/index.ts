import { Client, GatewayIntentBits } from "discord.js";
import { config } from "./config";
import { connectToDatabase } from "./db/connection";
import { registerCommands } from "./registerCommands";
import { execute as executeBirthdayCommand } from "./commands/birthday";
import { execute as executeBirthdayAdminCommand } from "./commands/birthday-admin";
import { setupInteraction } from "./interactions/admin/setup";
import { addInteraction } from "./interactions/user/add";
import { removeInteraction } from "./interactions/user/remove";
import {
  handleAdminRemoveSelect,
  handleAdminRemoveButton,
} from "./interactions/admin/remove";
import { handleAdminAddModal } from "./interactions/admin/add";
import { startBirthdayJob } from "./jobs/birthdayJob";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on("clientReady", async (c) => {
  console.log("────────────────────────────────────────");
  await connectToDatabase();
  console.log("────────────────────────────────────────");
  await registerCommands();
  console.log("────────────────────────────────────────");
  startBirthdayJob(client);
  console.log(`✅ ${c.user.username} is online! 🤖`);
  console.log("────────────────────────────────────────");
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "birthday") {
      await executeBirthdayCommand(interaction);
    } else if (interaction.commandName === "birthday-admin") {
      await executeBirthdayAdminCommand(interaction);
    }
    return;
  }

  if (
    interaction.isChannelSelectMenu() &&
    interaction.customId === "setup_channel_selector"
  ) {
    await setupInteraction(interaction);
    return;
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "admin_remove_birthday_select") {
      await handleAdminRemoveSelect(interaction);
    }
    return;
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === "user_add_birthday_modal") {
      await addInteraction(interaction);
      return;
    }

    if (interaction.customId === "admin_add_birthday_modal") {
      await handleAdminAddModal(interaction);
      return;
    }
  }

  if (interaction.isButton()) {
    if (
      interaction.customId === "user_remove_birthday_confirm" ||
      interaction.customId === "user_remove_birthday_cancel"
    ) {
      await removeInteraction(interaction);
      return;
    }

    if (interaction.customId.startsWith("admin_remove_")) {
      await handleAdminRemoveButton(interaction);
      return;
    }
  }
});

client.login(config.DISCORD_TOKEN);
