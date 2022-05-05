import FluorineClient from '@classes/Client';
import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Category } from 'types/structures';
export async function run(client: FluorineClient, interaction: CommandInteraction) {
    const args = interaction.options.getString('start');

    if (args.length > 65) {
        return interaction.reply({
            content: client.i18n.t('AI_TOO_LONG', { lng: interaction.locale }),
            ephemeral: true
        });
    }

    if (client.ai.queue.some(q => q.interaction.user.id === interaction.user.id)) {
        return interaction.reply({
            content: client.i18n.t('AI_LIMIT', { lng: interaction.locale }),
            ephemeral: true
        });
    }

    await interaction.deferReply();
    client.ai.getAI(interaction, args);
}

export const data = new SlashCommandBuilder()
    .setName('ai')
    .setNameLocalizations({ pl: 'ai' })
    .setDescription('Make AI complete your sentence')
    .setDescriptionLocalizations({ pl: 'AI dokończy twoje zdanie' })
    .addStringOption(option =>
        option
            .setName('start')
            .setNameLocalizations({ pl: 'start' })
            .setDescription('Start of the sentence')
            .setDescriptionLocalizations({ pl: 'Początek zdania' })
            .setRequired(true)
    );

export const category: Category = 'fun';
