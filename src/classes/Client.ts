import { Client, Collection, Intents } from 'discord.js';
import r from 'rethinkdb';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { join } from 'path';

import { Component } from 'types/component';

import { Logger } from './Logger';
import AI from './AI';
import EventHandler from '@handlers/EventHandler';
import ApplicationCommandHandler from '@handlers/ApplicationCommandHandler';
import CommandHandler from '@handlers/CommandHandler';
import ComponentHandler from '@handlers/ComponentHandler';
import EconomyHandler from '@handlers/EconomyHandler';
import ShopHandler from '@handlers/ShopHandler';
import TagHandler from './handlers/TagHandler';
import PhishingHandler from '@handlers/PhishingHandler';

export default class FluorineClient extends Client {
    logger = Logger;

    applicationCommands = new ApplicationCommandHandler(this);
    conn: r.Connection;
    cmds = new CommandHandler(this).loadCommands();
    components: Collection<string, Component>;
    economy = new EconomyHandler(this);
    phishing = new PhishingHandler(this);
    shop = new ShopHandler(this);
    tags = new TagHandler(this);
    cooldown = new Set<string>();
    ai = new AI(this);
    invite =
        'https://discord.com/api/oauth2/authorize?client_id=831932409943425064&scope=bot+applications.commands&permissions=474527689975';
    version = process.env.npm_package_version;
    devs = ['707675871355600967', '478823932913516544', '348591272476540928'];
    generating: boolean;
    i18n = i18next;
    constructor() {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_BANS,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_PRESENCES,
                Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS
            ],
            partials: ['MESSAGE'],
            allowedMentions: { repliedUser: false }
        });
        new EventHandler(this);
        r.connect({
            host: process.env.RETHINK_HOSTNAME,
            password: process.env.RETHINK_PASSWORD,
            db: process.env.RETHINK_DATABASE
        }).then(conn => {
            this.conn = conn;
        });
    }
    async init() {
        this.applicationCommands.loadChatInput();
        this.applicationCommands.loadContextMenu();

        this.components = await new ComponentHandler(this).loadComponents();

        await this.i18n.use(Backend).init({
            fallbackLng: 'en-US',
            preload: ['en-US', 'pl'],
            backend: { loadPath: join(__dirname, '/../../i18n/{{lng}}.json') }
        });

        this.login();

        process.on('unhandledRejection', (error: Error) => {
            this.logger.error(error.stack);
        });
    }
}
