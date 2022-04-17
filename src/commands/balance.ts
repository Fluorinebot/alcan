import { CommandInteraction } from 'discord.js';
import FluorineClient from '@classes/Client';
import Embed from '@classes/Embed';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Category } from 'types/structures';

export async function run(client: FluorineClient, interaction: CommandInteraction) {
    const balance = await client.economy.get(interaction.guildId, interaction.user);
    const currency = await client.economy.getCurrency(interaction.guildId);

    const embed = new Embed(client, interaction.locale)
        .setLocaleTitle('BALANCE')
        .addLocaleField({
            name: 'BALANCE_WALLET',
            value: `${balance.wallet_bal} ${currency}`
        })
        .addLocaleField({
            name: 'BALANCE_BANK',
            value: `${balance.bank_bal} ${currency}`
        });

    interaction.reply({ embeds: [embed], ephemeral: true });
}

export const data = new SlashCommandBuilder()
    .setName('balance')
    .setNameLocalizations({ pl: 'replace_me' })
    .setDescription('Check your balance')
    .setDescriptionLocalizations({ pl: 'replace_me' });

export const category: Category = 'economy';
