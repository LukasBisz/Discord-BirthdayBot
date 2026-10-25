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
        "ℹ️ Auf diesem Server sind bisher noch keine Geburtstage eingetragen.",
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
        description: `Geburtstag: ${dateDisplay}`,
        value: String(b.id),
      };
    }),
  );

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("admin_remove_birthday_select")
    .setPlaceholder("Wähle einen Geburtstag zum Löschen aus...")
    .addOptions(options);

  const rows: ActionRowBuilder<any>[] = [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu),
  ];

  if (totalPages > 1) {
    const prevBtn = new ButtonBuilder()
      .setCustomId(`admin_remove_page_${currentPage - 1}`)
      .setLabel(":arrow_backward: Vorherige")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === 0);

    const pageIndicator = new ButtonBuilder()
      .setCustomId("admin_remove_page_indicator")
      .setLabel(`Seite ${currentPage + 1} / ${totalPages}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);

    const nextBtn = new ButtonBuilder()
      .setCustomId(`admin_remove_page_${currentPage + 1}`)
      .setLabel("Nächste :arrow_forward:")
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
    content: "🗑️ Welchen Geburtstag möchtest du von diesem Server entfernen?",
    components: rows,
  };
}

export async function showAdminRemoveMenu(
  interaction: ChatInputCommandInteraction,
) {
  if (!interaction.guildId) {
    return interaction.reply({
      content: "❌ Dieser Befehl kann nur auf einem Server ausgeführt werden.",
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
        "❌ Dieser Eintrag konnte nicht mehr in der Datenbank gefunden werden.",
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
    .setLabel("Ja, endgültig löschen")
    .setStyle(ButtonStyle.Danger)
    .setEmoji("🗑️");

  const cancelBtn = new ButtonBuilder()
    .setCustomId("admin_remove_cancel")
    .setLabel("Abbrechen")
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    confirmBtn,
    cancelBtn,
  );

  await interaction.update({
    content: `⚠️ Möchtest du den Geburtstag von **${displayName}** wirklich löschen?`,
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
      content: "❌ Vorgang abgebrochen. Der Geburtstag wurde nicht gelöscht.",
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
        content: "🗑️ Der Geburtstag wurde erfolgreich gelöscht.",
        components: [],
      });
    } catch (error) {
      console.error("❌ Fehler beim Löschen des Geburtstags:", error);

      return interaction.update({
        content: "❌ Beim Löschen des Geburtstags ist ein Fehler aufgetreten.",
        components: [],
      });
    }
  }
}
