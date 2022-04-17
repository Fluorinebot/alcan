import FluorineClient from '@classes/Client';
import Embed from '@classes/Embed';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { InpostStatuses, InpostTrackObj } from 'types/webRequests';
import { fetch } from 'undici';

export async function run(client: FluorineClient, interaction: CommandInteraction) {
    const id = interaction.options.getString('id');

    const statusURL = client.i18n.t('INPOST_URL', { lng: interaction.locale });
    const statuses = (await fetch(statusURL).then(res => res.json())) as InpostStatuses;

    const req = await fetch(`https://api-shipx-pl.easypack24.net/v1/tracking/${id}`);
    const response = (await req.json()) as InpostTrackObj;

    if (req.status !== 200) {
        return interaction.reply({
            content: client.i18n.t('INPOST_NOT_FOUND', {
                lng: interaction.locale,
                id
            }),
            ephemeral: true
        });
    }

    const embed = new Embed(client, interaction.locale).setLocaleTitle('INPOST_TITLE', { id }).setColor('#ffcb39');

    if (response.custom_attributes.target_machine_detail.name) {
        embed.setLocaleDescription('INPOST_DESCRIPTION', response.custom_attributes.target_machine_detail);
    }

    response.tracking_details.reverse().forEach(data => {
        const status = statuses.items.find(element => element.name === data.status);
        embed.addField(status.title, status.description);
    });

    interaction.reply({ embeds: [embed] });
}

export const data = new SlashCommandBuilder()
    .setName('inpost')
    .setNameLocalizations({ pl: 'replace_me' })
    .setDescription('Track an InPost package')
    .setDescriptionLocalizations({ pl: 'replace_me' })
    .addStringOption(option =>
        option
            .setName('id')
            .setNameLocalizations({ pl: 'replace_me' })
            .setDescription('ID of the package')
            .setDescriptionLocalizations({ pl: 'replace_me' })
            .setRequired(true)
    );

export const category = 'tools';
