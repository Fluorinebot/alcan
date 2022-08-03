import type FluorineClient from '#classes/Client';
import Embed from '#classes/Embed';
import type { Category } from '#types/structures';
import { SlashCommandBuilder } from '@discordjs/builders';
import { type ChatInputCommandInteraction } from 'tiscord';

export async function run(client: FluorineClient, interaction: ChatInputCommandInteraction) {
    const random = Math.floor(Math.random() * 3);
    const money = Math.floor(Math.random() * 150 + 50);

    const description = client.i18n.t(`WORK_SUCCESS_DESCRIPTION.${random}`, {
        lng: interaction.locale,
        amount: `${money} ${await client.economy.getCurrency(interaction.guildId)}`
    });

    const embed = new Embed(client, interaction.locale).setLocaleTitle('WORK_SUCCESS').setDescription(description);

    client.economy.add(interaction.guildId, interaction.user, money);

    interaction.reply({ embeds: [embed.toJSON()] });
}

export const data = new SlashCommandBuilder()
    .setName('work')
    .setNameLocalizations({ pl: 'pracuj' })
    .setDescription('Get money from working!')
    .setDescriptionLocalizations({ pl: 'Zdobądź pieniądze za pracę!' })
    .setDMPermission(false);

export const category: Category = 'economy';
export const cooldown = 30 * 60 * 1000;
