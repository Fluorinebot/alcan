import { SlashCommandSubcommandBuilder } from '#builders';
import { Embed, type FluorineClient } from '#classes';
import { type ChatInputCommandInteraction } from 'discord.js';

export async function onSlashCommand(client: FluorineClient, interaction: ChatInputCommandInteraction) {
    const value = interaction.options.getBoolean('logs');

    await client.prisma.config.update({
        where: {
            guildId: BigInt(interaction.guildId)
        },
        data: {
            logsEnabled: value
        }
    });

    const embed = new Embed(client, interaction.locale)
        .setLocaleTitle('CONFIG_SET_SUCCESS_TITLE')
        .setLocaleDescription('CONFIG_SET_SUCCESS_DESCRIPTION', {
            key: client.i18n.t('CONFIG_LOGS', { lng: interaction.locale }),
            value
        });

    interaction.reply({ embeds: [embed] });
}

export const slashCommandData = new SlashCommandSubcommandBuilder()
    .setName('CONFIG.LOGS.NAME')
    .setDescription('CONFIG.LOGS.DESCRIPTION')
    .addBooleanOption(option =>
        option
            .setName('CONFIG.LOGS.OPTIONS.LOGS.NAME')
            .setDescription('CONFIG.LOG.OPTIONS.LOGS.DESCRIPTION')
            .setRequired(true)
    );
