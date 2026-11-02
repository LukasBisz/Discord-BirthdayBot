import { eq } from "drizzle-orm";
import { db } from "../../db/connection";
import { birthdays } from "../../db/schema";
import { DISCORD_ID_REGEX } from "../../utils/regex";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";

const PAGE_SIZE = 25;

async function buildRemovePayload(guildId: string, page: number, client: any) {
  const serverBirthdays = await db
    .select()
    .from(birthdays)
    .where(eq(birthdays.guildId, guildId));

  if (serverBirthdays.length === 0) {
    return {
      content:
        "ℹ️ No birthdays have been registered on this server yet.",
      components: [],
    };
  }

  const totalPages = Math.ceil(serverBirthdays.length / PAGE_SIZE);
  const currentPage = Math.max(0, Math.min(page, totalPages - 1));

  const pageItems = serverBirthdays.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  );

  const options = await Promise.all(
    pageItems.map(async (b) => {
      let displayName = b.birthdayId;

      if (DISCORD_ID_REGEX.test(b.birthdayId)) {
        const user = await client.users.fetch(b.birthdayId).catch(() => null);

        if (user) displayName = `@${user.username}`;
      }

      const day = String(b.day).padStart(2, "0");
      const month = String(b.month).padStart(2, "0");
      const dateDisplay = b.year
        ? `${day}.${month}.${b.year}`
        : `${day}.${month}.`;

      return {
        label: displayName.slice(0, 100),
        description: `Birthday: ${dateDisplay}`,
        value: String(b.id),
      };
    }),
  );

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("admin_remove_birthday_select")
    .setPlaceholder("Select a birthday to delete...")
    .addOptions(options);

  const rows: ActionRowBuilder<any>[] = [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu),
  ];

  if (totalPages > 1) {
    const prevBtn = new ButtonBuilder()
      .setCustomId(`admin_remove_page_${currentPage - 1}`)
      .setLabel("◀ Previous")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === 0);

    const pageIndicator = new ButtonBuilder()
      .setCustomId("admin_remove_page_indicator")
      .setLabel(`Page ${currentPage + 1} / ${totalPages}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);

    const nextBtn = new ButtonBuilder()
      .setCustomId(`admin_remove_page_${currentPage + 1}`)
      .setLabel("Next ▶")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage >= totalPages - 1);

    const paginationRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      prevBtn,
      pageIndicator,
      nextBtn,
    );

    rows.push(paginationRow);
  }

  return {
    content: "🗑️ Which birthday would you like to remove from this server?",
    components: rows,
  };
}

export async function showAdminRemoveMenu(
  interaction: ChatInputCommandInteraction,
) {
  if (!interaction.guildId) {
    return interaction.reply({
      content: "❌ This command can only be used in a server.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const payload = await buildRemovePayload(
    interaction.guildId,
    0,
    interaction.client,
  );
  await interaction.reply({ ...payload, flags: MessageFlags.Ephemeral });
}

export async function handleAdminRemoveSelect(
  interaction: StringSelectMenuInteraction,
) {
  const selectedId = parseInt(interaction.values[0], 10);

  const [target] = await db
    .select()
    .from(birthdays)
    .where(eq(birthdays.id, selectedId));

  if (!target) {
    return interaction.update({
      content:
        "❌ This entry could no longer be found in the database.",
      components: [],
    });
  }

  let displayName = target.birthdayId;
  if (DISCORD_ID_REGEX.test(target.birthdayId)) {
    const user = await interaction.client.users
      .fetch(target.birthdayId)
      .catch(() => null);
    if (user) displayName = `@${user.username}`;
  }

  const confirmBtn = new ButtonBuilder()
    .setCustomId(`admin_remove_confirm_${selectedId}`)
    .setLabel("Yes, permanently delete")
    .setStyle(ButtonStyle.Danger)
    .setEmoji("🗑️");

  const cancelBtn = new ButtonBuilder()
    .setCustomId("admin_remove_cancel")
    .setLabel("Cancel")
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    confirmBtn,
    cancelBtn,
  );

  await interaction.update({
    content: `⚠️ Are you sure you want to delete the birthday of **${displayName}**?`,
    components: [row],
  });
}

export async function handleAdminRemoveButton(interaction: ButtonInteraction) {
  if (interaction.customId.startsWith("admin_remove_page_")) {
    const targetPage = parseInt(
      interaction.customId.replace("admin_remove_page_", ""),
      10,
    );
    const payload = await buildRemovePayload(
      interaction.guildId!,
      targetPage,
      interaction.client,
    );
    return interaction.update(payload);
  }

  if (interaction.customId === "admin_remove_cancel") {
    return interaction.update({
      content: "❌ Action cancelled. The birthday was not deleted.",
      components: [],
    });
  }

  if (interaction.customId.startsWith("admin_remove_confirm_")) {
    const idToDelete = parseInt(
      interaction.customId.replace("admin_remove_confirm_", ""),
      10,
    );

    try {
      await db.delete(birthdays).where(eq(birthdays.id, idToDelete));

      return interaction.update({
        content: "🗑️ The birthday has been deleted successfully.",
        components: [],
      });
    } catch (error) {
      console.error("❌ Error deleting birthday:", error);

      return interaction.update({
        content: "❌ An error occurred while deleting the birthday.",
        components: [],
      });
    }
  }
}
