import FluorineClient from '@classes/Client';
import Embed from '@classes/Embed';
import { Message } from 'discord.js';

export async function run(
    client: FluorineClient,
    message: Message,
    args: string[]
) {
    const user =
        message.mentions.users.first() ??
        client.users.cache.get(args[0]) ??
        message.author;

    const embed = new Embed(client, message.guild.preferredLocale)
        .setLocaleTitle('AVATAR')

        .setImage(user.displayAvatarURL({ dynamic: true, size: 512 }));
    message.reply({ embeds: [embed] });
}
export const help = {
    name: 'avatar',
    description: 'Pokaż avatar wybranego użytkownika',
    aliases: ['av'],
    category: 'tools'
};
