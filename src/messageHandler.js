'use strict';

var logger = require('winston'),
	Triggers = require('./triggers.js');

var MessageHandler = function (discordClient) {
	this.COMMAND_CHARACTER = '!';
	this.COMMAND_START = 0;
	this.COMMAND_LENGTH = 1;
	this.discordClient = discordClient;

	this._triggers = new Triggers(this.discordClient);
};

MessageHandler.prototype.handle = function (message) {
	if (message.content.substring(this.COMMAND_START, this.COMMAND_LENGTH) === this.COMMAND_CHARACTER) {
		logger.info('handler got command:');
		logger.info(`Author: ${message.author.username}`);
		logger.info(`Content: ${message.content}`);
		logger.info(`At: ${message.createdTimestamp}`);
		// this._commands.run(message);
	} else {
		this._triggers.handle(message);
	}
};

module.exports = MessageHandler;
