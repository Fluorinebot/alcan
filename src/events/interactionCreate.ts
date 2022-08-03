import type FluorineClient from '#classes/Client';
import type { Interaction } from 'tiscord';
import type { ChatInputCommand } from '#types/structures';

export async function run(client: FluorineClient, interaction: Interaction) {
    if (interaction.isMessageComponent()) {
        const [name, user, value] = interaction.customId.split(':');
        const component = client.components.get(name);

        if (component.authorOnly && interaction.user.id !== user) {
            return interaction.reply({
                content: client.i18n.t('PRIVATE_COMPONENT', {
                    lng: interaction.locale
                }),
                ephemeral: true
            });
        }

        return component?.run(client, interaction, value);
    }
    if (interaction.isContextMenuCommand()) {
        const contextCommand = client.commands.contextMenu.get(interaction.name);

        if (contextCommand.dev && !client.devs.includes(interaction.user.id)) {
            return interaction.reply({
                content: 'You need to be a developer to do that!',
                ephemeral: true
            });
        }

        return contextCommand.run(client, interaction);
    }
    if (interaction.isChatInputCommand()) {
        const subcommand = interaction.options.getSubcommand();
        const key = subcommand ? `${interaction.name}/${subcommand}` : interaction.name;

        const command = client.commands.chatInput.get(key);
        const { dev } = client.commands.chatInput.get(interaction.name) as ChatInputCommand;

        if (command.cooldown) {
            const cooldown = await client.cooldowns.get(interaction.user, key);

            if (cooldown?.timestamp > Date.now()) {
                return interaction.reply({
                    content: client.i18n.t('INTERACTION_CREATE_COOLDOWN', {
                        lng: interaction.locale,
                        time: Math.floor(Number((await client.cooldowns.get(interaction.user, key)).timestamp) / 1000)
                    }),
                    ephemeral: true
                });
            }

            if (cooldown?.timestamp <= Date.now()) {
                await client.cooldowns.delete(interaction.user, key);
            }
        }

        if (dev && !client.devs.includes(interaction.user.id)) {
            return interaction.reply({
                content: 'You need to be a developer to do that!',
                ephemeral: true
            });
        }

        command.run(client, interaction);

        if (command.cooldown) {
            client.cooldowns.set(interaction.user, key, command.cooldown);
        }
    }
}
