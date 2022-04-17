import FluorineClient from '@classes/Client';
import Embed from '@classes/Embed';
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { ShopItem } from 'types/databaseTables';

export async function run(client: FluorineClient, interaction: CommandInteraction) {
    const name = interaction.options.getString('name');
    const description = interaction.options.getString('description');
    const price = interaction.options.getInteger('price');
    const role = interaction.options.getRole('role');

    const obj: Omit<ShopItem, 'item_id'> = { name, description, price, guild_id: BigInt(interaction.guildId) };

    if (role) {
        obj.role = BigInt(role.id);
    }

    if (!interaction.memberPermissions.has('MANAGE_GUILD')) {
        return interaction.reply({
            content: client.i18n.t('SHOP_CREATE_PERMISSIONS', {
                lng: interaction.locale
            }),
            ephemeral: true
        });
    }

    if (name.length > 19) {
        return interaction.reply(
            client.i18n.t('SHOP_CREATE_NAME_INVALID', {
                lng: interaction.locale
            })
        );
    }

    if (description.length > 49) {
        return interaction.reply(
            client.i18n.t('SHOP_CREATE_DESCRIPTION_INVALID', {
                lng: interaction.locale
            })
        );
    }

    const embed = new Embed(client, interaction.locale)
        .setLocaleTitle('SHOP_CREATE_SUCCESS')
        .addLocaleField({ name: 'SHOP_CREATE_NAME', value: name })
        .addLocaleField({ name: 'SHOP_CREATE_DESCRIPTION', value: description })
        .addLocaleField({
            name: 'SHOP_CREATE_PRICE',
            value: `${price} ${await client.economy.getCurrency(interaction.guildId)}`
        });

    interaction.reply({ embeds: [embed] });
    client.shop.add(obj);
}

export const data = new SlashCommandSubcommandBuilder()
    .setName('create')
    .setNameLocalizations({ pl: 'replace_me' })
    .setDescription('Create a item!')
    .setDescriptionLocalizations({ pl: 'replace_me' })
    .addStringOption(option =>
        option
            .setName('name')
            .setNameLocalizations({ pl: 'replace_me' })
            .setDescription('Name of the item')
            .setDescriptionLocalizations({ pl: 'replace_me' })
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('description')
            .setNameLocalizations({ pl: 'replace_me' })
            .setDescription('Description of the item')
            .setDescriptionLocalizations({ pl: 'replace_me' })
            .setRequired(true)
    )
    .addIntegerOption(option =>
        option
            .setName('price')
            .setNameLocalizations({ pl: 'replace_me' })
            .setDescription('Price of the item')
            .setDescriptionLocalizations({ pl: 'replace_me' })
            .setMinValue(1)
            .setRequired(true)
    )
    .addRoleOption(option =>
        option
            .setName('role')
            .setNameLocalizations({ pl: 'replace_me' })
            .setDescription('The role you want to give')
            .setDescriptionLocalizations({ pl: 'replace_me' })
            .setRequired(false)
    );
