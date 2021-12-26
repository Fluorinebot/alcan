import FluorineClient from '@classes/Client';
import Embed from '@classes/Embed';
import { HypixelType } from 'types/hypixel.type';
import { Message } from 'discord.js';
import axios from 'axios';
export async function run(
    client: FluorineClient,
    message: Message,
    args: string[]
) {
    if (!args[0])
        return message.reply(
            client.language.get(
                message.guild.preferredLocale,
                'HYPIXEL_NO_ARGS',
                { command: 'bedwars' }
            )
        );

    const uuid: any = await axios(
        `https://api.mojang.com/users/profiles/minecraft/${args[0]}`
    );
    if (!uuid.data.id)
        return message.reply(
            client.language.get(
                message.guild.preferredLocale,
                'HYPIXEL_INVALID_PLAYER'
            )
        );

    const { data }: { data: HypixelType } = await axios(
        `https://api.hypixel.net/player?uuid=${uuid.data.id}&key=${client.config.hypixel}`
    );

    const skyStats = data.player?.stats?.SkyWars;
    if (!skyStats) {
        return message.reply(
            client.language.get(
                message.guild.preferredLocale,
                'HYPIXEL_PLAYER_NOT_FOUND'
            )
        );
    }
    const kd = (skyStats.kills / skyStats.deaths).toFixed(2);
    const winratio = (skyStats.wins / skyStats.deaths).toFixed(2);
    const bedEmbed = new Embed(client, message.guild.preferredLocale)
        .setLocaleTitle('HYPIXEL_STATISTICS_TITLE', {
            player: args[0]
        })
        .setDescription(`K/D: ${kd}\n Win/loss ratio: ${winratio}`)
        .addLocaleField({
            name: 'HYPIXEL_WON_GAMES',
            value: `${skyStats.wins || 0}`,
            inline: true
        })
        .addLocaleField({
            name: 'HYPIXEL_LOST_GAMES',
            value: `${skyStats.losses || 0}`,
            inline: true
        })
        .addField('\u200B', '\u200B', true)
        .addLocaleField({
            name: 'HYPIXEL_KILLS',
            value: `${skyStats.kills || 0}`,
            inline: true
        })
        .addLocaleField({
            name: 'HYPIXEL_DEATHS',
            value: `${skyStats.deaths || 0}`,
            inline: true
        })
        .addField('\u200B', '\u200B', true)
        .addLocaleField({
            name: 'HYPIXEL_ASSISTS',
            value: `${skyStats.assists || 0}`,
            inline: true
        })
        .setThumbnail(
            `https://crafatar.com/avatars/${uuid.data.id}?default=MHF_Steve&overlay`
        )
        .setFooter(client.footer);
    message.reply({ embeds: [bedEmbed] });
}
export const help = {
    name: 'skywars',
    description: 'Sprawdź statystyki gracza na skywarsach z hypixel.net',
    aliases: [],
    category: 'fun'
};
