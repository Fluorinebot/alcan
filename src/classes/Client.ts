import { Client, ColorResolvable, Intents } from "discord.js";
import { connect } from "rethinkdb";
import CommandHandler from "./handlers/CommandHandler";
import EventHandler from "./handlers/EventHandler";
import { functions } from "../util";
export default class AlcanClient extends Client {
	conn: any;
	config: any;
	cmds!: Map<any, any>;
	version: string;
	footer: string;
	color: ColorResolvable;
	functions: any;
	constructor() {
		super({
			intents: new Intents(
				Object.values(Intents.FLAGS).reduce((acc, p) => acc | p, 0)
			),
			allowedMentions: { repliedUser: false },
		});
		connect({}).then((conn) => {
			this.conn = conn;
		});
		this.config = require(`${__dirname}/../../config.json`);
		this.version = "1.0.0-beta";
		this.footer = `Alcan ${this.version}`;
		this.color = "#3872f2";
		this.functions = functions;
	}
	init() {
		new EventHandler(this);
		this.cmds = new CommandHandler().map;
		this.login(this.config.token);
	}
}
