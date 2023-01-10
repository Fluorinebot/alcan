import { SlashCommandSubcommandBuilder } from '#builders';
import { Embed, type FluorineClient } from '#classes';
import { type ChatInputCommandInteraction } from 'discord.js';

export async function onSlashCommand(client: FluorineClient, interaction: ChatInputCommandInteraction) {
    const value = interaction.options.getBoolean('mod-logs');

    await client.prisma.config.update({
        where: {
            guildId: BigInt(interaction.guildId)
        },
        data: {
            logModerationActions: value
        }
    });

    const embed = new Embed(client, interaction.locale)
        .setLocaleTitle('CONFIG_SET_SUCCESS_TITLE')
        .setLocaleDescription('CONFIG_SET_SUCCESS_DESCRIPTION', {
            key: client.i18n.t('CONFIG_MODLOG', { lng: interaction.locale }),
            value
        });

    interaction.reply({ embeds: [embed] });
}

export const slashCommandData = new SlashCommandSubcommandBuilder()
    .setName('CONFIG.MOD_LOGS.NAME')
    .setDescription('CONFIG.MOD_LOGS.DESCRIPTION')
    .addBooleanOption(option =>
        option
            .setName('CONFIG.MOD.LOGS_OPTIONS.MOD_LOGS.NAME')
            .setDescription('CONFIG.MOD_LOGS.OPTIONS.MOD_LOGS.DESCRIPTION')
            .setRequired(true)
    );
