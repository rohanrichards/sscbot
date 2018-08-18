'use strict';

const logger = require('winston'),
	Triggers = require('./triggers.js'),
	Commands = require('./commands.js');

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
	if(message.content.substring(this.COMMAND_START, this.COMMAND_LENGTH) === this.COMMAND_CHARACTER) {
		this._commands.handle(message);
	} else {
		this._triggers.handle(message);
	}
};

module.exports = MessageHandler;
