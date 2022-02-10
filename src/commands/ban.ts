import { SlashCommandBuilder } from '@discordjs/builders';
import modLog from '@util/modLog';
import { CommandInteraction } from 'discord.js';
import r from 'rethinkdb';
import { Category } from 'types/applicationCommand';
import FluorineClient from '@classes/Client';
import Embed from '@classes/Embed';
import createCase from '@util/createCase';

export async function run(client: FluorineClient, interaction: CommandInteraction<'cached'>) {
    if (!interaction.member?.permissions.has('BAN_MEMBERS')) {
        return interaction.reply({
            content: client.i18n.t('BAN_PERMISSIONS_MISSING', {
                lng: interaction.locale
            }),
            ephemeral: true
        });
    }

    const member = interaction.options.getMember('user');
    const reason =
        interaction.options.getString('reason') ??
        client.i18n.t('NONE', {
            lng: interaction.locale
        });

    if (!member)
        return interaction.reply({
            content: client.i18n.t('BAN_MEMBER_MISSING', {
                lng: interaction.locale
            }),
            ephemeral: true
        });

    if (member.user.id === interaction.user.id)
        return interaction.reply({
            content: client.i18n.t('BAN_ERROR_YOURSELF', {
                lng: interaction.locale
            }),
            ephemeral: true
        });

    if (!member.bannable)
        return interaction.reply({
            content: client.i18n.t('BAN_BOT_PERMISSIONS_MISSING', {
                lng: interaction.locale
            }),
            ephemeral: true
        });

    if (reason.length > 1024) {
        return interaction.reply({
            content: client.i18n.t('REASON_LONGER_THAN_1024', {
                lng: interaction.locale
            }),
            ephemeral: true
        });
    }

    const create = await createCase(client, interaction?.guild, member.user, interaction.user, 'ban', reason);

    await member.ban({
        reason: client.i18n.t('BAN_REASON', {
            lng: interaction.locale,
            user: interaction.user.tag,
            reason
        })
    });
    modLog(client, create, interaction.guild);
    const embed = new Embed(client, interaction.locale)
        .setLocaleTitle('BAN_SUCCESS_TITLE')
        .setLocaleDescription('BAN_SUCCESS_DESCRIPTION')
        .setThumbnail(member.displayAvatarURL({ dynamic: true }))
        .addLocaleField({ name: 'BAN_MODERATOR', value: interaction.user.tag })
        .addLocaleField({ name: 'BAN_USER', value: member.user.tag })
        .addLocaleField({ name: 'REASON', value: reason })
        .addLocaleField({ name: 'PUNISHMENT_ID', value: create.id.toString() });
    interaction.reply({ embeds: [embed] });

    r.table('case').insert(create).run(client.conn);
}

export const data = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban an user from the server')
    .addUserOption(option => option.setName('user').setDescription('Provide an user to ban').setRequired(true))
    .addStringOption(option =>
        option.setName('reason').setDescription('Provide a reason for banning this user').setRequired(false)
    );

export const category: Category = 'moderation';
