import { SlashCommandBuilder } from '#builders';
import { Embed, type FluorineClient } from '#classes';
import { type ChatInputCommandInteraction } from 'discord.js';
import type { Category } from '#types';

export async function onSlashCommand(client: FluorineClient, interaction: ChatInputCommandInteraction) {
    const embed = new Embed(client, interaction.locale)
        .setTitle('Ping')
        .addLocaleFields([{ name: 'PING', value: `${client.ws.ping}ms` }]);

    interaction.reply({ embeds: [embed] });
}

export const slashCommandData = new SlashCommandBuilder('PING');
export const category: Category = 'tools';
