import { CommandInteraction } from 'discord.js';
import FluorineClient from '@classes/Client';
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';

export async function run(client: FluorineClient, interaction: CommandInteraction) {
    const name = interaction.options.getString('name');
    const itemObj = await client.shop.get(interaction.guildId, name);

    if (!itemObj) {
        return interaction.reply({
            content: client.i18n.t('SHOP_DELETE_NOT_FOUND', {
                lng: interaction.locale
            }),
            ephemeral: true
        });
    }

    if (!interaction.memberPermissions.has('MANAGE_GUILD')) {
        return interaction.reply({
            content: client.i18n.t('SHOP_DELETE_PERMISSIONS', {
                lng: interaction.locale
            })
        });
    }

    interaction.reply(client.i18n.t('SHOP_DELETE_SUCCESS', { lng: interaction.locale, item: name }));
    client.shop.delete(interaction.guildId, name);
}

export const data = new SlashCommandSubcommandBuilder()
    .setName('delete')
    .setDescription('Delete a item from the shop')
    .addStringOption(option => option.setName('name').setDescription('Name of the item').setRequired(true));
