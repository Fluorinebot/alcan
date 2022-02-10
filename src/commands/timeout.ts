import FluorineClient from '@classes/Client';
import Embed from '@classes/Embed';
import { SlashCommandBuilder } from '@discordjs/builders';
import createCase from '@util/createCase';
import modLog from '@util/modLog';
import { CommandInteraction } from 'discord.js';
import ms, { StringValue } from 'ms';
import r from 'rethinkdb';
import { Category } from 'types/applicationCommand';

export async function run(client: FluorineClient, interaction: CommandInteraction<'cached'>) {
    if (!interaction.member?.permissions.has('MODERATE_MEMBERS')) {
        return interaction.reply({
            content: client.i18n.t('TIMEOUT_PERMISSIONS_MISSING', {
                lng: interaction.locale
            }),
            ephemeral: true
        });
    }

    const member = interaction.options.getMember('user');
    const duration = ms(interaction.options.getString('duration') as StringValue);
    const reason = interaction.options.getString('reason') ?? client.i18n.t('NONE', { lng: interaction.locale });

    if (!member)
        return interaction.reply({
            content: client.i18n.t('TIMEOUT_MEMBER_MISSING', {
                lng: interaction.locale
            }),
            ephemeral: true
        });

    if (member.user.id === interaction.user.id)
        return interaction.reply({
            content: client.i18n.t('TIMEOUT_ERROR_YOURSELF', {
                lng: interaction.locale
            }),
            ephemeral: true
        });

    if (!member.moderatable)
        return interaction.reply({
            content: client.i18n.t('TIMEOUT_BOT_PERMISSIONS_MISSING', {
                lng: interaction.locale
            }),
            ephemeral: true
        });

    if (Number.isNaN(duration) || duration > 2419200000)
        return interaction.reply({
            content: client.i18n.t('TIMEOUT_DURATION_INVALID', {
                lng: interaction.locale
            }),
            ephemeral: true
        });

    if (reason.length > 1024)
        return interaction.reply({
            content: client.i18n.t('REASON_LONGER_THAN_1024', {
                lng: interaction.locale
            }),
            ephemeral: true
        });

    const create = await createCase(client, interaction?.guild, member.user, interaction.user, 'timeout', reason);

    await member.timeout(
        duration,
        client.i18n.t('TIMEOUT_REASON', {
            lng: interaction.locale,
            user: interaction.user.tag,
            reason
        })
    );
    modLog(client, create, interaction.guild);
    const embed = new Embed(client, interaction.locale)
        .setLocaleTitle('TIMEOUT_SUCCESS_TITLE')
        .setLocaleDescription('TIMEOUT_SUCCESS_DESCRIPTION')
        .setThumbnail(member.displayAvatarURL({ dynamic: true }))
        .addLocaleField({
            name: 'TIMEOUT_MODERATOR',
            value: interaction.user.tag
        })
        .addLocaleField({ name: 'TIMEOUT_USER', value: member.user.tag })
        .addLocaleField({ name: 'DURATION', value: ms(duration) })
        .addLocaleField({ name: 'REASON', value: reason })
        .addLocaleField({ name: 'PUNISHMENT_ID', value: create.id.toString() });
    interaction.reply({ embeds: [embed] });

    r.table('case').insert(create).run(client.conn);
}

export const data = new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout an user from the server')
    .addUserOption(option => option.setName('user').setDescription('Provide an user to timeout').setRequired(true))
    .addStringOption(option =>
        option.setName('duration').setDescription('Provide how long the timeout will last').setRequired(true)
    )
    .addStringOption(option =>
        option.setName('reason').setDescription('Provide a reason for timing out this user').setRequired(false)
    );

export const category: Category = 'moderation';
