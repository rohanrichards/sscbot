'use strict';

const logger = require('winston'),
	Triggers = require('./trigger-handler'),
	Commands = require('./command-handler');

var MessageHandler = function (discordClient, emitter) {
	this.COMMAND_CHARACTER = '!';
	this.COMMAND_START = 0;
	this.COMMAND_LENGTH = 1;
	this.discordClient = discordClient;
	this._emitter = emitter;

	this._triggers = new Triggers(this.discordClient, this._emitter);
	this._commands = new Commands(this.discordClient, this._emitter);
};

MessageHandler.prototype.handle = function (message) {
	//is this a command? (has command character at the front)
	if(message.content.substring(this.COMMAND_START, this.COMMAND_LENGTH) === this.COMMAND_CHARACTER) {
		this._commands.handle(message);
	} else {
		//its not a command so test if it contains trigger words
		// this._triggers.handle(message);
	}
};

module.exports = MessageHandler;
