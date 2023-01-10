import { SlashCommandSubcommandBuilder } from '#builders';
import { Embed, type FluorineClient } from '#classes';
import { Choice } from '#options';
import { type ChatInputCommandInteraction } from 'discord.js';

export async function onSlashCommand(client: FluorineClient, interaction: ChatInputCommandInteraction) {
    const table = client.prisma.profile;

    const field = interaction.options.getString('field');
    const value = interaction.options.getString('value');

    switch (field) {
        case 'birthday': {
            const birthday = value;
            const [day, month] = birthday.split('/').map(str => parseInt(str) || 0);

            if (day > 31 || day < 1 || month > 12 || month < 1) {
                interaction.reply({
                    content: client.i18n.t('PROFILE_INVALID_BIRTHDAY', {
                        lng: interaction.locale
                    }),
                    ephemeral: true
                });
                break;
            }

            await table.upsert({
                where: { userId: BigInt(interaction.user.id) },
                update: { birthday },
                create: {
                    userId: BigInt(interaction.user.id),
                    birthday
                }
            });

            const embed = new Embed(client, interaction.locale)
                .setLocaleTitle('PROFILE_SUCCESS')
                .setLocaleDescription('PROFILE_SET_BIRTHDAY', { birthday });

            interaction.reply({ embeds: [embed], ephemeral: true });
            break;
        }

        case 'location': {
            if (value.length > 15 || value.length < 3) {
                return interaction.reply({
                    content: client.i18n.t('PROFILE_INVALID_LOCATION', {
                        lng: interaction.locale
                    }),
                    ephemeral: true
                });
            }

            await table.upsert({
                where: { userId: BigInt(interaction.user.id) },
                update: { location: value },
                create: {
                    userId: BigInt(interaction.user.id),
                    location: value
                }
            });

            const embed = new Embed(client, interaction.locale)
                .setLocaleTitle('PROFILE_SUCCESS')
                .setLocaleDescription('PROFILE_SET_LOCATION', {
                    location: value
                });

            interaction.reply({ embeds: [embed], ephemeral: true });
            break;
        }

        case 'website': {
            const website = value;
            const regex =
                /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,20}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gu;

            if (!website.match(regex)) {
                return interaction.reply(
                    client.i18n.t('PROFILE_INVALID_WEBSITE', {
                        lng: interaction.locale
                    })
                );
            }

            await table.upsert({
                where: { userId: BigInt(interaction.user.id) },
                update: { website },
                create: {
                    userId: BigInt(interaction.user.id),
                    website
                }
            });

            const embed = new Embed(client, interaction.locale)
                .setLocaleTitle('PROFILE_SUCCESS')
                .setLocaleDescription('PROFILE_SET_WEBSITE', { website });

            interaction.reply({ embeds: [embed], ephemeral: true });
            break;
        }

        case 'pronouns': {
            const pronouns = value;
            if (!['she/her', 'he/him', 'they/them'].includes(pronouns)) {
                return interaction.reply({
                    content: client.i18n.t('PROFILE_INVALID_PRONOUNS', {
                        lng: interaction.locale
                    }),
                    ephemeral: true
                });
            }

            await table.upsert({
                where: { userId: BigInt(interaction.user.id) },
                update: { pronouns },
                create: {
                    userId: BigInt(interaction.user.id),
                    pronouns
                }
            });

            const embed = new Embed(client, interaction.locale)
                .setLocaleTitle('PROFILE_SUCCESS')
                .setLocaleDescription('PROFILE_SET_PRONOUNS', {
                    pronouns
                });

            interaction.reply({ embeds: [embed], ephemeral: true });
            break;
        }

        case 'description': {
            const description = value;
            if (description.length > 300) {
                return interaction.reply({
                    content: client.i18n.t('PROFILE_DESCRIPTION_LENGTH', {
                        lng: interaction.locale
                    }),
                    ephemeral: true
                });
            }

            await table.upsert({
                where: { userId: BigInt(interaction.user.id) },
                update: { description },
                create: {
                    userId: BigInt(interaction.user.id),
                    description
                }
            });

            const embed = new Embed(client, interaction.locale)
                .setLocaleTitle('PROFILE_SUCCESS')
                .setLocaleDescription('PROFILE_SET_DESCRIPTION', {
                    description
                });

            interaction.reply({ embeds: [embed], ephemeral: true });
            break;
        }
    }
}

export const slashCommandData = new SlashCommandSubcommandBuilder()
    .setName('PROFILE.SET.NAME')
    .setDescription('PROFILE.SET.DESCRIPTION')
    .addStringOption(option =>
        option
            .setName('PROFILE.SET.OPTIONS_FIELD_NAME')
            .setDescription('PROFILE.SET.OPTIONS_FIELD_DESCRIPTION')
            .setRequired(true)
            .setChoices(
                new Choice<string>().setName('PROFILE.SET.OPTIONS.FIELD.CHOICES.BIRTHDAY').setValue('birthday'),
                new Choice<string>().setName('PROFILE.SET.OPTIONS.FIELD.CHOICES.DESCRIPTION').setValue('description'),
                new Choice<string>().setName('PROFILE.SET.OPTIONS.FIELD.CHOICES.LOCATION').setValue('location'),
                new Choice<string>().setName('PROFILE.SET.OPTIONS.FIELD.CHOICES.PRONOUNS').setValue('pronouns'),
                new Choice<string>().setName('PROFILE.SET.OPTIONS.FIELD.CHOICES.WEBSITE').setValue('website')
            )
    )
    .addStringOption(option =>
        option
            .setName('PROFILE.SET.OPTIONS.VALUE.NAME')
            .setDescription('PROFILE.SET.OPTIONS.VALUE.DESCRIPTION')
            .setRequired(true)
    );
